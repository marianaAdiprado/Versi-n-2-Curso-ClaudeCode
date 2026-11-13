import { google } from "googleapis";
import { baseUrl } from "./config";

export function oauthClient(redirectPath = "/api/auth/callback") {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl()}${redirectPath}`,
  );
}

function authed() {
  const c = oauthClient();
  c.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return c;
}

export const drive = () => google.drive({ version: "v3", auth: authed() });
export const sheets = () => google.sheets({ version: "v4", auth: authed() });
export const calendar = () => google.calendar({ version: "v3", auth: authed() });
export const gmail = () => google.gmail({ version: "v1", auth: authed() });
