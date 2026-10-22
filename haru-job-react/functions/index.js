const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret, defineString } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const axios = require("axios");

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
// 웹훅 주소는 경로에 토큰이 있어 저장소(공개)에 두지 않는다. Functions 시크릿에서 읽는다.
const SLACK_WEBHOOK_URL = defineSecret("SLACK_WEBHOOK_URL");
const CLAIM_TTL_MS = 5 * 60 * 1000;

// ── StayOps 연동 (2026-09-09) ────────────────────────────────────────────────
// 지원서가 접수되면 운영 시스템(StayOps)으로도 그대로 넘긴다. 담당자는 거기서 읽고 분류한다.
//
// 브라우저가 아니라 **이 함수에서** 보내는 이유: 공유 시크릿이 클라이언트 번들에 들어가면
// 누구나 가짜 지원서를 밀어넣을 수 있다. 시크릿은 Functions 시크릿에만 둔다.
//
// 실패해도 지원 접수 자체는 성공이다. StayOps 가 잠깐 죽어 있다고 지원서를 잃을 수는 없다.
// 못 보낸 건은 Firestore 에 `stayOpsSync.status = "failed"` 로 남아 나중에 다시 보낼 수 있다.
const STAYOPS_WEBHOOK_SECRET = defineSecret("STAYOPS_WEBHOOK_SECRET");
const STAYOPS_WEBHOOK_URL = defineString("STAYOPS_WEBHOOK_URL", {
  default: "https://stay-ops-two.vercel.app/api/recruit/applications",
});

async function forwardToStayOps({ docRef, docId, data, source }) {
  const secret = STAYOPS_WEBHOOK_SECRET.value();
  const url = STAYOPS_WEBHOOK_URL.value();
  if (!secret || !url) {
    logger.warn("[stayops] secret/url not configured — skipping forward");
    return;
  }

  try {
    // Firestore Timestamp 는 그대로 직렬화하면 {_seconds} 가 된다. 받는 쪽이 세 형태를 모두
    // 읽지만, ISO 문자열이 가장 오해가 없다.
    const payload = { ...data };
    if (payload.createdAt && typeof payload.createdAt.toDate === "function") {
      payload.createdAt = payload.createdAt.toDate().toISOString();
    }

    const response = await axios.post(
      url,
      { source, docId, document: payload },
      {
        headers: { "x-recruit-webhook-secret": secret },
        timeout: 10000,
      },
    );
    await docRef.update({
      stayOpsSync: {
        status: "sent",
        at: admin.firestore.FieldValue.serverTimestamp(),
        result: response.data || null,
      },
    });
    logger.info(`[stayops] forwarded ${source}/${docId}`);
  } catch (error) {
    const detail = error?.response?.data || error?.message || String(error);
    logger.error(`[stayops] forward failed for ${source}/${docId}:`, detail);
    await docRef
      .update({
        stayOpsSync: {
          status: "failed",
          at: admin.firestore.FieldValue.serverTimestamp(),
          error: typeof detail === "string" ? detail.slice(0, 500) : JSON.stringify(detail).slice(0, 500),
        },
      })
      .catch(() => {});
  }
}

async function claimSlackNotification(docRef, eventId) {
  return firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    if (!snapshot.exists) {
      logger.warn(`Slack notification target does not exist: ${docRef.path}`);
      return false;
    }

    const data = snapshot.data() || {};
    const notification = data.slackNotification;

    if (notification?.status === "sent") {
      return false;
    }

    if (notification?.status === "sending" && notification.claimedAt && typeof notification.claimedAt.toMillis === "function") {
      const claimedAtMillis = notification.claimedAt.toMillis();
      if (Date.now() - claimedAtMillis < CLAIM_TTL_MS) {
        return false;
      }
    }

    transaction.update(docRef, {
      slackNotification: {
        status: "sending",
        eventId,
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    return true;
  });
}

async function finalizeSlackNotification(docRef, eventId, status, errorMessage) {
  const payload = {
    slackNotification: {
      status,
      eventId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(status === "sent"
        ? { sentAt: admin.firestore.FieldValue.serverTimestamp() }
        : {
            failedAt: admin.firestore.FieldValue.serverTimestamp(),
            errorMessage: errorMessage || "",
          }),
    },
  };

  await docRef.update(payload);
}

function formatSlackValue(value, maxLength = 900) {
  const rawValue = Array.isArray(value) ? value.join(", ") : value;
  const normalized = rawValue === undefined || rawValue === null || String(rawValue).trim() === ""
    ? "미입력"
    : String(rawValue).trim();
  const escaped = normalized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.length > maxLength ? `${escaped.slice(0, maxLength - 1)}…` : escaped;
}

function createSlackField(label, value, emphasize = false) {
  const formattedValue = formatSlackValue(value);
  return {
    type: "mrkdwn",
    text: `*${label}*\n${emphasize ? `*${formattedValue}*` : formattedValue}`,
  };
}

function isValidHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

async function sendSlackNotification({ docRef, eventId, logLabel, message, blocks }) {
  const claimed = await claimSlackNotification(docRef, eventId);
  if (!claimed) {
    logger.info(`Slack notification already handled for ${logLabel}: ${docRef.id}`);
    return;
  }

  try {
    await axios.post(SLACK_WEBHOOK_URL.value(), {
      text: message,
      ...(blocks ? { blocks } : {}),
    });
    await finalizeSlackNotification(docRef, eventId, "sent");
    logger.info(`Slack notification sent for ${logLabel}: ${docRef.id}`);
  } catch (error) {
    logger.error(`Failed to send Slack notification for ${logLabel}:`, error);
    await finalizeSlackNotification(docRef, eventId, "failed", error?.message || String(error));
  }
}

exports.onInquiryCreated = onDocumentCreated({ document: "chat_rooms/{roomId}", secrets: [SLACK_WEBHOOK_URL] }, async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("No data associated with the inquiry event");
    return;
  }

  const data = snapshot.data();
  const roomId = event.params.roomId;
  const eventId = event.id || roomId;
  const docRef = firestore.doc(`chat_rooms/${roomId}`);
  const message = `🔔 새로운 채용 문의가 도착했습니다! (ID: ${roomId})\n이름: ${data.name}\n나이: ${data.age}세\n성별: ${data.gender}\n연락처: ${data.phone}`;

  await sendSlackNotification({
    docRef,
    eventId,
    logLabel: "inquiry",
    message,
  });
});

exports.onApplicationCreated = onDocumentCreated(
  { document: "applications/{docId}", secrets: [STAYOPS_WEBHOOK_SECRET, SLACK_WEBHOOK_URL] },
  async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("No data associated with the application event");
    return;
  }

  const data = snapshot.data();
  const docId = event.params.docId;
  const eventId = event.id || docId;
  const docRef = firestore.doc(`applications/${docId}`);
  const employmentType = data.employment_type || "아르바이트";
  const appliedPosition = data.applied_position || data.job_title || "객실 클리닝 스태프";
  const jobTitle = data.job_title || appliedPosition;
  const preferredDays = Array.isArray(data.days) && data.days.length > 0 ? data.days.join(", ") : "미입력";
  const industryTasks = Array.isArray(data.industry_tasks) && data.industry_tasks.length > 0 ? data.industry_tasks.join(", ") : "미입력";
  const workFields = employmentType === "정사원"
    ? [createSlackField("입사 가능일", data.start_date, true)]
    : [
        createSlackField("희망 요일", preferredDays),
        createSlackField("주당 근무일", data.days_per_week),
        createSlackField("희망 근무기간", data.duration),
        createSlackField("근무 시작일", data.start_date),
      ];
  const message = `신규 지원서 · ${employmentType} | ${data.name || "이름 미입력"} | ${appliedPosition}`;
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "신규 지원서 접수",
        emoji: true,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*지원 공고*  ${formatSlackValue(jobTitle)}`,
        },
      ],
    },
    {
      type: "section",
      fields: [
        createSlackField("지원 구분", employmentType, true),
        createSlackField("지원 직무", appliedPosition, true),
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*기본 인적사항*" },
    },
    {
      type: "section",
      fields: [
        createSlackField("이름", data.name, true),
        createSlackField("나이 · 성별", `${data.age || "미입력"}세 · ${data.gender || "미입력"}`),
        createSlackField("국적", data.nationality),
        createSlackField("휴대폰", data.phone, true),
        createSlackField("카카오톡", data.kakao_id),
        createSlackField("현재 거주지", data.address),
        createSlackField("출퇴근 소요시간", data.commute_time),
        createSlackField("유니폼 사이즈", data.uniform_size),
        createSlackField("비자 종류", data.visa_type, true),
        createSlackField("비자 만료일", data.visa_period, true),
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: employmentType === "정사원" ? "*입사 정보*" : "*근무 희망 조건*" },
    },
    {
      type: "section",
      fields: workFields,
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*경력 및 지원 내용*" },
    },
    {
      type: "section",
      fields: [
        createSlackField("동일 업종 경험", data.has_industry_exp),
        createSlackField("경험 업무", industryTasks),
        createSlackField("지원 경로", data.source),
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*지원 동기*\n${formatSlackValue(data.motivation, 2400)}`,
      },
    },
  ];

  if (isValidHttpUrl(data.resumeUrl)) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "이력서 열기", emoji: true },
          url: data.resumeUrl,
          action_id: "open_resume",
        },
      ],
    });
  } else {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: "*이력서*  미첨부" }],
    });
  }

  // 슬랙 알림과 StayOps 전송은 서로를 막지 않는다 — 한쪽이 실패해도 다른 쪽은 간다.
  await Promise.allSettled([
    sendSlackNotification({
      docRef,
      eventId,
      logLabel: "application",
      message,
      blocks,
    }),
    forwardToStayOps({ docRef, docId, data, source: "applications" }),
  ]);
  },
);
