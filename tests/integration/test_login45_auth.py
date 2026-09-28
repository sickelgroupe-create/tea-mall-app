#!/usr/bin/env python3
"""Login page 45 isolated authentication acceptance and exact cleanup.

This script only targets the explicitly supplied loopback API and MySQL port.
It creates the account through the public registration API, never by SQL.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import secrets
import string
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path


API = os.environ.get("CHAYE_TEST_MALL_BASE", "http://127.0.0.1:18083/mall")
MYSQL = Path(r"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe")
MYSQL_PORT = os.environ.get("CHAYE_TEST_MYSQL_PORT", "33308")
DATABASE = os.environ.get("CHAYE_TEST_DATABASE", "chaye_full_regression_v3")
REDIS_DATABASE = os.environ.get("CHAYE_TEST_REDIS_DATABASE", "7")
OUT = Path(os.environ.get("CHAYE_TEST_LOGIN45_REPORT",
    r"C:\Users\Administrator\Desktop\茶叶\分销茶叶商城\docs\login45-special\login45-auth-evidence.json"))


def mysql(sql: str) -> str:
    command = [
        str(MYSQL),
        "--host=127.0.0.1",
        f"--port={MYSQL_PORT}",
        "--user=root",
        "--skip-column-names",
        f"--database={DATABASE}",
        f"--execute={sql}",
    ]
    completed = subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8")
    return completed.stdout.strip()


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
        payload = json.loads(error.read().decode("utf-8"))
        return error.code, payload


def token_of(payload: dict) -> str:
    data = payload.get("data") or {}
    token = data.get("sessionToken") or data.get("token")
    if not token:
        raise AssertionError(f"response omitted session token: {payload}")
    return str(token)


def expect(label: str, status: int, payload: dict, expected_status: int, expected_code: int) -> None:
    if status != expected_status or int(payload.get("code", -1)) != expected_code:
        raise AssertionError(f"{label}: HTTP {status}, body={payload}")


def redact(payload: dict) -> dict:
    value = json.loads(json.dumps(payload, ensure_ascii=False))
    data = value.get("data")
    if isinstance(data, dict):
        for key in ("sessionToken", "token", "testCode"):
            if key in data:
                data[key] = "<redacted>"
    return value


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def main() -> int:
    started = dt.datetime.now(dt.timezone(dt.timedelta(hours=8)))
    suffix = started.strftime("%m%d%H%M%S")[-8:]
    phone = "139" + suffix
    if len(phone) != 11:
        raise AssertionError(phone)
    alphabet = string.ascii_letters + string.digits
    # Always satisfy the real password policy while keeping every run random.
    password = "Ta1!" + "".join(secrets.choice(alphabet) for _ in range(12))
    new_password = "Na2!" + "".join(secrets.choice(alphabet) for _ in range(12))
    baseline_max = int(mysql("SELECT COALESCE(MAX(id),0) FROM mall_customer;"))
    baseline_count = int(mysql("SELECT COUNT(*) FROM mall_customer;"))
    redis_before = subprocess.run(
        [r"C:\Program Files\Memurai\memurai-cli.exe", "-h", "127.0.0.1", "-p", "6379", "-n", REDIS_DATABASE, "dbsize"],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    evidence: dict = {
        "environment": {
            "api": API,
            "mysql": f"127.0.0.1:{MYSQL_PORT}/{DATABASE}",
            "redis": f"127.0.0.1:6379/db{REDIS_DATABASE}",
            "productionConnected": False,
            "startedAt": started.isoformat(),
        },
        "temporaryAccount": {"phoneMasked": phone[:3] + "****" + phone[-4:]},
        "baseline": {"maxCustomerId": baseline_max, "customerCount": baseline_count, "redisDb7Keys": int(redis_before)},
        "checks": [],
    }
    tokens: set[str] = set()

    def checked(label: str, method: str, path: str, expected_status: int, expected_code: int,
                token: str | None = None, body: dict | None = None) -> dict:
        status, payload = call(method, path, token, body)
        expect(label, status, payload, expected_status, expected_code)
        evidence["checks"].append({"label": label, "httpStatus": status, "businessCode": payload.get("code"), "response": redact(payload)})
        return payload

    try:
        documents = checked("游客读取协议文档", "GET", "/support/documents", 200, 200)
        if not isinstance(documents.get("data"), list) or len(documents["data"]) < 2:
            raise AssertionError("协议文档不是数据库真实列表")
        checked("游客访问偏好被拒绝", "GET", "/account/preferences", 401, 401)
        checked("游客访问优惠券被拒绝", "GET", "/account/coupons", 401, 401)

        client_seed_token = secrets.token_urlsafe(32)
        tokens.add(client_seed_token)
        guest = checked("使用客户端随机令牌创建游客会话", "GET", "/bootstrap", 200, 200,
                        client_seed_token)
        guest_token = token_of(guest)
        tokens.add(guest_token)
        registered = checked("真实注册接口创建临时账号", "POST", "/session/register", 200, 200,
                             guest_token, {"phone": phone, "password": password, "refCode": ""})
        member_token = token_of(registered)
        tokens.add(member_token)
        checked("注册后读取账户偏好", "GET", "/account/preferences", 200, 200, member_token)
        checked("注册后读取优惠券", "GET", "/account/coupons", 200, 200, member_token)

        logged_out = checked("退出登录", "POST", "/session/logout", 200, 200, member_token, {})
        logout_guest_token = token_of(logged_out)
        tokens.add(logout_guest_token)
        checked("退出后旧Token返回401", "GET", "/account/preferences", 401, 401, member_token)

        logged_in = checked("手机号密码登录", "POST", "/session/login", 200, 200,
                            logout_guest_token, {"phone": phone, "password": password})
        password_token = token_of(logged_in)
        tokens.add(password_token)
        checked("密码登录后偏好成功", "GET", "/account/preferences", 200, 200, password_token)
        checked("密码登录后优惠券成功", "GET", "/account/coupons", 200, 200, password_token)

        login_code_response = checked("隔离环境申请随机登录验证码", "POST", "/session/sms/request", 200, 200,
                                      body={"phone": phone, "purpose": "LOGIN"})
        login_code = str(login_code_response["data"]["testCode"])
        guest_again = checked("验证码登录前退出", "POST", "/session/logout", 200, 200, password_token, {})
        guest_again_token = token_of(guest_again)
        tokens.add(guest_again_token)
        code_login = checked("随机验证码登录", "POST", "/session/code-login", 200, 200,
                             guest_again_token, {"phone": phone, "code": login_code})
        code_token = token_of(code_login)
        tokens.add(code_token)
        checked("验证码不可重复使用", "POST", "/session/code-login", 400, 400,
                code_token, {"phone": phone, "code": login_code})

        reset_code_response = checked("隔离环境申请随机找回验证码", "POST", "/session/sms/request", 200, 200,
                                      body={"phone": phone, "purpose": "RESET"})
        reset_code = str(reset_code_response["data"]["testCode"])
        checked("验证码找回密码", "POST", "/session/password/reset", 200, 200,
                body={"phone": phone, "code": reset_code, "newPassword": new_password})
        checked("重置密码后旧Token失效", "GET", "/account/preferences", 401, 401, code_token)

        fresh_seed_token = secrets.token_urlsafe(32)
        tokens.add(fresh_seed_token)
        fresh_guest = checked("密码重置后创建新游客会话", "GET", "/bootstrap", 200, 200,
                              fresh_seed_token)
        fresh_guest_token = token_of(fresh_guest)
        tokens.add(fresh_guest_token)
        final_login = checked("新密码登录", "POST", "/session/login", 200, 200,
                              fresh_guest_token, {"phone": phone, "password": new_password})
        final_token = token_of(final_login)
        tokens.add(final_token)
        checked("新密码登录后账户接口成功", "GET", "/account/preferences", 200, 200, final_token)
        final_logout = checked("最终退出", "POST", "/session/logout", 200, 200, final_token, {})
        tokens.add(token_of(final_logout))
        checked("最终退出后旧Token返回401", "GET", "/account/coupons", 401, 401, final_token)
    finally:
        created_raw = mysql(f"SELECT id FROM mall_customer WHERE id>{baseline_max} ORDER BY id;")
        created_ids = [int(line) for line in created_raw.splitlines() if line.strip()]
        evidence["createdCustomerIds"] = created_ids
        if created_ids:
            ids = ",".join(str(value) for value in created_ids)
            columns_raw = mysql(
                "SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS "
                f"WHERE TABLE_SCHEMA='{DATABASE}' AND COLUMN_NAME LIKE '%customer_id%' ORDER BY TABLE_NAME,COLUMN_NAME;"
            )
            by_table: dict[str, list[str]] = {}
            for line in columns_raw.splitlines():
                if not line.strip():
                    continue
                table, column = line.split("\t", 1)
                by_table.setdefault(table, []).append(column)
            statements = ["SET FOREIGN_KEY_CHECKS=0", "START TRANSACTION"]
            for table, columns in by_table.items():
                if table == "mall_customer":
                    continue
                predicate = " OR ".join(f"`{column}` IN ({ids})" for column in columns)
                statements.append(f"DELETE FROM `{table}` WHERE {predicate}")
            phone_hash = sha256(phone)
            statements.append(f"DELETE FROM mall_login_attempt WHERE phone_hash='{phone_hash}'")
            if tokens:
                token_hashes = ",".join("'" + sha256(token) + "'" for token in tokens)
                statements.append(f"DELETE FROM mall_revoked_session WHERE token_hash IN ({token_hashes})")
            statements.append(f"DELETE FROM mall_customer WHERE id IN ({ids})")
            statements.extend(["COMMIT", "SET FOREIGN_KEY_CHECKS=1"])
            mysql(";".join(statements) + ";")
        sms_keys = subprocess.run(
            [r"C:\Program Files\Memurai\memurai-cli.exe", "-h", "127.0.0.1", "-p", "6379", "-n", REDIS_DATABASE,
             "--scan", "--pattern", "mall:sms:*"],
            check=True, capture_output=True, text=True,
        ).stdout.splitlines()
        for key in sms_keys:
            if key.strip():
                subprocess.run(
                    [r"C:\Program Files\Memurai\memurai-cli.exe", "-h", "127.0.0.1", "-p", "6379", "-n", REDIS_DATABASE,
                     "del", key.strip()],
                    check=True, capture_output=True, text=True,
                )
        customer_after = int(mysql(f"SELECT COUNT(*) FROM mall_customer WHERE phone='{phone}';"))
        all_created_after = int(mysql(f"SELECT COUNT(*) FROM mall_customer WHERE id>{baseline_max};"))
        login_attempt_after = int(mysql(f"SELECT COUNT(*) FROM mall_login_attempt WHERE phone_hash='{sha256(phone)}';"))
        redis_after = int(subprocess.run(
            [r"C:\Program Files\Memurai\memurai-cli.exe", "-h", "127.0.0.1", "-p", "6379", "-n", REDIS_DATABASE, "dbsize"],
            check=True, capture_output=True, text=True,
        ).stdout.strip())
        evidence["cleanup"] = {
            "temporaryPhoneRows": customer_after,
            "customerRowsCreatedAfterBaseline": all_created_after,
            "loginAttemptRowsForPhoneHash": login_attempt_after,
            "redisDb7Keys": redis_after,
            "preciseCustomerIdsDeleted": evidence.get("createdCustomerIds", []),
        }
        evidence["finishedAt"] = dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).isoformat()
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")

    cleanup = evidence["cleanup"]
    if any(cleanup[key] != 0 for key in ("temporaryPhoneRows", "customerRowsCreatedAfterBaseline", "loginAttemptRowsForPhoneHash")):
        raise AssertionError(f"cleanup verification failed: {cleanup}")
    if cleanup["redisDb7Keys"] != evidence["baseline"]["redisDb7Keys"]:
        raise AssertionError(f"cleanup verification failed: {cleanup}")
    print(json.dumps({"result": "PASS", "checks": len(evidence["checks"]), "evidence": str(OUT), "cleanup": cleanup}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
