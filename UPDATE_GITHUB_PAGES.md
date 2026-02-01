# Как обновить код на GitHub Pages

## Способ 1: Через веб-интерфейс GitHub (самый простой)

1. **Откройте ваш репозиторий на GitHub**
   - Перейдите на https://github.com/ваш-username/ваш-репозиторий

2. **Обновите файлы:**
   - Нажмите на файл, который нужно обновить (например, `script.js`)
   - Нажмите кнопку "✏️ Edit" (карандаш)
   - Внесите изменения
   - Прокрутите вниз, напишите сообщение коммита (например, "Update script.js")
   - Нажмите "Commit changes"

3. **Повторите для всех файлов**, которые нужно обновить

4. **Проверьте GitHub Pages:**
   - Изменения появятся через 1-2 минуты
   - Откройте ваш сайт: `https://username.github.io/repository-name/`

## Способ 2: Через Git (командная строка)

### Если файлы уже на GitHub:

```bash
# Перейдите в папку проекта
cd C:\Users\ipyln\Desktop\code2\projects\pershcoin

# Перейдите в папку webapp
cd webapp

# Скопируйте файлы в корень репозитория (если нужно)
# Или обновите файлы напрямую в репозитории

# Добавьте изменения
git add .

# Создайте коммит
git commit -m "Update webapp files"

# Отправьте на GitHub
git push origin main
```

### Если нужно скопировать файлы из webapp/ в корень:

```bash
# Из корня проекта
cd C:\Users\ipyln\Desktop\code2\projects\pershcoin

# Скопируйте файлы (Windows PowerShell)
Copy-Item webapp\* . -Force

# Или через Git Bash
cp webapp/* .

# Добавьте изменения
git add .

# Коммит
git commit -m "Update GitHub Pages files"

# Отправьте
git push origin main
```

## Способ 3: Через GitHub Desktop (визуально)

1. **Откройте GitHub Desktop**
2. **Выберите ваш репозиторий**
3. **Внесите изменения в файлы** (через редактор или скопируйте файлы)
4. **В GitHub Desktop увидите изменения:**
   - Слева список измененных файлов
   - Внизу поле для сообщения коммита
5. **Напишите сообщение** (например, "Update webapp")
6. **Нажмите "Commit to main"**
7. **Нажмите "Push origin"** для отправки на GitHub

## Важно: Обновите API URL!

Перед отправкой на GitHub **обязательно обновите API URL** в `script.js`:

1. Откройте `webapp/script.js`
2. Найдите строку:
   ```javascript
   API_BASE = 'https://your-api-server.com'; // ЗАМЕНИТЕ НА ВАШ API URL
   ```
3. Замените на реальный URL вашего API сервера, например:
   ```javascript
   API_BASE = 'https://api.example.com';
   ```
4. Сохраните файл

## Проверка после обновления

1. Подождите 1-2 минуты после push
2. Откройте ваш сайт: `https://username.github.io/repository-name/`
3. Откройте консоль браузера (F12)
4. Проверьте, что нет ошибок
5. Проверьте, что API запросы идут на правильный URL

## Структура файлов на GitHub

Убедитесь, что в корне репозитория есть:
- `index.html`
- `script.js`
- `style.css`
- `manifest.json`
- `sw.js`
- `persh.jpg`

Все эти файлы должны быть в корне, а не в папке `webapp/`.
