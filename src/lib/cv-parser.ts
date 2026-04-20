import path from "path";
import fs from "fs/promises";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function extractCvText(cvPath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), "public", "uploads", "cvs", cvPath);
  const buffer = await fs.readFile(fullPath);
  const data = await pdfParse(buffer);
  return data.text as string;
}
