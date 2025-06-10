import json
from logging import warning
import os
import zipfile
from pathlib import Path
from typing import Dict, List, Literal, NotRequired, Union, TypedDict

from .lib.songs import ALL_SONGS
from .lib.navigators import navigators
from .lib.paths import manual_data_path


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


class StartingItemInfo(TypedDict):
    items: NotRequired[list[str]]
    item_categories: NotRequired[list[str]]
    random: NotRequired[int]


class GameInfo(TypedDict):
    game: str
    creator: str
    filler_item_name: str
    death_link: bool
    starting_items: list[StartingItemInfo]


def song_number_category_for(song_number: int) -> str:
    return f"Song Number {song_number}"


def navigator_key_category_for(navigator: str) -> str:
    return f"Navigator Access for {navigator}"


class SoundVoltexWorld:
    locations: list[Location]
    items: list[Item]
    categories: dict[str, Category]

    def __init__(self) -> None:
        self.locations = [
            {
                "name": "PERFECT ULTIMATE CHAIN",
                "requires": "|@Boss Clear|",
                "victory": True,
                "category": ["((Victory))"],
            }
        ]

        self.items = [
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

        self.categories = {
            "Goals": Category(hidden=True),
            "Consumables": Category(hidden=True),
        }

        for navigator in navigators:
            self.categories[navigator_key_category_for(navigator)] = Category(
                hidden=True
            )
            self.items += [
                Item(
                    name=f"{navigator} [ACCESS]",
                    progression=True,
                    category=["Navigator Keys", navigator_key_category_for(navigator)],
                )
            ]
            self.locations += [
                Location(
                    name=f"{navigator} [RESCUE]",
                    category=[f"((Navigator Rescue))"],
                    requires=f"|@{navigator_key_category_for(navigator)}|",
                )
            ]

        for song_number, song in enumerate(ALL_SONGS):
            self.categories[song.identifier] = Category(hidden=True)
            self.categories[song_number_category_for(song_number)] = Category(
                hidden=True
            )

            song_navigators = [
                navigator
                for navigator, navigator_songs in navigators.items()
                if song.title in navigator_songs
            ]

            goals = ["Pass", "AA Rank", "AAA Rank", "S Rank"]
            is_boss = any(level >= 20 for level in song.charts.values())

            if is_boss:
                self.items.append(
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
                self.locations.append(
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
                self.items.append(
                    Item(
                        name=f"{song.identifier} (Completion)",
                        progression=True,
                        category=["Goals", song.identifier, "Boss Clear"],
                    )
                )
            elif song_navigators:
                for goal in goals:
                    self.locations.append(
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
                self.items.append(
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
                    self.locations.append(
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

        self.items += [
            Item(name="Swap Lazer Colors", count=3, trap=True, category=["Traps"]),
            Item(name="Hard Timing Window", count=3, trap=True, category=["Traps"]),
            Item(name="Rate +1.1", count=3, trap=True, category=["Traps"]),
            Item(name="Random", count=3, trap=True, category=["Traps"]),
            Item(name="Pass a 20", count=3, trap=True, category=["Traps"]),
            Item(name="Slowjam (Speed 3.0)", count=3, trap=True, category=["Traps"]),
            Item(name="Speedjam (Speed 9.0)", count=3, trap=True, category=["Traps"]),
            Item(name="Score +5.0000", count=20, useful=True, category=["Helpers"]),
            Item(name="Score +10.0000", count=10, useful=True, category=["Helpers"]),
            Item(name="Score +20.0000", count=5, useful=True, category=["Helpers"]),
            Item(name="Score +50.0000", count=3, useful=True, category=["Helpers"]),
            Item(name="Score +100.0000", count=1, useful=True, category=["Helpers"]),
            Item(name="Cancel Trap", count=12, useful=True, category=["Helpers"]),
            Item(name="Downlevel", count=12, useful=True, category=["Helpers"]),
        ]

        gauge_levels = [
            # start at Blastive 2.5,
            "Blastive 2.0",
            "Blastive 1.5",
            "Blastive 1.0",
            "Blastive 0.5",
            "Effective",
        ]

        self.items += [
            Item(
                name="Progressive Gauge",
                count=len(gauge_levels) + 3,
                progression=True,
                category=["Progressive Gauge"],
            )
        ]

        for index, rate in enumerate(gauge_levels):
            self.locations.append(
                Location(
                    name=f"Progressive Gauge ({rate})",
                    requires=f"|Progressive Gauge:{index + 1}|",
                    category=["((Helpers)) Progressive Gauge"],
                )
            )

    @property
    def item_count(self):
        return sum(item.get("count") or 1 for item in world.items)


if __name__ == "__main__":
    is_dev = True
    if os.getenv("DEV") == False:
        is_dev = False

    if is_dev:
        warning("Building a development world suffixed with '_dev'")
        warning("Set the envionment variable DEV=false to generate without _dev suffix")

    game_info = GameInfo(
        game="SDVX" + ("_dev" if is_dev else ""),
        creator="MapleLeaf",
        filler_item_name="you tried (Score +0.1000)",
        death_link=False,
        starting_items=[{"item_categories": ["Songs"], "random": 5}],
    )

    world = SoundVoltexWorld()

    world_file_name = f"manual_{game_info['game']}_{game_info['creator']}"
    script_dir = Path(__file__).parent

    apworld_folder = Path(
        os.environ.get("APWORLD_OUTPUT_FOLDER") or script_dir.parent.parent / "dist"
    )
    apworld_folder.mkdir(exist_ok=True)

    zip_path = apworld_folder / f"{world_file_name}.apworld"

    class JsonDumpArgs(TypedDict):
        ensure_ascii: NotRequired[bool]
        indent: NotRequired[str | int]

    json_dump_args = JsonDumpArgs(ensure_ascii=False)
    if is_dev:
        json_dump_args["indent"] = "\t"

    print(f"Game: {game_info['game']}")
    print(f"Creator: {game_info['creator']}")

    print(f"Generated {world.item_count} items")
    print(f"Generated {len(world.locations)} locations")
    print(f"Configured {len(world.categories)} categories")
    print(f"World path: {zip_path}")

    print("Saving game info...")
    with open(manual_data_path("game.json"), "w", encoding="utf-8") as file:
        json.dump(game_info, file, **json_dump_args)

    print("Saving items...")
    with open(manual_data_path("items.json"), "w", encoding="utf-8") as file:
        json.dump(world.items, file, **json_dump_args)

    print("Saving locations...")
    with open(manual_data_path("locations.json"), "w", encoding="utf-8") as file:
        json.dump(world.locations, file, **json_dump_args)

    print("Saving categories...")
    with open(manual_data_path("categories.json"), "w", encoding="utf-8") as file:
        json.dump(world.categories, file, **json_dump_args)

    print("Saving apworld...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
        manual_src = script_dir.parent / "src"
        for root, dirs, files in os.walk(manual_src):
            for file in files:
                file_path = Path(root) / file
                arcname = Path(world_file_name) / file_path.relative_to(manual_src)
                zip_file.write(file_path, arcname)

    print("Done!")
