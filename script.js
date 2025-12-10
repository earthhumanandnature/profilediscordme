class DiscordProfile {
    constructor() {
        this.clientId = '1416381905024323755';
        this.redirectUri = 'https://mydiscordprofile.vercel.app';
        this.token = null;
        this.userData = null;
        this.init();
    }

    init() {
        // Lấy token từ URL (?token=...)
        var params = new URLSearchParams(window.location.search);
        var tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
            this.token = tokenFromUrl;
            localStorage.setItem('discord_token', this.token);
            window.history.replaceState({}, document.title, '/');
            this.loadUserData();
            return;
        }

        // Lấy token đã lưu
        this.token = localStorage.getItem('discord_token');
        if (this.token) {
            this.loadUserData();
        }

        this.bindEvents();
    }

    bindEvents() {
        var loginBtn = document.getElementById('login-btn');
        var logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                this.login();
            }.bind(this));
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                this.logout();
            }.bind(this));
        }
    }

    login() {
        var url = 'https://discord.com/oauth2/authorize?client_id=' + this.clientId +
                  '&redirect_uri=' + encodeURIComponent(this.redirectUri) +
                  '&response_type=code&scope=identify';
        window.location.href = url;
    }

    async loadUserData() {
        if (!this.token) return;

        try {
            var res = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { 'Authorization': 'Bearer ' + this.token }
            });

            if (!res.ok) throw new Error('Invalid token');

            this.userData = await res.json();
            this.displayProfile();
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('profile-container').style.display = 'flex';
        } catch (e) {
            this.logout();
        }
    }

    displayProfile() {
        if (!this.userData) return;

        // Avatar
        var avatar = this.userData.avatar
            ? 'https://cdn.discordapp.com/avatars/' + this.userData.id + '/' + this.userData.avatar + '.webp?size=256'
            : 'https://cdn.discordapp.com/embed/avatars/' + ((this.userData.discriminator || 0) % 5) + '.png';
        document.getElementById('avatar').src = avatar;

        // Tên
        document.getElementById('username').textContent = this.userData.global_name || this.userData.username;

        // Tag
        var disc = document.getElementById('discriminator');
        if (this.userData.discriminator && this.userData.discriminator !== '0') {
            disc.textContent = '#' + this.userData.discriminator;
        } else {
            disc.style.display = 'none';
        }

        // Bio
        document.getElementById('bio').textContent = this.userData.bio || 'Chưa có mô tả...';

        // ID
        document.getElementById('user-id').textContent = this.userData.id;

        // Badges (không dùng << nữa)
        var container = document.getElementById('badges');
        container.innerHTML = '';
        var flags = (this.userData.flags || 0) | (this.userData.public_flags || 0);

        var badgeList = [
            { bit: 1,      name: 'Staff' },
            { bit: 2,      name: 'Partner' },
            { bit: 4,      name: 'HypeSquad Events' },
            { bit: 8,      name: 'Bug Hunter Lv1' },
            { bit: 64,     name: 'Bravery' },
            { bit: 128,    name: 'Brilliance' },
            { bit: 256,    name: 'Balance' },
            { bit: 512,    name: 'Early Supporter' },
            { bit: 16384,  name: 'Bug Hunter Lv2' },
            { bit: 131072, name: 'Verified Dev' },
            { bit: 262144, name: 'Active Dev' }
        ];

        badgeList.forEach(function(b) {
            if (flags & b.bit) {
                var span = document.createElement('span');
                span.className = 'badge';
                span.textContent = b.name;
                container.appendChild(span);
            }
        });

        if (this.userData.premium_type && this.userData.premium_type > 0) {
            var nitro = document.createElement('span');
            nitro.className = 'badge nitro';
            nitro.textContent = 'Nitro';
            container.appendChild(nitro);
        }
    }

    logout() {
        localStorage.removeItem('discord_token');
        document.getElementById('profile-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
        window.location.href = '/';
    }
}

// Khởi động
document.addEventListener('DOMContentLoaded', function() {
    new DiscordProfile();
});
