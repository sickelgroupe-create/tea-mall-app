#!/usr/bin/env python3
"""Verify and precisely remove the page-45 UI-created isolated account."""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import secrets
import subprocess
import urllib.error
import urllib.request
from pathlib import Path


API = "http://127.0.0.1:18083/mall"
PHONE = "13900089991"
PASSWORD = os.environ["MALL_TEST_ACCOUNT_PASSWORD"]
MYSQL = Path(r"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe")
DATABASE = "chaye_full_regression_v2"
OUT = Path(r"C:\Users\Administrator\Desktop\茶叶\分销茶叶商城\docs\login45-special\login45-ui-account-evidence.json")


def mysql(sql: str) -> str:
    result = subprocess.run(
        [str(MYSQL), "--host=127.0.0.1", "--port=33308", "--user=root",
         "--skip-column-names", f"--database={DATABASE}", f"--execute={sql}"],
        check=True, capture_output=True, text=True, encoding="utf-8",
    )
    return result.stdout.strip()


def call(method: str, path: str, token: str | None = None, body: dict | None = None) -> tuple[int, dict]:
    headers = {"Accept": "application/json"}
    if token:
        headers["X-Mall-Session"] = token
    raw = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(API + path, data=raw, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read().decode("utf-8"))


def checked(evidence: dict, label: str, method: str, path: str, status_expected: int,
            token: str | None = None, body: dict | None = None) -> dict:
    status, payload = call(method, path, token, body)
    if status != status_expected or int(payload.get("code", -1)) != status_expected:
        raise AssertionError(f"{label}: HTTP {status}, body={payload}")
    evidence["checks"].append({"label": label, "httpStatus": status, "businessCode": payload.get("code")})
    return payload


def token_of(payload: dict) -> str:
    data = payload.get("data") or {}
    token = data.get("sessionToken") or data.get("token")
    if not token:
        raise AssertionError("session token missing")
    return str(token)


def main() -> int:
    ids_raw = mysql(f"SELECT id FROM mall_customer WHERE phone='{PHONE}' ORDER BY id;")
    ids = [int(value) for value in ids_raw.splitlines() if value.strip()]
    if len(ids) != 1:
        raise AssertionError(f"expected one UI-created account, found {ids}")
    customer_id = ids[0]
    evidence = {
        "environment": {
            "api": API,
            "mysql": "127.0.0.1:33308/chaye_full_regression_v2",
            "redis": "127.0.0.1:6379/db7",
            "productionConnected": False,
        },
        "temporaryAccount": {"customerId": customer_id, "phoneMasked": "139****9991"},
        "checks": [],
    }
    tokens: set[str] = set()
    try:
        documents = checked(evidence, "游客读取协议", "GET", "/support/documents", 200)
        if len(documents.get("data") or []) < 2:
            raise AssertionError("support/documents did not return real documents")
        checked(evidence, "游客访问偏好被拒绝", "GET", "/account/preferences", 401)
        checked(evidence, "游客访问优惠券被拒绝", "GET", "/account/coupons", 401)
        seed = secrets.token_urlsafe(32)
        tokens.add(seed)
        guest = checked(evidence, "创建隔离游客会话", "GET", "/bootstrap", 200, seed)
        guest_token = token_of(guest)
        tokens.add(guest_token)
        login = checked(evidence, "UI账号密码登录", "POST", "/session/login", 200, guest_token,
                        {"phone": PHONE, "password": PASSWORD})
        member_token = token_of(login)
        tokens.add(member_token)
        checked(evidence, "登录后读取偏好", "GET", "/account/preferences", 200, member_token)
        checked(evidence, "登录后读取优惠券", "GET", "/account/coupons", 200, member_token)
        logout = checked(evidence, "退出登录", "POST", "/session/logout", 200, member_token, {})
        tokens.add(token_of(logout))
        checked(evidence, "退出后旧Token访问偏好被拒绝", "GET", "/account/preferences", 401, member_token)
        checked(evidence, "退出后旧Token访问优惠券被拒绝", "GET", "/account/coupons", 401, member_token)
    finally:
        columns_raw = mysql(
            "SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS "
            f"WHERE TABLE_SCHEMA='{DATABASE}' AND COLUMN_NAME LIKE '%customer_id%' "
            "ORDER BY TABLE_NAME,COLUMN_NAME;"
        )
        by_table: dict[str, list[str]] = {}
        for line in columns_raw.splitlines():
            if line.strip():
                table, column = line.split("\t", 1)
                by_table.setdefault(table, []).append(column)
        statements = ["SET FOREIGN_KEY_CHECKS=0", "START TRANSACTION"]
        for table, columns in by_table.items():
            if table != "mall_customer":
                predicate = " OR ".join(f"`{column}`={customer_id}" for column in columns)
                statements.append(f"DELETE FROM `{table}` WHERE {predicate}")
        phone_hash = hashlib.sha256(PHONE.encode("utf-8")).hexdigest()
        statements.append(f"DELETE FROM mall_login_attempt WHERE phone_hash='{phone_hash}'")
        if tokens:
            hashes = ",".join(
                "'" + hashlib.sha256(value.encode("utf-8")).hexdigest() + "'" for value in tokens
            )
            statements.append(f"DELETE FROM mall_revoked_session WHERE token_hash IN ({hashes})")
        statements.append(f"DELETE FROM mall_customer WHERE id={customer_id}")
        statements.extend(["COMMIT", "SET FOREIGN_KEY_CHECKS=1"])
        mysql(";".join(statements) + ";")
        evidence["cleanup"] = {
            "customerId": customer_id,
            "customerRows": int(mysql(f"SELECT COUNT(*) FROM mall_customer WHERE id={customer_id};")),
            "phoneRows": int(mysql(f"SELECT COUNT(*) FROM mall_customer WHERE phone='{PHONE}';")),
            "loginAttemptRows": int(mysql(f"SELECT COUNT(*) FROM mall_login_attempt WHERE phone_hash='{phone_hash}';")),
        }
        evidence["finishedAt"] = dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).isoformat()
        OUT.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")

    if any(evidence["cleanup"][key] != 0 for key in ("customerRows", "phoneRows", "loginAttemptRows")):
        raise AssertionError(evidence["cleanup"])
    print(json.dumps({"result": "PASS", "checks": len(evidence["checks"]),
                      "cleanup": evidence["cleanup"], "evidence": str(OUT)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
