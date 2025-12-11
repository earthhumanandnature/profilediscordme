const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const card = document.getElementById('profile-card');
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('bgMusic');
const statusRing = document.getElementById('status');
let isPlaying = false;

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
  .then(r => r.json())
  .then(t => {
    if (!t.access_token) throw '';
    return fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${t.access_token}` }
    });
  })
  .then(r => r.json())
  .then(user => {
    document.getElementById('loading').classList.add('hidden');
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

    // Bật hiệu ứng nghiêng
    enableTilt();
  })
  .catch(() => {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
  });
}

// Nút nhạc
musicToggle.onclick = () => {
  if (isPlaying) audio.pause();
  else audio.play();
  isPlaying = !isPlaying;
  musicToggle.classList.toggle('playing', isPlaying);
};
document.body.addEventListener('click', () => audio.play(), { once: true });

// HIỆU ỨNG NGHIÊNG CARD SIÊU MƯỢT
function enableTilt() {
  const move = (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotY = x * 0.08;
    const rotX = -y * 0.08;
    card.style.transform = `perspective(2000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;
  };
  const leave = () => {
    card.style.transform = 'perspective(2000px) rotateX(0) rotateY(0) scale(1)';
  };
  document.addEventListener('mousemove', move);
  card.addEventListener('mouseleave', leave);
}
