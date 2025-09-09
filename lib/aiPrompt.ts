export const buildPrompt = (userPrompt: string) => `
You are helping an admin design a small web form. 
Return STRICT JSON that matches this TypeScript interface:

interface AISuggestionPayload {
  title: string;
  description?: string | null;
  sections: {
    title: string;
    description?: string | null;
    fields: { label: string; type: 'text' | 'number'; required?: boolean; placeholder?: string | null; }[];
  }[];
}

HARD CONSTRAINTS:
- Total sections: 1 or 2 (max 2).
- For each section, total fields: 1 to 3 (max 3).
- Field types MUST be 'text' or 'number' only.
- Prefer concise labels; avoid duplicates.
- Do NOT include markdown or backticks—JSON ONLY.

Example of valid JSON:
{
  "title": "Job Application",
  "description": "Short candidate intake",
  "sections": [
    { "title": "Personal Info", "fields": [
      {"label":"Full Name","type":"text","required":true},
      {"label":"Phone","type":"text"},
      {"label":"Years of Experience","type":"number","placeholder":"0"}
    ]},
    { "title": "Position Details", "fields": [
      {"label":"Desired Role","type":"text"},
      {"label":"Expected Salary","type":"number"}
    ]}
  ]
}

Now generate for: "${userPrompt}"
`;
