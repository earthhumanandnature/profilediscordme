const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const card = document.getElementById('profile-card');
const welcome = document.getElementById('welcome');
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('bgMusic');
const statusRing = document.getElementById('status');
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
      scope: 'identify'
    })
  })
  .then(r => r.json())
  .then(t => {
    if (!t.access_token) throw 'No token';
    return fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${t.access_token}` }
    });
  })
  .then(r => r.json())
  .then(user => {
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

    // NGHIÊNG + PHÓNG TO SIÊU ĐẸP
    card.style.transition = 'transform 0.1s ease-out';
    document.onmousemove = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 25;
      const y = (window.innerHeight / 2 - e.clientY) / 25;
      card.style.transform = `perspective(1400px) rotateX(${y}deg) rotateY(${x}deg) scale(1.06)`;
    };
    document.onmouseout = () => {
      card.style.transform = 'perspective(1400px) rotateX(0) rotateY(0) scale(1)';
    };

  })
  .catch(() => {
    welcome.classList.remove('hidden');
    card.classList.add('hidden');
  });
}

// ==================== NÚT NHẠC HOẠT ĐỘNG 100% ====================
musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (audio.paused) {
    audio.play();
    musicToggle.classList.add('playing');
  } else {
    audio.pause();
    musicToggle.classList.remove('playing');
  }
});

// Bật nhạc lần đầu khi click bất kỳ đâu
document.body.addEventListener('click', () => audio.play(), { once: true });

// Nếu reload khi đã login → vẫn nghiêng ngon
if (!card.classList.contains('hidden')) {
  document.onmousemove = (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 25;
    const y = (window.innerHeight / 2 - e.clientY) / 25;
    card.style.transform = `perspective(1400px) rotateX(${y}deg) rotateY(${x}deg) scale(1.06)`;
  };
}
