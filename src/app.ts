import express from 'express';
import { emailQueue } from './queue/queue';
import { fetchGmailEmails, fetchOutlookEmails } from './services/emailFetcher';
import { getGmailAuthClient } from './auth/gmailAuth';
import { getOutlookAuthClient } from './auth/outlookAuth';
import config from './config/config';
import { log } from './utils/logger';

const app = express();

app.get('/process-emails', async (req, res) => {
  try {
    const gmailAuth = await getGmailAuthClient();
    const outlookAuth = await getOutlookAuthClient();

    const gmailEmails = await fetchGmailEmails(gmailAuth);
    const outlookEmails = await fetchOutlookEmails(outlookAuth);

    for (const email of gmailEmails) {
      await emailQueue.add('process-gmail', { email, service: 'gmail' });
    }

    for (const email of outlookEmails) {
      await emailQueue.add('process-outlook', { email, service: 'outlook' });
    }

    res.send('Email processing started');
  } catch (error) {
    log(`Error processing emails: ${error}`, 'error');
    res.status(500).send('Error processing emails');
  }
});

app.listen(config.port, () => {
  log(`Server running on port ${config.port}`);
});