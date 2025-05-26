# structure

- resource: volforce
- "lobby" region
  - 50 songs, generic unlocks
- navigator regions:
  - up to 8 songs per navigator
  - each song goal = navigator appeal
  - 20 navigator appeal: region completed
  - navigator appeal also spawns outside of world
- boss region:
  - requires unlocking every navigator region
  - complete 3 boss songs to win

# current picture

general flow:

1. collect song keys to unlock songs, including navigator songs
1. play navigator songs to unlock navigators
1. unlock navigators to play boss song

- resource: ACCESS
  - unlocks individual songs
  - player starts with 7
- location: CLEAR (pass, AA rank, ...)
  - completed by achieving the corresponding goal on a song
  - places random item
- resource: ACCESS (navigator)
  - unlocks a navigator song
- location: CLEAR (navigator) (pass, AA rank, ...)
  - completed by achieving the corresponding goal on a song
  - places appeal for specific navigator
- resource: APPEAL (per navigator)
  - unlocks navigators
  - per-navigator required count is random (hehe)
- location: NAVIGATOR
  - named & unique by character
  - unlocks navigator
- resource: NAVIGATOR
  - named & unique by character
  - each has an ability that can be activated for a score by marking ENERGY (any # of times per score)
- resource: ENERGY
  - unlocks energy locations
  - 50 in pool
- location: USE ENERGY (x/20)
  - tracks navigator ability activation
  - drops no items
- location: SAVE GRACE (victory)
  - requires all navigators
  - completion: 10,000,000 score on veRtrageS, Lachryma《Re:Queen'M》, and DIABLOSIS::Nāga
- traps: applies to any played song until a goal is cleared
  - hidden
  - sudden
  - reversed lazers
  - play with some skin???
  - use hard timing window
  - next song must be cleared in another rhythm game x10
    - lol
    - each one must be different!
  - strategy: initially impossible (unless you're like 1 of 3 people on the planet) but becomes easier over time with help from items/navigators
  - clear a GRACE track

# characters

- [RASIS](https://remywiki.com/RASIS) - cool and cute friend
- [TSUMABUKI](https://remywiki.com/TSUMABUKI) - RASIS's companion
- Tsumabuki [LEFT](https://remywiki.com/Tsumabuki_LEFT) & [RIGHT](https://remywiki.com/Tsumabuki_RIGHT) - cute twink twins
- [NEAR & NOAH](https://remywiki.com/NEAR_%26_NOAH) - the most adorable creatures known to mankind
- [Kureha](https://remywiki.com/Kureha) - edgy (hot) samurai girl
- [Hina, Ao, Momo](https://remywiki.com/Hina,_Ao,_and_Momo) - cute and huggable trio
- [Voltenizer Maxima](https://remywiki.com/Voltenizer_Maxima) - daddy? i mean daddy? i mean daddy? i mean daddy? i mean daddy? i me
- [Kougei Ciel Nana](https://remywiki.com/Kougei_Ciel_Nana) - edgy French (derogatory) ojou-sama
- [Kanade Yamashina](https://remywiki.com/Kanade_Yamashina) - I love Camellia (feat. Nanahira)
- [Lyric Rishuna](https://remywiki.com/Lyric_Rishuna) - holy shit put some clothes on
- [GRACE](https://remywiki.com/GRACE) - final boss, RASIS's sister

# issues

- how to decide what songs belong to which navigators?
  - prominent inclusion in jacket art, meaning...
    - if there are multiple navigators who are prominent, the song belongs to those multiple navigators
      - e.g. rasis and grace as well as Tsumabuki R+L appear together in several arts
      - we'll decide later what it means for one song to belong to multiple navigators
    - if they only exist in some tiny part of the image and/or in the background, doesn't count
      - ops:Rapture _has_ rasis in the art, but she's very in the background, and removing her wouldn't significantly change the art, so this is very much a grace song
- issue of metadata differing between generator and .ksh files
  - the issue is multi-fold:
    - titles might not match exactly when the songs are the same, due to white space or other unicode issues
    - might have multiple songs with the same title but different artists - do we need to store song artists as well?
  - option 1: don't care
    - just deal with the misses, since most of them are gonna be with weird characters or something, probably
  - option 2: some sort of distance match formula?
    - the most i feel comfortable doing with this is just logging when we couldn't find a song
  - option 3: treat the song DB as the source of truth
    - basically...
      1. we get the song db data
      2. we generate the world data based purely on that, _not_ trying to match ksh track titles
      3. the ksh files are only used to verify which ones are actually playable
    - i can't see any immediately unsolvable problems with this so I think we just do this tbh; getting the data was probably inevitable for several reasons
      - if i don't have a chart that gets included in the rando, i'll just mark the check probably

## technical details

- uses a generator which creates items/locations given a bunch of .ksh files

  and ideally an .apworld file

- options:
  - normal chart pool: # of normal songs to include (default 100 probably)
  - boss song count: # of boss songs?
- any detail which requires game data (e.g. knowing which songs are SDVX original, floor, bemani, touhou, etc.) should use the [SDVX song DB](https://www.myshkin.io/sdvx/songlist?search=&level=&diff=&avail=&ver=&genre=S)

  which will _very likely_ require me writing some script to scrape this into JSON, which I'm cool with

# questions

- do we have multiple goals _per difficulty_?
  - i lean towards yes; an 18 and 20 of one song differ enough to treat them separately
- i want to structure this in a flavorful way, what does that look like?

  more specifically...

  - what's the structure of boss songs? possibilities:

    - multiple keys required per boss song

      defeating boss song gives a victory song key, then you win after completing victory songs

      this feels a little too unnecessarily structured, but I like that it gates the thematic finale songs behind several other bosses

    - just beat multiple bosses

      simple, but boring

  - what's the structure of regions
    - region per game?
      - consideration: requires game data
    - region per victory path? (e.g. one for GRACE and one for RASIS)

  alternatively...

  - character-based structuring?

    acquiring characters, then defeating the final boss once characters are acquired

    - acquire characters by playing through their songs (by album art inclusion[^album-art-inclusion]): passing a goal on a character song gives you an APPEAL, and then 20 APPEAL towards that character unlocks them

    [^album-art-inclusion]: must be prominent, e.g. not just in the background, or just barely visible in some corner

    - do characters have special abilities?

      would be cool, but I can't think of anything non-overpowered, like persistent score bonuses

      they could be small and add up over time, maybe, which plays into the AP "game gets easier to play over time" feel (that isn't just progressive unlocks)

      or they could come with a # of uses of their ability, effectively serving as helper items

# ideas

- idea: special goals? something more than just get a rank
  - don't drop lazers/button/holds/FX/FX holds
  - exactly X errors
  - X% gauge

## song inclusion

- pick folders with .ksh files to read from
- maybe make song categories an option?

  like... pick certain categories of officials, or just use your whole-ass song lib

- need to make some script that fetches all the songs from [the db](https://www.myshkin.io/sdvx/songlist?search=&level=&diff=&avail=&ver=&genre=S)

## goals

- Clear, AA, AAA, S
  - i'm mostly happy with these
  - A rank is basically same as clear most of the time
    - funny case: you can A rank but track crash at the same time
  - S-rank goals are kinda harsh, but the score helpers should offset that
- one goal per diff?
  - I found it kinda cheaty that I could just Let myself drop down to a lower difficulty at any time to clear a goal... so I never did
  - _definitely_ add a difficulty range setting; I personally don't care to play 16s
    - but we might need to care about booth/infinite rating... ugh
- what about bosses? all goals for boss, or just clear?
  - if we intend on bosses being hard, it should _probably_ just be a clear
  - if we do all goals for bosses then they become less unique aside from just being goal blockers
    - do they need to be?
    - _can_ we make them unique in any way, even?

## progression: game-based regions?

- regions are different games (booth, infinite, gravity, etc.) accessed chronologically
- each region has a boss (or more than 1?)
- need some amount of volforce to progress into the next region
- win after conquering exceed boss

## progression: story-based completion?

- base it around [the MISSION mode in gravity wars](https://remywiki.com/AC_SDVX_III/MISSION)
- ???

## progression: bring everyone together to defeat grace

- characters & character abilities?
  - e.g. new characters give you a persistent score bonus? or something

## helpers

- score bonuses
- trap clears

## traps

- reversed lazers
- pass a 20 (?)
  - doesn't work if the 20 has to be unlocked
  - what keeps you from just playing the easiest 20? whichever that is
