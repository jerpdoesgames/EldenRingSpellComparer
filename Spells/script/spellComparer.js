const SORT_NAME = 0;
const SORT_FP_COST = 1;
const SORT_AR_BASE = 2;
const SORT_AR_NET = 3;
const SORT_DAMAGE_NET = 4;
const SORT_AR_FP = 5;
const SORT_AR_FP_NET = 6;
const SORT_DMG_FP = 7;

class spellComparer
{
    updateOnChange = true;  // Disabled temporarily when modifying input fields without user intervention
    configuration = {
        weaponLevels : {
            regular: 25,
            somber: 10
        },
        damageTypes = [
            {
                defense: 90,
                negation: 10.00
            },
            {
                defense: 90,
                negation: 10.00
            },
            {
                defense: 90,
                negation: 10.00
            },
            {
                defense: 90,
                negation: 10.00
            },
            {
                defense: 90,
                negation: 10.00
            }
        ],
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

    statControlInput(aEvent)
    {
        let statIndex = parseInt(aEvent.target.id.substring(11));
        this.configuration.stats[statIndex].value = parseInt(this.statControls[statIndex].value);
        this.updateDisplay();
    }

    toolFilterChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.filter = controlValue;
        this.updateDisplay();
    }

    toolSortChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.sort = controlValue;
        this.updateDisplay();
    }

    populateStaffList()
    {
        // controlStaff
        // <option value="0">Astrologer Staff</option>
    }

    populateSealList()
    {
        // controlSeal
        // <option value="0">Finger Seal</option>
    }

    populateSchoolList()
    {
        // schoolsContainer
        // <div id="schoolSelect16" class="schoolsContainerEntry">Godskin Apostle<span>&#10003;</span></div>
    }

    updateDisplay()
    {

    }

    initialize()
    {
        this.contentElement = document.getElementById("outputDiv");
        this.controlSorting = document.getElementById("controlSorting");
        this.controlSpellType = document.getElementById("controlSpellType");

        // statControlDefense0 (0-4
        // statControlNegation0 (0-4)

        this.statControls = [];
        for (let i = 0; i < this.configuration.stats.length; i++)
        {
            this.statControls[i] = document.getElementById("statControl"+i);
            this.statControls[i].addEventListener("change", this.statControlInput.bind(this));
        }

        document.getElementById("upgradeControl0").addEventListener("change", this.upgradeControlInput.bind(this));
        document.getElementById("upgradeControl1").addEventListener("change", this.upgradeControlInput.bind(this));

        document.getElementById("controlSpellType").addEventListener("change", this.toolFilterChange.bind(this));
        document.getElementById("controlSorting").addEventListener("change", this.toolSortChange.bind(this));


        this.updateDisplay();
    }
}

var toolInstance = new spellComparer();

// Hacky VH business.
// - for the URL bar appearing/disappearing as you scroll up/down on mobile
window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--calculatedVH', `${vh}px`);
  });