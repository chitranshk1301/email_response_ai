import { Queue, Worker } from 'bullmq';
import { processEmail } from '../services/emailProcessor';
import { sendGmailReply, sendOutlookReply } from '../services/emailSender';
import { getGmailAuthClient } from '../auth/gmailAuth';
import { getOutlookAuthClient } from '../auth/outlookAuth';
import config from '../config/config';

const emailQueue = new Queue('email-processing', {
  connection: config.redis
});

const worker = new Worker('email-processing', async (job) => {
  const { email, service } = job.data;
  const { label, response } = await processEmail(email);

  if (service === 'gmail') {
    const auth = await getGmailAuthClient();
    await sendGmailReply(auth, email, response);
  } else if (service === 'outlook') {
    const auth = await getOutlookAuthClient();
    await sendOutlookReply(auth, email, response);
  }

  return { label, response };
}, { connection: config.redis });

export { emailQueue };