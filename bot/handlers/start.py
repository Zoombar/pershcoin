from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import CommandStart
from sqlalchemy.ext.asyncio import AsyncSession
from database import crud
from database.database import get_db
from bot.keyboards import get_start_keyboard, get_referral_keyboard
from bot.config import WEBAPP_URL
import asyncio

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    """Обработчик команды /start"""
    user_id = message.from_user.id
    username = message.from_user.username
    first_name = message.from_user.first_name
    
    # Получаем реферальный код из аргументов команды
    referral_code = None
    if message.text and len(message.text.split()) > 1:
        referral_code = message.text.split()[1]
    
    # Получаем сессию БД
    async for db in get_db():
        # Проверяем, существует ли пользователь
        user = await crud.get_user(db, user_id)
        
        if not user:
            # Новый пользователь - регистрируем
            new_referral_code = crud.generate_referral_code()
            # Проверяем уникальность кода
            while await crud.get_user_by_referral_code(db, new_referral_code):
                new_referral_code = crud.generate_referral_code()
            
            referred_by = None
            bonus_new_user = 0
            bonus_referrer = 0
            
            # Проверяем реферальный код
            if referral_code:
                referrer = await crud.get_user_by_referral_code(db, referral_code)
                if referrer and referrer.user_id != user_id:
                    referred_by = referrer.user_id
                    bonus_new_user = 500
                    bonus_referrer = 1000
                    
                    # Создаем запись о реферале
                    await crud.create_referral(db, referrer.user_id, user_id)
                    
                    # Начисляем бонусы
                    referrer.coins += bonus_referrer
                    await db.commit()
            
            # Создаем пользователя
            user = await crud.create_user(
                db=db,
                user_id=user_id,
                username=username,
                first_name=first_name,
                referral_code=new_referral_code,
                referred_by=referred_by
            )
            
            # Начисляем бонус новичку
            if bonus_new_user > 0:
                user.coins += bonus_new_user
                await db.commit()
                await db.refresh(user)
            
            # Отправляем приветственное сообщение
            welcome_text = f"🎉 Добро пожаловать в Pershcoin, {first_name}!\n\n"
            welcome_text += "💰 Тапай и зарабатывай монеты!\n"
            welcome_text += "👥 Приглашай друзей и получай бонусы!\n\n"
            
            if bonus_new_user > 0:
                welcome_text += f"🎁 Ты получил {bonus_new_user} монет за регистрацию по реферальной ссылке!\n\n"
            
            welcome_text += f"📊 Твой баланс: {user.coins} монет\n"
            welcome_text += f"🔗 Твой реферальный код: `{user.referral_code}`\n\n"
            welcome_text += "Нажми кнопку ниже, чтобы начать играть!"
            
            await message.answer(
                welcome_text,
                reply_markup=get_start_keyboard(WEBAPP_URL),
                parse_mode="Markdown"
            )
            
            # Отправляем реферальную ссылку
            bot_username = (await message.bot.get_me()).username
            await message.answer(
                f"📋 Твоя реферальная ссылка:\n"
                f"`https://t.me/{bot_username}?start={user.referral_code}`\n\n"
                f"👥 За каждого друга:\n"
                f"• Ты получаешь 1000 монет\n"
                f"• Друг получает 500 монет\n"
                f"• Ты получаешь 15% с каждого тапа друга",
                reply_markup=get_referral_keyboard(user.referral_code, bot_username),
                parse_mode="Markdown"
            )
        else:
            # Существующий пользователь
            await message.answer(
                f"👋 С возвращением, {first_name}!\n\n"
                f"💰 Баланс: {user.coins} монет\n"
                f"👆 Тапов: {user.total_taps}\n"
                f"🔗 Реферальный код: `{user.referral_code}`\n\n"
                f"Нажми кнопку ниже, чтобы продолжить играть!",
                reply_markup=get_start_keyboard(WEBAPP_URL),
                parse_mode="Markdown"
            )
        break
