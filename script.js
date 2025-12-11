const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const card         = document.getElementById('profile-card');
const welcome      = document.getElementById('welcome');   // màn hình chào
const musicToggle  = document.getElementById('musicToggle');
const audio        = document.getElementById('bgMusic');
const statusRing   = document.getElementById('status');
let isPlaying = false;

// ======================= NẾU CHƯA ĐĂNG NHẬP =======================
if (!code) {
  // Ẩn card, hiện màn hình chào
  card.classList.add('hidden');
  welcome.classList.remove('hidden');
} 
// ======================= ĐÃ CÓ CODE → ĐĂNG NHẬP =======================
else {
  // Ẩn màn hình chào trước (trong trường hợp reload trang)
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
    if (!t.access_token) throw new Error('No token');
    return fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${t.access_token}` }
    });
  })
  .then(r => r.json())
  .then(user => {
    // Ẩn welcome, hiện card profile
    welcome.classList.add('hidden');
    card.classList.remove('hidden');

    // Avatar
    const av = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;
    document.getElementById('avatar').src = av;

    // Tên + tag
    const name = user.global_name || user.username;
    document.getElementById('username').innerHTML = 
      `${name} <span>#${user.discriminator || '0000'}</span>`;

    // Banner
    if (user.banner) {
      const fmt = user.banner.startsWith('a_') ? 'gif' : 'webp';
      document.getElementById('banner').style.backgroundImage = 
        `url('https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${fmt}?size=480')`;
    }

    // Trạng thái giả lập (xanh lá/vàng/đỏ/xám)
    const statuses = ['online', 'idle', 'dnd', 'offline'];
    const s = statuses[Math.floor(Math.random() * 4)];
    statusRing.className = `status-ring ${s}`;

    // Badge Nitro
    if (user.premium_type && user.premium_type > 0) {
      const img = document.createElement('img');
      img.src = 'https://discord.com/assets/648f50e7d79f44cf13e23a88a58f403e.svg';
      img.className = 'badge';
      img.title = 'Discord Nitro';
      document.getElementById('badges').appendChild(img);
    }

    // Bật hiệu ứng nghiêng + phồng siêu mượt
    enableTilt();
  })
  .catch(err => {
    console.error(err);
    // Nếu lỗi → hiện lại màn hình chào
    welcome.classList.remove('hidden');
    card.classList.add('hidden');
  });
}

// ======================= NÚT NHẠC =======================
musicToggle.onclick = () => {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play().catch(() => {});
  }
  isPlaying = !isPlaying;
  musicToggle.classList.toggle('playing', isPlaying);
};

// Cho phép phát nhạc sau lần tương tác đầu (tránh lỗi autoplay)
document.body.addEventListener('click', () => audio.play().catch(() => {}), { once: true });

// ======================= HIỆU ỨNG NGHIÊNG CARD =======================
function enableTilt() {
  const move = (e) => {
    if (window.innerWidth < 768) return; // tắt trên mobile nếu muốn

    const rect = card.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    const rotY = x * 0.08;   // nghiêng ngang mạnh
    const rotX = -y * 0.08;  // nghiêng dọc

    card.style.transform = `
      perspective(2000px) 
      rotateX(${rotX}deg) 
      rotateY(${rotY}deg) 
      scale(1.05)
    `;
  };

  const leave = () => {
    card.style.transform = 'perspective(2000px) rotateX(0) rotateY(0) scale(1)';
  };

  document.addEventListener('mousemove', move);
  card.addEventListener('mouseleave', leave);
}

// Nếu reload trang khi đã login rồi → vẫn bật tilt ngay
if (!card.classList.contains('hidden')) {
  enableTilt();
}
