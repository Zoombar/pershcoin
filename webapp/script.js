// Telegram Web App API
let tg = null;
try {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
    }
} catch (error) {
    console.log('Telegram WebApp API not available, running in browser mode');
}

// Состояние приложения
let state = {
    coins: 0,
    taps: 0,
    referralCode: '',
    referralsCount: 0,
    totalCoinsEarned: 0,
    initData: tg ? tg.initData : ''
};

// Логируем initData для отладки (только в консоли)
if (tg && tg.initData) {
    console.log('Telegram WebApp initData получен');
} else {
    console.warn('Telegram WebApp initData не доступен - приложение будет работать в демо режиме');
}

// API базовый URL
// Определяем URL API в зависимости от окружения
let API_BASE = null;

// Настройка API URL
// Для локальной разработки используйте localhost
// Для продакшна укажите URL вашего API сервера
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Локальная разработка
    API_BASE = 'http://localhost:8080';
} else {
    // Продакшн - укажите URL вашего API сервера
    // Примеры:
    // API_BASE = 'https://your-api-server.com';
    // API_BASE = 'https://api.yourdomain.com';
    // API_BASE = 'https://your-server.com:8080';
    
    // ВАЖНО: Замените на URL вашего API сервера!
    // GitHub Pages может хостить только статические файлы,
    // поэтому API должен быть на отдельном сервере
    // 
    // Бесплатные варианты для API:
    // - Railway.app: https://railway.app
    // - Render.com: https://render.com
    // - Fly.io: https://fly.io
    // - Replit: https://replit.com
    //
    // После настройки API сервера, замените URL ниже:
    API_BASE = null; // Укажите URL вашего API сервера, например: 'https://your-app.railway.app'
    
    // Если API на том же домене (не GitHub Pages), можно использовать:
    // const protocol = window.location.protocol;
    // const hostname = window.location.hostname;
    // API_BASE = `${protocol}//${hostname}:8080`;
}

// Получение данных пользователя
async function fetchUserData() {
    // Если нет initData, работаем в демо режиме
    if (!state.initData || !API_BASE) {
        // Демо режим - используем значения по умолчанию
        if (!state.referralCode) {
            state.referralCode = 'PERSH' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        }
        updateUI();
        return;
    }
    
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
        } else {
            console.error('Error from API:', data.error);
            // Если пользователь не найден, API создаст его автоматически при следующем запросе
            if (data.error === 'user_not_found') {
                console.log('Пользователь не найден, будет создан автоматически');
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Демо режим при ошибке сети
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.warn('Сеть недоступна, работаем в демо режиме');
            if (!state.referralCode) {
                state.referralCode = 'PERSH' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            }
            updateUI();
        }
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

    // Вибрация
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // Если нет initData, работаем в демо режиме
    if (!state.initData || !API_BASE) {
        state.coins += 1;
        state.taps += 1;
        updateUI();
        showCoinAnimation();
        return;
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
            if (tg && tg.showAlert) {
                tg.showAlert(`Слишком быстро! Подожди ${data.retry_after.toFixed(1)} сек`);
            }
        } else {
            console.error('Error from API:', data.error);
            if (tg && tg.showAlert) {
                tg.showAlert(`Ошибка: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error sending tap:', error);
        // Демо режим при ошибке сети
        if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
            console.warn('Сеть недоступна, работаем в демо режиме');
            state.coins += 1;
            state.taps += 1;
            updateUI();
            showCoinAnimation();
        } else {
            if (tg && tg.showAlert) {
                tg.showAlert('Ошибка соединения с сервером');
            }
        }
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
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Загрузка рефералов
async function loadReferrals() {
    const list = document.getElementById('referralsList');
    if (!list) return;
    
    if (!API_BASE) {
        list.innerHTML = '<div class="loading">Демо режим: API сервер не настроен</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/referrals?initData=${encodeURIComponent(state.initData)}`);
        const data = await response.json();
        
        if (data.success) {
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
        list.innerHTML = '<div class="loading">Ошибка загрузки рефералов</div>';
    }
}

// Загрузка лидерборда
async function loadLeaderboard(type = 'coins') {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    
    if (!API_BASE) {
        list.innerHTML = '<div class="loading">Демо режим: API сервер не настроен</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/leaderboard?initData=${encodeURIComponent(state.initData)}`);
        const data = await response.json();
        
        if (data.success) {
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
        list.innerHTML = '<div class="loading">Ошибка загрузки лидерборда</div>';
    }
}

// Копирование реферального кода
function copyReferralCode() {
    const code = state.referralCode;
    const botUsername = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user.username : 'your_bot';
    const link = `https://t.me/${botUsername}?start=${code}`;
    
    // Копирование в буфер обмена
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            if (tg && tg.showAlert) {
                tg.showAlert('Ссылка скопирована!');
            } else {
                alert('Ссылка скопирована!');
            }
        });
    } else {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (tg && tg.showAlert) {
            tg.showAlert('Ссылка скопирована!');
        } else {
            alert('Ссылка скопирована!');
        }
    }
}

// Обработка ошибки загрузки изображения монеты
function setupCoinImageErrorHandler() {
    const coinImage = document.getElementById('coinImage');
    if (coinImage) {
        coinImage.onerror = () => {
            console.error('Failed to load coin image');
            coinImage.style.display = 'none';
            const tapButton = document.getElementById('tapButton');
            if (tapButton) {
                tapButton.innerHTML = '<div style="font-size: 48px; display: flex; align-items: center; justify-content: center; width: 250px; height: 250px; border-radius: 50%;">🪙</div>';
            }
        };
    }
}

// Инициализация темы
function initTheme() {
    const savedTheme = localStorage.getItem('pershcoin_theme') || 'light';
    applyTheme(savedTheme);
}

// Применение темы
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('pershcoin_theme', theme);
}

// Переключение темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация темы
    initTheme();
    
    // Переключатель темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Настраиваем обработчик ошибок для изображения монеты
    setupCoinImageErrorHandler();
    
    // Кнопка тапа
    const tapButton = document.getElementById('tapButton');
    if (tapButton) {
        tapButton.addEventListener('click', sendTap);
    }
    
    // Кнопки действий
    const referralsBtn = document.getElementById('referralsBtn');
    if (referralsBtn) {
        referralsBtn.addEventListener('click', () => {
            openModal('referralsModal');
            loadReferrals();
        });
    }
    
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            openModal('leaderboardModal');
            loadLeaderboard('coins');
        });
    }
    
    // Закрытие модальных окон
    const closeReferrals = document.getElementById('closeReferrals');
    if (closeReferrals) {
        closeReferrals.addEventListener('click', () => {
            closeModal('referralsModal');
        });
    }
    
    const closeLeaderboard = document.getElementById('closeLeaderboard');
    if (closeLeaderboard) {
        closeLeaderboard.addEventListener('click', () => {
            closeModal('leaderboardModal');
        });
    }
    
    // Закрытие при клике вне модального окна
    const referralsModal = document.getElementById('referralsModal');
    if (referralsModal) {
        referralsModal.addEventListener('click', (e) => {
            if (e.target.id === 'referralsModal') {
                closeModal('referralsModal');
            }
        });
    }
    
    const leaderboardModal = document.getElementById('leaderboardModal');
    if (leaderboardModal) {
        leaderboardModal.addEventListener('click', (e) => {
            if (e.target.id === 'leaderboardModal') {
                closeModal('leaderboardModal');
            }
        });
    }
    
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
    const copyReferralCodeBtn = document.getElementById('copyReferralCode');
    if (copyReferralCodeBtn) {
        copyReferralCodeBtn.addEventListener('click', copyReferralCode);
    }
    
    // Загрузка данных пользователя
    fetchUserData();
    
    // Обновление данных каждые 5 секунд
    setInterval(fetchUserData, 5000);
});
