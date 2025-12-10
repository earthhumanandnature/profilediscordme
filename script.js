class DiscordProfile {
    constructor() {
        this.clientId = '1416381905024323755';
        this.redirectUri = 'https://mydiscordprofile.vercel.app';
        this.token = null;
        this.userData = null;

        this.init();
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            this.token = tokenFromUrl;
            localStorage.setItem('discord_token', this.token);
            window.history.replaceState({}, document.title, '/');
            this.loadUserData();
            return;
        }

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

            if (!res.ok) throw new Error('Token invalid');

            this.userData = await res.json();
            this.displayProfile();
            this.showProfileContainer();
        } catch (err) {
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

        // Username
        document.getElementById('username').textContent = this.userData.global_name || this.userData.username;

        // Discriminator
        const discEl = document.getElementById('discriminator');
        if (this.userData.discriminator && this.userData.discriminator !== '0') {
            discEl.textContent = `#${this.userData.discriminator}`;
            discEl.style.display = 'inline';
        } else {
            discEl.style.display = 'none';
        }

        // Bio
        document.getElementById('bio').textContent = this.userData.bio || 'Chưa có mô tả...';

        // User ID
        document.getElementById('user-id').textContent = this.userData.id;

        // === BADGES – ĐÃ LOẠI BỎ HOÀN TOÀN DẤU << ĐỂ TRÁNH LỖI ===
        const badgesContainer = document.getElementById('badges');
        badgesContainer.innerHTML = '';

        const flags = (this.userData.flags || 0) + (this.userData.public_flags || 0);

        const badges = [
            { bit: 1,      name: 'Discord Employee' },
            { bit: 2,      name: 'Partner' },
            { bit: 4,      name: 'HypeSquad Events' },
            { bit: 8,      name: 'Bug Hunter Lv1' },
            { bit: 64,     name: 'House Bravery' },
            { bit: 128,    name: 'House Brilliance' },
            { bit: 256,    name: 'House Balance' },
            { bit: 512,    name: 'Early Supporter' },
            { bit: 16384,  name: 'Bug Hunter Lv2' },
            { bit: 131072, name: 'Verified Bot Developer' },
            { bit: 262144, name: 'Active Developer' }
        ];

        badges.forEach(b => {
            if (flags & b.bit) {
                const span = document.createElement('span');
                span.className = 'badge';
                span.textContent = b.name;
                badgesContainer.appendChild(span);
            }
        });

        // Nitro badge
        if (this.userData.premium_type && this.userData.premium_type > 0) {
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
