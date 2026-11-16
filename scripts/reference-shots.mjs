// Captures reference screenshots and measured style values of the demo used as visual reference
// (docs/DESIGN.md). Study material only: output goes to design/reference/, which is git-ignored.
// No asset, text or code from the demo is copied into the product.
// Usage: node scripts/reference-shots.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const ORIGIN = 'https://demo.codeandchill.store/cadra/';
const OUT = 'design/reference';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1440, height: 900 },
	deviceScaleFactor: 2
});

await page.goto(`${ORIGIN}#/dashboard`, { waitUntil: 'networkidle', timeout: 45_000 });
await page.waitForTimeout(2500);

// Routes are discovered from the app's own links instead of being guessed.
const routes = await page.evaluate(() => [
	...new Set(
		[...document.querySelectorAll('a[href*="#/"]')]
			.map((a) => (a.getAttribute('href') ?? '').replace(/^.*#\//, ''))
			.filter(Boolean)
	)
]);

// Measured values: custom properties declared on :root and the fonts actually in use.
const measured = await page.evaluate(() => {
	/** @type {Record<string, string>} */
	const tokens = {};
	for (const sheet of document.styleSheets) {
		let rules;
		try {
			rules = sheet.cssRules;
		} catch {
			continue;
		}
		for (const rule of rules) {
			if (!(rule instanceof CSSStyleRule)) continue;
			if (rule.selectorText !== ':root' && rule.selectorText !== ':root, :host') continue;
			for (const name of rule.style) {
				if (name.startsWith('--')) tokens[name] = rule.style.getPropertyValue(name).trim();
			}
		}
	}
	const body = getComputedStyle(document.body);
	const heading = document.querySelector('h1');
	return {
		tokens,
		body: {
			fontFamily: body.fontFamily,
			fontSize: body.fontSize,
			background: body.backgroundColor
		},
		h1: heading && {
			fontFamily: getComputedStyle(heading).fontFamily,
			fontSize: getComputedStyle(heading).fontSize,
			fontWeight: getComputedStyle(heading).fontWeight,
			letterSpacing: getComputedStyle(heading).letterSpacing
		}
	};
});
writeFileSync(`${OUT}/measured.json`, JSON.stringify({ routes, ...measured }, null, '\t'));

for (const route of routes) {
	const slug = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
	try {
		await page.goto(`${ORIGIN}#/${route}`, { waitUntil: 'networkidle', timeout: 45_000 });
		await page.waitForTimeout(2000);
		await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });
		console.log(`ok   ${slug}`);
	} catch (error) {
		console.log(`FAIL ${slug}: ${String(error).split('\n')[0]}`);
	}
}

await browser.close();
