from sblpy.connection import SurrealSyncConnection
from loguru import logger

try:
    with SurrealSyncConnection(
        host="127.0.0.1",
        port=8001,
        user="root",
        password="root",
        namespace="test",
        database="test",
        max_size=2**20,
        encrypted=False
    ) as conn:
        result = conn.query("INFO FOR DB;")
        print("Connection successful!")
        print("Database info:", result)
except Exception as e:
    logger.error(f"Connection failed: {e}")
