import json
import os
import zipfile
from pathlib import Path
from typing import Dict, List, NotRequired, Union, TypedDict

from .songs import ALL_SONGS
from .navigators import navigators
from .paths import manual_data_path


class Item(TypedDict):
    name: str
    category: NotRequired[List[str]]
    count: NotRequired[int]
    value: NotRequired[Dict[str, Union[str, int]]]
    progression: NotRequired[bool]
    progression_skip_balancing: NotRequired[bool]
    useful: NotRequired[bool]
    trap: NotRequired[bool]


class Location(TypedDict):
    name: str
    category: NotRequired[List[str]]
    requires: NotRequired[str]
    place_item: NotRequired[List[str]]
    place_item_category: NotRequired[List[str]]
    victory: NotRequired[bool]


class Category(TypedDict):
    hidden: NotRequired[bool]
    yaml_option: NotRequired[List[str]]


def song_number_category_for(song_number: int) -> str:
    return f"Song Number {song_number}"


def navigator_key_category_for(navigator: str) -> str:
    return f"Navigator Access for {navigator}"


if __name__ == "__main__":
    locations: List[Location] = [
        {
            "name": "PERFECT ULTIMATE CHAIN",
            "requires": "|@Boss Clear|",
            "victory": True,
            "category": ["((Victory))"],
        }
    ]

    items = [
        Item(
            name="CHAIN",
            category=["CHAIN"],
            progression=True,
            count=20,
            value={"chain": 1},
        ),
        Item(
            name="5 CHAIN",
            category=["CHAIN"],
            progression=True,
            count=10,
            value={"chain": 5},
        ),
        Item(
            name="10 CHAIN",
            category=["CHAIN"],
            progression=True,
            count=5,
            value={"chain": 10},
        ),
        Item(
            name="20 CHAIN",
            category=["CHAIN"],
            progression=True,
            count=3,
            value={"chain": 20},
        ),
        Item(
            name="50 CHAIN",
            category=["CHAIN"],
            progression=True,
            count=2,
            value={"chain": 50},
        ),
        Item(
            name="100 CHAIN",
            category=["CHAIN"],
            progression=True,
            count=1,
            value={"chain": 100},
        ),
    ]

    categories = {
        "Goals": Category(hidden=True),
        "Consumables": Category(hidden=True),
    }

    for navigator in navigators:
        items.append(
            Item(
                name=f"{navigator} [NAVIGATOR ACCESS]",
                progression=True,
                category=["Navigator Keys", navigator_key_category_for(navigator)],
            )
        )
        categories[navigator_key_category_for(navigator)] = Category(hidden=True)

    for song_number, song in enumerate(ALL_SONGS):
        categories[song.identifier] = Category(hidden=True)
        categories[song_number_category_for(song_number)] = Category(hidden=True)

        song_navigators = [
            navigator
            for navigator, navigator_songs in navigators.items()
            if song.title in navigator_songs
        ]

        goals = ["Pass", "AA Rank", "AAA Rank", "S Rank"]
        is_boss = any(level >= 20 for level in song.charts.values())

        if is_boss:
            items.append(
                Item(
                    name=song.identifier,
                    progression=True,
                    category=[
                        "Goals",
                        song.identifier,
                        song_number_category_for(song_number),
                        "Boss Access",
                    ],
                )
            )
            locations.append(
                Location(
                    name=song.identifier,
                    requires=f"{{ItemValue(chain:300)}} and |@{song_number_category_for(song_number)}|",
                    category=[
                        "Goals",
                        song.identifier,
                        f"(Boss) {song.identifier}",
                    ],
                    place_item=[f"{song.identifier} (Completion)"],
                )
            )
            items.append(
                Item(
                    name=f"{song.identifier} (Completion)",
                    progression=True,
                    category=["Goals", song.identifier, "Boss Clear"],
                )
            )
        elif song_navigators:
            for goal in goals:
                locations.append(
                    Location(
                        name=f"{song.identifier} ({goal})",
                        requires=" or ".join(
                            f"|@{navigator_key_category_for(navigator)}|"
                            for navigator in song_navigators
                        ),
                        category=[
                            "Goals",
                            song.identifier,
                            f"(Song) {song.identifier}",
                            f"(Goal) {goal}",
                            *[
                                f"(Navigator) {navigator}"
                                for navigator in song_navigators
                            ],
                        ],
                    )
                )
        else:
            items.append(
                Item(
                    name=song.identifier,
                    progression=True,
                    category=[
                        "Songs",
                        song.identifier,
                        song_number_category_for(song_number),
                    ],
                )
            )
            for goal in goals:
                locations.append(
                    Location(
                        name=f"{song.identifier} ({goal})",
                        requires=f"|@{song_number_category_for(song_number)}|",
                        category=[
                            "Goals",
                            song.identifier,
                            f"(Song) {song.identifier}",
                            f"(Goal) {goal}",
                        ],
                    )
                )

    items += [
        Item(name="Swap Lazer Colors", count=5, trap=True, category=["Traps"]),
        Item(name="Hard Timing Window", count=5, trap=True, category=["Traps"]),
        Item(name="Rate +1.1", count=5, trap=True, category=["Traps"]),
        Item(name="Random", count=5, trap=True, category=["Traps"]),
        Item(name="Excessive Rate", count=5, trap=True, category=["Traps"]),
        Item(name="Pass Latest Nautica Chart", count=5, trap=True, category=["Traps"]),
        Item(name="Pass a 20", count=5, trap=True, category=["Traps"]),
        Item(name="Slowjam (Speed 3.0)", count=5, trap=True, category=["Traps"]),
        Item(name="Speedjam (Speed 9.0)", count=5, trap=True, category=["Traps"]),
        Item(name="Score +5.0000", count=20, useful=True, category=["Helpers"]),
        Item(name="Score +10.0000", count=10, useful=True, category=["Helpers"]),
        Item(name="Score +20.0000", count=5, useful=True, category=["Helpers"]),
        Item(name="Score +50.0000", count=3, useful=True, category=["Helpers"]),
        Item(name="Score +100.0000", count=1, useful=True, category=["Helpers"]),
        Item(name="Cancel Trap", count=10, useful=True, category=["Helpers"]),
        Item(name="Downlevel", count=10, useful=True, category=["Helpers"]),
    ]

    gauge_levels = [
        # start at Blastive 2.5,
        "Blastive 2.0",
        "Blastive 1.5",
        "Blastive 1.0",
        "Blastive 0.5",
        "Effective",
    ]

    items += [
        Item(
            name="Progressive Gauge",
            count=len(gauge_levels) + 3,
            progression=True,
            category=["Progressive Gauge"],
        )
    ]

    for index, rate in enumerate(gauge_levels):
        locations.append(
            Location(
                name=f"Progressive Gauge ({rate})",
                requires=f"|Progressive Gauge:{index + 1}|",
                category=["((Helpers)) Progressive Gauge"],
            )
        )

    total_count = sum(item.get("count") or 1 for item in items)
    print(f"Generated {total_count} items")
    print(f"Generated {len(locations)} locations")
    print(f"Configured {len(categories)} categories")

    with open(manual_data_path("items.json"), "w", encoding="utf-8") as file:
        json.dump(items, file, indent=4, ensure_ascii=False)

    with open(manual_data_path("locations.json"), "w", encoding="utf-8") as file:
        json.dump(locations, file, indent=4, ensure_ascii=False)

    with open(manual_data_path("categories.json"), "w", encoding="utf-8") as file:
        json.dump(categories, file, indent=4, ensure_ascii=False)

    print("Generated")

    world_file_name = "manual_SDVX_MapleLeaf"
    script_dir = Path(__file__).parent

    apworld_folder = Path(
        os.environ.get("APWORLD_OUTPUT_FOLDER") or script_dir.parent.parent / "dist"
    )
    apworld_folder.mkdir(exist_ok=True)

    zip_path = apworld_folder / f"{world_file_name}.apworld"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
        manual_src = script_dir.parent / "src"
        for root, dirs, files in os.walk(manual_src):
            for file in files:
                file_path = Path(root) / file
                arcname = Path(world_file_name) / file_path.relative_to(manual_src)
                zip_file.write(file_path, arcname)

    print("World built")
