const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const card        = document.getElementById('profile-card');
const welcome     = document.getElementById('welcome');
const musicToggle = document.getElementById('musicToggle');
const audio       = document.getElementById('bgMusic');
const statusRing  = document.getElementById('status');
let isPlaying = false;

// ==================== CHƯA ĐĂNG NHẬP ====================
if (!code) {
  card.classList.add('hidden');
  welcome.classList.remove('hidden');
} 
// ==================== ĐÃ ĐĂNG NHẬP ====================
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
    return fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${t.access_token}` } });
  })
  .then(r => r.json())
  .then(user => {
    welcome.classList.add('hidden');
    card.classList.remove('hidden');

    // Avatar
    const av = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;
    document.getElementById('avatar').src = av;

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

    // BẬT HIỆU ỨNG NGHIÊNG SIÊU ĐẸP NHƯ CODE CŨ
    enableOldTilt();
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
document.body.addEventListener('click', () => audio.play(), { once: true });

// ==================== HIỆU ỨNG NGHIÊNG CŨ (SIÊU MƯỢT, SIÊU ĐẸP) ====================
function enableOldTilt() {
  const move = (e) => {
    if (window.innerWidth < 768) return;

    const rect = card.getBoundingClientRect();
    const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
    const yAxis = (window.innerHeight / 2 - e.clientY) / 25;

    card.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  };

  const leave = () => {
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  };

  document.addEventListener('mousemove', move);
  document.querySelector('.container').addEventListener('mouseleave', leave);
}

// Nếu reload trang khi đã login → vẫn bật nghiêng ngay
if (!card.classList.contains('hidden')) enableOldTilt();
