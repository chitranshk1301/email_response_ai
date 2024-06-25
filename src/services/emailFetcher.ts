import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { OAuth2Client } from 'google-auth-library';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function fetchGmailEmails(auth: OAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
  const messages = res.data.messages || [];

  const emails = await Promise.all(messages.map(async (message) => {
    const email = await gmail.users.messages.get({ userId: 'me', id: message.id || '' });
    return email.data;
  }));

  return emails;
}

export async function fetchOutlookEmails(client: ConfidentialClientApplication) {
  const graphClient = Client.init({
    authProvider: (done) => {
      client.acquireTokenByClientCredential({
        scopes: ['https://graph.microsoft.com/.default']
      }).then((response) => {
        done(null, response?.accessToken);
      }).catch((error) => done(error, null));
    }
  });

  const res = await graphClient.api('/me/messages')
    .top(10)
    .select('subject,body,receivedDateTime')
    .get();

  return res.value;
}