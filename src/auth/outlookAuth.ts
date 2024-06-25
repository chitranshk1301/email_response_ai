import { ConfidentialClientApplication } from '@azure/msal-node';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const config = {
  auth: {
    clientId: process.env.OUTLOOK_CLIENT_ID || '',
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
  }
};

const TOKEN_PATH = path.join(process.cwd(), 'outlook_token.json');

export async function getOutlookAuthClient(): Promise<ConfidentialClientApplication> {
  const client = new ConfidentialClientApplication(config);

  try {
    const tokenContent = await readFile(TOKEN_PATH, 'utf-8');
    const tokenData = JSON.parse(tokenContent);
    if (tokenData.expiresOn > Date.now()) {
      return client;
    }
  } catch (error) {
    console.log('No valid token found, acquiring new token');
  }

  const authResult = await client.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default']
  });

  if (authResult) {
    await writeFile(TOKEN_PATH, JSON.stringify(authResult));
  } else {
    throw new Error('Failed to acquire token');
  }

  return client;
}