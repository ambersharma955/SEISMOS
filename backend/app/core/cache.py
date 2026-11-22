import time
from typing import Any
class TTLCache:
    def __init__(self, ttl_s: int = 60): self.ttl=ttl_s; self._d={}
    def get(self,key):
        item=self._d.get(key)
        if not item: return None
        expires,value=item
        if expires < time.monotonic(): self._d.pop(key,None); return None
        return value
    def set(self,key,value,ttl=None): self._d[key]=(time.monotonic()+(ttl or self.ttl),value)
