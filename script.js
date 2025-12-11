const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const card        = document.getElementById('profile-card');
const welcome     = document.getElementById('welcome');
const musicToggle = document.getElementById('musicToggle');
const audio       = document.getElementById('bgMusic');
const statusRing  = document.getElementById('status');
let isPlaying = false;

// ==================== CHƯA LOGIN ====================
if (!code) {
  card.classList.add('hidden');
  welcome.classList.remove('hidden');
} 
// ==================== ĐÃ LOGIN ====================
else {
  welcome.classList.add('hidden');

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
  .then(r => r.json())
  .then(t => {
    if (!t.access_token) throw '';
    return fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${t.access_token}` }
    });
  })
  .then(r => r.json())
  .then(user => {
    welcome.classList.add('hidden');
    card.classList.remove('hidden');

    // Avatar
    document.getElementById('avatar').src = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;

    // Tên
    const name = user.global_name || user.username;
    document.getElementById('username').innerHTML = `${name} <span>#${user.discriminator || '0000'}</span>`;

    // Banner
    if (user.banner) {
      const fmt = user.banner.startsWith('a_') ? 'gif' : 'webp';
      document.getElementById('banner').style.backgroundImage = 
        `url('https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${fmt}?size=480')`;
    }

    // Trạng thái giả lập
    const s = ['online','idle','dnd','offline'][Math.floor(Math.random()*4)];
    statusRing.className = `status-ring ${s}`;

    // Nitro badge
    if (user.premium_type > 0) {
      const i = document.createElement('img');
      i.src = 'https://discord.com/assets/648f50e7d79f44cf13e23a88a58f403e.svg';
      i.className = 'badge';
      i.title = 'Nitro';
      document.getElementById('badges').appendChild(i);
    }

    // BẮT ĐẦU NGHIÊNG NGAY VÀ LUÔN – CÁI NÀY CHẮC CHẮN CHẠY
    card.style.transition = 'transform 0.1s ease-out';
    document.addEventListener('mousemove', tiltCard);
    document.addEventListener('mouseleave', resetCard);

  })
  .catch(() => {
    welcome.classList.remove('hidden');
    card.classList.add('hidden');
  });
}

// ==================== NÚT NHẠC ====================
musicToggle.onclick = () => {
  if (isPlaying) audio.pause();
  else audio.play();
  isPlaying = !isPlaying;
  musicToggle.classList.toggle('playing', isPlaying);
};
document.body.onclick = () => audio.play(); // bật nhạc ngay lần click đầu

// ==================== NGHIÊNG SIÊU MẠNH – CHẠY NGAY KHÔNG CẦN CHỜ ====================
function tiltCard(e) {
  if (card.classList.contains('hidden')) return;
  if (window.innerWidth < 768) return;

  const xAxis = (window.innerWidth / 2 - e.clientX) / 22;
  const yAxis = (window.innerHeight / 2 - e.clientY) / 22;

  card.style.transform = `perspective(1400px) rotateX(${yAxis}deg) rotateY(${xAxis}deg) scale3d(1.05,1.05,1.05)`;
}

function resetCard() {
  if (card.classList.contains('hidden')) return;
  card.style.transform = 'perspective(1400px) rotateX(0) rotateY(0) scale3d(1,1,1)';
}

// Nếu reload trang khi đã login → vẫn nghiêng ngay lập tức
if (!card.classList.contains('hidden')) {
  card.style.transition = 'transform 0.1s ease-out';
  document.addEventListener('mousemove', tiltCard);
  document.addEventListener('mouseleave', resetCard);
}
