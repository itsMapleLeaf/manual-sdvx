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
		progression: true,
		count: 50,
	},
]

const categories: Record<string, Category> = {
	Goals: { hidden: true },
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
			requires: `|@CHAIN:80%| and |@${songNumberCategoryFor(songNumber)}|`,
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
			const completionItem = {
				name: `CHAIN (${song.identifier}) (${goal})`,
				category: ["Goals", song.identifier, "CHAIN"],
				progression: true,
			} satisfies Item
			items.push(completionItem)

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
				place_item: [completionItem.name],
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
	{ name: "Swap Lazer Colors", count: 3, type: "trap" },
	{ name: "Hard Timing Window", count: 3, type: "trap" },
	{ name: "Hidden", count: 3, type: "trap" },
	{ name: "Sudden", count: 3, type: "trap" },
	{ name: "-100,000 score", count: 3, type: "trap" },

	{ name: "+50,000 score", count: 20, type: "helper" },
	{ name: "+100,000 score", count: 10, type: "helper" },
	{ name: "+200,000 score", count: 5, type: "helper" },
	{ name: "+500,000 score", count: 3, type: "helper" },
	{ name: "+1,000,000 score", count: 1, type: "helper" },
	{ name: "Cancel Trap", count: 5, type: "helper" },
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
	} satisfies Item
	items.push(usageItem)

	for (let i = 0; i < count; i++) {
		locations.push({
			name: `${name} ${i}`,
			category: [type === "trap" ? "((Traps))" : "((Helpers))"],
			place_item: [usageItem.name],
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
