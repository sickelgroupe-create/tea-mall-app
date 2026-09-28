const crypto = require("node:crypto");

const api = process.env.CHAYE_PLATFORM_API || "http://127.0.0.1:18083/mall";
const adminApi = process.env.CHAYE_ADMIN_API || "http://127.0.0.1:18083/mall/admin";
const adminToken = process.env.CHAYE_ADMIN_TOKEN || "";
const smsCode = process.env.CHAYE_TEST_SMS_CODE || "";
if (!/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/mall\/?$/.test(api)) throw new Error("平台回归只允许本机隔离商城服务");
if (!/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/mall\/admin\/?$/.test(adminApi)) throw new Error("平台回归只允许本机隔离管理服务");
if (!adminToken || !/^\d{6}$/.test(smsCode)) throw new Error("缺少隔离管理会话或测试验证码");

const requestNo = (prefix) => `${prefix}_${Date.now()}_${crypto.randomBytes(13).toString("hex")}`.slice(0, 64);
const suffix = String(Date.now()).slice(-8);
const phones = [`188${suffix}`, `189${suffix}`];
const password = `LocalA1!${crypto.randomBytes(10).toString("hex")}`;

async function request(base, path, { method = "GET", token, admin = false, body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? (admin ? { Authorization: `Bearer ${token}` } : { "X-Mall-Session": token }) : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, payload: await response.json() };
}
const mall = (path, options) => request(api, path, options);
const admin = (path, options = {}) => request(adminApi, path, { ...options, token: adminToken, admin: true });
function ok(result, label) {
  if (result.payload?.code !== 200) throw new Error(`${label}失败：${result.status}/${result.payload?.code}/${result.payload?.msg || ""}`);
  return result.payload.data;
}
function rejected(result, label, expected) {
  if (result.payload?.code === 200) throw new Error(`${label}未被拦截`);
  if (expected && !expected.test(String(result.payload?.msg || ""))) throw new Error(`${label}拒绝原因不正确：${result.payload?.msg || ""}`);
}
async function register(phone) {
  const guest = requestNo("platform_guest");
  ok(await mall("/bootstrap", { token: guest }), "游客初始化");
  ok(await mall("/session/sms/request", { method: "POST", body: { phone, purpose: "REGISTER" } }), "申请注册验证码");
  const data = ok(await mall("/session/register", { method: "POST", token: guest, body: { phone, code: smsCode, password } }), "注册隔离账号");
  if (!data?.sessionToken || !data?.authenticated) throw new Error("注册未返回登录会话");
  return data.sessionToken;
}
async function bootstrap(token) { return ok(await mall("/bootstrap", { token }), "加载会员数据"); }

(async () => {
  const [token, otherToken] = await Promise.all(phones.map(register));
  const user = await bootstrap(token);
  const other = await bootstrap(otherToken);

  const categories = ok(await mall("/content/categories"), "加载科普分类");
  const articles = ok(await mall("/content/articles?categoryCode=TEA_SCIENCE"), "加载科普文章");
  if (!categories.length || !articles.length || categories.some((row) => !row.categoryName)) throw new Error("科普分类或文章数据不完整");
  const article = ok(await mall(`/content/articles/${encodeURIComponent(articles[0].slug)}`, { token }), "加载科普详情");
  if (!article.title || /<script|javascript:/i.test(String(article.bodyHtml || ""))) throw new Error("科普详情内容缺失或未完成危险HTML过滤");

  const agreement = ok(await mall("/partner/agreement"), "加载合伙人协议");
  const application = ok(await mall("/partner/applications", {
    method: "POST", token,
    body: {
      realName: "隔离测试申请人", idNo: "11010519491231002X", region: "浙江省杭州市",
      address: "西湖区隔离自动化测试地址", phone: phones[0], reason: "用于本机隔离环境验证合伙人审核完整流程",
      agreed: true, agreementVersion: agreement.version,
    },
  }), "提交合伙人申请");
  rejected(await mall("/partner/applications", {
    method: "POST", token,
    body: { realName: "重复申请", idNo: "11010519491231002X", region: "浙江杭州", address: "隔离测试地址", phone: phones[0], reason: "重复申请必须由后端拦截", agreed: true, agreementVersion: agreement.version },
  }), "重复合伙人申请", /不能重复|已有/);
  const applications = ok(await admin("/partner/applications"), "后台合伙人申请列表");
  const adminApplication = applications.find((row) => row.application_no === application.application?.applicationNo || row.application_no === application.applicationNo);
  if (!adminApplication) throw new Error("后台未显示用户合伙人申请");
  ok(await admin(`/partner/applications/${adminApplication.id}`, { method: "PUT", body: { status: "审核通过", reason: "隔离自动化审核通过" } }), "后台审核合伙人");
  const approved = ok(await mall("/partner/status", { token }), "查看合伙人审核结果");
  if (approved.partnerStatus !== "审核通过") throw new Error("合伙人审核结果未同步到用户端");
  ok(await mall("/partner/workbench", { token }), "已审核合伙人工作台");
  rejected(await mall("/partner/workbench", { token: otherToken }), "未审核用户访问合伙人工作台", /审核|合伙人/);

  const post = ok(await mall("/community/posts", { method: "POST", token, body: { content: "隔离自动化留言板动态", images: [] } }), "发布留言板动态");
  const liked = ok(await mall(`/community/posts/${post.id}/like`, { method: "PUT", token: otherToken, body: { liked: true } }), "点赞动态");
  const likedAgain = ok(await mall(`/community/posts/${post.id}/like`, { method: "PUT", token: otherToken, body: { liked: true } }), "重复点赞幂等");
  if (Number(liked.likeCount) !== 1 || Number(likedAgain.likeCount) !== 1) throw new Error("点赞幂等失败");
  const comment = ok(await mall(`/community/posts/${post.id}/comments`, { method: "POST", token: otherToken, body: { content: "隔离自动化评论" } }), "评论动态");
  rejected(await mall(`/community/comments/${comment.id}`, { method: "DELETE", token }), "越权删除评论", /无权|不存在/);
  rejected(await mall(`/community/posts/${post.id}`, { method: "DELETE", token: otherToken }), "越权删除动态", /无权|不存在/);
  ok(await mall("/community/reports", { method: "POST", token, body: { commentId: comment.id, reason: "隔离自动化举报验证" } }), "提交举报");
  const reports = ok(await admin("/community/reports"), "后台举报列表");
  const report = reports.find((row) => Number(row.comment_id) === Number(comment.id));
  if (!report) throw new Error("举报未在后台落库显示");
  ok(await admin(`/community/reports/${report.id}`, { method: "PUT", body: { status: "已处理", adminRemark: "隔离举报处理完成" } }), "后台处理举报");
  ok(await mall(`/community/comments/${comment.id}`, { method: "DELETE", token: otherToken }), "删除自己的评论");
  ok(await mall(`/community/posts/${post.id}`, { method: "DELETE", token }), "删除自己的动态");

  const ticket = ok(await mall("/service-tickets", {
    method: "POST", token,
    body: { category: "订单咨询", content: "隔离自动化客服工单", contact: phones[0], requestNo: requestNo("ticket") },
  }), "创建客服工单");
  rejected(await mall(`/service-tickets/${ticket.ticketNo}`, { token: otherToken }), "客服工单越权查看", /无权|不存在|数据不存在/);
  ok(await mall(`/service-tickets/${ticket.ticketNo}/messages`, {
    method: "POST", token, body: { content: "用户补充问题", requestNo: requestNo("ticket_reply") },
  }), "用户补充客服消息");
  const tickets = ok(await admin("/tickets"), "后台客服工单列表");
  const adminTicket = tickets.find((row) => row.ticketNo === ticket.ticketNo);
  if (!adminTicket) throw new Error("客服工单未在后台显示");
  ok(await admin(`/tickets/${adminTicket.id}`, {
    method: "PUT", body: { status: "已回复", reply: "隔离客服已回复", requestNo: requestNo("admin_ticket_reply") },
  }), "后台回复客服工单");
  ok(await admin(`/tickets/${adminTicket.id}`, {
    method: "PUT", body: { status: "已完成", reply: "隔离客服处理完成", requestNo: requestNo("admin_ticket_complete") },
  }), "后台完成客服工单");
  let ticketDetail = ok(await mall(`/service-tickets/${ticket.ticketNo}`, { token }), "用户查看客服处理结果");
  if (ticketDetail.status !== "已完成" || ticketDetail.messages.length < 4) throw new Error("客服状态或完整时间轴未同步");
  ticketDetail = ok(await mall(`/service-tickets/${ticket.ticketNo}/messages`, {
    method: "POST", token, body: { content: "处理后继续追问", requestNo: requestNo("ticket_reopen") },
  }), "用户重新打开已完成工单");
  if (ticketDetail.status !== "处理中") throw new Error("已完成工单未按规则重新打开");

  const rewards = user.rewards.filter((row) => row.status === "0" && Number(row.stock) > 0);
  if (!rewards.length) throw new Error("隔离库没有可兑换积分奖品");
  const reward = rewards.sort((a, b) => Number(a.points) - Number(b.points))[0];
  const addressId = ok(await mall("/addresses", {
    method: "POST", token,
    body: { name: "积分兑换用户", phone: phones[0], line1: "浙江省 杭州市 西湖区", line2: "隔离积分兑换地址", isDefault: true },
  }), "保存积分兑换地址");
  const customers = ok(await admin("/customers"), "后台会员列表");
  const customer = customers.find((row) => Number(row.id) === Number(user.customer.id));
  if (!customer) throw new Error("后台未找到积分兑换会员");
  ok(await admin(`/customers/${customer.id}`, {
    method: "PUT",
    body: { nickname: customer.nickname, phone: customer.phone, status: customer.status, pointsAdjustment: Number(reward.points) + 100, pointsRemark: "隔离兑换并发回归积分" },
  }), "后台审计式积分调整");
  const exchangeRequest = requestNo("exchange");
  const exchangeBody = { requestId: exchangeRequest, rewardId: reward.id, qty: 1, addressId };
  const concurrentExchange = await Promise.all([
    mall("/exchanges", { method: "POST", token, body: exchangeBody }),
    mall("/exchanges", { method: "POST", token, body: exchangeBody }),
  ]);
  const exchangeA = ok(concurrentExchange[0], "并发积分兑换");
  const exchangeB = ok(concurrentExchange[1], "重复积分兑换幂等返回");
  if (exchangeA.exchangeNo !== exchangeB.exchangeNo) throw new Error("重复兑换生成多个兑换单");
  rejected(await mall(`/exchanges/${exchangeA.exchangeNo}`, { token: otherToken }), "积分兑换单越权查看", /无权|数据不存在/);
  const adminExchanges = ok(await admin("/exchanges"), "后台兑换订单列表");
  const adminExchange = adminExchanges.find((row) => row.exchangeNo === exchangeA.exchangeNo);
  if (!adminExchange) throw new Error("积分兑换订单未在后台显示");
  ok(await admin(`/exchanges/${adminExchange.id}`, { method: "PUT", body: { status: "待发货" } }), "后台确认兑换订单");
  ok(await admin(`/exchanges/${adminExchange.id}`, { method: "PUT", body: { status: "配送中", carrier: "隔离兑换物流", trackingNo: requestNo("EXTRACK") } }), "后台发出兑换奖品");
  ok(await mall(`/exchanges/${exchangeA.exchangeNo}/confirm-receipt`, { method: "POST", token }), "用户确认兑换奖品收货");
  const exchangeDetail = ok(await mall(`/exchanges/${exchangeA.exchangeNo}`, { token }), "查看兑换物流结果");
  if (exchangeDetail.status !== "已完成") throw new Error("兑换订单未完成");

  const notifications = ok(await mall("/notifications", { token }), "加载站内消息");
  if (!notifications.some((row) => row.category === "合伙人") || !notifications.some((row) => row.category === "客服")) {
    throw new Error("合伙人或客服状态变化未生成站内消息");
  }
  ok(await mall("/notifications/read-all", { method: "PUT", token }), "全部标记已读");
  const readNotifications = ok(await mall("/notifications", { token }), "核对站内消息已读状态");
  if (readNotifications.some((row) => Number(row.readStatus) !== 1)) throw new Error("站内消息全部已读失败");

  console.log(JSON.stringify({
    status: "PASS",
    environment: { localIsolatedOnly: true, productionConnected: false },
    content: { categories: true, articleDetail: true, dangerousHtmlFiltered: true },
    partner: { application: true, duplicateBlocked: true, adminApproval: true, userStatusSync: true, workbenchPermission: true },
    community: { post: true, likeIdempotent: true, comment: true, ownership: true, reportPersistedAndProcessed: true },
    serviceTicket: { created: true, ownership: true, userReply: true, adminReplyAndClose: true, timeline: true, reopen: true },
    pointsExchange: { adminAdjustmentAudited: true, concurrentIdempotency: true, ownership: true, delivery: true, receipt: true },
    notifications: { partnerAndServiceEvents: true, readAll: true, inAppOnly: true },
    createdTestAccounts: 2,
    secretsRecorded: false,
  }, null, 2));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
