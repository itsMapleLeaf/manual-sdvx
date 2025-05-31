import AdmZip from "adm-zip"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import songs from "../Manual/src/data/songs.json"
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
		count: 20,
	},
]

const categories: Record<string, Category> = {
	// Goals: { hidden: true },
}

const navigators = new Map(
	Object.entries({
		"RASIS": new Set([
			"Everlasting Message",
			"Find the Answer",
			"FLügeL《Λrp:ΣggyØ》",
			"INDEPENDENT SKY",
			"Lord=Crossight",
			"Ops:Code-Rapture-",
			"Prayer",
			"Sounds Of Summer",
			"#Endroll",
			"VOLTEXES III",
			"XROSS THE XOUL",
			"Destiny",
			"Fly Like You",
			"Goddess Bless you",
			"HEAVENLY SMILE",
			"I",
			"iLLness LiLin",
			"VOLTEXES IV",
			"Innocent",
			"LECTORIA",
			"Teufel",
			"VIVIDWAVERS",
			"月光乱舞",
			"いつかの夢、またねの約束。",
			"君がいる場所へ",
			"セイレーン ～悲壮の竪琴～",
			"Aurolla",
			"Believe (y)our Wings {V:IVID RAYS}",
		]),
		"GRACE": new Set([
			"DIABLOSIS::Nāga",
			"#Endroll",
			"FLügeL《Λrp:ΣggyØ》",
			"INDEPENDENT SKY",
			"Lachryma《Re:Queen’M》",
			"NEO TREASON",
			"Ops:Code-Rapture-",
			"REGALIA",
			"relegation grimoire",
			"veRtrageS",
			"グレイスちゃんの超～絶!!グラビティ講座w",
			"いつかの夢、またねの約束。",
			"君がいる場所へ",
			"Nexta",
			"Reb∞t",
			"《Re:miniscence》",
			"Cross Fire",
			"crossing blue",
			"Divine's:Bugscript",
			"Goddess Bless you",
			"HEAVENLY SMILE",
			"iLLness LiLin",
			"ULTiMATE INFLATiON",
			"朧 (kamome sano remix)",
			"Aurolla",
			"Believe (y)our Wings {GRA5P WAVES}",
			"BLIZZARD BEAT",
			"D1g1t1ze b0dy",
			"Innocent",
			"scary night",
			"Teufel",
			"VIVIDWAVERS",
			"ミュージックプレイヤー",
			"MixxioN",
			"Resonant Gear",
			"SuddeИDeath",
			"VALKYRIE ASSAULT",
			"夢の終わり、世界のはじまり。",
		]),
		// "TSUMABUKI": new Set([
		// 	"F.K.S.",
		// 	"My name is TSUMABUKI",
		// 	"twilight signal",
		// 	"#Namescapes",
		// 	"Perfect Ultimate Celebration!!",
		// 	"ゔぉるみっくす!!!!",
		// 	"夢の終わり、世界のはじまり。",
		// ]),
		"Tsumabuki Left": new Set([
			"croiX",
			"Gott",
			"Fiat Lux",
			"Last Battalion",
			"Princessどうかお願い!!",
			"Survival Games (Hommarju Remix)",
			"TrailBlazer",
			"超越してしまった彼女と其を生み落した理由",
			'コンベア速度Max!? しゃいにん☆廻転ズシ"Sushi&Peace"',
			"隅田川夏恋歌 (I/O Angel mix)",
			"ボルテ体操第一",
			"Destroy",
			"Get back here",
			"INF-B《L-aste-R》",
			"LegenD.",
			"NEO TREASON",
			"Twin Blaster",
			"Violet Soul",
			"君がいる場所へ",
			"↓↓↓",
			"ΣmbryØ",
			"Fin.ArcDeaR",
			"Last Resort",
			"Mirrorwall",
			"Rebuilding of Paradise Lost",
			"Aurolla",
			"GEMINI LA2ER",
			"SociuS",
			"V Sen5eS",
			"I Left for my Right",
			"PLANISPHERE",
			"refluxio",
		]),
		"Tsumabuki Right": new Set([
			"croiX",
			"Gott",
			"TYCOON",
			"Fiat Lux",
			"Hellfire",
			"Last Battalion",
			"Last Concerto",
			"Survival Games (Hommarju Remix)",
			"TrailBlazer",
			"隅田川夏恋歌 (I/O Angel mix)",
			"ボルテ体操第一",
			"2 MINUTES FIGHTERS",
			"Discloze",
			"Get back here",
			"IKAROS DYNAMITE!!!!",
			"Liming Light",
			"Twin Blaster",
			"Violet Soul",
			"君がいる場所へ",
			"Over The Top",
			"A Lasting Promise",
			"Absolute Domination",
			"ΣmbryØ",
			"Fin.ArcDeaR",
			"Juggler's Maddness",
			"Rebuilding of Paradise Lost",
			"準備運動",
			"Aurolla",
			"GEMINI LA2ER",
			"SociuS",
			"V Sen5eS",
			"Wings to fly high",
		]),
		"NEAR & NOAH": new Set([
			"freaky freak",
			"choux à la crème",
			"concon (picom'n'bass rmx)",
			"Dawn of Asia",
			"Wish upon Twin Stars",
			"archive::zip",
			"Follow Up",
			"Happy Sensation",
			"Milkyway - memorable -",
			"tricky trick",
			"Twin Rocket",
			"Aurolla",
			"FIN4LE ～終止線の彼方へ～",
			"HE4VEN ～天国へようこそ～",
			"光射す澪のユズリハ",
			"Яe:son D'être",
			"ultra turbo",
			"星の透る夏空に願う",
			"君は Fantasista",
			"Fun walk!!",
			"sparky spark",
		]),
		"Kureha": new Set([
			"Absurd Gaff",
			"good high school",
			"CODE -CRiMSON-",
			"Smile",
			"AYAKASHI",
			"Celestial stinger",
			"EMPIRE OF FLAME",
			"Nofram",
			"Poison Blood",
			"Warriors Aboot",
			"感情Xerography",
			"紅の剣舞",
			"Nexta",
			"Arcade Prison",
			"Cy-Bird",
			"逆月",
			"666",
			"伊邪那美白山姫大神",
			"Enter The Rave",
			"Little Red Riding Hood",
			"灼ナル刃、破カヰ譜",
			"運命超過乃巡合",
		]),
		"Hina, Ao, Momo": new Set([
			"TYCOON",
			"バタフライキャット",
			"concon (picom'n'bass rmx)",
			"Wuv U -More2 HAPPY Re-Mix Special-",
			"crêpe suzette",
			"CUTIE☆EX-DREAM",
			"eternita",
			"Ok!! Hug Me",
			"Wuv U (Colorful QT3 nekomix)",
			"Wuv U(pico/ustic rmx)",
			"ちぇいす いん ざ さんしゃいん！！！",
			"きらきらタイム☆",
			"トリコロール・ダイアリー",
			"Ring！Run！Nyan!!",
			"Poppin’Cats!!",
			"Staring at star",
			"ULTRAVELOCITY",
			"Aurolla",
			"プラネタジャーニー",
			"ホワイトパレード",
			"SuperMiracleEnsemble",
			"Grandeur",
			"party:stage",
			"Puni Puni Parade",
		]),
		"Voltenizer Maxima": new Set([
			"FLOWER REDALiCE Remix",
			"Max Burning!!",
			"Bangin' Burst",
			"Growth Memories",
			"XROSS INFECTION",
			"ボルテ体操第一",
			"REVOLVER",
			"UnivEarth",
			"World's end",
			"極圏",
			"マサカリブレイド",
			"GODHEART",
			"Immortal saga",
			"TWO-TORIAL",
			"Xéroa",
			"Xronièr",
			"Aurolla",
			"マキシマ先生の満開!!ヘヴンリー講座♥",
			"All for One",
			"FEEL THE FORCE",
			"Perfect Ultimate Celebration!!",
			"X1GNUS",
		]),
		"Kougei Ciel Nana": new Set([
			"ナナイロ",
			"Appliqué",
			"Demise Quartet",
			"Le Fruit Défendu",
			"Le ××××",
			"Sourire",
			"The star in eclipse",
			"Liar rain",
			"Grand-Guignol",
			"神話に芽吹く",
			"祝福の色彩は想い結ぶ君たち迄",
			"真夏の海の修道女",
			"雲海",
			"HeaveИ's Rain",
			"Souhait bleu",
			"極夜、暁を望んで",
		]),
		"Kanade Yamashina": new Set([
			"じゅーじゅー♥焼肉の火からフェニックス！？～再誕の†炭火焼き～",
			"ヤサイマシ☆ニンニクアブラオオメ",
			'コンベア速度Max!? しゃいにん☆廻転ズシ"Sushi&Peace"',
			"ませまてぃっく♡ま＋ま＝まじっく！　～徹夜の追込みエナジーまっくす！～",
			"混乱少女♥そふらんちゃん!!",
			"*Feels Seasickness...*",
			"JUNKIE FLAVOR",
			"超☆超☆光☆速☆出☆前☆最☆速!!! スピード★スター★かなで",
			"Voice 7 Voice!!!!!!!",
			"まみむめ🍄まるっと🍄まっしゅるーむ🍄🍄",
			"ばらんが!!!!",
			"ゔぉるみっくす!!!!",
		]),
		"Lyric Rishuna": new Set([
			"Gorgetech",
			"VVelcome!!",
			"Chakra",
			"いでぃおで結構！",
		]),
		"TAMA-chan & TAMANEKO": new Set([
			"Space Diver Tama",
			"大宇宙ステージ",
			"Goodbye-bye Planet",
			"Hyper☆Chipspace",
			"Pon-Pon-Pompoko Dai-Sen-Saw!",
			"Sayonara Planet Wars",
			"I",
			"Made In Love",
			"#SpeedyCats",
			"Poppin’Cats!!",
			"Aurolla",
			"GaLaXyEggPlanT",
			"Sudden Visitor",
			"Initiating League",
			"Never Forget Evergreen",
			"Test Flight",
		]),
	}),
)
console.info(`Configured ${navigators.size} navigators`)

{
	const allSongTitles = new Set(songs.map((it) => it.title))
	const notFound = []

	for (const [navigator, navigatorSongNames] of navigators) {
		for (const navigatorSong of [
			...navigatorSongNames,
			// ...(navigatorBossSongs.get(navigator) ?? []),
		]) {
			if (!allSongTitles.has(navigatorSong)) {
				notFound.push({ title: navigatorSong, navigator })
			}
		}
	}

	if (notFound.length > 0) {
		console.warn(`Failed to find songs:`)
		console.table(notFound)
	} else {
		console.info("All navigator songs valid ✅")
	}
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
			requires: `|CHAIN:80%| and |@${songNumberCategoryFor(songNumber)}|`,
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
	{ name: "Swap Lazer Colors", count: 3, type: "trap" },
	{ name: "Hard Timing Window", count: 3, type: "trap" },
	{ name: "Hidden", count: 3, type: "trap" },
	{ name: "Sudden", count: 3, type: "trap" },
	{ name: "-100,000 score", count: 3, type: "trap" },

	{ name: "+50,000 score", count: 16, type: "helper" },
	{ name: "+100,000 score", count: 8, type: "helper" },
	{ name: "+200,000 score", count: 4, type: "helper" },
	{ name: "+500,000 score", count: 2, type: "helper" },
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
