// api/callback.js
const CLIENT_ID = "1416381905024323755";
const CLIENT_SECRET = "YrEyjK1CYHELbQaejSlZEg5vRLS5HP8G"; // ← CHỈ THAY DÒNG NÀY!!!
const REDIRECT_URI = "https://mydiscordprofile.vercel.app";

export default async function handler(req, res) {
  const code = req.query.code || req.url.split('code=')[1]?.split('&')[0];

  if (!code) {
    return res.status(400).send("Không có code");
  }

  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send("Lỗi Discord: " + data.error_description);
    }

    // Đổi code thành token rồi redirect về trang chủ kèm token
    res.redirect(`/?token=${data.access_token}`);
  } catch (error) {
    res.status(500).send("Lỗi server: " + error.message);
  }
}
export const config = { api: { bodyParser: false } };
