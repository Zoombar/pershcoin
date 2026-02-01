# Инструкция по деплою на GitHub Pages

## Шаг 1: Подготовка файлов

1. Убедитесь, что все файлы в папке `webapp/` готовы к деплою
2. Обновите `API_BASE` в `webapp/script.js` на URL вашего API сервера

## Шаг 2: Настройка API URL

Откройте `webapp/script.js` и найдите строку:
```javascript
API_BASE = 'https://your-api-server.com'; // ЗАМЕНИТЕ НА ВАШ API URL
```

Замените на URL вашего API сервера, например:
```javascript
API_BASE = 'https://api.example.com';
// или
API_BASE = 'https://your-server.com:8080';
```

## Шаг 3: Деплой на GitHub Pages

### Вариант 1: Через веб-интерфейс GitHub

1. Создайте репозиторий на GitHub (если еще не создан)
2. Загрузите все файлы из папки `webapp/` в корень репозитория
3. Перейдите в Settings → Pages
4. В разделе "Source" выберите:
   - Branch: `main` (или `master`)
   - Folder: `/ (root)`
5. Нажмите Save
6. GitHub Pages будет доступен по адресу: `https://username.github.io/repository-name/`

### Вариант 2: Через Git

```bash
# Инициализируйте репозиторий (если еще не инициализирован)
git init

# Добавьте файлы
git add webapp/*

# Создайте коммит
git commit -m "Deploy to GitHub Pages"

# Добавьте remote (замените на ваш репозиторий)
git remote add origin https://github.com/username/repository-name.git

# Отправьте на GitHub
git branch -M main
git push -u origin main
```

Затем в настройках репозитория включите GitHub Pages (Settings → Pages).

## Шаг 4: Настройка API сервера

Ваш API сервер должен быть доступен извне. Варианты:

### Вариант 1: VPS сервер
- Разверните бота на VPS (DigitalOcean, AWS, и т.д.)
- Настройте nginx для проксирования запросов
- Убедитесь, что порт 8080 доступен или используйте nginx reverse proxy

### Вариант 2: Heroku / Railway / Render
- Загрузите код бота на платформу
- Настройте переменные окружения
- Получите URL вашего API

### Вариант 3: Локальный сервер с туннелем (для тестирования)
- Используйте ngrok: `ngrok http 8080`
- Получите публичный URL
- Используйте его как API_BASE

## Шаг 5: Настройка бота в Telegram

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выполните `/mybots` → выберите вашего бота
3. Выберите "Bot Settings" → "Menu Button"
4. Выберите "Configure menu button"
5. Введите название кнопки (например, "Играть")
6. Введите URL вашего GitHub Pages: `https://username.github.io/repository-name/`

## Шаг 6: Проверка работы

1. Откройте бота в Telegram
2. Нажмите на кнопку меню (или отправьте `/start`)
3. Откройте WebApp
4. Проверьте консоль браузера (F12) на наличие ошибок
5. Убедитесь, что API запросы идут на правильный URL

## Важные замечания

1. **CORS**: Убедитесь, что ваш API сервер настроен для работы с CORS (уже настроено в `bot/handlers/webapp.py`)

2. **HTTPS**: GitHub Pages использует HTTPS, поэтому API сервер также должен поддерживать HTTPS (или использовать CORS правильно)

3. **initData**: Telegram WebApp передает `initData` только в безопасном контексте (HTTPS). Убедитесь, что ваш API использует HTTPS.

4. **Обновление кода**: После обновления файлов на GitHub, изменения появятся через несколько минут

## Структура файлов на GitHub Pages

```
repository-root/
├── index.html
├── script.js
├── style.css
├── manifest.json
├── sw.js
└── persh.jpg
```

Все файлы должны быть в корне репозитория (не в папке `webapp/`).

## Автоматический деплой (опционально)

Можно настроить GitHub Actions для автоматического деплоя. Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./webapp
```

Но проще просто загрузить файлы из `webapp/` в корень репозитория.
