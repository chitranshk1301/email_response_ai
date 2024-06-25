import { Configuration, OpenAI } from 'openai';
import config from '../config/config';

const configuration = new Configuration({
  apiKey: config.openai.apiKey,
});
const openai = new OpenAI(configuration);

export async function processEmail(email: any) {
  const content = email.body || email.snippet || '';
  
  const labelCompletion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Categorize this email as "Interested", "Not Interested", or "More Information": ${content}`,
    max_tokens: 60,
  });

  const label = labelCompletion.data.choices[0]?.text?.trim() || 'Unclassified';

  const responseCompletion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Generate a response for an email labeled as ${label}: ${content}`,
    max_tokens: 200,
  });

  const response = responseCompletion.data.choices[0]?.text?.trim() || '';

  return { label, response };
}