const crypto = require("node:crypto");

const api = process.env.CHAYE_EXCHANGE_API || "http://127.0.0.1:18083/mall";
if (!/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/mall\/?$/.test(api)) throw new Error("兑换中心回归只允许访问本机隔离服务");

const token = (prefix) => `${prefix}_${crypto.randomBytes(24).toString("hex")}`.slice(0, 64);
const suffix = String(Date.now()).slice(-8);
const phones = [`198${suffix}`, `197${suffix}`];
const password = `AuditA1${crypto.randomBytes(8).toString("hex")}`;
const smsCode = process.env.CHAYE_TEST_SMS_CODE;
if (!/^\d{6}$/.test(String(smsCode || ""))) throw new Error("请通过 CHAYE_TEST_SMS_CODE 提供隔离测试验证码");

async function call(path, { method = "GET", session, body } = {}) {
	const response = await fetch(`${api}${path}`, { method, headers: { "Content-Type": "application/json", ...(session ? { "X-Mall-Session": session } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
	return { status: response.status, payload: await response.json() };
}
function ok(result, label) {
	if (result.payload?.code !== 200) throw new Error(`${label}失败：${result.payload?.msg || result.status}`);
	return result.payload.data;
}
async function register(phone, refCode = "") {
	const guest = token("exchange_guest");
	ok(await call("/bootstrap", { session: guest }), "游客初始化");
	ok(await call("/session/sms/request", { method: "POST", session: guest, body: { phone, purpose: "REGISTER" } }), "注册验证码申请");
	return ok(await call("/session/register", { method: "POST", session: guest, body: { phone, code: smsCode, password, refCode } }), "隔离账号注册");
}

(async () => {
	const categories = ok(await call("/content/categories"), "科普分类");
	const articles = ok(await call("/content/articles?categoryCode=TEA_SCIENCE"), "科普文章");
	const guestExchange = await call("/exchange-center", { session: token("unauth") });
	if (guestExchange.payload?.code === 200) throw new Error("游客越权读取兑换中心");

	const a = await register(phones[0]);
	const aToken = a.sessionToken;
	const scene = ok(await call("/distribution/invite-scene", { session: aToken }), "邀请场景");
	const selfBind = await call("/distribution/bind", { method: "POST", session: aToken, body: { sceneCode: scene.sceneCode } });
	if (selfBind.payload?.code === 200) throw new Error("自己邀请自己未被拦截");

	const b = await register(phones[1], scene.sceneCode);
	const bToken = b.sessionToken;
	const duplicateBind = await call("/distribution/bind", { method: "POST", session: bToken, body: { sceneCode: scene.sceneCode } });
	if (duplicateBind.payload?.code === 200) throw new Error("重复绑定邀请关系未被拦截");

	const overview = ok(await call("/exchange-center", { session: aToken }), "兑换中心摘要");
	const rewards = ok(await call("/distribution/invite-rewards", { session: aToken }), "邀请奖励页");
	const aRecords = ok(await call("/distribution/invite-records", { session: aToken }), "邀请人记录");
	const bRecords = ok(await call("/distribution/invite-records", { session: bToken }), "受邀人记录");
	if (!overview.points || !overview.invite || !Array.isArray(rewards.tiers)) throw new Error("兑换中心左右摘要结构不完整");
	if (aRecords.length !== 1 || bRecords.length !== 0) throw new Error("邀请记录归属隔离失败");
	if (Number(rewards.effectiveInvites || 0) !== 0) throw new Error("好友未完成首单却被计为有效邀请");

	console.log(JSON.stringify({ status: "PASS", publicContent: { categoryCount: categories.length, articleCount: articles.length }, exchangeCenter: { pointsSummary: true, inviteSummary: true }, invitationSecurity: { guestRejected: true, selfInviteRejected: true, duplicateBindRejected: true, ownershipIsolated: true, emptyRegistrationNotEffective: true }, createdTestAccounts: 2, secretsRecorded: false }, null, 2));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
