import { Resend } from 'resend';

function getResendClient(apiKey = process.env.RESEND_API_KEY) {
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY for inbound email retrieval.');
  }

  return new Resend(apiKey);
}

export async function getReceivedEmail(emailId, apiKey) {
  const client = getResendClient(apiKey);
  const result = await client.emails.receiving.get(emailId);

  if (result.error) {
    throw new Error(result.error.message || 'Unable to retrieve received email from Resend.');
  }

  return result.data;
}
