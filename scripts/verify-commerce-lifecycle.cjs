const crypto = require("node:crypto");

const api = process.env.CHAYE_COMMERCE_API || "http://127.0.0.1:18083/mall";
const adminApi = process.env.CHAYE_ADMIN_API || "http://127.0.0.1:18083/mall/admin";
const adminToken = process.env.CHAYE_ADMIN_TOKEN || "";
const smsCode = process.env.CHAYE_TEST_SMS_CODE || "";

if (!/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/mall\/?$/.test(api)) {
  throw new Error(`商城生命周期回归只允许访问本机隔离服务：${api}`);
}
if (!/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/mall\/admin\/?$/.test(adminApi)) {
  throw new Error(`管理端生命周期回归只允许访问本机隔离服务：${adminApi}`);
}
if (!adminToken) throw new Error("缺少本机隔离管理端会话 CHAYE_ADMIN_TOKEN");
if (!/^\d{6}$/.test(smsCode)) throw new Error("缺少六位隔离测试验证码 CHAYE_TEST_SMS_CODE");

const id = (prefix) => `${prefix}_${Date.now()}_${crypto.randomBytes(14).toString("hex")}`.slice(0, 64);
const suffix = String(Date.now()).slice(-8);
const phones = [`186${suffix}`, `187${suffix}`];
const password = `LocalA1!${crypto.randomBytes(10).toString("hex")}`;

async function request(base, path, { method = "GET", token, admin = false, body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? (admin ? { Authorization: `Bearer ${token}` } : { "X-Mall-Session": token }) : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let payload;
  try {
    payload = await response.json();
  } catch (_) {
    payload = { code: response.status, msg: "响应不是JSON" };
  }
  return { status: response.status, payload };
}

const mall = (path, options) => request(api, path, options);
const admin = (path, options = {}) => request(adminApi, path, { ...options, token: adminToken, admin: true });

function ok(result, label) {
  if (result.status < 200 || result.status >= 300 || result.payload?.code !== 200) {
    throw new Error(`${label}失败：HTTP ${result.status} / code ${result.payload?.code} / ${result.payload?.msg || ""}`);
  }
  return result.payload.data;
}

function rejected(result, label, expected) {
  if (result.payload?.code === 200) throw new Error(`${label}未被拦截`);
  if (expected && !expected.test(String(result.payload?.msg || ""))) {
    throw new Error(`${label}拒绝原因不正确：${result.payload?.msg || ""}`);
  }
}

async function register(phone) {
  const guest = id("commerce_guest");
  ok(await mall("/bootstrap", { token: guest }), "游客初始化");
  ok(await mall("/session/sms/request", {
    method: "POST",
    body: { phone, purpose: "REGISTER" },
  }), "申请注册验证码");
  const data = ok(await mall("/session/register", {
    method: "POST",
    token: guest,
    body: { phone, code: smsCode, password },
  }), "注册隔离账号");
  if (!data?.authenticated || !data?.sessionToken) throw new Error("注册后未签发登录会话");
  return data.sessionToken;
}

async function bootstrap(token) {
  return ok(await mall("/bootstrap", { token }), "加载商城数据");
}

async function orderDetail(token, orderNo) {
  return ok(await mall(`/orders/${encodeURIComponent(orderNo)}`, { token }), "读取订单详情");
}

async function findAdminOrder(orderNo) {
  const orders = ok(await admin("/orders"), "后台订单列表");
  const order = orders.find((row) => row.orderNo === orderNo);
  if (!order) throw new Error(`后台未找到订单 ${orderNo}`);
  return order;
}

async function updateAdminOrder(orderNo, status) {
  const order = await findAdminOrder(orderNo);
  ok(await admin(`/orders/${order.id}`, {
    method: "PUT",
    body: {
      status,
      carrier: "隔离测试物流",
      trackingNo: id("TRACK").replaceAll("_", "").slice(0, 32),
      adminRemark: "本机隔离生命周期回归",
      requestNo: id("admin_order"),
    },
  }), `后台订单流转至${status}`);
}

async function createOrder(token, addressId, product, qty = 1) {
  const items = [{ productId: product.id, skuId: product.defaultSkuId, qty }];
  const quote = ok(await mall("/orders/quote", { method: "POST", token, body: { items } }), "服务端结算报价");
  if (Number(quote.paidAmount) !== Number(product.price) * qty) throw new Error("结算金额未采用服务端实时价格");
  const requestNo = id("create_order");
  const body = { requestNo, addressId, items, usePoints: false, invoice: { type: "不开发票" } };
  const concurrent = await Promise.all([
    mall("/orders", { method: "POST", token, body }),
    mall("/orders", { method: "POST", token, body }),
  ]);
  const created = ok(concurrent[0], "并发创建订单");
  const duplicate = ok(concurrent[1], "并发重复创建订单幂等返回");
  if (created.orderNo !== duplicate.orderNo) throw new Error("相同幂等键生成了不同订单");
  return created;
}

async function payAndComplete(token, orderNo) {
  const failureNo = id("pay_failure");
  ok(await mall(`/orders/${orderNo}/test-pay`, {
    method: "POST",
    token,
    body: { requestNo: failureNo, outcome: "failure" },
  }), "模拟支付失败落库");
  let detail = await orderDetail(token, orderNo);
  if (detail.status !== "待付款" || detail.paymentStatus !== "待支付") {
    throw new Error("模拟支付失败后订单没有保持待付款/待支付");
  }

  const successNo = id("pay_success");
  const concurrentPay = await Promise.all([
    mall(`/orders/${orderNo}/test-pay`, { method: "POST", token, body: { requestNo: successNo } }),
    mall(`/orders/${orderNo}/test-pay`, { method: "POST", token, body: { requestNo: successNo } }),
  ]);
  ok(concurrentPay[0], "并发模拟支付成功");
  ok(concurrentPay[1], "并发重复模拟支付幂等返回");
  detail = await orderDetail(token, orderNo);
  if (detail.status !== "待发货" || detail.paymentStatus !== "已支付" || !detail.testPayment) {
    throw new Error("模拟支付后订单状态或测试支付标识错误");
  }

  ok(await mall(`/orders/${orderNo}/expedite`, {
    method: "POST",
    token,
    body: { requestNo: id("expedite"), remark: "隔离回归催单" },
  }), "提交真实催发货记录");
  rejected(await mall(`/orders/${orderNo}/expedite`, {
    method: "POST",
    token,
    body: { requestNo: id("expedite_again") },
  }), "六小时内重复催单", /6小时|提醒/);

  await updateAdminOrder(orderNo, "待收货");
  ok(await mall(`/orders/${orderNo}/status`, {
    method: "PUT",
    token,
    body: { status: "已完成" },
  }), "用户确认收货");
  detail = await orderDetail(token, orderNo);
  if (detail.status !== "已完成") throw new Error("确认收货后订单未完成");
  return detail;
}

async function payToWaitingShipment(token, orderNo) {
  const requestNo = id("pay_unshipped_refund");
  ok(await mall(`/orders/${orderNo}/test-pay`, {
    method: "POST",
    token,
    body: { requestNo },
  }), "未发货仅退款场景模拟支付");
  const detail = await orderDetail(token, orderNo);
  if (detail.status !== "待发货" || detail.paymentStatus !== "已支付" || !detail.testPayment) {
    throw new Error("未发货仅退款场景没有进入测试支付待发货状态");
  }
  return detail;
}

async function createAftersale(token, otherToken, order, typeName, qty = 1) {
  const item = order.items[0];
  const quoteBody = { orderNo: order.orderNo, orderItemId: item.orderItemId, qty, typeName };
  const quote = ok(await mall("/aftersales/quote", { method: "POST", token, body: quoteBody }), `${typeName}金额试算`);
  if (Number(quote.requestedAmount) <= 0 || quote.calculatedBy !== "JAVA_BACKEND") {
    throw new Error(`${typeName}退款金额未由Java后端计算`);
  }
  const requestNo = id("aftersale");
  const body = { ...quoteBody, requestNo, reason: "隔离回归测试", description: "仅用于本机隔离库自动化验证", evidenceUrls: [] };
  const concurrent = await Promise.all([
    mall("/aftersales", { method: "POST", token, body }),
    mall("/aftersales", { method: "POST", token, body }),
  ]);
  const created = ok(concurrent[0], `并发创建${typeName}售后`);
  const duplicate = ok(concurrent[1], `${typeName}并发重复提交幂等返回`);
  if (created.aftersaleNo !== duplicate.aftersaleNo) throw new Error(`${typeName}相同幂等键生成了不同售后单`);
  rejected(await mall(`/aftersales/${created.aftersaleNo}`, { token: otherToken }), `${typeName}越权查看`, /不存在|无权/);
  return created;
}

async function findAdminAftersale(aftersaleNo) {
  const rows = ok(await admin("/aftersales"), "后台售后列表");
  const row = rows.find((item) => item.aftersaleNo === aftersaleNo);
  if (!row) throw new Error(`后台未找到售后单 ${aftersaleNo}`);
  return row;
}

async function updateAdminAftersale(aftersaleNo, status, extra = {}) {
  const row = await findAdminAftersale(aftersaleNo);
  ok(await admin(`/aftersales/${row.id}`, {
    method: "PUT",
    body: {
      status,
      adminRemark: "本机隔离售后状态回归",
      requestNo: id("admin_aftersale"),
      ...extra,
    },
  }), `后台售后流转至${status}`);
}

async function finishRefund(aftersaleNo) {
  await updateAdminAftersale(aftersaleNo, "退款处理中");
  await updateAdminAftersale(aftersaleNo, "退款成功");
  await updateAdminAftersale(aftersaleNo, "售后完成");
}

async function finishReturnRefund(token, aftersaleNo) {
  await updateAdminAftersale(aftersaleNo, "等待用户退货", { returnAddress: "隔离测试退货地址" });
  ok(await mall(`/aftersales/${aftersaleNo}/return-logistics`, {
    method: "POST",
    token,
    body: { carrier: "隔离退货物流", trackingNo: id("RETURN").slice(0, 32), requestNo: id("return_logistics") },
  }), "用户填写退货物流");
  await updateAdminAftersale(aftersaleNo, "商家已收货");
  await updateAdminAftersale(aftersaleNo, "退款处理中");
  await updateAdminAftersale(aftersaleNo, "退款成功");
  await updateAdminAftersale(aftersaleNo, "售后完成");
}

async function finishExchange(token, aftersaleNo) {
  await updateAdminAftersale(aftersaleNo, "等待用户退货", { returnAddress: "隔离测试换货地址" });
  ok(await mall(`/aftersales/${aftersaleNo}/return-logistics`, {
    method: "POST",
    token,
    body: { carrier: "隔离退货物流", trackingNo: id("EXRETURN").slice(0, 32), requestNo: id("exchange_return") },
  }), "换货用户填写退货物流");
  await updateAdminAftersale(aftersaleNo, "商家已收货");
  await updateAdminAftersale(aftersaleNo, "换货已发出", {
    exchangeCarrier: "隔离换货物流",
    exchangeTrackingNo: id("EXCHANGE").slice(0, 32),
  });
  ok(await mall(`/aftersales/${aftersaleNo}/confirm-exchange`, {
    method: "POST",
    token,
    body: { requestNo: id("exchange_confirm") },
  }), "用户确认收到换货商品");
}

async function verifyInventoryConcurrency(tokenA, addressA, tokenB, addressB, products) {
  const product = [...products]
    .filter((item) => item.status === "0" && item.defaultSkuId && Number(item.stock) > 0 && Number(item.stock) <= 99)
    .sort((a, b) => Number(a.stock) - Number(b.stock))[0];
  if (!product) throw new Error("隔离库没有适合执行库存并发回归的SKU");
  const qty = Number(product.stock);
  const bodies = [
    { requestNo: id("stock_race_a"), addressId: addressA, items: [{ productId: product.id, skuId: product.defaultSkuId, qty }] },
    { requestNo: id("stock_race_b"), addressId: addressB, items: [{ productId: product.id, skuId: product.defaultSkuId, qty }] },
  ];
  const results = await Promise.all([
    mall("/orders", { method: "POST", token: tokenA, body: bodies[0] }),
    mall("/orders", { method: "POST", token: tokenB, body: bodies[1] }),
  ]);
  const successful = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.payload?.code === 200);
  const refused = results.filter((result) => result.payload?.code !== 200);
  if (successful.length !== 1 || refused.length !== 1) {
    throw new Error(`库存并发结果错误：成功${successful.length}，拒绝${refused.length}`);
  }
  if (!/库存|冲突|重试/.test(String(refused[0].payload?.msg || ""))) {
    throw new Error(`库存并发拒绝原因错误：${refused[0].payload?.msg || ""}`);
  }
  const winner = successful[0];
  const winnerToken = winner.index === 0 ? tokenA : tokenB;
  const orderNo = winner.result.payload.data.orderNo;
  ok(await mall(`/orders/${orderNo}/cancel`, {
    method: "POST",
    token: winnerToken,
    body: { requestNo: id("stock_race_cancel"), reason: "隔离库存并发回归完成", note: "释放预占库存" },
  }), "释放库存并发回归订单");
  const restored = await bootstrap(tokenA);
  const restoredProduct = restored.products.find((item) => Number(item.id) === Number(product.id));
  if (Number(restoredProduct?.stock) !== qty) throw new Error("并发回归取消订单后库存没有完整恢复");
  return true;
}

(async () => {
  const [token, otherToken] = await Promise.all(phones.map(register));
  const initial = await bootstrap(token);
  const product = initial.products.find((item) => item.status === "0" && item.stock >= 8 && item.defaultSkuId);
  if (!product) throw new Error("隔离库中没有可用于生命周期回归的在售SKU");
  const initialStock = Number(product.stock);

  ok(await mall(`/cart/${product.id}`, {
    method: "PUT",
    token,
    body: { skuId: product.defaultSkuId, qty: 3, checked: true },
  }), "加入购物车");
  let state = await bootstrap(token);
  let cartLine = state.cart.find((item) => Number(item.skuId) === Number(product.defaultSkuId));
  if (!cartLine || Number(cartLine.qty) !== 3) throw new Error("加入购物车后数量或角标数据源未更新");
  ok(await mall(`/cart/${product.id}`, {
    method: "PUT",
    token,
    body: { skuId: product.defaultSkuId, qty: 2, checked: true },
  }), "修改购物车数量");
  state = await bootstrap(token);
  cartLine = state.cart.find((item) => Number(item.skuId) === Number(product.defaultSkuId));
  if (!cartLine || Number(cartLine.qty) !== 2) throw new Error("购物车数量没有持久化");

  const addressId = ok(await mall("/addresses", {
    method: "POST",
    token,
    body: { name: "隔离测试用户", phone: phones[0], line1: "浙江省 杭州市 西湖区", line2: "隔离自动化测试地址1号", isDefault: true },
  }), "保存收货地址");
  const otherAddressId = ok(await mall("/addresses", {
    method: "POST",
    token: otherToken,
    body: { name: "隔离并发用户", phone: phones[1], line1: "浙江省 杭州市 西湖区", line2: "隔离并发测试地址2号", isDefault: true },
  }), "保存并发账号收货地址");

  rejected(await mall("/orders", {
    method: "POST",
    token,
    body: { addressId, items: [{ productId: product.id, skuId: product.defaultSkuId, qty: 1 }] },
  }), "缺少订单幂等键", /幂等|请求号/);

  const firstCreated = await createOrder(token, addressId, product, 2);
  const firstCompleted = await payAndComplete(token, firstCreated.orderNo);
  rejected(await mall(`/orders/${firstCreated.orderNo}`, { token: otherToken }), "订单越权查看", /不存在|无权/);

  const refund = await createAftersale(token, otherToken, firstCompleted, "仅退款", 1);
  await finishRefund(refund.aftersaleNo);
  const exchange = await createAftersale(token, otherToken, await orderDetail(token, firstCreated.orderNo), "换货", 1);
  await finishExchange(token, exchange.aftersaleNo);

  const secondCreated = await createOrder(token, addressId, product, 1);
  const secondCompleted = await payAndComplete(token, secondCreated.orderNo);
  const returned = await createAftersale(token, otherToken, secondCompleted, "退货退款", 1);
  await finishReturnRefund(token, returned.aftersaleNo);

  const beforeUnshippedRefund = await bootstrap(token);
  const beforeUnshippedProduct = beforeUnshippedRefund.products.find((item) => Number(item.id) === Number(product.id));
  const thirdCreated = await createOrder(token, addressId, product, 1);
  const thirdPaid = await payToWaitingShipment(token, thirdCreated.orderNo);
  const unshippedRefund = await createAftersale(token, otherToken, thirdPaid, "仅退款", 1);
  await finishRefund(unshippedRefund.aftersaleNo);
  const afterUnshippedRefund = await bootstrap(token);
  const afterUnshippedProduct = afterUnshippedRefund.products.find((item) => Number(item.id) === Number(product.id));
  if (Number(afterUnshippedProduct?.stock) !== Number(beforeUnshippedProduct?.stock)) {
    throw new Error("未发货订单仅退款完成后没有恢复预占库存");
  }

  const finalState = await bootstrap(token);
  const finalProduct = finalState.products.find((item) => Number(item.id) === Number(product.id));
  const firstFinal = await orderDetail(token, firstCreated.orderNo);
  const secondFinal = await orderDetail(token, secondCreated.orderNo);
  const adminAftersales = ok(await admin("/aftersales"), "后台售后最终核对");
  const generated = adminAftersales.filter((row) => [refund.aftersaleNo, exchange.aftersaleNo, returned.aftersaleNo].includes(row.aftersaleNo));
  if (generated.length !== 3 || generated.some((row) => row.status !== "售后完成")) {
    throw new Error("三类售后未全部形成后台闭环");
  }
  if (Number(firstFinal.refundedAmount) <= 0 || Number(secondFinal.refundedAmount) <= 0) {
    throw new Error("退款金额没有真实写回订单");
  }
  if (Number(finalProduct.stock) !== initialStock - 2) {
    throw new Error(`库存恢复结果错误：初始${initialStock}，最终${finalProduct.stock}，预期${initialStock - 2}`);
  }
  await verifyInventoryConcurrency(token, addressId, otherToken, otherAddressId, finalState.products);

  console.log(JSON.stringify({
    status: "PASS",
    environment: { localIsolatedOnly: true, productionConnected: false },
    cart: { add: true, quantityPersistence: true, backendIsolation: true },
    order: {
      serverQuote: true,
      requiredIdempotencyKey: true,
      concurrentDuplicateCreateReturnsSameOrder: true,
      paymentFailureKeepsPending: true,
      paymentRetrySuccess: true,
      concurrentDuplicatePaymentIdempotent: true,
      expeditePersistedAndRateLimited: true,
      adminShipment: true,
      customerReceipt: true,
      ownershipEnforced: true,
    },
    aftersale: {
      refundOnly: "completed",
      returnRefund: "completed",
      exchange: "completed",
      sameItemPartialQuantityTwice: true,
      javaCalculatedRefund: true,
      concurrentDuplicateSubmissionIdempotent: true,
      ownershipEnforced: true,
      adminVisibleAndOperable: true,
    },
    inventory: {
      reservedAtomically: true,
      lastAvailableStockConcurrencyAllowsOneOrder: true,
      cancelledReservationRestoredOnce: true,
      returnRefundRestoredOnce: true,
      unshippedRefundRestoredOnce: true,
      expectedNetDecrease: 2,
    },
    createdTestAccounts: 2,
    createdTestOrders: 2,
    createdTestAftersales: 3,
    secretsRecorded: false,
  }, null, 2));
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
