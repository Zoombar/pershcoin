import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
DATABASE_PATH = os.getenv("DATABASE_PATH", "pershcoin.db")
WEBAPP_URL = os.getenv("WEBAPP_URL", "")
TAP_RATE_LIMIT = int(os.getenv("TAP_RATE_LIMIT", "10"))

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не установлен в переменных окружения!")
