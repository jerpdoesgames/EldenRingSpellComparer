const SORT_NAME = 0;
const SORT_AR_BASE = 1;
const SORT_AR_NET = 2;
const SORT_DAMAGE_NET = 3;
const SORT_AR_FP = 4;
const SORT_DMG_FP = 5;

class spellComparer
{

    updateOnChange = true;  // Disabled temporarily when modifying input fields without user intervention
    configuration = {
        weaponLevels : {
            regular: 25,
            somber: 10
        },
        sort : SORT_SCALING_ADJUSTED,
        filter : SPELL_TYPE_ALL,
        stats: [
            {
                name: "strength",
                value: 10
            },
            {
                name: "dexterity",
                value: 10
            },
            {
                name: "intelligence",
                value: 10
            },
            {
                name: "faith",
                value: 10
            },
            {
                name: "arcane",
                value: 10
            }
        ]
    };
}
