document.addEventListener("DOMContentLoaded", () => {

  // ==================== DOM ====================
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  const card = document.getElementById('profile-card');
  const welcome = document.getElementById('welcome');
  const musicToggle = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  const statusRing = document.getElementById('status');

  // ⚠️ nếu thiếu element → dừng tránh crash
  if (!card || !welcome) {
    console.warn("Thiếu element HTML, script dừng an toàn");
    return;
  }

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
      if (!t.access_token) throw "No token";
      return fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${t.access_token}` }
      });
    })
    .then(r => r.json())
    .then(user => {
      card.classList.remove('hidden');
      initWaterBackground(); // ✅ chỉ chạy khi login

      // Avatar
      document.getElementById('avatar').src = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;

      // Name
      const name = user.global_name || user.username;
      document.getElementById('username').innerHTML =
        `${name} <span>#${user.discriminator || '0000'}</span>`;

      // Banner
      if (user.banner) {
        const fmt = user.banner.startsWith('a_') ? 'gif' : 'webp';
        document.getElementById('banner').style.backgroundImage =
          `url('https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${fmt}?size=480')`;
      }

      // Status giả
      const s = ['online','idle','dnd','offline'][Math.floor(Math.random()*4)];
      if (statusRing) statusRing.className = `status-ring ${s}`;

      // Nghiêng card
      card.style.transition = 'transform 0.1s ease-out';
      document.addEventListener('mousemove', e => {
        const x = (window.innerWidth / 2 - e.clientX) / 25;
        const y = (window.innerHeight / 2 - e.clientY) / 25;
        card.style.transform =
          `perspective(1400px) rotateX(${y}deg) rotateY(${x}deg) scale(1.06)`;
      });
      document.addEventListener('mouseout', () => {
        card.style.transform =
          'perspective(1400px) rotateX(0) rotateY(0) scale(1)';
      });
    })
    .catch(err => {
      console.error(err);
      welcome.classList.remove('hidden');
      card.classList.add('hidden');
    });
  }

  // ==================== MUSIC ====================
  if (musicToggle && audio) {
    musicToggle.addEventListener('click', e => {
      e.stopPropagation();
      if (audio.paused) {
        audio.play();
        musicToggle.classList.add('playing');
      } else {
        audio.pause();
        musicToggle.classList.remove('playing');
      }
    });

    document.body.addEventListener('click', () => audio.play(), { once: true });
  }

});


// ==================== WATER BACKGROUND ====================
let waterStarted = false;

async function initWaterBackground() {
  if (waterStarted) return;
  waterStarted = true;

  const THREE = await import(
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'
  );

  const canvas = document.getElementById('water-bg');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  const scene = new THREE.Scene();

  const SIZE = 120;
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);
  camera.position.set(0, SIZE, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, 200, 200);

  const uniforms = {
    uTime: { value: 0 },
    uPulseCenter: { value: new THREE.Vector2(9999, 9999) },
    uPulseTime: { value: -10 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uPulseCenter;
      uniform float uPulseTime;
      varying float vWave;

      void main(){
        vec3 pos = position;

        float wave =
          sin(pos.x * 0.15 + uTime * 2.0) +
          cos(pos.y * 0.15 + uTime * 2.0);

        float d = distance(pos.xy, uPulseCenter);
        float pulse =
          sin(d * 1.5 - (uTime - uPulseTime) * 8.0)
          * exp(-d * 0.08)
          * 3.5;

        pos.z += wave * 0.6 + pulse;
        vWave = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
      }
    `,
    fragmentShader: `
      varying float vWave;
      void main(){
        vec3 deep = vec3(0.02,0.2,0.4);
        vec3 light = vec3(0.3,0.7,1.0);
        float f = clamp(vWave * 0.3 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(mix(deep, light, f), 1.0);
      }
    `,
    side: THREE.DoubleSide
  });

  const water = new THREE.Mesh(geo, mat);
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // CLICK → SÓNG
  window.addEventListener('click', e => {
    const x = (e.clientX / innerWidth - 0.5) * SIZE;
    const y = (0.5 - e.clientY / innerHeight) * SIZE;
    uniforms.uPulseCenter.value.set(x, y);
    uniforms.uPulseTime.value = uniforms.uTime.value;
  });

  // RANDOM 2 SÓNG / GIÂY
  setInterval(() => {
    uniforms.uPulseCenter.value.set(
      (Math.random() - 0.5) * SIZE,
      (Math.random() - 0.5) * SIZE
    );
    uniforms.uPulseTime.value = uniforms.uTime.value;
  }, 500);

  function animate(t) {
    uniforms.uTime.value = t * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });
}
