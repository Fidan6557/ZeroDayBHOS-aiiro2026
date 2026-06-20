import ipaddress
import socket
from urllib.parse import urlparse

import httpx

from app.config import settings


BLOCKED_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}


def _is_private_ip(host: str) -> bool:
    try:
        for info in socket.getaddrinfo(host, None):
            ip = ipaddress.ip_address(info[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                return True
    except (socket.gaierror, ValueError):
        return True
    return False


def validate_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP/HTTPS URLs are allowed")
    host = parsed.hostname or ""
    if not host or host.lower() in BLOCKED_HOSTS:
        raise ValueError("URL host is not allowed")
    if _is_private_ip(host):
        raise ValueError("Private/internal URLs are blocked")
    return url


async def fetch_url_content(url: str) -> str:
    validate_url(url)
    async with httpx.AsyncClient(
        timeout=settings.url_fetch_timeout,
        follow_redirects=True,
        max_redirects=3,
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "")
        if "text" not in content_type and "html" not in content_type and "json" not in content_type:
            raise ValueError("URL must return text/html/json content")
        data = response.content[: settings.url_max_bytes]
        return data.decode("utf-8", errors="replace")
