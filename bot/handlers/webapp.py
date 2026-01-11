import json
import hmac
import hashlib
from aiohttp import web
from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command
from sqlalchemy.ext.asyncio import AsyncSession
from database import crud
from database.database import get_db, AsyncSessionLocal
from bot.config import BOT_TOKEN
import asyncio

router = Router()

# Глобальная переменная для хранения HTTP приложения
http_app = None


def validate_init_data(init_data: str) -> dict | None:
    """
    Валидация initData от Telegram Web App
    Возвращает словарь с данными или None если невалидно
    """
    try:
        # Парсим initData
        data_pairs = init_data.split('&')
        data_dict = {}
        hash_value = None
        
        for pair in data_pairs:
            if '=' in pair:
                key, value = pair.split('=', 1)
                if key == 'hash':
                    hash_value = value
                else:
                    data_dict[key] = value
        
        if not hash_value:
            return None
        
        # Создаем строку для проверки
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(data_dict.items())
        )
        
        # Проверяем подпись
        secret_key = hmac.new(
            "WebAppData".encode(),
            BOT_TOKEN.encode(),
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash != hash_value:
            return None
        
        # Парсим user данные
        if 'user' in data_dict:
            user_data = json.loads(data_dict['user'])
            return user_data
        
        return None
    except Exception as e:
        print(f"Error validating init_data: {e}")
        return None


async def handle_api_user(request: web.Request) -> web.Response:
    """Обработка GET /api/user"""
    init_data = request.query.get('initData', '')
    if not init_data:
        return web.json_response({"success": False, "error": "initData required"})
    
    user_data = validate_init_data(init_data)
    if not user_data:
        return web.json_response({"success": False, "error": "invalid_initData"})
    
    user_id = user_data.get('id')
    if not user_id:
        return web.json_response({"success": False, "error": "user_id not found"})
    
    async with AsyncSessionLocal() as db:
        user = await crud.get_user(db, user_id)
        if not user:
            return web.json_response({"success": False, "error": "user_not_found"})
        
        referrals = await crud.get_user_referrals(db, user_id)
        total_earned = sum(ref.coins_earned for ref in referrals)
        
        response = {
            "success": True,
            "coins": user.coins,
            "taps": user.total_taps,
            "referral_code": user.referral_code,
            "referrals_count": len(referrals),
            "total_coins_earned": total_earned
        }
        return web.json_response(response)


async def handle_api_tap(request: web.Request) -> web.Response:
    """Обработка POST /api/tap"""
    data = await request.json()
    init_data = data.get('initData', '')
    
    if not init_data:
        return web.json_response({"success": False, "error": "initData required"})
    
    user_data = validate_init_data(init_data)
    if not user_data:
        return web.json_response({"success": False, "error": "invalid_initData"})
    
    user_id = user_data.get('id')
    if not user_id:
        return web.json_response({"success": False, "error": "user_id not found"})
    
    async with AsyncSessionLocal() as db:
        result = await crud.process_tap(db, user_id)
        return web.json_response(result)


async def handle_api_leaderboard(request: web.Request) -> web.Response:
    """Обработка GET /api/leaderboard"""
    init_data = request.query.get('initData', '')
    
    if not init_data:
        return web.json_response({"success": False, "error": "initData required"})
    
    user_data = validate_init_data(init_data)
    if not user_data:
        return web.json_response({"success": False, "error": "invalid_initData"})
    
    async with AsyncSessionLocal() as db:
        top_coins = await crud.get_leaderboard_by_coins(db, 10)
        top_taps = await crud.get_leaderboard_by_taps(db, 10)
        
        leaderboard_coins = [
            {
                "user_id": u.user_id,
                "username": u.username or u.first_name or f"ID{u.user_id}",
                "coins": u.coins
            }
            for u in top_coins
        ]
        
        leaderboard_taps = [
            {
                "user_id": u.user_id,
                "username": u.username or u.first_name or f"ID{u.user_id}",
                "taps": u.total_taps
            }
            for u in top_taps
        ]
        
        response = {
            "success": True,
            "by_coins": leaderboard_coins,
            "by_taps": leaderboard_taps
        }
        return web.json_response(response)


async def handle_api_referrals(request: web.Request) -> web.Response:
    """Обработка GET /api/referrals"""
    init_data = request.query.get('initData', '')
    
    if not init_data:
        return web.json_response({"success": False, "error": "initData required"})
    
    user_data = validate_init_data(init_data)
    if not user_data:
        return web.json_response({"success": False, "error": "invalid_initData"})
    
    user_id = user_data.get('id')
    if not user_id:
        return web.json_response({"success": False, "error": "user_id not found"})
    
    async with AsyncSessionLocal() as db:
        referrals = await crud.get_user_referrals(db, user_id)
        total_earned = sum(ref.coins_earned for ref in referrals)
        
        referrals_list = []
        for ref in referrals:
            referred_user = await crud.get_user(db, ref.referred_id)
            if referred_user:
                referrals_list.append({
                    "user_id": referred_user.user_id,
                    "username": referred_user.username or referred_user.first_name or f"ID{referred_user.user_id}",
                    "coins_earned": ref.coins_earned,
                    "created_at": ref.created_at.isoformat() if ref.created_at else None
                })
        
        response = {
            "success": True,
            "referrals_count": len(referrals),
            "total_coins_earned": total_earned,
            "referrals": referrals_list
        }
        return web.json_response(response)


@web.middleware
async def cors_middleware(request, handler):
    """CORS middleware для web-app"""
    if request.method == 'OPTIONS':
        response = web.Response()
    else:
        response = await handler(request)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


def setup_http_routes(app: web.Application):
    """Настройка HTTP маршрутов для API"""
    app.router.add_get('/api/user', handle_api_user)
    app.router.add_post('/api/tap', handle_api_tap)
    app.router.add_get('/api/leaderboard', handle_api_leaderboard)
    app.router.add_get('/api/referrals', handle_api_referrals)
    
    # Добавляем CORS middleware
    app.middlewares.append(cors_middleware)
