import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root = path.resolve(".");
const reportDir = path.join(root, "docs", "adaptation-audit");
const base = process.env.CHAYE_TEST_MALL_BASE || "http://127.0.0.1:18083/mall";
const site = process.env.CHAYE_TEST_H5_BASE || "http://127.0.0.1:18084";
const widths = [320, 360, 375, 390, 414, 430, 448];
const mysql = "C:/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe";
const database = process.env.CHAYE_TEST_DATABASE || "chaye_full_regression_v3";
const pages = JSON.parse(await readFile(path.join(root, "pages.json"), "utf8"))
	.pages.map((item) => item.path)
	.filter((route) => route !== "pages/reward-detail/reward-detail");

if (pages.length !== 51 || !base.startsWith("http://127.0.0.1:")) {
	throw new Error(
		`Refusing unexpected audit scope: pages=${pages.length}, base=${base}`,
	);
}

function query(sql) {
	return execFileSync(
		mysql,
		[
			"--no-defaults",
			"--protocol=tcp",
			"--host=127.0.0.1",
			"--port=33308",
			"--user=root",
			"--default-character-set=utf8mb4",
			`--database=${database}`,
			"--batch",
			"--raw",
			"--skip-column-names",
			`--execute=${sql}`,
		],
		{ encoding: "utf8" },
	).trim();
}

async function api(endpoint, { method = "GET", token, body } = {}) {
	const response = await fetch(base + endpoint, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { "X-Mall-Session": token } : {}),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const payload = await response.json();
	if (response.status >= 400 || payload.code !== 200) {
		throw new Error(
			`${method} ${endpoint}: ${response.status} ${JSON.stringify(payload)}`,
		);
	}
	return payload.data;
}

const baselineCustomerId = Number(
	query("SELECT COALESCE(MAX(id),0) FROM mall_customer"),
);
const phone = "136" + String(Date.now()).slice(-8);
const password = "Audit" + randomBytes(5).toString("hex") + "7!";
const guestToken = "audit_guest_" + randomBytes(20).toString("hex");
await api("/bootstrap", { token: guestToken });
const registered = await api("/session/register", {
	method: "POST",
	token: guestToken,
	body: { phone, password, refCode: "" },
});
const memberToken = registered.sessionToken;
const memberCustomerId = Number(registered.customer?.id);
if (!memberCustomerId)
	throw new Error("Temporary audit customer id is missing");
query(
	`UPDATE mall_distributor SET partner_status='审核通过', partner_approved_time=NOW() WHERE customer_id=${memberCustomerId}`,
);
const routeQuery = {
	"pages/tier-reward-detail/tier-reward-detail": "id=1",
};

await mkdir(reportDir, { recursive: true });
const result = {
	environment: { site, api: base, database, productionConnected: false },
	widths,
	routes: pages.length,
	checks: [],
	consoleErrors: [],
	requestFailures: [],
	resource404: [],
	httpErrors: [],
	horizontalOverflows: [],
	controlClipping: [],
	testFixtureSubstitutions: [],
};

const browser = await chromium.launch({
	headless: true,
	executablePath:
		"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});

try {
	for (const width of widths) {
		const page = await browser.newPage({
			viewport: { width, height: 900 },
			deviceScaleFactor: 1,
		});
		let currentRoute = "";
		await page.addInitScript((session) => {
			localStorage.setItem("teaMallSessionToken", session);
		}, memberToken);
		await page.route(`${site}/api/mall/**`, async (route) => {
			const request = route.request();
			const target = request.url().replace(`${site}/api/mall`, base);
			const response = await fetch(target, {
				method: request.method(),
				headers: request.headers(),
				body: ["GET", "HEAD"].includes(request.method())
					? undefined
					: request.postDataBuffer(),
			});
			await route.fulfill({
				status: response.status,
				headers: {
					"content-type":
						response.headers.get("content-type") ||
						"application/json",
				},
				body: Buffer.from(await response.arrayBuffer()),
			});
		});
		await page.route(
			"https://chaye.okam.top/static/images/**",
			async (route) => {
				let target = route
					.request()
					.url()
					.replace("https://chaye.okam.top", site);
				if (target.endsWith("/static/images/custom-preserve.webp")) {
					result.testFixtureSubstitutions.push({
						width,
						route: currentRoute,
						from: target,
						to: `${site}/static/images/longjing-hero-v2.webp`,
						reason: "isolated migration-preservation sentinel",
					});
					target = `${site}/static/images/longjing-hero-v2.webp`;
				}
				const response = await fetch(target);
				await route.fulfill({
					status: response.status,
					body: Buffer.from(await response.arrayBuffer()),
				});
			},
		);
		await page.route(
			`${site}/static/images/custom-preserve.webp`,
			async (route) => {
				const target = `${site}/static/images/longjing-hero-v2.webp`;
				result.testFixtureSubstitutions.push({
					width,
					route: currentRoute,
					from: route.request().url(),
					to: target,
					reason: "isolated migration-preservation sentinel",
				});
				const response = await fetch(target);
				await route.fulfill({
					status: response.status,
					body: Buffer.from(await response.arrayBuffer()),
				});
			},
		);
		page.on("console", (message) => {
			if (message.type() === "error")
				result.consoleErrors.push({
					width,
					route: currentRoute,
					text: message.text(),
				});
		});
		page.on("requestfailed", (request) => {
			result.requestFailures.push({
				width,
				url: request.url(),
				error: request.failure()?.errorText,
			});
		});
		page.on("response", (response) => {
			if (response.status() === 404)
				result.resource404.push({
					width,
					route: currentRoute,
					url: response.url(),
				});
			if (response.status() >= 400)
				result.httpErrors.push({
					width,
					route: currentRoute,
					status: response.status(),
					url: response.url(),
				});
		});

		for (const route of pages) {
			currentRoute = route;
			const extraQuery = routeQuery[route] ? `&${routeQuery[route]}` : "";
			const url = `${site}/#/${route}?visualAudit=1&auditWidth=${width}${extraQuery}`;
			await page.goto(url, {
				waitUntil: "domcontentloaded",
				timeout: 20000,
			});
			await page.waitForTimeout(180);
			const layout = await page.evaluate(() => {
				const shell =
					document.querySelector(".phone-shell") || document.body;
				const buttons = [...document.querySelectorAll("button")].filter(
					(node) => {
						const rect = node.getBoundingClientRect();
						return rect.width > 0 && rect.height > 0;
					},
				);
				const fixed = [
					...document.querySelectorAll(
						".submit-bar,.exchange-submit,.detail-actions,.cart-total,.bottom-nav,.order-payment-actions",
					),
				];
				return {
					documentOverflow:
						document.documentElement.scrollWidth -
						document.documentElement.clientWidth,
					shellOverflow: shell.scrollWidth - shell.clientWidth,
					clippedButtons: buttons
						.filter(
							(node) =>
								node.scrollWidth > node.clientWidth + 1 ||
								node.scrollHeight > node.clientHeight + 1,
						)
						.map((node) => ({
							className: node.className,
							text: node.textContent.trim().slice(0, 40),
						})),
					fixedOutsideShell: fixed
						.filter((node) => {
							const rect = node.getBoundingClientRect();
							const parent = shell.getBoundingClientRect();
							return (
								rect.left < parent.left - 1 ||
								rect.right > parent.right + 1
							);
						})
						.map((node) => node.className),
				};
			});
			result.checks.push({
				width,
				route,
				actualHash: new URL(page.url()).hash.split("?")[0],
				...layout,
			});
			if (layout.documentOverflow > 1 || layout.shellOverflow > 1) {
				result.horizontalOverflows.push({ width, route, ...layout });
			}
			if (
				layout.clippedButtons.length ||
				layout.fixedOutsideShell.length
			) {
				result.controlClipping.push({
					width,
					route,
					clippedButtons: layout.clippedButtons,
					fixedOutsideShell: layout.fixedOutsideShell,
				});
			}
		}
		await page.close();
	}
} finally {
	await browser.close();
	try {
		await api("/session/logout", { method: "POST", token: memberToken });
	} catch {}
	const created = query(
		`SELECT id FROM mall_customer WHERE id>${baselineCustomerId} ORDER BY id`,
	)
		.split(/\r?\n/)
		.filter(Boolean)
		.map(Number);
	if (created.length) {
		const ids = created.join(",");
		const columns = query(
			"SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS " +
				`WHERE TABLE_SCHEMA='${database}' AND COLUMN_NAME LIKE '%customer_id%' ORDER BY TABLE_NAME,COLUMN_NAME`,
		)
			.split(/\r?\n/)
			.filter(Boolean)
			.map((line) => line.split("\t"));
		const grouped = new Map();
		for (const [table, column] of columns) {
			if (table === "mall_customer") continue;
			if (!grouped.has(table)) grouped.set(table, []);
			grouped.get(table).push(column);
		}
		const deletes = [...grouped].map(
			([table, cols]) =>
				`DELETE FROM \`${table}\` WHERE ${cols.map((col) => `\`${col}\` IN (${ids})`).join(" OR ")}`,
		);
		const tokenHash = createHash("sha256")
			.update(memberToken)
			.digest("hex");
		query(
			[
				"SET FOREIGN_KEY_CHECKS=0",
				"START TRANSACTION",
				...deletes,
				`DELETE FROM mall_revoked_session WHERE token_hash='${tokenHash}'`,
				`DELETE FROM mall_customer WHERE id IN (${ids})`,
				"COMMIT",
				"SET FOREIGN_KEY_CHECKS=1",
			].join(";"),
		);
	}
	result.cleanup = {
		customerRowsCreatedAfterBaseline: Number(
			query(
				`SELECT COUNT(*) FROM mall_customer WHERE id>${baselineCustomerId}`,
			),
		),
	};
}

result.status =
	result.horizontalOverflows.length ||
	result.controlClipping.length ||
	result.consoleErrors.length ||
	result.requestFailures.length ||
	result.resource404.length ||
	result.httpErrors.length
		? "FAIL"
		: "PASS";
await writeFile(
	path.join(reportDir, "responsive-48.json"),
	JSON.stringify(result, null, 2),
	"utf8",
);
console.log(
	JSON.stringify(
		{
			status: result.status,
			routes: result.routes,
			widths: result.widths,
			checks: result.checks.length,
			horizontalOverflows: result.horizontalOverflows.length,
			controlClipping: result.controlClipping.length,
			consoleErrors: result.consoleErrors.length,
			requestFailures: result.requestFailures.length,
			resource404: result.resource404.length,
			httpErrors: result.httpErrors.length,
			cleanup: result.cleanup,
		},
		null,
		2,
	),
);
if (result.status !== "PASS") process.exitCode = 1;
