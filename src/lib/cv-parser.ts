// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function extractCvText(cvData: string): Promise<string> {
  const buffer = Buffer.from(cvData, "base64");
  const data = await pdfParse(buffer);
  return data.text as string;
}
