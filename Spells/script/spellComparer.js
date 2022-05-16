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
        selectedStaff: 0,
        selectedSeal: 0,
        showCharged = false,
        weaponLevels : {
            regular: 25,
            somber: 10
        },
        damageTypes : [
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

    getDamageTypeString(aDamageType)
    {
        switch(aDamageType)
        {
            case DAMAGE_MIXED:
                return "Mixed";
            case DAMAGE_ANY:
                return "Any";
            case DAMAGE_PHYSICAL:
                return "Physical";
            case DAMAGE_MAGIC:
                return "Magic";
            case DAMAGE_FIRE:
                return "Fire";
            case DAMAGE_LIGHTNING:
                return "Lightning";
            case DAMAGE_HOLY:
                return "Holy";
        }
        return "Unknown";
    }

    combineHitData(aHitDataList)
    {
        let displayEntry = {};
        let damageType = 0;

        for (let hitIndex = 0; hitIndex < aHitDataList.length; hitIndex++)
        {
            let curHitData = aHitDataList[hitIndex];
            if (damageType != DAMAGE_MIXED && curHitData.damageType > 0)
            {
                if (damageType > 0 && curHitData.damageType != damageType)
                {
                    damageType = DAMAGE_MIXED;
                }
                else
                {
                    damageType = curHitData.damageType;
                }

                displayEntry.damageType = damageType;
            }
        }

        return displayEntry;
    }

    toggleSpellSchool(aEvent)
    {
        let schoolIndex = parseInt(aEvent.target.id.substring(12));
        if (spellSchools[schoolIndex].activeCount >= 2)
        {
            spellSchools[schoolIndex].activeCount = 0;
        }
        else if (spellSchools[schoolIndex].activeCount == 1)
        {
            spellSchools[schoolIndex].activeCount = 2;
        }
        else
        {
            spellSchools[schoolIndex].activeCount = 1;
        }

        this.updateDisplay();
    }

    defenseControlInput(aEvent)
    {
        let statIndex = parseInt(aEvent.target.id.substring(18));
        this.configuration.damageTypes[statIndex].defense = parseInt(this.defenseControls[statIndex].value);
        this.updateDisplay();
    }

    negationControlInput(aEvent)
    {
        let statIndex = parseInt(aEvent.target.id.substring(19));
        this.configuration.damageTypes[statIndex].negation = parseFloat(this.negationControls[statIndex].value);
        this.updateDisplay();
    }

    statControlInput(aEvent)
    {
        let statIndex = parseInt(aEvent.target.id.substring(11));
        this.configuration.stats[statIndex].value = parseInt(this.statControls[statIndex].value);
        this.updateDisplay();
    }

    upgradeControlInput(aEvent)
    {
        let controlIndex = parseInt(aEvent.target.id.substring(14));
        let controlValue = parseInt(aEvent.target.value);

        if (controlIndex == 0)
        {
            this.configuration.weaponLevels.regular = controlValue;
        }
        else
        {
            this.configuration.weaponLevels.somber = controlValue;
        }
        this.updateDisplay();
    }

    toolFilterChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.filter = controlValue;
        this.updateDisplay();
    }

    onSortChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.sort = controlValue;
        this.updateDisplay();
    }

    populateStaffList()
    {
        let output = "";
        for (let i = 0; i < staves.length; i++)
        {
            let selectedString = (this.configuration.selectedStaff == i) ? " selected" : "";
            output += `<option value="${i}"${selectedString}>${staves[i].name}</option>`
        }

        this.controlStaff.innerHTML = output;
    }

    populateSealList()
    {
        let output = "";
        for (let i = 0; i < seals.length; i++)
        {
            let selectedString = (this.configuration.selectedSeal == i) ? " selected" : "";
            output += `<option value="${i}"${selectedString}>${seals[i].name}</option>`
        }

        this.controlSeal.innerHTML = output;
    }

    populateSchoolList()
    {
        let output = "";

        for (let i = 0; i < spellSchools.length; i++)
        {
            output += `<div id="schoolSelect${i}" class="schoolsContainerEntry">${spellSchools[i].name}<span class="schoolCheck1">&#10003;</span><span class="schoolCheck2">x2</span></div>`;
        }

        this.schoolsContainer.innerHTML = output;
    }

    updateSchoolChecks()
    {
        for(let i = 0; i < spellSchools.length; i++)
        {
            let curSchool = spellSchools[i];
            if (curSchool.activeCount == 2)
            {
                curSchool.control.classList.add("schoolsContainerEntrySelected2");
                curSchool.control.classList.remove("schoolsContainerEntrySelected1");
            }
            else if (curSchool.activeCount == 1)
            {
                curSchool.control.classList.add("schoolsContainerEntrySelected1");
                curSchool.control.classList.remove("schoolsContainerEntrySelected2");
            }
            else
            {
                curSchool.control.classList.remove("schoolsContainerEntrySelected1");
                curSchool.control.classList.remove("schoolsContainerEntrySelected2");
            }

        }
    }

    updateDisplay()
    {
        this.updateSchoolChecks();



        let output = "";


        for (let spellIndex = 0; spellIndex < spellData.length; spellIndex++)
        {
            let curSpell = spellData[spellIndex];
            let displayEntries = [];

            if (curSpell.hitData.length > 0)
            {
                if (curSpell.hitDisplayData.length == 0)
                {
                    displayEntries = this.combineHitData(curSpell.hitData);
                }
                else
                {

                    for (let displayIndex = 0; displayIndex < curSpell.hitDisplayData.length; displayIndex++)
                    {
                        let curDisplayEntry = curSpell.hitDisplayData[displayIndex];
                        let hitEntries = [];

                        for (let hitIndex = 0; hitIndex < curDisplayEntry.componentHits.length; hitIndex++)
                        {

                        }

                        displayEntries.push(this.combineHitData(hitEntries));
                    }
                }


                let toolTypestring = curSpell.toolType == SPELL_TYPE_SORCERY ? "Sorcery" : "Incantation";

                output += `
                    <tr>
                        <td class="displayColName">${curSpell.name}</td>
                        <td class="displayColType">${toolTypestring}</td>
                        <td class="displayColDmgType">DamageType</td>
                        <td class="displayColHitType">Any</td>
                        <td class="displayColFP">${curSpell.fpCostBase}</td>
                        <td class="displayColARDmg">180</td>
                        <td class="displayColARDmg">45</td>
                        <td class="displayColHitCount">1</td>
                        <td class="displayColARDmg">675</td>
                        <td class="displayColARDmg">168.75</td>
                        <td class="displayColARDmg">442.26</td>
                        <td class="displayColARDmg">110.56</td>
                        <td class="displayColStat">${curSpell.intelligence}</td>
                        <td class="displayColStat">${curSpell.faith}</td>
                        <td class="displayColStat">${curSpell.arcane}</td>
                        <td class="displayColNotes">-</td>
                    </tr>
                `;
            }


        }

        /*
            <tr>
                <td class="displayColName">Aspects of the Crucible: Tail</td>
                <td class="displayColType">Sorcery</td>
                <td class="displayColDmgType">Magic</td>
                <td class="displayColHitType">Any</td>
                <td class="displayColFP">4</td>
                <td class="displayColARDmg">180</td>
                <td class="displayColARDmg">45</td>
                <td class="displayColHitCount">1</td>
                <td class="displayColARDmg">675</td>
                <td class="displayColARDmg">168.75</td>
                <td class="displayColARDmg">442.26</td>
                <td class="displayColARDmg">110.56</td>
                <td class="displayColStat">15</td>
                <td class="displayColStat">0</td>
                <td class="displayColStat">0</td>
                <td class="displayColNotes">-</td>
            </tr>
        */

        this.contentElement.innerHTML = `
        <table id="spellList">
            <thead>
                <tr>
                    <th class="displayColName">Name</th>
                    <th class="displayColType">Type</th>
                    <th class="displayColDmgType">DMG Type</th>
                    <th class="displayColType">Hit</th>
                    <th class="displayColFP">FP</th>
                    <th class="displayColARDmg">Base AR</th>
                    <th class="displayColARDmg">Base AR/FP</th>
                    <th class="displayColHitCount">Hits</th>
                    <th class="displayColARDmg">Net AR</th>
                    <th class="displayColARDmg">Net AR/FP</th>
                    <th class="displayColARDmg">Net DMG</th>
                    <th class="displayColARDmg">Net DMG/FP</th>
                    <th class="displayColStat">Int</th>
                    <th class="displayColStat">Fai</th>
                    <th class="displayColStat">Arc</th>
                    <th class="displayColNotes">Notes</th>
                </tr>
            </thead>
            <tbody>
                ${output}
            </tbody>
        </table>
        `;
    }

    initialize()
    {
        this.contentElement = document.getElementById("outputDiv");
        this.controlSorting = document.getElementById("controlSorting");
        this.controlSpellType = document.getElementById("controlSpellType");
        this.controlStaff = document.getElementById("controlStaff");
        this.controlSeal = document.getElementById("controlSeal");

        this.defenseControls = [];
        for (let i = 0; i < this.configuration.damageTypes.length; i++)
        {
            this.defenseControls[i] = document.getElementById("statControlDefense"+i);
            this.defenseControls[i].addEventListener("change", this.defenseControlInput.bind(this));
        }

        this.negationControls = [];
        for (let i = 0; i < this.configuration.damageTypes.length; i++)
        {
            this.negationControls[i] = document.getElementById("statControlNegation"+i);
            this.negationControls[i].addEventListener("change", this.negationControlInput.bind(this));
        }

        this.statControls = [];
        for (let i = 0; i < this.configuration.stats.length; i++)
        {
            this.statControls[i] = document.getElementById("statControl"+i);
            this.statControls[i].addEventListener("change", this.statControlInput.bind(this));
        }

        document.getElementById("upgradeControl0").addEventListener("change", this.upgradeControlInput.bind(this));
        document.getElementById("upgradeControl1").addEventListener("change", this.upgradeControlInput.bind(this));

        document.getElementById("controlSpellType").addEventListener("change", this.toolFilterChange.bind(this));
        document.getElementById("controlSorting").addEventListener("change", this.onSortChange.bind(this));

        this.schoolsContainer = document.getElementById("schoolsContainer");
        this.populateSchoolList();

        for (let i = 0; i < spellSchools.length; i++)
        {
            spellSchools[i].activeCount = 0;
            spellSchools[i].control = document.getElementById("schoolSelect"+i);
            spellSchools[i].control.addEventListener("click", this.toggleSpellSchool.bind(this));
        }

        this.populateStaffList();
        this.populateSealList();
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