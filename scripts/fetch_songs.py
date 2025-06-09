import json
import os
from pathlib import Path
from urllib import request
from bs4 import BeautifulSoup, Tag

from .songs import Song

if __name__ == "__main__":
    PAGE_COUNT = 53

    songs: list[Song] = []

    for page_number in range(1, PAGE_COUNT + 1):
        url = f"https://www.myshkin.io/sdvx/songlist?page={page_number}"
        print(f"fetching {url}")

        req = request.urlopen(url)
        html_content = req.read().decode("utf-8")
        soup = BeautifulSoup(html_content, "html5lib")

        for row in soup.select("#song-table-body > tr"):
            title_element = row.select_one(".song-title")
            title = (
                title_element.get_text(strip=True) if title_element else "Unknown Title"
            )

            artist_element = row.select_one(".song-artist")
            artist = (
                artist_element.get_text(strip=True)
                if artist_element
                else "Unknown Artist"
            )

            groups = ["Unknown Group"]
            genre_header = None
            for header in row.select(".metadata-header"):
                if "Genre" in header.get_text():
                    genre_header = header
                    break

            if genre_header:
                next_sibling = genre_header.find_next_sibling()
                if next_sibling:
                    groups = [
                        part.strip() for part in next_sibling.get_text().split(",")
                    ]

            charts: dict[str, int] = {}
            for cell in row.select(".chart-difficulty"):
                cell_text = cell.get_text(strip=True)
                parts = cell_text.split(" ")
                if len(parts) >= 2:
                    key = parts[0]
                    level = parts[1]
                    try:
                        charts[key] = int(level)
                    except ValueError:
                        print(f"failed to parse difficulty cell: {cell_text}")
                        continue
                else:
                    print(f"failed to parse difficulty cell: {cell_text}")
                    continue

            songs += [
                Song(
                    identifier=f"{title} by {artist}",
                    title=title,
                    artist=artist,
                    groups=groups,
                    charts=charts,
                )
            ]

        print(f"found {len(songs)} songs...")

    print(f"saving {len(songs)} songs...")

    data_dir = Path(__file__).parent.parent / "src/data"
    songs_file_path = data_dir / "songs.json"

    os.makedirs(data_dir, exist_ok=True)
    with open(songs_file_path, "w", encoding="utf-8") as file:
        json.dump(
            [song.to_dict() for song in songs],
            file,
            indent=4,
            ensure_ascii=False,
        )

    print("done")
