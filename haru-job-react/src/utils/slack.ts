const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL || '';

export const sendSlackNotification = async (message: string) => {
    try {
        await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify({ text: message }),
        });
    } catch (error) {
        console.error('Failed to send Slack notification:', error);
    }
};
