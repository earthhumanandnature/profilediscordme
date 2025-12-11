// api/profile.js
const axios = require('axios');

const CLIENT_ID = '1416381905024323755';
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = '1435083149142130720'; // server của bạn
const REDIRECT_URI = 'https://YOUR-VERCEL-DOMAIN.vercel.app'; // sẽ tự thay khi deploy

module.exports = async (req, res) => {
  const { code } = req.query;

  // Nếu chưa có code → bắt đầu OAuth
  if (!code) {
    const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20bot%20guilds.join&guild_id=${GUILD_ID}&disable_guild_select=true&permissions=0&prompt=consent`;
    return res.redirect(url);
  }

  try {
    // 1. Lấy access token
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2. Lấy info user
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = userRes.data;

    // 3. Kiểm tra + lấy dữ liệu từ server chung
    const member = await axios.get(`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    }).catch(() => null);

    const status = member?.data?.presence?.status || 'offline';
    const bio = member?.data?.user?.bio || 'Người dùng chưa viết gì cả ~';

    res.json({ user, status, bio });
  } catch (err) {
    // Nếu chưa join server → redirect lại để join
    const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20bot%20guilds.join&guild_id=${GUILD_ID}&disable_guild_select=true&permissions=0&prompt=consent`;
    res.redirect(url);
  }
};
