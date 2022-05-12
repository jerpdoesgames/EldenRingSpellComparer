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
        sort : SORT_DAMAGE_NET,
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

    initialize()
    {
        // blah
    }
}

var toolInstance = new spellComparer();


// Hacky VH business.
// - for the URL bar appearing/disappearing as you scroll up/down on mobile
window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--calculatedVH', `${vh}px`);
  });