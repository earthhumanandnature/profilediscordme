const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const card = document.getElementById('profile-card');
const welcome = document.getElementById('welcome');
const musicToggle = document.getElementById('musicToggle');
const audio = document.getElementById('bgMusic');
const statusRing = document.getElementById('status');
let isPlaying = false;

if (!code) {
  card.classList.add('hidden');
  welcome.classList.remove('hidden');
} else {
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
  .then(r=>r.json())
  .then(t=>{if(!t.access_token)throw'';return fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:`Bearer ${t.access_token}`}})})
  .then(r=>r.json())
  .then(user=>{
    welcome.classList.add('hidden');
    card.classList.remove('hidden');

    document.getElementById('avatar').src = user.avatar 
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator||0)%5}.png`;

    const name = user.global_name || user.username;
    document.getElementById('username').innerHTML = `${name} <span>#${user.discriminator||'0000'}</span>`;

    if(user.banner){
      const fmt = user.banner.startsWith('a_')?'gif':'webp';
      document.getElementById('banner').style.backgroundImage = `url('https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${fmt}?size=480')`;
    }

    const s = ['online','idle','dnd','offline'][Math.floor(Math.random()*4)];
    statusRing.className = `status-ring ${s}`;

    if(user.premium_type>0){
      const i=document.createElement('img');
      i.src='https://discord.com/assets/648f50e7d79f44cf13e23a88a58f403e.svg';
      i.className='badge'; i.title='Nitro';
      document.getElementById('badges').appendChild(i);
    }

    // NGHIÊNG NGAY VÀ LUÔN – CHẠY 1000000%
    document.onmousemove = (e) => {
      if(window.innerWidth < 768) return;
      const x = (window.innerWidth/2 - e.clientX)/25;
      const y = (window.innerHeight/2 - e.clientY)/25;
      card.style.transform = `perspective(1400px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.05,1.05,1.05)`;
    };
    document.onmouseleave = document.onmouseout = () => {
      card.style.transform = 'perspective(1400px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    };
  })
  .catch(()=>{
    welcome.classList.remove('hidden');
    card.classList.add('hidden');
  });
}

// Nút nhạc
musicToggle.onclick = () => {
  if(isPlaying) audio.pause(); else audio.play();
  isPlaying=!isPlaying;
  musicToggle.classList.toggle('playing',isPlaying);
};
document.body.onclick = () => audio.play();
