# EldenRingSpellComparer
A web app to compare AR, Damage, and FP Efficiency for offensive spells.

[Click here for the current live version of the tool](https://jerp.tv/eldenring/spells/)

## How to Use:

* Enter in your stats (str/dex/int/fai/arc)
* Select your desired casting tool(s)
* Select the regular/somber upgrade level for the casting tool(s) you want to use.
* If you use an off-hand casting tool to boost damage via a particular spell school, click the desired school(s) from the "Extra Spell Schools" list.
  * Whatever casting tool(s) you've selected will also confer any school bonuses they offer (so you can double up if necessary).
* Enter in whatever defense values you think your target may have.
  * For PvP, you can generally look at your own build or similar builds at your level.  You can use this [build planner](https://eip.gg/elden-ring/build-planner/) for reference.
  * For PvE, you can consult [this sheet for defense/absorption values for all enemies/bosses](https://docs.google.com/spreadsheets/d/1aujq95UfL_oUs3voPt3nGqM1hLhaVJOj6JKB6Np3FD8/edit#gid=1315305173) (the same defense value is used for all damage types).

Once you've entered in the data you want, the list below should populate (defaulting to sorting by Net Damage/FP).

You can also see some useful information like whether the spell can be cast on horseback and the stat requirements for the spell.

## Notes:
* This only shows offensive spells that directly deal damage or add AR to a weapon.  Only spells which you meet the requirements for are currently listed (the tool defaults to 10/10/80/50/18 str/dex/int/fai/arc in order to show everything).
* Regarding the "Hits" for some spells like Meteorite, weapon buffs, etc. I've generally tried to guesstimate either a favorable cast or a reasonable amount of hits, but I'd want a more data-driven approach to figuring out that number - or add something to let you configure that yourself.
* For spells that can be channeled (Comet Azur, Crystal Barrage, etc.) the tool is more or less displaying a single tap of the button and doesn't factor in the additional/repeating cost.

# My Other Tools

* **[Casting Tool Comparator](https://jerp.tv/eldenring/spelltools/)** (Enter in your desired stats and compare how each Staff and Seal performs relative to each other.)
* **[Rune Level Calculator](https://jerp.tv/eldenring/runes/)** (Find out the level of the player who died based on how many runes you received.)

# Credits

* The scaling information for this is based on /u/TarnishedSpreadsheet's [Weapon Calculator tool](https://www.reddit.com/r/Eldenring/comments/tbco46/elden_ring_weapon_calculator/).  I also used some data-mined information they provided.
* Thanks to [Tical](https://twitter.com/mrtical91) for helping with testing and initial data collection.
* Damage calculation based on [information posted by TalentedJuli](https://www.reddit.com/r/darksouls3/comments/4f8yy8/how_defense_and_absorption_really_work/).  Dark Souls 3 and Elden Ring use roughly the same system.
* Please be sure to check the [Contributors List](https://github.com/jerpdoesgames/EldenRingSpellComparer/graphs/contributors) to see who've been submitting changes on **GitHub**.
