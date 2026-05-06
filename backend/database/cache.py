import json
import httpx
from config import settings
from logger import get_logger

logger = get_logger(__name__)

class RedisCache:
    def __init__(self):
        self.url = settings.UPSTASH_REDIS_REST_URL.rstrip('/') if settings.UPSTASH_REDIS_REST_URL else ""
        self.token = settings.UPSTASH_REDIS_REST_TOKEN
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
    async def _request(self, command, *args):
        if not self.url or not self.token:
            return None
        url = f"{self.url}/{command}/" + "/".join(str(a) for a in args)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=2.0)
                if response.status_code == 200:
                    data = response.json()
                    if "result" in data:
                        return data["result"]
                return None
        except Exception as e:
            logger.error(f"Redis cache error: {e}")
            return None
            
    async def get(self, key):
        res = await self._request("get", key)
        if res:
            try:
                return json.loads(res)
            except:
                return res
        return None
        
    async def set(self, key, value, ex=None):
        val_str = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
        if ex:
            await self._request("set", key, val_str, "EX", ex)
        else:
            await self._request("set", key, val_str)
            
    async def incr(self, key):
        res = await self._request("incr", key)
        if res is not None:
            await self._request("expire", key, 60)  # Ensure it expires after a minute
        return res
        
    async def delete(self, key):
        await self._request("del", key)
        
    async def delete_pattern(self, pattern):
        keys = await self._request("keys", pattern)
        if keys:
            for key in keys:
                await self.delete(key)

redis_cache = RedisCache()
