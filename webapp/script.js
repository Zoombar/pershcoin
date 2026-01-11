// Telegram Web App API
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Состояние приложения
let state = {
    coins: 0,
    taps: 0,
    referralCode: '',
    referralsCount: 0,
    totalCoinsEarned: 0,
    initData: tg.initData
};

// API базовый URL
// Для локальной разработки используйте ngrok: ngrok http 8080
// Для продакшена укажите URL вашего сервера
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://your-server.com'; // TODO: Замените на URL вашего API сервера (ngrok или продакшен)

// Получение данных пользователя
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

// Отправка тапа
async function sendTap() {
    // Проверка rate limit на клиенте (предварительная)
    const now = Date.now();
    if (!window.lastTapTime) window.lastTapTime = 0;
    if (now - window.lastTapTime < 100) {
        // Слишком быстро, игнорируем
        return;
    }
    window.lastTapTime = now;

    // Анимация
    const tapButton = document.getElementById('tapButton');
    tapButton.classList.add('tapped');
    setTimeout(() => tapButton.classList.remove('tapped'), 600);

    // Вибрация
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
            
            // Анимация монеты
            showCoinAnimation();
        } else if (data.error === 'rate_limit_exceeded') {
            // Показываем сообщение о rate limit
            tg.showAlert(`Слишком быстро! Подожди ${data.retry_after.toFixed(1)} сек`);
        }
    } catch (error) {
        console.error('Error sending tap:', error);
        tg.showAlert('Ошибка при отправке тапа');
    }
}


// Обновление UI
function updateUI() {
    document.getElementById('balance').textContent = state.coins.toLocaleString();
    document.getElementById('taps').textContent = state.taps.toLocaleString();
    document.getElementById('referralCode').textContent = state.referralCode;
    document.getElementById('referralsCount').textContent = state.referralsCount;
    document.getElementById('referralsEarned').textContent = state.totalCoinsEarned.toLocaleString();
}

// Анимация монеты
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

// Модальные окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Загрузка рефералов
async function loadReferrals() {
    try {
        const response = await fetch(`${API_BASE}/api/referrals?initData=${encodeURIComponent(state.initData)}`);
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('referralsList');
            list.innerHTML = '';
            
            if (data.referrals.length === 0) {
                list.innerHTML = '<div class="loading">Пока нет рефералов</div>';
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
                        <div class="leaderboard-value">+${ref.coins_earned} монет</div>
                    `;
                    list.appendChild(item);
                });
            }
        }
    } catch (error) {
        console.error('Error loading referrals:', error);
    }
}

// Загрузка лидерборда
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
                        ${type === 'coins' ? item.coins : item.taps} ${type === 'coins' ? 'монет' : 'тапов'}
                    </div>
                `;
                list.appendChild(leaderboardItem);
            });
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Копирование реферального кода
function copyReferralCode() {
    const code = state.referralCode;
    const botUsername = tg.initDataUnsafe?.user?.username || 'your_bot';
    const link = `https://t.me/${botUsername}?start=${code}`;
    
    // Копирование в буфер обмена
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            tg.showAlert('Ссылка скопирована!');
        });
    } else {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        tg.showAlert('Ссылка скопирована!');
    }
}

// Загрузка фото пользователя в монету
function loadUserPhoto() {
    const coinFace = document.getElementById('coinFace');
    const user = tg.initDataUnsafe?.user;
    
    if (user && user.photo_url) {
        // Используем фото из Telegram
        const img = document.createElement('img');
        img.src = user.photo_url;
        img.alt = 'User photo';
        img.onerror = () => {
            // Если фото не загрузилось, показываем инициалы
            showUserInitials(user);
        };
        coinFace.appendChild(img);
    } else if (user) {
        // Если фото нет, показываем инициалы
        showUserInitials(user);
    } else {
        // Заглушка, если данных нет
        coinFace.innerHTML = '<div style="font-size: 48px;">🪙</div>';
    }
}

// Показать инициалы пользователя
function showUserInitials(user) {
    const coinFace = document.getElementById('coinFace');
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase() || '?';
    
    coinFace.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            color: #d4af37;
            background: linear-gradient(135deg, #f4d03f 0%, #d4af37 100%);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        ">${initials}</div>
    `;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем фото пользователя в монету
    loadUserPhoto();
    
    // Кнопка тапа
    const tapButton = document.getElementById('tapButton');
    tapButton.addEventListener('click', sendTap);
    
    // Кнопки действий
    document.getElementById('referralsBtn').addEventListener('click', () => {
        openModal('referralsModal');
        loadReferrals();
    });
    
    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        openModal('leaderboardModal');
        loadLeaderboard('coins');
    });
    
    // Закрытие модальных окон
    document.getElementById('closeReferrals').addEventListener('click', () => {
        closeModal('referralsModal');
    });
    
    document.getElementById('closeLeaderboard').addEventListener('click', () => {
        closeModal('leaderboardModal');
    });
    
    // Закрытие при клике вне модального окна
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
    
    // Табы лидерборда
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.tab === 'coins' ? 'coins' : 'taps';
            loadLeaderboard(type);
        });
    });
    
    // Копирование реферального кода
    document.getElementById('copyReferralCode').addEventListener('click', copyReferralCode);
    
    // Загрузка данных пользователя
    fetchUserData();
    
    // Обновление данных каждые 5 секунд
    setInterval(fetchUserData, 5000);
});
