import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { readFile } from 'fs/promises';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export async function getGmailAuthClient(): Promise<OAuth2Client> {
  const content = await readFile(CREDENTIALS_PATH, 'utf-8');
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = await readFile(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (error) {
    await getNewToken(oAuth2Client);
  }

  return oAuth2Client;
}

async function getNewToken(oAuth2Client: OAuth2Client): Promise<void> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  // Implement token retrieval logic here
  // This might involve setting up a small web server to handle the OAuth callback
}