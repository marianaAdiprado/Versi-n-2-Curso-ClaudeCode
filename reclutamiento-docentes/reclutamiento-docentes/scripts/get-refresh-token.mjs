// Obtiene el GOOGLE_REFRESH_TOKEN de la cuenta que operará Drive, Sheets, Calendar y Gmail.
// Uso:  npm run token   (requiere GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.local)
import http from "node:http";
import { google } from "googleapis";

const PORT = 53682;
const redirect = `http://localhost:${PORT}/callback`;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en .env.local");
  process.exit(1);
}
const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirect);
const url = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
  ],
});

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  if (u.pathname !== "/callback") return res.end();
  try {
    const { tokens } = await client.getToken(u.searchParams.get("code"));
    res.end("Listo. Vuelve a la terminal y copia el refresh token.");
    console.log("\nGOOGLE_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
    if (!tokens.refresh_token) console.log("No llegó refresh_token: revoca el acceso de la app en tu cuenta de Google y repite.");
  } catch (e) {
    res.end("Error: " + e.message);
    console.error(e);
  }
  server.close();
});
server.listen(PORT, () => {
  console.log(`Redirect URI requerido en tu cliente OAuth: ${redirect}\n`);
  console.log("Abre esta URL e inicia sesión con la cuenta que operará el sistema:\n\n" + url + "\n");
});
