import { load } from "cheerio"
import { writeFile } from "node:fs/promises"
import { manualDataPath } from "./paths.ts"

const songs = []

for (let page = 1; page <= 53; page++) {
	const url = `https://www.myshkin.io/sdvx/songlist?page=${page}`
	console.debug(`fetching ${url}`)
	const $ = load(await fetch(url).then((res) => res.text()))

	for (const row of $("#song-table-body > tr")) {
		const title = $(row).find(".song-title").text().trim() || "Unknown Title"
		const artist = $(row).find(".song-artist").text().trim() || "Unknown Artist"

		const groups =
			$(row)
				.find(".metadata-header")
				.filter((_i, header) => $(header).text().includes("Genre"))
				.next()
				.text()
				.split(",")
				.map((part) => part.trim()) ?? "Unknown Group"

		const charts: Record<string, number> = {}
		for (const cell of $(row).find(".chart-difficulty")) {
			const [key, level] = $(cell).text().trim().split(" ")
			if (!key || !level) {
				console.warn("failed to parse difficulty cell:", $(cell).text())
				continue
			}
			charts[key] = Number(level)
		}

		songs.push({
			title,
			artist,
			groups,
			charts,
		})
	}

	console.debug(`found ${songs.length} songs...`)
}

console.debug(`saving ${songs.length} songs...`)

await writeFile(manualDataPath("songs.json"), JSON.stringify(songs, null, "\t"))

console.debug("done")
