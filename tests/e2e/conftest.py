# tests/e2e/conftest.py
from __future__ import annotations

import urllib.error
import urllib.request

import pytest


@pytest.fixture(scope="session", autouse=True)
def _require_running_app(base_url: str) -> None:
    try:
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({}),
        )
        opener.open(base_url + "/", timeout=8)
    except (urllib.error.URLError, OSError) as exc:
        pytest.exit(
            f"Приложение не отвечает на {base_url}. Запустите в корне проекта: npm run dev\n"
            f"Причина: {exc}",
            returncode=1,
        )
