/**
 * Gmail integration — reactive pull model.
 * Reads only messages labelled with "BrandOS — [Brand Name]".
 *
 * Required OAuth scopes:
 *   - gmail.labels (read label names)
 *   - gmail.readonly (read labelled messages)
 *
 * For MVP: poll on 5-minute cron instead of Pub/Sub webhooks.
 * Label format: "BrandOS — [Brand Name]"
 */

// Placeholder — implement with @googleapis/gmail or google-auth-library
// when OAuth is configured for the deployment environment.

export async function fetchLabelledMessages({ accessToken, labelName, maxResults = 5 }) {
  // TODO: implement Gmail API call
  // GET https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds={labelId}&maxResults={maxResults}
  throw new Error('Gmail integration not yet implemented. Configure OAuth credentials first.');
}

export async function getMessageById({ accessToken, messageId }) {
  // TODO: implement
  throw new Error('Gmail integration not yet implemented.');
}
