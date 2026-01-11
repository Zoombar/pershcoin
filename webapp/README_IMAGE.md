# Инструкция: Добавление изображения монеты

## Шаг 1: Подготовьте изображение

1. Сохраните изображение монеты с лицом
2. Назовите файл: `coin-face.jpg` (или `coin-face.png`)
3. Размер изображения: рекомендуется 500x500px или больше (квадратное)

## Шаг 2: Разместите изображение

Поместите файл `coin-face.jpg` в папку `webapp/` рядом с `index.html`, `style.css` и `script.js`.

## Шаг 3: Обновите на GitHub Pages

После добавления изображения:

```bash
# Переключитесь на ветку gh-pages
git checkout gh-pages

# Скопируйте изображение
Copy-Item ..\webapp\coin-face.jpg . -Force

# Закоммитьте и отправьте
git add coin-face.jpg
git commit -m "Add coin face image"
git push origin gh-pages

# Вернитесь на main
git checkout main
```

## Альтернатива: Использовать URL изображения

Если изображение уже размещено в интернете, можно использовать URL:

1. Откройте `webapp/index.html`
2. Найдите строку: `<img src="coin-face.jpg" alt="Coin" id="coinImage">`
3. Замените `coin-face.jpg` на URL вашего изображения:
   ```html
   <img src="https://your-domain.com/coin-face.jpg" alt="Coin" id="coinImage">
   ```

## Формат файла

- Поддерживаемые форматы: JPG, PNG, WebP
- Рекомендуемый размер: 500x500px или больше
- Формат: квадратное изображение (для круглой монеты)
