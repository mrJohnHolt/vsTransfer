import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const globalRoot = execSync("npm root -g").toString().trim();
const { default: puppeteer } = await import(pathToFileURL(path.join(globalRoot, "puppeteer", "lib", "puppeteer", "puppeteer.js")).href);

const url = process.argv[2];
const label = process.argv[3];
const width = parseInt(process.argv[4] ?? "1280", 10);
const height = parseInt(process.argv[5] ?? "900", 10);

if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label] [width] [height]");
  process.exit(1);
}

const dir = "./temporary screenshots";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter((f) => f.startsWith("screenshot-"));
const nextNum = existing.length
  ? Math.max(...existing.map((f) => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? "0", 10))) + 1
  : 1;

const filename = label ? `screenshot-${nextNum}-${label}.png` : `screenshot-${nextNum}.png`;
const filepath = path.join(dir, filename);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Saved ${filepath}`);
