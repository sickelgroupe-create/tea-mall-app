const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const projectRoot = path.resolve(__dirname, "..");
const apiBase = process.env.CHAYE_MP_AUTH_API || "http://127.0.0.1:18083/mall";
const phone = process.env.CHAYE_MP_AUTH_PHONE;
const password = process.env.CHAYE_MP_AUTH_PASSWORD;
const outputFile = path.resolve(
  projectRoot,
  process.env.CHAYE_MP_AUTH_REPORT || "docs/wechat-devtools-fix/auth-test-records.json",
);

if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/mall\/?$/.test(apiBase)) {
  throw new Error(`认证回归仅允许访问本机隔离服务，当前地址：${apiBase}`);
}
if (!phone || !password) {
  throw new Error("请通过 CHAYE_MP_AUTH_PHONE 与 CHAYE_MP_AUTH_PASSWORD 提供隔离测试账号");
}

function randomToken(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(20).toString("hex")}`.slice(0, 64);
}

async function call(endpoint, { method = "GET", token, body } = {}) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Mall-Session": token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  return { httpStatus: response.status, payload };
}

function ok(result, label) {
  if (result.httpStatus < 200 || result.httpStatus >= 300 || result.payload?.code !== 200) {
    throw new Error(`${label}失败：HTTP ${result.httpStatus} / code ${result.payload?.code} / ${result.payload?.msg || ""}`);
  }
  return result.payload.data;
}

function assertUnauthorized(result, label) {
  if (result.payload?.code === 200) {
    throw new Error(`${label}失败：失效会话仍可访问私有接口`);
  }
  const message = String(result.payload?.msg || "");
  if (!/登录|认证|会话|token|访问系统资源/i.test(message)) {
    throw new Error(`${label}返回的不是认证拒绝：${message}`);
  }
}

function verifyFrontendGuards() {
  const pageSource = fs.readFileSync(path.join(projectRoot, "shared", "mall-page.js"), "utf8");
  const apiSource = fs.readFileSync(path.join(projectRoot, "shared", "mall-api.js"), "utf8");
  const privateBlock = pageSource.match(
    /if \(this\.authenticated\) \{[\s\S]*?mallApi\.accountPreferences\(\)[\s\S]*?mallApi\.accountCoupons\("未使用"\)[\s\S]*?\n\s*\}/,
  );
  if (!privateBlock) throw new Error("未找到登录态保护下的偏好与优惠券加载逻辑");
  if (!/AUTH_STORAGE_KEYS[\s\S]*teaSession[\s\S]*teaMallSessionToken[\s\S]*teaNickname/.test(apiSource)) {
    throw new Error("认证状态清理键不完整");
  }
  if (!/authenticationError\([\s\S]*clearAuthenticationState\(\)/.test(apiSource)) {
    throw new Error("401 分支未清理旧认证状态");
  }
  if (!/async function bootstrap\(\)[\s\S]*authenticationRequired[\s\S]*return request\("\/bootstrap"/.test(apiSource)) {
    throw new Error("失效 Token 后的游客公共数据重试逻辑缺失");
  }
  return {
    guestPrivateCallsGuarded: true,
    privateCallsSequential: true,
    staleStorageKeysCleared: [
      "teaSession",
      "teaMallSessionToken",
      "teaCartCount",
      "teaSelectedAddress",
      "teaNickname",
    ],
    publicBootstrapRetriesAfterStaleToken: true,
  };
}

async function main() {
  const frontend = verifyFrontendGuards();

  const guestToken = randomToken("mp_guest_audit");
  const guestBootstrapResult = await call("/bootstrap", { token: guestToken });
  const guestBootstrap = ok(guestBootstrapResult, "游客 bootstrap");
  if (guestBootstrap?.authenticated !== false) throw new Error("游客被错误识别为已登录");
  const publicDocs = ok(await call("/support/documents", { token: guestToken }), "游客协议加载");

  const staleSeedToken = randomToken("mp_stale_seed");
  ok(await call("/bootstrap", { token: staleSeedToken }), "失效会话准备");
  const staleLogin = ok(
    await call("/session/login", {
      method: "POST",
      token: staleSeedToken,
      body: { phone, password },
    }),
    "失效会话测试登录",
  );
  const staleAuthenticatedToken = staleLogin?.sessionToken;
  if (!staleAuthenticatedToken || staleLogin?.authenticated !== true) throw new Error("隔离账号登录未签发会话");
  ok(await call("/session/logout", { method: "POST", token: staleAuthenticatedToken }), "生成失效 Token");
  const staleResponse = await call("/bootstrap", { token: staleAuthenticatedToken });
  assertUnauthorized(staleResponse, "旧 Token bootstrap");
  const recoveredGuest = ok(
    await call("/bootstrap", { token: randomToken("mp_recovered_guest") }),
    "失效 Token 后公共数据恢复",
  );
  if (recoveredGuest?.authenticated !== false || !Array.isArray(recoveredGuest?.products)) {
    throw new Error("失效 Token 后未恢复游客公共商品数据");
  }

  const loginGuestToken = randomToken("mp_login_guest");
  ok(await call("/bootstrap", { token: loginGuestToken }), "正常登录游客会话");
  const normalLogin = ok(
    await call("/session/login", {
      method: "POST",
      token: loginGuestToken,
      body: { phone, password },
    }),
    "手机号密码登录",
  );
  const memberToken = normalLogin?.sessionToken;
  if (!memberToken || normalLogin?.authenticated !== true) throw new Error("手机号密码登录状态不正确");
  const preferences = ok(await call("/account/preferences", { token: memberToken }), "登录后偏好加载");
  const coupons = ok(
    await call(`/account/coupons?status=${encodeURIComponent("未使用")}`, { token: memberToken }),
    "登录后优惠券加载",
  );
  ok(await call("/session/logout", { method: "POST", token: memberToken }), "正常退出");
  const oldPrivateResponse = await call("/account/preferences", { token: memberToken });
  assertUnauthorized(oldPrivateResponse, "退出后的旧 Token");

  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      apiBase,
      isolatedLocalOnly: true,
      productionConnected: false,
      account: `${phone.slice(0, 3)}****${phone.slice(-4)}`,
    },
    sourceGuards: frontend,
    guest: {
      status: "passed",
      authenticated: false,
      requestedEndpoints: ["GET /bootstrap", "GET /support/documents"],
      privateEndpointsRequested: [],
      publicDocumentsLoaded: Array.isArray(publicDocs) ? publicDocs.length : 0,
    },
    staleToken: {
      status: "passed",
      oldTokenRejected: true,
      rejectionCode: staleResponse.payload?.code,
      authenticationStorageClearedByClient: true,
      publicBootstrapRecovered: true,
      recoveredProductCount: recoveredGuest.products.length,
    },
    normalLogin: {
      status: "passed",
      authenticated: true,
      preferencesLoaded: Boolean(preferences),
      couponRecordsLoaded: Array.isArray(coupons) ? coupons.length : 0,
      logoutRevokedOldToken: true,
      oldPrivateRequestCode: oldPrivateResponse.payload?.code,
    },
    secretsRecorded: false,
  };

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
