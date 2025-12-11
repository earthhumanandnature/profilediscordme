const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const card = document.getElementById('profile-card');
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('bgMusic');
const statusRing = document.getElementById('status');
let isPlaying = false;

// ==================== DISCORD OAUTH ====================
if (!code) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
} else {
  fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '1416381905024323755',
      client_secret: '8nAeNgEpThAgzJ0HgU2XGI05b9F-CoYG',
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://mydiscordprofile.vercel.app',
      scope: 'identify',
    })
  })
  .then(res => res.json())
  .then(tokenData => {
    if (!tokenData.access_token) throw new Error('No token');
    return fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
  })
  .then(res => res.json())
  .then(user => {
    document.getElementById('loading').classList.add('hidden');
    card.classList.remove('hidden');

    // Avatar
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;
    document.getElementById('avatar').src = avatarUrl;

    // Username
    const name = user.global_name || user.username;
    document.getElementById('username').innerHTML = `${name} <span>#${user.discriminator || '0000'}</span>`;

    // Banner
    if (user.banner) {
      const format = user.banner.startsWith('a_') ? 'gif' : 'webp';
      document.getElementById('banner').style.backgroundImage = 
        `url('https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${format}?size=480')`;
    }

    // Trạng thái giả lập (vì scope identify không có presence thật)
    const statuses = ['online', 'idle', 'dnd', 'offline'];
    const status = statuses[Math.floor(Math.random() * 4)];
    statusRing.className = `status-ring ${status}`; // thêm class online/idle/dnd/offline

    // Nitro badge
    if (user.premium_type && user.premium_type > 0) {
      const img = document.createElement('img');
      img.src = 'https://discord.com/assets/648f50e7d79f44cf13e23a88a58f403e.svg';
      img.className = 'badge';
      img.title = 'Nitro';
      document.getElementById('badges').appendChild(img);
    }

    // BẬT HIỆU ỨNG NGHIÊNG NGAY KHI CARD HIỆN
    enableTiltEffect();
  })
  .catch(err => {
    console.error(err);
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
  });
}

// ==================== NÚT NHẠC ====================
musicToggle.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    musicToggle.classList.remove('playing');
  } else {
    audio.play().catch(() => {});
    musicToggle.classList.add('playing');
  }
  isPlaying = !isPlaying;
});
document.body.addEventListener('click', () => audio.play().catch(() => {}), { once: true });

// ==================== HIỆU ỨNG NGHIÊNG CARD SIÊU MƯỢT ====================
function enableTiltEffect() {
  const handleMove = (e) => {
    if (window.innerWidth < 768) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateY = x * 0.07;   // nghiêng mạnh hơn
    const rotateX = -y * 0.07;

    card.style.transform = `
      perspective(1500px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `;
  };

  const handleLeave = () => {
    card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0) scale(1)';
  };

  document.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseleave', handleLeave);
}
// Nếu reload trang khi đã login rồi → vẫn có hiệu ứng nghiêng
if (!card.classList.contains('hidden')) enableTiltEffect();
