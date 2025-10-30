import os
from contextlib import contextmanager
from typing import Any, Dict, Optional

from loguru import logger
from sblpy.connection import SurrealSyncConnection


@contextmanager
def db_connection():
    # Use host.docker.internal for Docker Desktop on macOS/Windows
    host = os.environ.get("SURREAL_ADDRESS", "127.0.0.1")
    port = int(os.environ.get("SURREAL_PORT", "8001"))
    
    logger.info(f"Connecting to SurrealDB at {host}:{port}")
    
    try:
        connection = SurrealSyncConnection(
            host=host,
            port=port,
            user=os.environ.get("SURREAL_USER", "root"),
            password=os.environ.get("SURREAL_PASS", "root"),
            namespace=os.environ.get("SURREAL_NAMESPACE", "test"),
            database=os.environ.get("SURREAL_DATABASE", "test"),
            max_size=2**20,  # 1MB buffer size
            encrypted=False
        )
        logger.info("Successfully connected to SurrealDB")
        yield connection
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        if 'connection' in locals():
            try:
                if hasattr(connection, 'socket') and connection.socket:
                    connection.socket.close()
            except Exception as e:
                logger.warning(f"Error closing connection: {e}")


def repo_query(query_str: str, vars: Optional[Dict[str, Any]] = None):
    with db_connection() as connection:
        try:
            result = connection.query(query_str, vars)
            return result
        except Exception as e:
            logger.critical(f"Query: {query_str}")
            logger.exception(e)
            raise


def repo_create(table: str, data: Dict[str, Any]):
    query = f"CREATE {table} CONTENT $data;"
    return repo_query(query, {"data": data})


def repo_upsert(table: str, data: Dict[str, Any]):
    query = f"UPSERT {table} CONTENT $data;"
    return repo_query(query, {"data": data})


def repo_update(id: str, data: Dict[str, Any]):
    query = "UPDATE $id CONTENT $data;"
    vars = {"id": id, "data": data}
    return repo_query(query, vars)


def repo_delete(id: str):
    query = "DELETE $id;"
    vars = {"id": id}
    return repo_query(query, vars)


def repo_relate(source: str, relationship: str, target: str, data: Optional[Dict] = {}):
    query = f"RELATE {source}->{relationship}->{target} CONTENT $content;"
    result = repo_query(query, {"content": data})
    return result
