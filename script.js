class DiscordProfile {
    constructor() {
        this.clientId = '1416381905024323755';
        this.redirectUri = 'https://mydiscordprofile.vercel.app'; // DOMAIN MỚI CỦA BẠN
        this.token = null;
        this.userData = null;

        this.init();
    }

    init() {
        // 1. Kiểm tra token từ URL (do serverless callback redirect về)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            this.token = tokenFromUrl;
            localStorage.setItem('discord_token', this.token);
            window.history.replaceState({}, document.title, '/'); // xóa ?token=...
            this.loadUserData();
            return;
        }

        // 2. Lấy token từ localStorage (nếu đã đăng nhập trước)
        this.token = localStorage.getItem('discord_token');
        if (this.token) {
            this.loadUserData();
        }

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    login() {
        const authUrl = `https://discord.com/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=identify`;
        window.location.href = authUrl;
    }

    async loadUserData() {
        if (!this.token) return;

        try {
            const res = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (!res.ok) {
                this.logout();
                return;
            }

            this.userData = await res.json();
            this.displayProfile();
            this.showProfileContainer();
        } catch (err) {
            console.error(err);
            this.logout();
        }
    }

    displayProfile() {
        if (!this.userData) return;

        // Avatar
        const avatarUrl = this.userData.avatar
            ? `https://cdn.discordapp.com/avatars/${this.userData.id}/${this.userData.avatar}.webp?size=256`
            : `https://cdn.discordapp.com/embed/avatars/${(this.userData.discriminator || 0) % 5}.png`;

        document.getElementById('avatar').src = avatarUrl;

        // Username + discriminator
        document.getElementById('username').textContent = this.userData.global_name || this.userData.username || 'User';

        const discEl = document.getElementById('discriminator');
        if (this.userData.discriminator && this.userData.discriminator !== '0') {
            discEl.textContent = `#${this.userData.discriminator}`;
            discEl.style.display = 'inline';
        } else {
            discEl.style.display = 'none';
        }

        // Bio (mô tả)
        document.getElementById('bio').textContent = this.userData.bio || 'Chưa có mô tả...';

        // User ID
        document.getElementById('user-id').textContent = this.userData.id;

        // Badges
        const badgesContainer = document.getElementById('badges');
        badgesContainer.innerHTML = '';

        const flags = this.userData.flags || 0;
        const publicFlags = this.userData.public_flags || 0;
        const allFlags = flags | publicFlags;

        const badgeMap = {
            1<<0:   'Discord Employee',
            1<<1:   'Partner',
            1<<2:   'HypeSquad Events',
            1<<3:   'Bug Hunter Level 1',
            1<<6:   'House Bravery',
            1<<7:   'House Brilliance',
            1<<8:   'House Balance',
            1<<9:   'Early Supporter',
            1<<14:  'Bug Hunter Level 2',
            1<<17:  'Verified Bot Developer',
            1<<18:  'Active Developer'
        };

        Object.entries(badgeMap).forEach(([bit, name]) => {
            if (allFlags & Number(bit)) {
                const badge = document.createElement('span');
                badge.className = 'badge';
                badge.textContent = name;
                badgesContainer.appendChild(badge);
            }
        });

        // Nitro
        if (this.userData.premium_type > 0) {
            const nitro = document.createElement('span');
            nitro.className = 'badge nitro';
            nitro.textContent = 'Nitro';
            badgesContainer.appendChild(nitro);
        }
    }

    showProfileContainer() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('profile-container').style.display = 'flex';
    }

    logout() {
        localStorage.removeItem('discord_token');
        this.token = null;
        this.userData = null;
        document.getElementById('profile-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
        window.location.href = '/';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DiscordProfile();

});
