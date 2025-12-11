const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (!code) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
} else {
  fetch(`https://discord.com/api/v10/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '1416381905024323755',
      client_secret: '8nAeNgEpThAgzJ0HgU2XGI05b9F-CoYG', // ← RẤT QUAN TRỌNG
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://mydiscordprofile.vercel.app',
      scope: 'identify',
    })
  })
  .then(res => res.json())
  .then(tokenData => {
    if (tokenData.access_token) {
      return fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
    }
    throw new Error('No access token');
  })
  .then(res => res.json())
  .then(user => {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('profile-card').classList.remove('hidden');

    // Avatar
    const avatarUrl = user.avatar 
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
    document.getElementById('avatar').src = avatarUrl;

    // Username
    const globalName = user.global_name || user.username;
    document.getElementById('username').innerHTML = 
      `${globalName} <span>#${user.discriminator}</span>`;

    // Banner
    if (user.banner) {
      const bannerUrl = user.banner.startsWith('a_')
        ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.gif?size=480`
        : `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.webp?size=480`;
      document.getElementById('banner').style.backgroundImage = `url('${bannerUrl}')`;
    }

    // Bio (About Me) - cần scope guilds + thêm endpoint /users/@me/profile nhưng hiện tại chỉ identify thì không có
    // Nếu bạn thêm scope `guilds` và xử lý backend thì có thể lấy được

    // Trạng thái (cần bot online và dùng gateway hoặc thêm endpoint backend)
    // Ở đây mình giả lập một chút để đẹp, bạn có thể bỏ nếu không muốn
    const statuses = ['online', 'idle','dnd','offline'];
    const status = statuses[Math.floor(Math.random()*4)];
    document.getElementById('status').classList.add(status);

    // Badges đơn giản (chỉ vài badge công khai từ user.flags)
    const badgesDiv = document.getElementById('badges');
    const flags = user.flags || 0;
    const premium = user.premium_type || 0;

    if (premium > 0) {
      const img = document.createElement('img');
      img.src = 'https://discord.com/assets/648f50e7d79f44cf13e23a88a58f403e.svg';
      img.className = 'badge';
      img.title = 'Nitro';
      badgesDiv.appendChild(img);
    }

    if (flags & (1 << 2)) { // Staff
      const img = document.createElement('img');
      img.src = 'https://discord.com/assets/4e2f3b5a7b3d7d3e2b9d6d106d7e7e7e.svg';
      img.className = 'badge';
      badgesDiv.appendChild(img);
    }
    // thêm các badge khác nếu muốn...
  })
  .catch(err => {
    console.error(err);
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
  });
}

