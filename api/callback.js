const CLIENT_ID = "1416381905024323755";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "YrEyjK1CYHELbQaejSlZEg5vRLS5HP8G"; // Dùng env var Vercel cho an toàn!

export default async function handler(req, res) {
  // Parse code từ URL query (Vercel serverless)
  var url = new URL(req.url, `http://${req.headers.host}`);
  var code = url.searchParams.get('code');

  if (!code) {
    return res.status(400).send("<h1>Lỗi: Không có code từ Discord</h1><p>Kiểm tra redirect URI trong Discord Dev Portal.</p>");
  }

  try {
    var response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://mydiscordprofile.vercel.app",
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    var data = await response.json();

    if (data.error) {
      return res.status(400).send("<h1>Lỗi Discord: " + (data.error_description || data.error) + "</h1>");
    }

    // Redirect về trang chủ với token
    res.redirect("https://mydiscordprofile.vercel.app/?token=" + data.access_token);
  } catch (e) {
    console.error(e);
    res.status(500).send("<h1>Lỗi server: " + e.message + "</h1>");
  }
}

export const config = { api: { bodyParser: false } };
