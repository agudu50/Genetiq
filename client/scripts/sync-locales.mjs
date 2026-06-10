import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/locales");
const en = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8"));
const enKeys = Object.keys(en);

const files = fs
	.readdirSync(localesDir)
	.filter((f) => f.endsWith(".json") && f !== "en.json");

for (const file of files) {
	const filePath = path.join(localesDir, file);
	const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
	const merged = {};

	for (const key of enKeys) {
		merged[key] = current[key] ?? en[key];
	}

	fs.writeFileSync(filePath, `${JSON.stringify(merged, null, "\t")}\n`, "utf8");
	console.log(`Synced ${file}: ${Object.keys(current).length} → ${Object.keys(merged).length} keys`);
}
