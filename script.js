const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const card = document.getElementById('profile-card');
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('bgMusic');
let isPlaying = false;

// === XỬ LÝ DISCORD OAUTH & LẤY THÔNG TIN USER ===
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
    if (!tokenData.access_token) throw new Error('No access token');
    return fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
  })
  .then(res => res.json())
  .then(user => {
    // Ẩn loading, hiện card
    document.getElementById('loading').classList.add('hidden');
    card.classList.remove('hidden');

    // Avatar
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;
    document.getElementById('avatar').src = avatarUrl;

    // Username + Tag
    const displayName = user.global_name || user.username;
    document.getElementById('username').innerHTML = 
      `${displayName} <span>#${user.discriminator || '0000'}</span>`;

    // Banner
    if (user.banner) {
      {
      const format = user.banner.startsWith('a_') ? 'gif' : 'webp';
      const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${format}?size=480`;
      document.getElementById('banner').style.backgroundImage = `url('${bannerUrl})`;
    }

    // Trạng thái giả lập (vì scope identify không có presence)
    const fakeStatuses = ['online', 'idle', 'dnd', 'offline'];
    const randomStatus = fakeStatuses[Math.floor(Math.random() * fakeStatuses.length)];
    document.getElementById('status').classList.add(randomStatus);

    // Badge Nitro
    if (user.premium_type && user.premium_type > 0) {
      const nitro = document.createElement('img');
      nitro.src = 'https://discord.com/assets/648f50e7d79f44cf13e23a88a58f403e.svg';
      nitro.className = 'badge';
      nitro.title = 'Discord Nitro';
      document.getElementById('badges').appendChild(nitro);
    }

    // Các badge khác (nếu cần mở rộng thì thêm ở đây)
  })
  .catch(err => {
    console.error('Lỗi khi lấy thông tin user:', err);
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
  });
}

// === NÚT BẬT/TẮT NHẠC ===
musicToggle.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    musicToggle.classList.remove('playing');
  } else {
    audio.play().catch(() => {
      alert("Click thêm 1 lần nữa để bật nhạc nhé!");
    });
    musicToggle.classList.add('playing');
  }
  isPlaying = !isPlaying;
});

// Cho phép phát nhạc sau lần tương tác đầu tiên (tránh lỗi autoplay)
document.body.addEventListener('click', () => audio.play().catch(() => {}), { once: true });

// === HIỆU ỨNG NGHIÊNG CARD THEO CHUỘT (mạnh, mượt, đúng hướng) ===
const handleMouseMove = (e) => {
  if (window.innerWidth < 768) return; // tắt trên mobile

  const rect = card.getBoundingClientRect();
  const cardX = rect.left + rect.width / 2;
  const cardY = rect.top + rect.height / 2;

  const rotateY = (e.clientX - cardX) / 18;   // nghiêng ngang (dương = nghiêng về phải)
  const rotateX = (cardY - e.clientY) / 18;   // nghiêng dọc (dương = nghiêng lên trên)

  card.style.transform = `
    perspective(1500px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    scale(1.04)
  `;
};

const handleMouseLeave = () => {
  card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0) scale(1)';
};

// Chỉ bật hiệu ứng khi card đã hiện (đã login thành công)
if (card.classList.contains('hidden')) {
  // Nếu chưa login → chờ card hiện rồi mới gắn sự kiện
  const observer = new MutationObserver(() => {
    if (!card.classList.contains('hidden')) {
      document.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    }
  });
  observer.observe(card, { attributes: true, attributeFilter: ['class'] });
} else {
  // Nếu đã login sẵn (reload trang)
  document.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseleave', handleMouseLeave);
}
