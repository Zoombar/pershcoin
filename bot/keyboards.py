from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

def get_start_keyboard(webapp_url: str) -> InlineKeyboardMarkup:
    """Клавиатура с кнопкой открытия web-app"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🎮 Открыть игру",
            web_app=WebAppInfo(url=webapp_url)
        )]
    ])


def get_referral_keyboard(referral_code: str, bot_username: str) -> InlineKeyboardMarkup:
    """Клавиатура с реферальной ссылкой"""
    referral_link = f"https://t.me/{bot_username}?start={referral_code}"
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="📋 Скопировать ссылку",
            url=referral_link
        )]
    ])
