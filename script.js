// Telegram Web App API
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ╨б╨╛╤Б╤В╨╛╤П╨╜╨╕╨╡ ╨┐╤А╨╕╨╗╨╛╨╢╨╡╨╜╨╕╤П
let state = {
    coins: 0,
    taps: 0,
    referralCode: '',
    referralsCount: 0,
    totalCoinsEarned: 0,
    initData: tg.initData
};

// API ╨▒╨░╨╖╨╛╨▓╤Л╨╣ URL
// ╨Ф╨╗╤П ╨╗╨╛╨║╨░╨╗╤М╨╜╨╛╨╣ ╤А╨░╨╖╤А╨░╨▒╨╛╤В╨║╨╕ ╨╕╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╣╤В╨╡ ngrok: ngrok http 8080
// ╨Ф╨╗╤П ╨┐╤А╨╛╨┤╨░╨║╤И╨╡╨╜╨░ ╤Г╨║╨░╨╢╨╕╤В╨╡ URL ╨▓╨░╤И╨╡╨│╨╛ ╤Б╨╡╤А╨▓╨╡╤А╨░
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://your-server.com'; // TODO: ╨Ч╨░╨╝╨╡╨╜╨╕╤В╨╡ ╨╜╨░ URL ╨▓╨░╤И╨╡╨│╨╛ API ╤Б╨╡╤А╨▓╨╡╤А╨░ (ngrok ╨╕╨╗╨╕ ╨┐╤А╨╛╨┤╨░╨║╤И╨╡╨╜)

// ╨Я╨╛╨╗╤Г╤З╨╡╨╜╨╕╨╡ ╨┤╨░╨╜╨╜╤Л╤Е ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤П
async function fetchUserData() {
    try {
        const response = await fetch(`${API_BASE}/api/user?initData=${encodeURIComponent(state.initData)}`);
        const data = await response.json();
        
        if (data.success) {
            state.coins = data.coins;
            state.taps = data.taps;
            state.referralCode = data.referral_code;
            state.referralsCount = data.referrals_count;
            state.totalCoinsEarned = data.total_coins_earned;
            updateUI();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// ╨Ю╤В╨┐╤А╨░╨▓╨║╨░ ╤В╨░╨┐╨░
async function sendTap() {
    // ╨Я╤А╨╛╨▓╨╡╤А╨║╨░ rate limit ╨╜╨░ ╨║╨╗╨╕╨╡╨╜╤В╨╡ (╨┐╤А╨╡╨┤╨▓╨░╤А╨╕╤В╨╡╨╗╤М╨╜╨░╤П)
    const now = Date.now();
    if (!window.lastTapTime) window.lastTapTime = 0;
    if (now - window.lastTapTime < 100) {
        // ╨б╨╗╨╕╤И╨║╨╛╨╝ ╨▒╤Л╤Б╤В╤А╨╛, ╨╕╨│╨╜╨╛╤А╨╕╤А╤Г╨╡╨╝
        return;
    }
    window.lastTapTime = now;

    // ╨Р╨╜╨╕╨╝╨░╤Ж╨╕╤П ╤Г╨╝╨╡╨╜╤М╤И╨╡╨╜╨╕╤П ╤Г╨╢╨╡ ╨▓ CSS ╤З╨╡╤А╨╡╨╖ :active

    // ╨Т╨╕╨▒╤А╨░╤Ж╨╕╤П
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    try {
        const response = await fetch(`${API_BASE}/api/tap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initData: state.initData
            })
        });
        
        const data = await response.json();

        if (data.success) {
            state.coins = data.coins;
            state.taps = data.taps;
            updateUI();
            
            // ╨Р╨╜╨╕╨╝╨░╤Ж╨╕╤П ╨╝╨╛╨╜╨╡╤В╤Л
            showCoinAnimation();
        } else if (data.error === 'rate_limit_exceeded') {
            // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Б╨╛╨╛╨▒╤Й╨╡╨╜╨╕╨╡ ╨╛ rate limit
            tg.showAlert(`╨б╨╗╨╕╤И╨║╨╛╨╝ ╨▒╤Л╤Б╤В╤А╨╛! ╨Я╨╛╨┤╨╛╨╢╨┤╨╕ ${data.retry_after.toFixed(1)} ╤Б╨╡╨║`);
        }
    } catch (error) {
        console.error('Error sending tap:', error);
        tg.showAlert('╨Ю╤И╨╕╨▒╨║╨░ ╨┐╤А╨╕ ╨╛╤В╨┐╤А╨░╨▓╨║╨╡ ╤В╨░╨┐╨░');
    }
}


// ╨Ю╨▒╨╜╨╛╨▓╨╗╨╡╨╜╨╕╨╡ UI
function updateUI() {
    document.getElementById('balance').textContent = state.coins.toLocaleString();
    document.getElementById('taps').textContent = state.taps.toLocaleString();
    document.getElementById('referralCode').textContent = state.referralCode;
    document.getElementById('referralsCount').textContent = state.referralsCount;
    document.getElementById('referralsEarned').textContent = state.totalCoinsEarned.toLocaleString();
}

// ╨Р╨╜╨╕╨╝╨░╤Ж╨╕╤П ╨╝╨╛╨╜╨╡╤В╤Л
function showCoinAnimation() {
    const coin = document.createElement('div');
    coin.textContent = '+1';
    coin.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 32px;
        font-weight: bold;
        color: #4caf50;
        pointer-events: none;
        z-index: 9999;
        animation: coinFloat 1s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes coinFloat {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -150%) scale(1.5);
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(coin);
    
    setTimeout(() => {
        coin.remove();
        style.remove();
    }, 1000);
}

// ╨Ь╨╛╨┤╨░╨╗╤М╨╜╤Л╨╡ ╨╛╨║╨╜╨░
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// ╨Ч╨░╨│╤А╤Г╨╖╨║╨░ ╤А╨╡╤Д╨╡╤А╨░╨╗╨╛╨▓
async function loadReferrals() {
    try {
        const response = await fetch(`${API_BASE}/api/referrals?initData=${encodeURIComponent(state.initData)}`);
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('referralsList');
            list.innerHTML = '';
            
            if (data.referrals.length === 0) {
                list.innerHTML = '<div class="loading">╨Я╨╛╨║╨░ ╨╜╨╡╤В ╤А╨╡╤Д╨╡╤А╨░╨╗╨╛╨▓</div>';
            } else {
                data.referrals.forEach(ref => {
                    const item = document.createElement('div');
                    item.className = 'referral-item';
                    item.innerHTML = `
                        <div>
                            <div class="leaderboard-username">${ref.username}</div>
                            <div style="font-size: 12px; color: #666;">
                                ${new Date(ref.created_at).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                        <div class="leaderboard-value">+${ref.coins_earned} ╨╝╨╛╨╜╨╡╤В</div>
                    `;
                    list.appendChild(item);
                });
            }
        }
    } catch (error) {
        console.error('Error loading referrals:', error);
    }
}

// ╨Ч╨░╨│╤А╤Г╨╖╨║╨░ ╨╗╨╕╨┤╨╡╤А╨▒╨╛╤А╨┤╨░
async function loadLeaderboard(type = 'coins') {
    try {
        const response = await fetch(`${API_BASE}/api/leaderboard?initData=${encodeURIComponent(state.initData)}`);
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('leaderboardList');
            list.innerHTML = '';
            
            const leaderboard = type === 'coins' ? data.by_coins : data.by_taps;
            
            leaderboard.forEach((item, index) => {
                const leaderboardItem = document.createElement('div');
                leaderboardItem.className = 'leaderboard-item';
                leaderboardItem.innerHTML = `
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-username">${item.username}</div>
                    </div>
                    <div class="leaderboard-value">
                        ${type === 'coins' ? item.coins : item.taps} ${type === 'coins' ? '╨╝╨╛╨╜╨╡╤В' : '╤В╨░╨┐╨╛╨▓'}
                    </div>
                `;
                list.appendChild(leaderboardItem);
            });
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// ╨Ъ╨╛╨┐╨╕╤А╨╛╨▓╨░╨╜╨╕╨╡ ╤А╨╡╤Д╨╡╤А╨░╨╗╤М╨╜╨╛╨│╨╛ ╨║╨╛╨┤╨░
function copyReferralCode() {
    const code = state.referralCode;
    const botUsername = tg.initDataUnsafe?.user?.username || 'your_bot';
    const link = `https://t.me/${botUsername}?start=${code}`;
    
    // ╨Ъ╨╛╨┐╨╕╤А╨╛╨▓╨░╨╜╨╕╨╡ ╨▓ ╨▒╤Г╤Д╨╡╤А ╨╛╨▒╨╝╨╡╨╜╨░
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            tg.showAlert('╨б╤Б╤Л╨╗╨║╨░ ╤Б╨║╨╛╨┐╨╕╤А╨╛╨▓╨░╨╜╨░!');
        });
    } else {
        // Fallback ╨┤╨╗╤П ╤Б╤В╨░╤А╤Л╤Е ╨▒╤А╨░╤Г╨╖╨╡╤А╨╛╨▓
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        tg.showAlert('╨б╤Б╤Л╨╗╨║╨░ ╤Б╨║╨╛╨┐╨╕╤А╨╛╨▓╨░╨╜╨░!');
    }
}

// ╨Ч╨░╨│╤А╤Г╨╖╨║╨░ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╤П ╨╝╨╛╨╜╨╡╤В╤Л (╤Б╤В╨░╤В╨╕╤З╨╡╤Б╨║╨╛╨╡ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡)
function loadCoinImage() {
    const coinImage = document.getElementById('coinImage');
    if (coinImage) {
        // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╨╖╨░╨│╤А╤Г╨╖╨╕╨╗╨╛╤Б╤М ╨╗╨╕ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡
        if (coinImage.complete && coinImage.naturalHeight !== 0) {
            // ╨Ш╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡ ╤Г╨╢╨╡ ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜╨╛
            return;
        }
        
        // ╨Х╤Б╨╗╨╕ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡ ╨╜╨╡ ╨╖╨░╨│╤А╤Г╨╖╨╕╨╗╨╛╤Б╤М, ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╨╖╨░╨│╨╗╤Г╤И╨║╤Г
        coinImage.onerror = () => {
            console.error('Failed to load coin image');
            coinImage.style.display = 'none';
            const tapButton = document.getElementById('tapButton');
            if (tapButton) {
                tapButton.innerHTML = '<div style="font-size: 48px; display: flex; align-items: center; justify-content: center; width: 250px; height: 250px; border-radius: 50%;">ЁЯкЩ</div>';
            }
        };
        
        // ╨Я╤А╨╕╨╜╤Г╨┤╨╕╤В╨╡╨╗╤М╨╜╨╛ ╨╖╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡
        coinImage.src = coinImage.src;
    }
}

// ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨░╤Ж╨╕╤П
document.addEventListener('DOMContentLoaded', () => {
    // ╨Ч╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡ ╨╝╨╛╨╜╨╡╤В╤Л
    loadCoinImage();
    
    // ╨Ъ╨╜╨╛╨┐╨║╨░ ╤В╨░╨┐╨░
    const tapButton = document.getElementById('tapButton');
    tapButton.addEventListener('click', sendTap);
    
    // ╨Ъ╨╜╨╛╨┐╨║╨╕ ╨┤╨╡╨╣╤Б╤В╨▓╨╕╨╣
    document.getElementById('referralsBtn').addEventListener('click', () => {
        openModal('referralsModal');
        loadReferrals();
    });
    
    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        openModal('leaderboardModal');
        loadLeaderboard('coins');
    });
    
    // ╨Ч╨░╨║╤А╤Л╤В╨╕╨╡ ╨╝╨╛╨┤╨░╨╗╤М╨╜╤Л╤Е ╨╛╨║╨╛╨╜
    document.getElementById('closeReferrals').addEventListener('click', () => {
        closeModal('referralsModal');
    });
    
    document.getElementById('closeLeaderboard').addEventListener('click', () => {
        closeModal('leaderboardModal');
    });
    
    // ╨Ч╨░╨║╤А╤Л╤В╨╕╨╡ ╨┐╤А╨╕ ╨║╨╗╨╕╨║╨╡ ╨▓╨╜╨╡ ╨╝╨╛╨┤╨░╨╗╤М╨╜╨╛╨│╨╛ ╨╛╨║╨╜╨░
    document.getElementById('referralsModal').addEventListener('click', (e) => {
        if (e.target.id === 'referralsModal') {
            closeModal('referralsModal');
        }
    });
    
    document.getElementById('leaderboardModal').addEventListener('click', (e) => {
        if (e.target.id === 'leaderboardModal') {
            closeModal('leaderboardModal');
        }
    });
    
    // ╨в╨░╨▒╤Л ╨╗╨╕╨┤╨╡╤А╨▒╨╛╤А╨┤╨░
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.tab === 'coins' ? 'coins' : 'taps';
            loadLeaderboard(type);
        });
    });
    
    // ╨Ъ╨╛╨┐╨╕╤А╨╛╨▓╨░╨╜╨╕╨╡ ╤А╨╡╤Д╨╡╤А╨░╨╗╤М╨╜╨╛╨│╨╛ ╨║╨╛╨┤╨░
    document.getElementById('copyReferralCode').addEventListener('click', copyReferralCode);
    
    // ╨Ч╨░╨│╤А╤Г╨╖╨║╨░ ╨┤╨░╨╜╨╜╤Л╤Е ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤П
    fetchUserData();
    
    // ╨Ю╨▒╨╜╨╛╨▓╨╗╨╡╨╜╨╕╨╡ ╨┤╨░╨╜╨╜╤Л╤Е ╨║╨░╨╢╨┤╤Л╨╡ 5 ╤Б╨╡╨║╤Г╨╜╨┤
    setInterval(fetchUserData, 5000);
});
