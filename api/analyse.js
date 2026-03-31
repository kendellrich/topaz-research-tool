export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || text.length < 50) {
    return res.status(400).json({ error: 'Text too short' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a research analyst summarising investment content for an institutional portfolio manager. The portfolio is primarily US equities, fixed income, and macro.

Analyse the content and respond ONLY with a JSON object in this exact format (no markdown, no preamble, just raw JSON):

{
  "title": "3-6 word headline summarising the piece",
  "signal": "High" or "Medium" or "Low" or "Noise",
  "signal_reason": "one sentence explaining signal strength",
  "core_idea": "1-2 sentences — what is actually being said",
  "why_it_matters": "specific impact on growth, inflation, liquidity, or equity valuations",
  "time_horizon": "0-3 months" or "3-12 months" or "1-5 years",
  "market_impact": "which asset classes are affected and how — be specific",
  "action": "Ignore" or "Monitor" or "Adjust Positioning",
  "action_detail": "one sentence on what to watch or do"
}

Be direct. No fluff. Write for a CIO, not a retail investor.`,
      messages: [{ role: 'user', content: text }]
    })
  });

  const data = await response.json();
  return res.status(200).json(data);
}
