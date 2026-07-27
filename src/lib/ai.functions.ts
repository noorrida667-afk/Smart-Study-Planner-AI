import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  title: z.string(),
  course: z.string(),
  description: z.string().optional().default(""),
  priority: z.string(),
  dueDate: z.string(),
  estimatedHours: z.number(),
});

const SYSTEM_PROMPT =
  "You are an expert academic tutor. Analyze the student's assignment details and generate a realistic, structured, phase-by-phase daily preparation schedule. Include key focus areas, resource recommendations, and one high-impact productivity tip.";

export const generateStudyPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    // Prefer the project's own Gemini key (works on Vercel / any host).
    // Falls back to Lovable's managed gateway key when running on Lovable.
    const geminiKey = process.env.GEMINI_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;

    const useGemini = Boolean(geminiKey);
    const endpoint = useGemini
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const model = useGemini ? "gemini-flash-latest" : "google/gemini-2.5-flash";
    const apiKey = geminiKey ?? lovableKey;

    if (!apiKey)
      throw new Error(
        "AI is not configured. Set GEMINI_API_KEY in your deployment environment variables.",
      );

    const userPrompt = `Assignment details:
- Title: ${data.title}
- Course: ${data.course}
- Description: ${data.description || "(none provided)"}
- Priority: ${data.priority}
- Due date: ${new Date(data.dueDate).toDateString()}
- Estimated study hours: ${data.estimatedHours}
- Today's date: ${new Date().toDateString()}

Return ONLY valid JSON matching this exact TypeScript type:
{
  "overview": string,           // 1-2 sentence high-level plan
  "phases": [                   // 3-6 daily/phase entries leading up to the due date
    {
      "day": string,            // e.g. "Day 1 — Mon Oct 20" or "Phase 1"
      "focus": string,          // 1 short sentence describing the focus
      "tasks": [{ "id": string, "text": string }]   // 2-5 concrete tasks; id must be a short unique slug like "d1-t1"
    }
  ],
  "resources": string[],        // 3-5 recommended resource types or specific suggestions
  "tip": string                 // ONE high-impact productivity tip
}
Do not wrap in markdown code fences. Output JSON only.`;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      if (resp.status === 429) throw new Error("AI is rate limited. Please try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please add credits to your workspace.");
      throw new Error(`AI request failed (${resp.status}): ${body.slice(0, 200)}`);
    }

    const payload = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    try {
      return { studyPlan: JSON.parse(content) };
    } catch {
      throw new Error("AI returned an invalid response. Please try again.");
    }
  });
