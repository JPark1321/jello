import Resolver from '@forge/resolver';
import api from '@forge/api';
import { GPT_4o_MINI, GPT_4o, GPT_4_TURBO, GPT_3_5_TURBO } from '../models';

const buttonResolver = new Resolver();

buttonResolver.define('onButtonClick', async (req) => {
  console.log('Button clicked! Calling OpenAI...');

  const key = process.env.OPENAI_API_KEY;
  const userPrompt = req.payload?.prompt || "Say no prompt given";

  if (!key) {
    console.error('Missing OpenAI API key.');
    return 'Error: No API key set. Run "forge variables set OPENAI_API_KEY <your-key>"';
  }

  try {
    const response = await api.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GPT_4o, // cheapest model
        messages: [
          { role: 'system', content: 'You are a coding assistant running inside Jira.' },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response';
    return reply;

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return `Error: ${error.message}`;
  }
});


export const buttonHandler = buttonResolver.getDefinitions();
