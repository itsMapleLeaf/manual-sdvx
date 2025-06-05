import AdmZip from "adm-zip"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import songs from "../Manual/src/data/songs.json"
import { navigators } from "./navigators.ts"
import { manualDataPath } from "./paths.ts"

type Item = {
	name: string
	category?: string[]
	count?: number
	value?: Record<string, string | number>
	progression?: boolean
	progression_skip_balancing?: boolean
	useful?: boolean
	trap?: boolean
}

type Location = {
	name: string
	category?: string[]
	requires?: string
	place_item?: string[]
	place_item_category?: string[]
	victory?: boolean
}

type Category = {
	hidden?: boolean
	yaml_option?: string[]
}

const locations: Location[] = [
	{
		name: "PERFECT ULTIMATE CHAIN",
		requires: "|@Boss Clear|",
		victory: true,
		category: ["((Victory))"],
	},
]

const items: Item[] = [
	{
		name: "CHAIN",
		category: ["CHAIN"],
		progression: true,
		count: 20,
		value: { chain: 1 },
	},
	{
		name: "5 CHAIN",
		category: ["CHAIN"],
		progression: true,
		count: 10,
		value: { chain: 5 },
	},
	{
		name: "10 CHAIN",
		category: ["CHAIN"],
		progression: true,
		count: 5,
		value: { chain: 10 },
	},
	{
		name: "20 CHAIN",
		category: ["CHAIN"],
		progression: true,
		count: 3,
		value: { chain: 20 },
	},
	{
		name: "50 CHAIN",
		category: ["CHAIN"],
		progression: true,
		count: 2,
		value: { chain: 50 },
	},
	{
		name: "100 CHAIN",
		category: ["CHAIN"],
		progression: true,
		count: 1,
		value: { chain: 100 },
	},
]

const categories: Record<string, Category> = {
	Goals: { hidden: true },
	Consumables: { hidden: true },
}

function songNumberCategoryFor(songNumber: number) {
	return `Song Number ${songNumber}`
}

function navigatorKeyCategoryFor(navigator: string) {
	return `Navigator Access for ${navigator}`
}

for (const [navigator] of navigators) {
	items.push({
		name: `${navigator} [NAVIGATOR ACCESS]`,
		progression: true,
		category: ["Navigator Keys", navigatorKeyCategoryFor(navigator)],
	})
	categories[navigatorKeyCategoryFor(navigator)] = { hidden: true }
}

for (const [songNumber, song] of songs.entries()) {
	categories[song.identifier] = { hidden: true }
	categories[songNumberCategoryFor(songNumber)] = { hidden: true }

	const songNavigators = navigators
		.entries()
		.filter(([, songs]) => songs.has(song.title))
		.map(([navigator]) => navigator)
		.toArray()

	const goals = ["Pass", "AA Rank", "AAA Rank", "S Rank"]
	const isBoss = Object.values(song.charts).some((level) => level >= 20)

	if (isBoss) {
		items.push({
			name: `${song.identifier}`,
			progression: true,
			category: [
				"Goals",
				song.identifier,
				songNumberCategoryFor(songNumber),
				"Boss Access",
			],
		})
		locations.push({
			name: `${song.identifier}`,
			requires: `{ItemValue(chain:300)} and |@${songNumberCategoryFor(
				songNumber,
			)}|`,
			category: ["Goals", song.identifier, `(Boss) ${song.identifier}`],
			place_item: [`${song.identifier} (Completion)`],
		})
		items.push({
			name: `${song.identifier} (Completion)`,
			progression: true,
			category: ["Goals", song.identifier, "Boss Clear"],
		})
	} else if (songNavigators.length > 0) {
		for (const goal of goals) {
			locations.push({
				name: `${song.identifier} (${goal})`,
				requires: songNavigators
					.map((navigator) => `|@${navigatorKeyCategoryFor(navigator)}|`)
					.join(" or "),
				category: [
					"Goals",
					song.identifier,
					`(Song) ${song.identifier}`,
					`(Goal) ${goal}`,
					...songNavigators.map((navigator) => `(Navigator) ${navigator}`),
				],
			})
		}
	} else {
		items.push({
			name: `${song.identifier}`,
			progression: true,
			category: ["Songs", song.identifier, songNumberCategoryFor(songNumber)],
		})
		for (const goal of goals) {
			locations.push({
				name: `${song.identifier} (${goal})`,
				requires: `|@${songNumberCategoryFor(songNumber)}|`,
				category: [
					"Goals",
					song.identifier,
					`(Song) ${song.identifier}`,
					`(Goal) ${goal}`,
				],
			})
		}
	}
}

const genericItems = [
	{ name: "Swap Lazer Colors", count: 5, type: "trap" },
	{ name: "Hard Timing Window", count: 5, type: "trap" },
	// { name: "Hidden", count: 3, type: "trap" },
	// { name: "Sudden", count: 3, type: "trap" },
	// { name: "Score -10.0000", count: 3, type: "trap" },
	{ name: "Rate +1.1", count: 5, type: "trap" },
	{ name: "Random", count: 5, type: "trap" },
	{ name: "Excessive Rate", count: 5, type: "trap" },
	{ name: "Play Latest Nautica Chart", count: 5, type: "trap" },
	{ name: "Pass a 20", count: 5, type: "trap" },
	{ name: "Slowjam (Speed 3.0)", count: 5, type: "trap" },
	{ name: "Speedjam (Speed 9.0)", count: 5, type: "trap" },

	{ name: "Score +5.0000", count: 20, type: "helper" },
	{ name: "Score +10.0000", count: 10, type: "helper" },
	{ name: "Score +20.0000", count: 5, type: "helper" },
	{ name: "Score +50.0000", count: 3, type: "helper" },
	{ name: "Score +100.0000", count: 1, type: "helper" },
	{ name: "Cancel Trap", count: 10, type: "helper" },
] as const

for (const { name, count, type } of genericItems) {
	items.push({
		name,
		count,
		trap: type === "trap" ? true : undefined,
		useful: type === "helper" ? true : undefined,
		category: [type === "trap" ? "Traps" : "Helpers"],
	})

	const usageItem = {
		name: `${name} (Used)`,
		count,
		category: ["Consumables"],
	} satisfies Item
	items.push(usageItem)

	for (let i = 0; i < count; i++) {
		locations.push({
			name: `${name} ${i + 1}`,
			category: [`${type === "trap" ? "((Traps))" : "((Helpers))"} ${name}`],
			place_item: [usageItem.name],
		})
	}
}

{
	const gaugeLevels = [
		"Blastive 2.5",
		"Blastive 2.0",
		"Blastive 1.5",
		"Blastive 1.0",
		"Blastive 0.5",
		"Effective",
	]
	items.push({
		name: "Progressive Gauge",
		count: gaugeLevels.length + 3,
		progression: true,
		category: ["Progressive Guage"],
	})
	for (const [index, rate] of gaugeLevels.entries()) {
		locations.push({
			name: `Progressive Gauge (${rate})`,
			requires: `|Progressive Gauge:${index + 1}|`,
			category: ["((Helpers)) Progressive Gauge"],
		})
	}
}

{
	const totalCount = items.reduce((total, item) => total + (item.count ?? 1), 0)
	console.info(`Generated ${totalCount} items`)
}

console.info(`Generated ${locations.length} locations`)
console.info(`Configured ${Object.keys(categories).length} categories`)

await writeFile(manualDataPath("items.json"), JSON.stringify(items, null, "\t"))

await writeFile(
	manualDataPath("locations.json"),
	JSON.stringify(locations, null, "\t"),
)

await writeFile(
	manualDataPath("categories.json"),
	JSON.stringify(categories, null, "\t"),
)

console.info("Generated")

const worldFileName = "manual_SDVX_MapleLeaf"

const apworldFolder =
	Bun.env.APWORLD_OUTPUT_FOLDER || join(import.meta.dirname, `../dist`)

const zip = new AdmZip()
await zip.addLocalFolderPromise("Manual/src", {
	zipPath: worldFileName,
})
await zip.writeZipPromise(join(apworldFolder, `${worldFileName}.apworld`))

console.info("World built")
