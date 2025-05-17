import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import songs from "../manual_Sound Voltex_MapleLeaf/data/songs.json"

type Item = {
	name: string
	category?: string[]
	count?: number
	value?: Record<string, string | number>
	progression?: boolean
	trap?: boolean
}

type Location = {
	name: string
	category?: string[]
	requires?: string
	progression?: boolean
	place_item?: string[]
	place_item_category?: string[]
	victory?: boolean
}

const items: Item[] = [
	// ...helpers.map((helper) => ({
	// 	name: `EFFECT: ${helper.name}`,
	// 	category: ["EFFECT (Helper)"],
	// 	count: helper.count,
	// })),
	// ...traps.map((trap) => ({
	// 	name: `ERROR: ${trap.name}`,
	// 	category: ["EFFECT (Helper)"],
	// 	count: trap.count,
	// })),
]

const locations: Location[] = []

const categories: Record<
	string,
	{
		hidden?: boolean
		yaml_option?: string[]
	}
> = {}

function addItem(item: Item) {
	items.push(item)
	return item
}

function addLocation(location: Location) {
	locations.push(location)
	return location
}

const goals = ["Pass", "AA Rank", "AAA Rank", "S Rank"]

const navigators = new Map(
	Object.entries({
		"RASIS": {
			ability: "passive: +100,000 to all scores",
			songs: [
				{ title: "Everlasting Message" },
				{ title: "Find the Answer" },
				{ title: "FLügeL《Λrp:ΣggyØ》" },
				{ title: "INDEPENDENT SKY" },
				{ title: "Lord=Crossight" },
				{ title: "Ops:Code-Rapture-" },
				{ title: "Prayer" },
				{ title: "Sounds Of Summer" },
				{ title: "VOLTEXES III" },
				{ title: "XROSS THE XOUL" },
				{ title: "Destiny" },
				{ title: "Fly Like You" },
				{ title: "Goddess Bless you" },
				{ title: "HEAVENLY SMILE" },
				{ title: "I" },
				{ title: "iLLness LiLin" },
				{ title: "VOLTEXES IV" },
				{ title: "Innocent" },
				{ title: "LECTORIA" },
				{ title: "Teufel" },
				{ title: "VIVIDWAVERS" },
				{ title: "月光乱舞", roman: "Gekkou ranbu" },
				{
					title: "いつかの夢、またねの約束。",
					roman: "Itsuka no yume, matane no yakusoku.",
				},
				{ title: "君がいる場所へ", roman: "Kimi ga iru basho e" },
				{
					title: "セイレーン 〜悲壮の竪琴〜",
					roman: "Siren ~hisou no tategoto~",
				},
				{
					title: "Believe (y)our Wings {V:IVID RAYS}",
					roman: "Siren ~hisou no tategoto~",
				},
			],
		},
		"TSUMABUKI": {
			ability: "cancel an active trap",
			songs: [
				{ title: "F.K.S." },
				{ title: "My name is TSUMABUKI" },
				{ title: "twilight signal" },
				{ title: "#Namescapes" },
				{ title: "Perfect Ultimate Celebration!!" },
				{ title: "ゔぉるみっくす!!!!", roman: "Volmix!!!!" },
				{
					title: "夢の終わり、世界のはじまり。",
					roman: "Yume no owari, sekai no hajimari.",
				},
			],
		},
		"Tsumabuki Left": {
			ability: "4 energy: autoplay left lazer until clear",
			songs: [],
		},
		"Tsumabuki Right": {
			ability: "4 energy: autoplay right lazer until clear",
			songs: [],
		},
		"NEAR & NOAH": {
			ability: "turn up to 50 NEAR to CRITICAL",
			songs: [],
		},
		"Kureha": {
			ability: "3 energy: clear any goal",
			songs: [],
		},
		"Hina, Ao, Momo": {
			ability: "turn up to 50 ERROR to NEAR",
			songs: [],
		},
		"Voltenizer Maxima": {
			ability: "2 energy: clear highest uncleared goal",
			songs: [],
		},
		"Kougei Ciel Nana": {
			ability: "use CMod",
			songs: [],
		},
		"Kanade Yamashina": {
			ability: "rescue: +5 energy",
			songs: [
				{
					title: "じゅーじゅー♥焼肉の火からフェニックス！？～再誕の†炭火焼き～",
					roman: "Juju yakiniku no hi kara phoenix!?~saitan no sumibiyaki~",
				},
			],
		},
		"Lyric Rishuna": {
			ability: "+500,000 score",
			songs: [],
		},
	}),
)

const graceSongs = [
	{ title: "Ops:Code-Rapture-" },
	{ title: "iLLness LiLin" },
	{ title: "VALKYRIE ASSAULT" },
	{ title: "You Are My Best RivaL!!" },
]

for (const [songNumber, song] of songs.entries()) {
	const songText = `${song.title} by ${song.artist}`
	const itemName = `${songText} [ACCESS]`
	const songNumberCategory = `(Song Number ${songNumber})`
	categories[songNumberCategory] = { hidden: true }

	addItem({
		name: itemName,
		category: ["(Songs)", songText, songNumberCategory],
		progression: true,
	})

	for (const goal of goals) {
		addLocation({
			name: `${songText} [CLEAR] (${goal})`,
			category: ["(Goals)", songText, goal],
			// some songs have weird names in them which break the requires syntax,
			// so we tie them via an internal song number category instead
			requires: `|@${songNumberCategory}|`,
		})
	}
}

await writeFile(
	join(import.meta.dirname, "../manual_Sound Voltex_MapleLeaf/data/items.json"),
	JSON.stringify(items, null, "\t"),
)

await writeFile(
	join(
		import.meta.dirname,
		"../manual_Sound Voltex_MapleLeaf/data/locations.json",
	),
	JSON.stringify(locations, null, "\t"),
)

await writeFile(
	join(
		import.meta.dirname,
		"../manual_Sound Voltex_MapleLeaf/data/categories.json",
	),
	JSON.stringify(categories, null, "\t"),
)
