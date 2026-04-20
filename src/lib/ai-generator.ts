import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface JobInfo {
  title: string;
  company: string;
  description: string;
  location: string;
}

interface GeneratedApplication {
  coverLetter: string;
  cvSummary: string;
}

export async function generateApplication(
  job: JobInfo,
  cvText: string,
  userName: string
): Promise<GeneratedApplication> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: "You are an expert Australian mining industry careers coach. You write compelling, authentic cover letters and tailored CV summaries that precisely match the candidate's real experience to the job requirements. Always write in first person from the candidate's perspective. Keep cover letters under 350 words — punchy and specific. CV summaries should be 3–5 bullet points highlighting the most relevant experience and skills for the specific role. Never invent experience that isn't in the CV.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Candidate name: ${userName}\n\nCandidate CV:\n${cvText}`,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: `Job: ${job.title} at ${job.company}, ${job.location}\n\nJob description:\n${job.description.slice(0, 2000)}\n\nReturn a JSON object with exactly two keys:\n{\n  "coverLetter": "...",\n  "cvSummary": "..."\n}\n\nReturn only valid JSON, no markdown.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Strip any markdown code fences if Claude wraps the JSON
  const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  const parsed = JSON.parse(cleaned) as GeneratedApplication;
  return parsed;
}
