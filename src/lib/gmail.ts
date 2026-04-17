import { google } from "googleapis";
import { prisma } from "./prisma";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
);

export function getGmailAuthUrl(userId: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
    state: userId,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(refreshToken: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  );
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gmailAccessToken: true,
      gmailRefreshToken: true,
      gmailTokenExpiry: true,
    },
  });

  if (!user?.gmailRefreshToken) {
    throw new Error("Gmail not connected");
  }

  const isExpired =
    !user.gmailTokenExpiry || new Date() >= new Date(user.gmailTokenExpiry);

  if (isExpired || !user.gmailAccessToken) {
    const credentials = await refreshAccessToken(user.gmailRefreshToken);

    await prisma.user.update({
      where: { id: userId },
      data: {
        gmailAccessToken: credentials.access_token,
        gmailTokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      },
    });

    return credentials.access_token!;
  }

  return user.gmailAccessToken;
}

export async function sendEmailWithGmail(
  userId: string,
  to: string,
  subject: string,
  body: string,
  attachmentPath: string,
  attachmentName: string
): Promise<void> {
  const accessToken = await getValidAccessToken(userId);

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: client });

  const fs = await import("fs");

  const attachmentData = fs.readFileSync(attachmentPath);
  const attachmentBase64 = attachmentData.toString("base64");
  const mimeType = "application/pdf";

  const boundary = "boundary_mineapply_001";
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    body,
    "",
    `--${boundary}`,
    `Content-Type: ${mimeType}; name="${attachmentName}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${attachmentName}"`,
    "",
    attachmentBase64,
    "",
    `--${boundary}--`,
  ];

  const email = emailLines.join("\r\n");
  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedEmail },
  });
}
