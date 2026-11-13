import { gmail } from "./google";

export const isEmail = (s: string) => /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/.test(s);

export async function sendMail(to: string | string[], subject: string, html: string) {
  const list = (Array.isArray(to) ? to : [to]).filter(isEmail);
  if (!list.length) return;
  const body = Buffer.from(html, "utf8").toString("base64").replace(/(.{76})/g, "$1\r\n");
  const msg = [
    `To: ${list.join(", ")}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].join("\r\n");
  await gmail().users.messages.send({
    userId: "me",
    requestBody: { raw: Buffer.from(msg, "utf8").toString("base64url") },
  });
}
