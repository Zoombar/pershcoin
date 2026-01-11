from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from database.models import User, Referral
import json
import os

TAP_RATE_LIMIT = int(os.getenv("TAP_RATE_LIMIT", "10"))


async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    """Получить пользователя по user_id"""
    result = await db.execute(select(User).where(User.user_id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    user_id: int,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    referral_code: str = None,
    referred_by: Optional[int] = None
) -> User:
    """Создать нового пользователя"""
    user = User(
        user_id=user_id,
        username=username,
        first_name=first_name,
        referral_code=referral_code,
        referred_by=referred_by,
        coins=0,
        total_taps=0
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_referral_code(db: AsyncSession, code: str) -> Optional[User]:
    """Найти пользователя по реферальному коду"""
    result = await db.execute(select(User).where(User.referral_code == code))
    return result.scalar_one_or_none()


def generate_referral_code() -> str:
    """Генерация уникального реферального кода"""
    import random
    return f"PERSH{random.randint(100000, 999999)}"


async def check_rate_limit(db: AsyncSession, user_id: int) -> tuple[bool, float]:
    """
    Проверка rate limit для тапов
    Возвращает (is_allowed, retry_after)
    """
    user = await get_user(db, user_id)
    if not user or not user.last_tap_at:
        return True, 0.0

    # Получаем историю тапов
    tap_history = []
    if user.tap_history:
        try:
            tap_history = json.loads(user.tap_history)
        except:
            tap_history = []

    now = datetime.utcnow()
    # Оставляем только тапы за последнюю секунду
    one_second_ago = now - timedelta(seconds=1)
    tap_history = [t for t in tap_history if datetime.fromisoformat(t) > one_second_ago]

    if len(tap_history) >= TAP_RATE_LIMIT:
        # Находим время самого старого тапа в окне
        oldest_tap = min(datetime.fromisoformat(t) for t in tap_history)
        retry_after = (one_second_ago - oldest_tap).total_seconds()
        return False, max(0.0, retry_after)

    return True, 0.0


async def process_tap(db: AsyncSession, user_id: int) -> dict:
    """
    Обработка тапа пользователя
    Возвращает информацию о начисленных монетах
    """
    # Проверка rate limit
    is_allowed, retry_after = await check_rate_limit(db, user_id)
    if not is_allowed:
        return {
            "success": False,
            "error": "rate_limit_exceeded",
            "retry_after": retry_after
        }

    user = await get_user(db, user_id)
    if not user:
        return {"success": False, "error": "user_not_found"}

    now = datetime.utcnow()
    
    # Обновляем историю тапов
    tap_history = []
    if user.tap_history:
        try:
            tap_history = json.loads(user.tap_history)
        except:
            tap_history = []
    
    # Удаляем тапы старше 1 секунды
    one_second_ago = now - timedelta(seconds=1)
    tap_history = [t for t in tap_history if datetime.fromisoformat(t) > one_second_ago]
    tap_history.append(now.isoformat())

    # Начисляем монеты
    coins_earned = 1
    user.coins += coins_earned
    user.total_taps += 1
    user.last_tap_at = now
    user.tap_history = json.dumps(tap_history)

    # Проверяем реферера и начисляем ему бонус
    referral_bonus = 0
    if user.referred_by:
        referrer = await get_user(db, user.referred_by)
        if referrer:
            # 15% от тапа (округляется вниз)
            referral_bonus = int(coins_earned * 0.15)
            if referral_bonus > 0:
                referrer.coins += referral_bonus
                
                # Обновляем статистику реферала
                referral = await get_referral_by_ids(db, user.referred_by, user_id)
                if referral:
                    referral.coins_earned += referral_bonus

    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "coins": user.coins,
        "taps": user.total_taps,
        "coins_earned": coins_earned,
        "referral_bonus": referral_bonus,
        "rate_limit_remaining": TAP_RATE_LIMIT - len(tap_history)
    }


async def get_referral_by_ids(db: AsyncSession, referrer_id: int, referred_id: int) -> Optional[Referral]:
    """Получить запись о реферале"""
    result = await db.execute(
        select(Referral).where(
            Referral.referrer_id == referrer_id,
            Referral.referred_id == referred_id
        )
    )
    return result.scalar_one_or_none()


async def create_referral(
    db: AsyncSession,
    referrer_id: int,
    referred_id: int
) -> Referral:
    """Создать запись о реферале"""
    referral = Referral(
        referrer_id=referrer_id,
        referred_id=referred_id,
        coins_earned=0,
        bonus_paid=False
    )
    db.add(referral)
    await db.commit()
    await db.refresh(referral)
    return referral


async def get_user_referrals(db: AsyncSession, user_id: int) -> List[Referral]:
    """Получить список рефералов пользователя"""
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == user_id).order_by(desc(Referral.created_at))
    )
    return result.scalars().all()


async def get_leaderboard_by_coins(db: AsyncSession, limit: int = 10) -> List[User]:
    """Получить лидерборд по монетам"""
    result = await db.execute(
        select(User)
        .order_by(desc(User.coins))
        .limit(limit)
    )
    return result.scalars().all()


async def get_leaderboard_by_taps(db: AsyncSession, limit: int = 10) -> List[User]:
    """Получить лидерборд по тапам"""
    result = await db.execute(
        select(User)
        .order_by(desc(User.total_taps))
        .limit(limit)
    )
    return result.scalars().all()


async def get_user_rank_by_coins(db: AsyncSession, user_id: int) -> int:
    """Получить место пользователя в лидерборде по монетам"""
    result = await db.execute(
        select(func.count(User.user_id))
        .where(User.coins > select(User.coins).where(User.user_id == user_id).scalar_subquery())
    )
    rank = result.scalar() or 0
    return rank + 1
