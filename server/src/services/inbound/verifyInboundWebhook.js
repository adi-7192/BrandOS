import { Webhook } from 'svix';

export function verifyInboundWebhook({ payload, headers, webhookSecret = process.env.RESEND_WEBHOOK_SECRET }) {
  if (!webhookSecret) {
    throw new Error('Missing RESEND_WEBHOOK_SECRET for inbound email verification.');
  }

  const verifier = new Webhook(webhookSecret);
  return verifier.verify(payload, {
    'svix-id': headers['svix-id'],
    'svix-timestamp': headers['svix-timestamp'],
    'svix-signature': headers['svix-signature'],
  });
}
