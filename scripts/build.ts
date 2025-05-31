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
	progression?: boolean
	place_item?: string[]
	place_item_category?: string[]
	victory?: boolean
}

type Category = {
	hidden?: boolean
	yaml_option?: string[]
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

// const navigatorBossSongs = new Map([
// 	["Hina, Ao, Momo", new Set(["Staring at star"])],
// ])

// const navigatorsWithBosses = new Set<string>()

function validateNavigatorSongs() {
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

function navigatorAppealCategoryFor(navigator: string) {
	return `Appeal for ${navigator}`
}

function processSongs() {
	const items: Item[] = []
	const locations: Location[] = []

	for (const [songNumber, song] of songs.entries()) {
		const songNavigators = navigators
			.entries()
			.filter(([, songs]) => songs.has(song.title))
			.map(([navigator]) => navigator)
			.toArray()

		const navigatorAppealCategories = songNavigators.map((navigator) =>
			navigatorAppealCategoryFor(navigator),
		)

		items.push({
			name: song.identifier,
			progression: true,
			category: [
				"Songs",
				song.identifier,
				songNumberCategoryFor(songNumber),
				...navigatorAppealCategories,
			],
		})

		const goals = ["Pass", "AA Rank", "AAA Rank", "S Rank"]
		for (const goal of goals) {
			if (songNavigators.length > 0) {
				const listFormat = new Intl.ListFormat(undefined, {
					type: "conjunction",
				})

				const completionItemName = `Appeal for ${listFormat.format(
					songNavigators,
				)} (${song.identifier}, ${goal})`

				locations.push({
					name: `${song.identifier} [${goal}]`,
					// some songs have weird names in them which break the requires syntax,
					// so we tie them via an internal song number category instead
					requires: `|@${songNumberCategoryFor(songNumber)}|`,
					category: [
						"Goals",
						song.identifier,
						goal,
						...navigatorAppealCategories,
					],
					place_item: [completionItemName],
				})
				items.push({
					name: completionItemName,
					progression: true,
					category: ["Goals", song.identifier, ...navigatorAppealCategories],
				})
			} else {
				locations.push({
					name: `${song.identifier} [${goal}]`,
					// some songs have weird names in them which break the requires syntax,
					// so we tie them via an internal song number category instead
					requires: `|@${songNumberCategoryFor(songNumber)}|`,
					category: [
						"Goals",
						song.identifier,
						goal,
						...navigatorAppealCategories,
					],
				})
			}
		}
	}

	return { items, locations }
}

function processNavigators() {
	return {
		*locations(): Iterable<Location> {
			for (const [navigator] of navigators) {
				yield {
					name: navigator,
					requires: `|@${navigatorAppealCategoryFor(navigator)}:80%|`,
					category: ["Navigators"],
					place_item: [navigator],
				}
			}
		},
		*items(): Iterable<Item> {
			for (const [navigator] of navigators) {
				yield {
					name: `Appeal for ${navigator}`,
					progression: true,
					count: 10,
					category: [navigatorAppealCategoryFor(navigator)],
				}
				yield {
					name: navigator,
					category: ["Navigators"],
					progression: true,
				}
			}
		},
	}
}

function configureSongCategories(): Record<string, Category> {
	return Object.fromEntries(
		songs.flatMap((song, index) => [
			[song.identifier, { hidden: true }],
			[songNumberCategoryFor(index), { hidden: true }],
		]),
	)
}

// Drops: additional items and traps outside the normal gameplay flow
function processDrops() {
	const traps = [
		{ name: "Swap Lazer Colors", count: 5 },
		{ name: "Hard Timing Window", count: 5 },
		{ name: "Hidden", count: 5 },
		{ name: "Sudden", count: 5 },
		{ name: "-100,000 score", count: 5 },
	]

	const helpers = [
		{ name: "+50,000 score", count: 50 },
		{ name: "+100,000 score", count: 25 },
		{ name: "+200,000 score", count: 12 },
		{ name: "+500,000 score", count: 6 },
		{ name: "+1,000,000 score", count: 3 },
		{ name: "Cancel Trap", count: 5 },
	]

	return {
		*items(): Iterable<Item> {
			for (const trap of traps) {
				yield {
					name: trap.name,
					count: trap.count,
					trap: true,
				}
			}

			for (const helper of helpers) {
				yield {
					name: helper.name,
					count: helper.count,
					useful: true,
					category: ["Helpers"],
				}
			}
		},
	}
}

async function main() {
	validateNavigatorSongs()

	const drops = processDrops()
	const processedSongs = processSongs()
	const processedNavigators = processNavigators()

	const items: Item[] = [
		...processedNavigators.items(),
		...drops.items(),
		...processedSongs.items,
	]

	{
		const totalCount = items.reduce(
			(total, item) => total + (item.count ?? 1),
			0,
		)
		console.info(`Generated ${totalCount} items`)
	}

	const locations: Location[] = [
		{
			name: "All Navigators (Victory)",
			requires: `|@Navigators:all|`,
			victory: true,
		},
		...processedNavigators.locations(),
		...processedSongs.locations,
	]
	console.info(`Generated ${locations.length} locations`)

	const categories: Record<string, Category> = {
		...configureSongCategories(),
	}
	console.info(`Configured ${Object.keys(categories).length} categories`)

	// const navigatorsWithoutBosses = new Set(navigators.keys()).difference(
	// 	navigatorsWithBosses,
	// )
	// if (navigatorsWithoutBosses.size > 0) {
	// 	console.warn(
	// 		"Navigators without bosses:",
	// 		[...navigatorsWithoutBosses].map((name) => `"${name}"`).join(", "),
	// 	)
	// }

	await writeFile(
		manualDataPath("items.json"),
		JSON.stringify(items, null, "\t"),
	)

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
}

if (import.meta.main) {
	await main()
}
