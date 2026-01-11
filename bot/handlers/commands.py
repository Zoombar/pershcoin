from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command
from sqlalchemy.ext.asyncio import AsyncSession
from database import crud
from database.database import get_db
from bot.keyboards import get_referral_keyboard
import asyncio

router = Router()


@router.message(Command("balance"))
async def cmd_balance(message: Message):
    """Показать баланс пользователя"""
    user_id = message.from_user.id
    
    async for db in get_db():
        user = await crud.get_user(db, user_id)
        if not user:
            await message.answer("❌ Пользователь не найден. Используйте /start")
            break
        
        rank = await crud.get_user_rank_by_coins(db, user_id)
        
        text = f"💰 Твой баланс: {user.coins} монет\n"
        text += f"👆 Всего тапов: {user.total_taps}\n"
        text += f"🏆 Место в рейтинге: #{rank}"
        
        await message.answer(text)
        break


@router.message(Command("referral"))
async def cmd_referral(message: Message):
    """Показать реферальную информацию"""
    user_id = message.from_user.id
    
    async for db in get_db():
        user = await crud.get_user(db, user_id)
        if not user:
            await message.answer("❌ Пользователь не найден. Используйте /start")
            break
        
        referrals = await crud.get_user_referrals(db, user_id)
        total_earned = sum(ref.coins_earned for ref in referrals)
        
        bot_username = (await message.bot.get_me()).username
        referral_link = f"https://t.me/{bot_username}?start={user.referral_code}"
        
        text = f"👥 Реферальная система\n\n"
        text += f"🔗 Твой код: `{user.referral_code}`\n"
        text += f"📋 Ссылка: `{referral_link}`\n\n"
        text += f"👥 Приглашено друзей: {len(referrals)}\n"
        text += f"💰 Заработано с рефералов: {total_earned} монет\n\n"
        text += f"🎁 За каждого друга:\n"
        text += f"• Ты получаешь 1000 монет\n"
        text += f"• Друг получает 500 монет\n"
        text += f"• Ты получаешь 15% с каждого тапа друга"
        
        await message.answer(
            text,
            reply_markup=get_referral_keyboard(user.referral_code, bot_username),
            parse_mode="Markdown"
        )
        break


@router.message(Command("leaderboard"))
async def cmd_leaderboard(message: Message):
    """Показать лидерборд"""
    async for db in get_db():
        # Лидерборд по монетам
        top_coins = await crud.get_leaderboard_by_coins(db, 10)
        # Лидерборд по тапам
        top_taps = await crud.get_leaderboard_by_taps(db, 10)
        
        text = "🏆 Лидерборд по монетам:\n\n"
        for i, user in enumerate(top_coins, 1):
            username = user.username or user.first_name or f"ID{user.user_id}"
            text += f"{i}. {username}: {user.coins} монет\n"
        
        text += "\n👆 Лидерборд по тапам:\n\n"
        for i, user in enumerate(top_taps, 1):
            username = user.username or user.first_name or f"ID{user.user_id}"
            text += f"{i}. {username}: {user.total_taps} тапов\n"
        
        await message.answer(text)
        break


@router.message(Command("help"))
async def cmd_help(message: Message):
    """Справка по командам"""
    text = "📖 Справка по командам:\n\n"
    text += "/start - Начать игру или обновить данные\n"
    text += "/balance - Показать баланс и статистику\n"
    text += "/referral - Показать реферальную информацию\n"
    text += "/leaderboard - Показать лидерборд\n"
    text += "/help - Показать эту справку\n\n"
    text += "💡 Используй кнопку 'Открыть игру' для тапа!"
    
    await message.answer(text)
