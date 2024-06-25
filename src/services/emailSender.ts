import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { OAuth2Client } from 'google-auth-library';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function sendGmailReply(auth: OAuth2Client, email: any, response: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const raw = makeBody(email.payload.headers.find((header: any) => header.name === 'From').value, email.payload.headers.find((header: any) => header.name === 'Subject').value, response);
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: raw,
      threadId: email.threadId,
    },
  });
}

export async function sendOutlookReply(client: ConfidentialClientApplication, email: any, response: string) {
  const graphClient = Client.init({
    authProvider: (done) => {
      client.acquireTokenByClientCredential({
        scopes: ['https://graph.microsoft.com/.default']
      }).then((response) => {
        done(null, response?.accessToken);
      }).catch((error) => done(error, null));
    }
  });

  await graphClient.api(`/me/messages/${email.id}/reply`)
    .post({
      message: {
        toRecipients: email.from.emailAddress,
        body: {
          contentType: 'Text',
          content: response,
        },
      },
    });
}

function makeBody(to: string, subject: string, message: string) {
  const str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    'MIME-Version: 1.0\n',
    'Content-Transfer-Encoding: 7bit\n',
    'to: ', to, '\n',
    'subject: ', subject, '\n\n',
    message
  ].join('');

  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}