import { prisma } from "./prisma";
import { sendEmailWithGmail } from "./gmail";
import path from "path";

const EMAIL_SUBJECT = "Application for Mining Roles – CV Enclosed";

function buildEmailBody(userName: string): string {
  return `Dear Hiring Manager,

I hope this message finds you well. My name is ${userName} and I am writing to express my interest in any current or upcoming positions within your organisation.

Please find my CV attached for your consideration. I have a strong interest in the Australian mining sector and am actively seeking opportunities to contribute my skills and experience to your team.

I would welcome the opportunity to discuss how my background aligns with your needs. Please feel free to contact me at your convenience.

Thank you for taking the time to consider my application.

Kind regards,
${userName}

---
This application was sent via MineApply – Australia's automated mining job application platform.
To unsubscribe from future applications, please reply to this email.`;
}

export async function sendDailyCVs(): Promise<{
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  const activeUsers = await prisma.user.findMany({
    where: {
      isActive: true,
      subscriptionStatus: "active",
      gmailRefreshToken: { not: null },
      cvPath: { not: null },
    },
  });

  const activeCompanies = await prisma.miningCompany.findMany({
    where: { isActive: true },
  });

  if (activeCompanies.length === 0) {
    return { processed: 0, errors: ["No active mining companies found"] };
  }

  for (const user of activeUsers) {
    try {
      const cvFullPath = path.join(process.cwd(), "public", user.cvPath!);
      const cvName = user.cvOriginalName || "CV.pdf";
      const userName = user.name || user.email?.split("@")[0] || "Applicant";
      const emailBody = buildEmailBody(userName);

      let successCount = 0;
      const recipientErrors: string[] = [];

      for (const company of activeCompanies) {
        try {
          await sendEmailWithGmail(
            user.id,
            company.email,
            EMAIL_SUBJECT,
            emailBody,
            cvFullPath,
            cvName
          );
          successCount++;
          // Small delay to avoid rate limiting
          await new Promise((r) => setTimeout(r, 200));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          recipientErrors.push(`${company.name}: ${msg}`);
        }
      }

      await prisma.sendLog.create({
        data: {
          userId: user.id,
          recipientCount: successCount,
          status: recipientErrors.length === 0 ? "success" : "partial",
          errorMessage:
            recipientErrors.length > 0
              ? recipientErrors.slice(0, 5).join("; ")
              : null,
        },
      });

      processed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`User ${user.email}: ${msg}`);

      await prisma.sendLog.create({
        data: {
          userId: user.id,
          recipientCount: 0,
          status: "error",
          errorMessage: msg,
        },
      });
    }
  }

  return { processed, errors };
}
