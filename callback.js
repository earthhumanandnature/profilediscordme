// api/callback.js
const CLIENT_ID = "1416381905024323755";
const CLIENT_SECRET = "THAY_BẰNG_CLIENT_SECRET_THẬT_CỦA_BẠN"; // ← ĐỪNG QUÊN THAY!!!

const REDIRECT_URI = "https://mydiscordprofile.vercel.app";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Không có code");
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return res.status(400).send(tokens.error_description);
    }

    // Chuyển hướng về trang chủ kèm token
    res.redirect(`/?token=${tokens.access_token}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};