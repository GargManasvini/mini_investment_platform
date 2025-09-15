require('dotenv').config();
const fetch = require('node-fetch'); 

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function callLLM(prompt) {
 
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', 
      messages: [{role:'user', content: prompt}],
      max_tokens: 300
    })
  });
  const j = await res.json();
  return j.choices?.[0]?.message?.content?.trim() || '';
}

module.exports = {
  async generateProductDescription(fields) {
    const prompt = `Write a 2-sentence product description for a financial product. Fields: ${JSON.stringify(fields)}. Keep it simple.`;
    return await callLLM(prompt);
  },
  async suggestPasswordStrength(password) {
    const prompt = `Evaluate the password "${password}" and return a short JSON with fields: score (0-100), suggestions (array).`;
    const out = await callLLM(prompt);
    return out;
  },
}
