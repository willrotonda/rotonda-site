export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, firm, aum, message } = req.body;

  if (!name || !email || !firm || !aum) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const slackMessage = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Access Request' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${name}` },
          { type: 'mrkdwn', text: `*Email:*\n${email}` },
          { type: 'mrkdwn', text: `*Firm:*\n${firm}` },
          { type: 'mrkdwn', text: `*AUM:*\n${aum}` }
        ]
      },
      ...(message ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${message}` }
      }] : [])
    ]
  };

  const slackRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackMessage)
  });

  if (!slackRes.ok) {
    return res.status(500).json({ error: 'Failed to send to Slack' });
  }

  res.redirect(303, '/contact?submitted=true');
}
