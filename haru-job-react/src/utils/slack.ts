const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL || '';

export const sendSlackNotification = async (message: string) => {
    if (!SLACK_WEBHOOK_URL) {
        console.error('Slack Webhook URL is missing! Check your VITE_SLACK_WEBHOOK_URL environment variable.');
        return;
    }
    try {
        await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: message }),
        });
    } catch (error) {
        console.error('Failed to send Slack notification:', error);
    }
};
