const SORT_NAME = 0;
const SORT_FP_COST = 1;
const SORT_AR_NET = 2;
const SORT_DAMAGE_NET = 3;
const SORT_AR_FP_NET = 4;
const SORT_DMG_FP = 5;

const ATTACK_INDEX_MAX = 2;

class spellComparer
{
    updateOnChange = true;  // Disabled temporarily when modifying input fields without user intervention
    configuration = {
        selectedStaff: 0,
        selectedSeal: 0,
        showCharged : false,
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
        sort : SORT_DMG_FP,
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
                value: 80
            },
            {
                name: "faith",
                value: 50
            },
            {
                name: "arcane",
                value: 18
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

    combineHitData(aHitDataList, aAttackIndex = -1, aIsCharged = false, aSpellBuffMultiplier = 1.0, aFPOverride = 0, aShowAttackIndex = false)
    {
        let displayEntry = {
            netDamage: 0,
            hitCount: 0,
            netAR: 0,
            fpCostOverride: aFPOverride,
        };

        let foundValidHits = false;
        let arBreakdownList = [];

        let hitNotes = [];

        for (const curHitData of aHitDataList)
        {
            if ((aAttackIndex == -1 || curHitData.attackIndex == aAttackIndex) && curHitData.isCharged == aIsCharged)
            {
                if (displayEntry.damageType == null)
                {
                    displayEntry.damageType = curHitData.damageType;
                }
                else if (displayEntry.damageType != curHitData.damageType)
                {
                    displayEntry.damageType = DAMAGE_MIXED;
                }

                let checkDamageTypeIndex = curHitData.damageType - 1;
                let buffedAttackRating = curHitData.attackRating * aSpellBuffMultiplier;
                displayEntry.netDamage += (curHitData.hitCount * eldenRingDamageCalc.reduceARByAllDefenses(buffedAttackRating, this.configuration.damageTypes[checkDamageTypeIndex].defense, this.configuration.damageTypes[checkDamageTypeIndex].negation));

                displayEntry.hitCount += curHitData.hitCount;
                displayEntry.netAR += (buffedAttackRating * curHitData.hitCount);

                let arDescriptionString = this.formatDamageForDisplay(curHitData.attackRating);

                if (curHitData.hitTypeNote != "")
                {
                    arDescriptionString += ` (${curHitData.hitTypeNote})`;

                    hitNotes.push(curHitData.hitTypeNote);
                }
                if (curHitData.hitCount >= 2)
                {
                    arDescriptionString += ` x${curHitData.hitCount}`;
                }
                foundValidHits = true;
                arBreakdownList.push(arDescriptionString);

                if (aShowAttackIndex && curHitData.attackIndex >= 0)
                {
                    if (displayEntry.attackIndex == null)
                        displayEntry.attackIndex = curHitData.attackIndex;
                    else
                        displayEntry.attackIndex = Math.max(displayEntry.attackIndex, curHitData.attackIndex);
                }
            }

        }

        displayEntry.arBreakdown = arBreakdownList.join(", ");
        displayEntry.hitNote = hitNotes.join(", ");

        return foundValidHits ? displayEntry : null;
    }

    toggleSpellSchool(aEvent)
    {
        let schoolIndex = parseInt(aEvent.target.id.substring(12));
        spellSchools[schoolIndex].activeCount = spellSchools[schoolIndex].activeCount >= 1 ? 0 : 1;
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


    toolStaffChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.selectedStaff = controlValue;
        this.updateDisplay();
    }

    toolSealChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.selectedSeal = controlValue;
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

        staves.forEach((staff, i) => {
            let selectedString = (this.configuration.selectedStaff == i) ? " selected" : "";
            output += `<option value="${i}" ${selectedString}>${staff.name}</option>`
        })

        this.controlStaff.innerHTML = output;
    }

    populateSealList()
    {
        let output = "";

        seals.forEach((seal, i) => {
            let selectedString = (this.configuration.selectedSeal == i) ? " selected" : "";
            output += `<option value="${i}" ${selectedString}>${seal.name}</option>`
        })

        this.controlSeal.innerHTML = output;
    }

    populateSchoolList()
    {
        let output = "";

        spellSchools.forEach((school, i) => {
            output += `<div id="schoolSelect${i}" class="schoolsContainerEntry">${school.name}<span class="schoolCheck1">&#10003;</span><span class="schoolCheck2">x2</span></div>`;
        })

        this.schoolsContainer.innerHTML = output;
    }

    updateSchoolChecks()
    {
        for (const curSchool of spellSchools)
        {
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

    getMatchingHitData(aHitData, aAttackIndex, aHitIndex)
    {
        return aHitData.find(curHitData => curHitData.attackIndex == aAttackIndex && curHitData.hitIndex == aHitIndex);
    }

    formatDamageForDisplay(aInputValue)
    {
        return aInputValue == 0 ? "-" : Math.round(aInputValue * 100) / 100;
    }

    sortBy({ property, sortOrder })
    {
        return (a, b) => 
        {
            switch (sortOrder) {
            case "asc":
                return a[property] - b[property];
            case "desc":
                return b[property] - a[property];
            default:
                throw new Error("Invalid sort order, expected 'asc' or 'desc'");
            }
        }
    }


    checkFromBool(aInput)
    {
        return aInput ? "&#10003;" : "&nbsp;";
    }

    updateDisplay()
    {
        this.updateSchoolChecks();

        let scalingStaff = [];
        let scalingSeal = [];

        let selectedStaff = staves[this.configuration.selectedStaff];
        let selectedSeal = seals[this.configuration.selectedSeal];

        let reqMetStaff = (
            (this.configuration.stats[STAT_STRENGTH].value >= selectedStaff.requirements.strength || !eldenRingScalingCalc.isToolScaledByStat(selectedStaff, STAT_STRENGTH, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_DEXTERITY].value >= selectedStaff.requirements.dexterity || !eldenRingScalingCalc.isToolScaledByStat(selectedStaff, STAT_DEXTERITY, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_INTELLIGENCE].value >= selectedStaff.requirements.intelligence || !eldenRingScalingCalc.isToolScaledByStat(selectedStaff, STAT_INTELLIGENCE, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_FAITH].value >= selectedStaff.requirements.faith || !eldenRingScalingCalc.isToolScaledByStat(selectedStaff, STAT_FAITH, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_ARCANE].value >= selectedStaff.requirements.arcane || !eldenRingScalingCalc.isToolScaledByStat(selectedStaff, STAT_ARCANE, DAMAGE_MAGIC - 1))
        );

        let reqMetSeal = (
            (this.configuration.stats[STAT_STRENGTH].value >= selectedSeal.requirements.strength || !eldenRingScalingCalc.isToolScaledByStat(selectedSeal, STAT_STRENGTH, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_DEXTERITY].value >= selectedSeal.requirements.dexterity || !eldenRingScalingCalc.isToolScaledByStat(selectedSeal, STAT_DEXTERITY, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_INTELLIGENCE].value >= selectedSeal.requirements.intelligence || !eldenRingScalingCalc.isToolScaledByStat(selectedSeal, STAT_INTELLIGENCE, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_FAITH].value >= selectedSeal.requirements.faith || !eldenRingScalingCalc.isToolScaledByStat(selectedSeal, STAT_FAITH, DAMAGE_MAGIC - 1)) &&
            (this.configuration.stats[STAT_ARCANE].value >= selectedSeal.requirements.arcane || !eldenRingScalingCalc.isToolScaledByStat(selectedSeal, STAT_ARCANE, DAMAGE_MAGIC - 1))
        );

        let weaponLevelStaff = 0;
        let weaponLevelSeal = 0;
        if (selectedStaff.maxLevel != 0)
        {
            weaponLevelStaff = selectedStaff.maxLevel == 25 ? this.configuration.weaponLevels.regular : this.configuration.weaponLevels.somber;
        }

        if (selectedSeal.maxLevel != 0)
        {
            weaponLevelSeal = selectedSeal.maxLevel == 25 ? this.configuration.weaponLevels.regular : this.configuration.weaponLevels.somber;
        }

        for (let statIndex = STAT_STRENGTH; statIndex <= STAT_ARCANE; statIndex++)
        {
            if (eldenRingScalingCalc.isToolScaledByStat(selectedStaff, statIndex, DAMAGE_MAGIC - 1))
            {
                scalingStaff[statIndex] = eldenRingScalingCalc.calculateToolScalingForStat(selectedStaff, statIndex, DAMAGE_MAGIC - 1, weaponLevelStaff, this.configuration.stats[statIndex].value)
            }
            else
            {
                scalingStaff[statIndex] = 0;
            }
        }

        for (let statIndex = STAT_STRENGTH; statIndex <= STAT_ARCANE; statIndex++)
        {

            if (eldenRingScalingCalc.isToolScaledByStat(selectedSeal, statIndex, DAMAGE_MAGIC - 1))
            {
                scalingSeal[statIndex] = eldenRingScalingCalc.calculateToolScalingForStat(selectedSeal, statIndex, DAMAGE_MAGIC - 1, weaponLevelSeal, this.configuration.stats[statIndex].value)
            }
            else
            {
                scalingSeal[statIndex] = 0;
            }
        }

        if (reqMetStaff)
        {
            let totalScaling = 100 + scalingStaff.reduce((a, b) => a + b);
            this.scalingDisplayStaff.innerHTML = Math.floor(totalScaling);
        }
        else
        {
            this.scalingDisplayStaff.innerHTML = "60";
        }

        if (reqMetSeal)
        {
            let totalScaling = 100 + scalingSeal.reduce((a, b) => a + b);
            this.scalingDisplaySeal.innerHTML = Math.floor(totalScaling);
        }
        else
        {
            this.scalingDisplaySeal.innerHTML = "60";
        }

        let output = "";
        let outputRows = [];

        for (const curSpell of spellData)
        {
            if (this.configuration.filter == SPELL_TYPE_ALL || this.configuration.filter == curSpell.toolType)
            {
                if (curSpell.hitData.length > 0)
                {
                    let curTool = curSpell.toolType == SPELL_TYPE_SORCERY ? selectedStaff : selectedSeal;
                    let hitDisplayEntries = [];
                    let reqMetIntelligence = (this.configuration.stats[STAT_INTELLIGENCE].value >= curSpell.intelligence);
                    let reqMetFaith = (this.configuration.stats[STAT_FAITH].value >= curSpell.faith);
                    let reqMetArcane = (this.configuration.stats[STAT_ARCANE].value >= curSpell.arcane);

                    let schoolMultiplier = 1.0;

                    if (curSpell.magicEffectCategory > 0)
                    {
                        if (curSpell.magicEffectCategory == curTool.magicEffectCategory)
                        {
                            schoolMultiplier *= curTool.schoolMultiplier;
                        }

                        for (const element of spellSchools)
                        {
                            if (curSpell.magicEffectCategory == element.magicEffectCategory)
                            {
                                if (element.activeCount >= 1)
                                {
                                    schoolMultiplier *= element.schoolMultiplier;
                                }
                                break;
                            }
                        }
                    }

                    if (!reqMetIntelligence || !reqMetFaith || !reqMetArcane)
                    {
                        // Maybe show these?
                    }
                    else
                    {
                        let spellBuffMultiplier = 1.0;
                        let toolRequirementMet = curSpell.toolType == SPELL_TYPE_SORCERY ? reqMetStaff : reqMetSeal;
                        let spellBuffEntries = curSpell.toolType == SPELL_TYPE_SORCERY ? scalingStaff : scalingSeal;

                        if (toolRequirementMet)
                        {
                            if (curSpell.isWeaponBuff)
                            {

                                if (curSpell.toolType == SPELL_TYPE_SORCERY)
                                {
                                    spellBuffMultiplier += (spellBuffEntries[STAT_INTELLIGENCE] / 100);
                                }
                                else
                                {
                                    spellBuffMultiplier += (spellBuffEntries[STAT_FAITH] / 100);
                                }
                            }
                            else
                            {
                                for (let statIndex = STAT_STRENGTH; statIndex <= STAT_ARCANE; statIndex++)
                                {
                                    spellBuffMultiplier += (spellBuffEntries[statIndex] / 100);
                                }
                            }
                        }
                        else
                        {
                            spellBuffMultiplier = 0.6;
                        }

                        let useChargedAR = this.configuration.useChargedAR && curSpell.allowCharge;

                        let maxAttackIndex = -1;
                        for (const element of curSpell.hitData)
                        {
                            maxAttackIndex = Math.max(maxAttackIndex, element.attackIndex);
                        }

                        if (curSpell.hitDisplayData.length == 0)
                        {
                            for (let attackIndex = 0; attackIndex <= ATTACK_INDEX_MAX; attackIndex++)
                            {
                                let curDisplayEntry = this.combineHitData(curSpell.hitData, attackIndex, useChargedAR, spellBuffMultiplier, -1, (maxAttackIndex > 0));
                                if (curDisplayEntry != null)
                                {
                                    hitDisplayEntries.push(curDisplayEntry);
                                }
                            }
                        }
                        else
                        {
                            for (const element of curSpell.hitDisplayData)
                            {
                                let curDisplayEntry = element;
                                let hitEntries = [];

                                for (const hit of curDisplayEntry.componentHits)
                                {
                                    let foundHitData = this.getMatchingHitData(curSpell.hitData, hit.attackIndex, hit.hitIndex);
                                    if (foundHitData != null)
                                    {
                                        hitEntries.push(foundHitData);
                                    }
                                }

                                let dataToAdd = this.combineHitData(hitEntries, -1, useChargedAR, spellBuffMultiplier, curDisplayEntry.fpCostOverride, (maxAttackIndex > 0));

                                if (curDisplayEntry.note != null && curDisplayEntry.note != "")
                                {
                                    dataToAdd.hitNote = curDisplayEntry.note;
                                }
                                hitDisplayEntries.push(dataToAdd);
                            }
                        }
                    }

                    let toolTypestring = curSpell.toolType == SPELL_TYPE_SORCERY ? "Sorcery" : "Incantation";
                    for (const curDisplayEntry of hitDisplayEntries)
                    {

                        let useFPCost = curDisplayEntry.fpCostOverride > 0 ? curDisplayEntry.fpCostOverride : curSpell.fpCostBase;
                        useFPCost = Math.ceil(curTool.fpCostMultiplier * useFPCost);
                        let damageTypeString = this.getDamageTypeString(curDisplayEntry.damageType);
                        let schoolBoostedDamage = curDisplayEntry.netDamage * schoolMultiplier;
                        let netDamageFP = schoolBoostedDamage / useFPCost;
                        let netARFP = curDisplayEntry.netAR / useFPCost;
                        let attackIndexString = (curDisplayEntry.attackIndex != null && curDisplayEntry.attackIndex >= 0) ? ` (${curDisplayEntry.attackIndex + 1})` : "";

                        outputRows.push({
                            name: curSpell.name + attackIndexString,
                            type: toolTypestring,
                            damageType: damageTypeString,
                            hitNote: curDisplayEntry.hitNote,
                            fpCost: useFPCost,
                            hitCount: curDisplayEntry.hitCount,
                            netAR: curDisplayEntry.netAR,
                            netARFP: netARFP,
                            netDamage: schoolBoostedDamage,
                            netDamageFP: netDamageFP,
                            intelligence: curSpell.intelligence,
                            faith: curSpell.faith,
                            arcane: curSpell.arcane,
                            allowCharge: curSpell.allowCharge,
                            allowChain: curSpell.allowChain,
                            allowFollowup: curSpell.allowFollowup,
                            allowChannel: curSpell.allowChannel,
                            allowMovement: curSpell.allowMovement,
                            allowHorseback: curSpell.allowHorseback,
                            arBreakdown: curDisplayEntry.arBreakdown
                        });
                    }
                }
            }
        }

        switch(this.configuration.sort)
        {
            case SORT_NAME:
                outputRows.sort(this.sortBy({ property: "name", sortOrder: "asc"}));
                break;
            case SORT_FP_COST:
                outputRows.sort(this.sortBy({ property: "fpCost", sortOrder: "desc"}));
                break;
            case SORT_AR_NET:
                outputRows.sort(this.sortBy({ property: "netAR", sortOrder: "desc"}));
                break;
            case SORT_DAMAGE_NET:
                outputRows.sort(this.sortBy({ property: "netDamage", sortOrder: "desc"}));
                break;
            case SORT_AR_FP_NET:
                outputRows.sort(this.sortBy({ property: "netARFP", sortOrder: "desc"}));
                break;
            case SORT_DMG_FP:
                outputRows.sort(this.sortBy({ property: "netDamageFP", sortOrder: "desc"}));
                break;
        }

        for (const curRow of outputRows)
        {
            let reqMetIntelligence = (this.configuration.stats[STAT_INTELLIGENCE].value >= curRow.intelligence);
            let reqMetFaith = (this.configuration.stats[STAT_FAITH].value >= curRow.faith);
            let reqMetArcane = (this.configuration.stats[STAT_ARCANE].value >= curRow.arcane);

            let reqClassIntelligence = reqMetIntelligence ? "" : " requirementUnmet";
            let reqClassFaith = reqMetFaith ? "" : " requirementUnmet";
            let reqClassArcane = reqMetArcane ? "" : " requirementUnmet";

            output += `
                <tr>
                    <td class="displayColName">${curRow.name}</td>
                    <td class="displayColType">${curRow.type}</td>
                    <td class="displayColDmgType">${curRow.damageType}</td>
                    <td class="displayColHitType">${curRow.hitNote}</td>
                    <td class="displayColFP">${curRow.fpCost}</td>
                    <td class="displayColHitCount">${curRow.hitCount}</td>
                    <td class="displayColARDmg">${this.formatDamageForDisplay(curRow.netAR)}</td>
                    <td class="displayColARDmg">${this.formatDamageForDisplay(curRow.netARFP)}</td>
                    <td class="displayColARDmg">${this.formatDamageForDisplay(curRow.netDamage)}</td>
                    <td class="displayColARDmg">${this.formatDamageForDisplay(curRow.netDamageFP)}</td>
                    <td class="displayColARDmg">${this.checkFromBool(curRow.allowCharge)}</td>
                    <td class="displayColARDmg">${this.checkFromBool(curRow.allowChain)}</td>
                    <td class="displayColARDmg">${this.checkFromBool(curRow.allowFollowup)}</td>
                    <td class="displayColARDmg">${this.checkFromBool(curRow.allowChannel)}</td>
                    <td class="displayColARDmg">${this.checkFromBool(curRow.allowMovement)}</td>
                    <td class="displayColARDmg">${this.checkFromBool(curRow.allowHorseback)}</td>
                    <td class="displayColStat${reqClassIntelligence}">${curRow.intelligence}</td>
                    <td class="displayColStat${reqClassFaith}">${curRow.faith}</td>
                    <td class="displayColStat${reqClassArcane}">${curRow.arcane}</td>
                    <td class="displayColHitType leftAlign">${curRow.arBreakdown}</td>
                </tr>
            `;
        }

        this.contentElement.innerHTML = `
        <table id="spellList">
            <thead>
                <tr>
                    <th class="displayColName">Name</th>
                    <th class="displayColType">Type</th>
                    <th class="displayColDmgType">DMG Type</th>
                    <th class="displayColType">Note</th>
                    <th class="displayColFP">FP</th>
                    <th class="displayColHitCount">Hits</th>
                    <th class="displayColARDmg">Net AR</th>
                    <th class="displayColARDmg">Net AR/FP</th>
                    <th class="displayColARDmg">Net DMG</th>
                    <th class="displayColARDmg">Net DMG/FP</th>
                    <th class="displayColType">Charge?</th>
                    <th class="displayColType">Chain?</th>
                    <th class="displayColType">Followup?</th>
                    <th class="displayColType">Channel?</th>
                    <th class="displayColType">Movement?</th>
                    <th class="displayColType">Horseback?</th>
                    <th class="displayColStat">Int</th>
                    <th class="displayColStat">Fai</th>
                    <th class="displayColStat">Arc</th>
                    <th class="displayColStat leftAlign">Base AR Breakdown</th>
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

        this.controlStaff.addEventListener("change", this.toolStaffChange.bind(this));
        this.controlSeal.addEventListener("change", this.toolSealChange.bind(this));

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

        this.scalingDisplayStaff = document.getElementById("scalingStaff");
        this.scalingDisplaySeal = document.getElementById("scalingSeal");

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