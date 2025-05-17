import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

async function readLines(path: string) {
	const content = await readFile(path, "utf8")
	return content.trim().split("\n")
}

const dataPath = (...segments: string[]) =>
	join(import.meta.dirname, "../data", ...segments)

const songs = (await readLines(dataPath("songs.txt"))).sort()
const bossSongs = (await readLines(dataPath("boss_songs.txt"))).sort()

const goals = ["Track Clear", "AA Rank", "AAA Rank", "S Rank"]

const items = [
	...songs.map((song) => ({
		name: song,
		category: [`Songs`],
		progression: true,
		count: 2,
	})),
	...bossSongs.map((song) => ({
		name: `CHAIN: ${song}`,
		category: [`CHAIN`, `CHAIN - ${song}`],
		progression: true,
		count: 10,
	})),
	{
		name: "ULTIMATE CHAIN (GRACE)",
		category: ["ULTIMATE CHAIN"],
		progression: true,
		count: 8,
	},
	{
		name: "ULTIMATE CHAIN (RASIS)",
		category: ["ULTIMATE CHAIN"],
		progression: true,
		count: 8,
	},
	{
		name: "PERFECT ULTIMATE CHAIN (GRACE)",
		category: ["PERFECT ULTIMATE CHAIN"],
		progression: true,
	},
	{
		name: "PERFECT ULTIMATE CHAIN (RASIS)",
		category: ["PERFECT ULTIMATE CHAIN"],
		progression: true,
	},
	{
		name: "ERROR: Reversed Lazer Colors",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "ERROR: Forced Slowjam (Speed 400)",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "ERROR: Pass a 10+ with Keyboard",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "ERROR: Pass neu BSP style with no cmod",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "ERROR: Pass Endymion with no cmod",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "ERROR: Pass Firestorm with reversed lazers",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "ERROR: Pass '* Erm, could it be a Spatiotemporal ShockWAVE Syndrome...?' (exhaust) with no cmod",
		category: ["ERROR"],
		trap: true,
		count: 2,
	},
	{
		name: "EFFECT: +50,000 score",
		category: ["EFFECT"],
		count: 12,
	},
	{
		name: "EFFECT: +100,000 score",
		category: ["EFFECT"],
		count: 9,
	},
	{
		name: "EFFECT: +200,000 score",
		category: ["EFFECT"],
		count: 6,
	},
	{
		name: "EFFECT: +500,000 score",
		category: ["EFFECT"],
		count: 3,
	},
	{
		name: "EFFECT: +1,000,000 score",
		category: ["EFFECT"],
		count: 1,
	},
	{
		name: "EFFECT: Cancel Trap",
		category: ["EFFECT"],
		count: 5,
	},
]

const locations = [
	...songs.flatMap((song) => {
		return goals.map((goal) => ({
			name: `${song} (${goal})`,
			requires: `|${song}|`,
			category: ["Songs", `Song: ${song}`, `Goal: ${goal}`],
		}))
	}),
	...bossSongs.map((song) => ({
		name: `BOSS: ${song}`,
		requires: `|@CHAIN - ${song}:5|`,
		place_item_category: [`ULTIMATE CHAIN`],
		category: ["Boss Songs"],
	})),
	{
		name: `VICTORY: Believe (y)our Wings {GRA5P WAVES} - GRACE COLORS (Camellia ft. Yuki Shizaki, Nakuru Aitsuki, Aramaki, ORIHIME, Kanata.N, dadaco, haruno, Nanahira)`,
		requires: `|ULTIMATE CHAIN (GRACE):5|`,
		place_item: ["PERFECT ULTIMATE CHAIN (GRACE)"],
		category: ["Victory Songs"],
	},
	{
		name: `VICTORY: Believe (y)our Wings {V:IVID RAYS} - RASIS COLORS (Camellia ft. Yuki Shizaki, ayu, kabotya, Kuroa*, SOPHY, mikanzil, myui)`,
		requires: `|ULTIMATE CHAIN (RASIS):5|`,
		place_item: ["PERFECT ULTIMATE CHAIN (RASIS)"],
		category: ["Victory Songs"],
	},
	{
		name: `PERFECT ULTIMATE CHAIN`,
		requires: `|@PERFECT ULTIMATE CHAIN:all|`,
		victory: true,
		category: ["Victory"],
	},
]

console.time("Saved items")
await writeFile(
	dataPath("items.json"),
	JSON.stringify({ data: items }, null, "\t"),
)
console.timeEnd("Saved items")

console.time("Saved locations")
await writeFile(
	dataPath("locations.json"),
	JSON.stringify({ data: locations }, null, "\t"),
)
console.timeEnd("Saved locations")
