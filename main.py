import asyncio
import logging
from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from bot.config import BOT_TOKEN
from bot.handlers import start, commands, webapp
from database.database import init_db

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Порт для HTTP API
API_PORT = 8080


async def main():
    """Главная функция запуска бота"""
    # Инициализация базы данных
    logger.info("Инициализация базы данных...")
    await init_db()
    logger.info("База данных инициализирована")
    
    # Создание HTTP приложения для API
    http_app = web.Application()
    webapp.setup_http_routes(http_app)
    
    # Запуск HTTP сервера в фоне
    async def run_http_server():
        runner = web.AppRunner(http_app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', API_PORT)
        await site.start()
        logger.info(f"HTTP API сервер запущен на порту {API_PORT}")
    
    # Запуск HTTP сервера
    http_task = asyncio.create_task(run_http_server())
    
    # Инициализация бота и диспетчера
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())
    
    # Регистрация роутеров
    dp.include_router(start.router)
    dp.include_router(commands.router)
    dp.include_router(webapp.router)
    
    logger.info("Бот запущен")
    
    try:
        # Запуск polling
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        http_task.cancel()
        try:
            await http_task
        except asyncio.CancelledError:
            pass


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот остановлен")
