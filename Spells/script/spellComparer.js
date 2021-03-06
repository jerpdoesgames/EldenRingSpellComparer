const {
    SORT_NAME, SORT_FP_COST, SORT_AR_NET, SORT_DAMAGE_NET, SORT_AR_FP_NET, SORT_DMG_FP,
    ATTACK_INDEX_MAX
} = ELDEN_RING_TOOLS_CONSTANTS.SPELL_COMPARER;

class spellComparer
{
    updateOnChange = true;  // Disabled temporarily when modifying input fields without user intervention
    configuration = PlayerConfigStorage.getInstance().getConfig();

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
        const schoolIndex = parseInt(aEvent.target.id.substring(12));
        const school = spellSchools[schoolIndex];
        const activeCount = this.getSchoolActive(school.magicEffectCategory);
        this.configuration.schoolActive[school.magicEffectCategory] = activeCount >= 1 ? 0 : 1;

        if (this.updateOnChange)
            this.updateDisplay();
    }

    defenseControlInput(aEvent)
    {
        let statIndex = parseInt(aEvent.target.id.substring(18));
        this.configuration.damageTypes[statIndex].defense = parseInt(this.defenseControls[statIndex].value);

        if (this.updateOnChange)
            this.updateDisplay();
    }

    negationControlInput(aEvent)
    {
        let statIndex = parseInt(aEvent.target.id.substring(19));
        this.configuration.damageTypes[statIndex].negation = parseFloat(this.negationControls[statIndex].value);

        if (this.updateOnChange)
            this.updateDisplay();
    }

    statControlInput(aEvent)
    {
        let statName = aEvent.target.id;
        let stat = this.configuration.stats.find(it => it.name == statName);
        stat.value = parseInt(aEvent.target.value);

        if (this.updateOnChange)
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

        if (this.updateOnChange)
            this.updateDisplay();
    }

    toolFilterChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.filter = controlValue;

        if (this.updateOnChange)
            this.updateDisplay();
    }


    toolStaffChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.selectedStaff = controlValue;

        if (this.updateOnChange)
            this.updateDisplay();
    }

    toolSealChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.selectedSeal = controlValue;

        if (this.updateOnChange)
            this.updateDisplay();
    }

    onSortChange(aEvent)
    {
        let controlValue = parseInt(aEvent.target.value);
        this.configuration.sort = controlValue;

        if (this.updateOnChange)
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

    getSchoolActive(aMagicEffectCategory)
    {
        return this.configuration.schoolActive.hasOwnProperty(aMagicEffectCategory) ? this.configuration.schoolActive[aMagicEffectCategory] : 0 ;
    }

    updateSchoolChecks()
    {
        for (const curSchool of spellSchools)
        {
            let activeCount = this.getSchoolActive(curSchool.magicEffectCategory);
            if (activeCount == 2)
            {
                curSchool.control.classList.add("schoolsContainerEntrySelected2");
                curSchool.control.classList.remove("schoolsContainerEntrySelected1");
            }
            else if (activeCount == 1)
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

    sortBy(property, sortOrder)
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

        // Call setConfig to persist current settings in localStorage (as a side effect)
        PlayerConfigStorage.getInstance().setConfig(this.configuration);

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

        const directDamageRows = [];
        const otherSpellRows = [];

        for (const curSpell of spellData)
        {
            if (this.configuration.filter == SPELL_TYPE_ALL || this.configuration.filter == curSpell.toolType)
            {
                const reqMetIntelligence = (this.configuration.stats[STAT_INTELLIGENCE].value >= curSpell.intelligence);
                const reqMetFaith = (this.configuration.stats[STAT_FAITH].value >= curSpell.faith);
                const reqMetArcane = (this.configuration.stats[STAT_ARCANE].value >= curSpell.arcane);
                const requirementsMet = reqMetIntelligence && reqMetFaith && reqMetArcane;

                if (curSpell.hitData.length > 0)
                {
                    let curTool = curSpell.toolType == SPELL_TYPE_SORCERY ? selectedStaff : selectedSeal;
                    let hitDisplayEntries = [];

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
                                const activeCount = this.getSchoolActive(element.magicEffectCategory);
                                if (activeCount >= 1)
                                {
                                    schoolMultiplier *= element.schoolMultiplier;
                                }
                                break;
                            }
                        }
                    }

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

                    const useChargedAR = this.configuration.useChargedAR && curSpell.allowCharge;
                    const maxAttackIndex = curSpell.hitData.reduce((a, b) => Math.max(a, b.attackIndex), -1);

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
                        for (const curDisplayEntry of curSpell.hitDisplayData)
                        {
                            let hitEntries = [];

                            for (const hit of curDisplayEntry.componentHits)
                            {
                                let foundHitData = this.getMatchingHitData(curSpell.hitData, hit.attackIndex, hit.hitIndex);
                                if (foundHitData != null)
                                {
                                    hitEntries.push(foundHitData);
                                }
                            }

                            const dataToAdd = this.combineHitData(hitEntries, -1, useChargedAR, spellBuffMultiplier, curDisplayEntry.fpCostOverride, (maxAttackIndex > 0));

                            if (curDisplayEntry.note != null && curDisplayEntry.note != "")
                            {
                                dataToAdd.hitNote = curDisplayEntry.note;
                            }
                            hitDisplayEntries.push(dataToAdd);
                        }
                    }

                    const toolTypestring = curSpell.toolType == SPELL_TYPE_SORCERY ? "Sorcery" : "Incantation";
                    for (const curDisplayEntry of hitDisplayEntries)
                    {

                        let useFPCost = curDisplayEntry.fpCostOverride > 0 ? curDisplayEntry.fpCostOverride : curSpell.fpCostBase;
                        useFPCost = Math.ceil(curTool.fpCostMultiplier * useFPCost);

                        const schoolBoostedDamage = curDisplayEntry.netDamage * schoolMultiplier;
                        const netDamageFP = schoolBoostedDamage / useFPCost;
                        const netARFP = curDisplayEntry.netAR / useFPCost;
                        const attackIndexString = (curDisplayEntry.attackIndex != null && curDisplayEntry.attackIndex >= 0) ? ` (${curDisplayEntry.attackIndex + 1})` : "";

                        directDamageRows.push({
                            name: curSpell.name + attackIndexString,
                            type: toolTypestring,
                            damageType: curDisplayEntry.damageType,
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
                            arBreakdown: curDisplayEntry.arBreakdown,
                            reqMetIntelligence: reqMetIntelligence,
                            reqMetFaith: reqMetFaith,
                            reqMetArcane: reqMetArcane,
                            requirementsMet: requirementsMet
                        });
                    }
                }
                else
                {
                    // Spells that don't deal direct damage / don't have hit data
                    const toolTypestring = curSpell.toolType == SPELL_TYPE_SORCERY ? "Sorcery" : "Incantation";
                    otherSpellRows.push({
                        name: curSpell.name,
                        type: toolTypestring,
                        fpCost: curSpell.fpCostBase,
                        intelligence: curSpell.intelligence,
                        faith: curSpell.faith,
                        arcane: curSpell.arcane,
                        allowCharge: curSpell.allowCharge,
                        allowChain: curSpell.allowChain,
                        allowFollowup: curSpell.allowFollowup,
                        allowChannel: curSpell.allowChannel,
                        allowMovement: curSpell.allowMovement,
                        allowHorseback: curSpell.allowHorseback,
                        reqMetIntelligence: reqMetIntelligence,
                        reqMetFaith: reqMetFaith,
                        reqMetArcane: reqMetArcane,
                        requirementsMet: requirementsMet
                    });

                }
            }
        }

        otherSpellRows.sort(this.sortBy("name", "asc"));
        otherSpellRows.sort(this.sortBy("requirementsMet", "desc"));

        switch(this.configuration.sort)
        {
            case SORT_NAME:
                directDamageRows.sort(this.sortBy("name", "asc"));
                break;
            case SORT_FP_COST:
                directDamageRows.sort(this.sortBy("fpCost", "desc"));
                break;
            case SORT_AR_NET:
                directDamageRows.sort(this.sortBy("netAR", "desc"));
                break;
            case SORT_DAMAGE_NET:
                directDamageRows.sort(this.sortBy("netDamage", "desc"));
                break;
            case SORT_AR_FP_NET:
                directDamageRows.sort(this.sortBy("netARFP", "desc"));
                break;
            case SORT_DMG_FP:
                directDamageRows.sort(this.sortBy("netDamageFP", "desc"));
                break;
        }

        directDamageRows.sort(this.sortBy("requirementsMet", "desc"));

        let directDamageOutput = "";

        for (const curRow of directDamageRows)
        {
            const disabledClass = !curRow.requirementsMet ? ` class="disabled"` : "";
            const reqClassIntelligence = curRow.reqMetIntelligence ? "" : "requirementUnmet";
            const reqClassFaith = curRow.reqMetFaith ? "" : "requirementUnmet";
            const reqClassArcane = curRow.reqMetArcane ? "" : "requirementUnmet";

            const damageTypeString = this.getDamageTypeString(curRow.damageType);
            const damageTypeClass = (curRow.damageType != DAMAGE_PHYSICAL) ? ` class="damageType${damageTypeString}"` : "";

            directDamageOutput += `
                <tr${disabledClass}>
                    <td class="displayColName">${curRow.name}</td>
                    <td class="spellType${curRow.type}">${curRow.type}</td>
                    <td${damageTypeClass}>${damageTypeString}</td>
                    <td>${curRow.hitNote}</td>
                    <td>${curRow.fpCost}</td>
                    <td>${curRow.hitCount}</td>
                    <td>${this.formatDamageForDisplay(curRow.netAR)}</td>
                    <td>${this.formatDamageForDisplay(curRow.netARFP)}</td>
                    <td>${this.formatDamageForDisplay(curRow.netDamage)}</td>
                    <td>${this.formatDamageForDisplay(curRow.netDamageFP)}</td>
                    <td>${this.checkFromBool(curRow.allowCharge)}</td>
                    <td>${this.checkFromBool(curRow.allowChain)}</td>
                    <td>${this.checkFromBool(curRow.allowFollowup)}</td>
                    <td>${this.checkFromBool(curRow.allowChannel)}</td>
                    <td>${this.checkFromBool(curRow.allowMovement)}</td>
                    <td>${this.checkFromBool(curRow.allowHorseback)}</td>
                    <td class="${reqClassIntelligence}">${curRow.intelligence}</td>
                    <td class="${reqClassFaith}">${curRow.faith}</td>
                    <td class="${reqClassArcane}">${curRow.arcane}</td>
                    <td class="leftAlign">${curRow.arBreakdown}</td>
                </tr>
            `;
        }

        this.directDamageListContainer.innerHTML = `
        <table id="spellList">
            <thead>
                <tr>
                    <th class="displayColName">Name</th>
                    <th>Type</th>
                    <th>DMG Type</th>
                    <th>Note</th>
                    <th>FP</th>
                    <th>Hits</th>
                    <th>Net AR</th>
                    <th>Net AR/FP</th>
                    <th>Net DMG</th>
                    <th>Net DMG/FP</th>
                    <th>Charge?</th>
                    <th>Chain?</th>
                    <th>Followup?</th>
                    <th>Channel?</th>
                    <th>Movement?</th>
                    <th>Horseback?</th>
                    <th>Int</th>
                    <th>Fai</th>
                    <th>Arc</th>
                    <th class="leftAlign">Base AR Breakdown</th>
                </tr>
            </thead>
            <tbody>
                ${directDamageOutput}
            </tbody>
        </table>
        `;

        let otherSpellOutput = "";

        for (const curRow of otherSpellRows)
        {
            const disabledClass = !curRow.requirementsMet ? ` class="disabled"` : "";

            const reqClassIntelligence = curRow.reqMetIntelligence ? "" : "requirementUnmet";
            const reqClassFaith = curRow.reqMetFaith ? "" : "requirementUnmet";
            const reqClassArcane = curRow.reqMetArcane ? "" : "requirementUnmet";

            otherSpellOutput += `
                <tr${disabledClass}>
                    <td class="displayColName">${curRow.name}</td>
                    <td class="spellType${curRow.type}">${curRow.type}</td>
                    <td>${curRow.fpCost}</td>
                    <td>${this.checkFromBool(curRow.allowCharge)}</td>
                    <td>${this.checkFromBool(curRow.allowChannel)}</td>
                    <td>${this.checkFromBool(curRow.allowMovement)}</td>
                    <td>${this.checkFromBool(curRow.allowHorseback)}</td>
                    <td class="${reqClassIntelligence}">${curRow.intelligence}</td>
                    <td class="${reqClassFaith}">${curRow.faith}</td>
                    <td class="${reqClassArcane}">${curRow.arcane}</td>
                </tr>
            `;
        }

        this.otherSpellsListContainer.innerHTML = `
        <table id="spellList">
            <thead>
                <tr>
                    <th class="displayColName">Name</th>
                    <th>Type</th>
                    <th>FP</th>
                    <th>Charge?</th>
                    <th>Channel?</th>
                    <th>Movement?</th>
                    <th>Horseback?</th>
                    <th>Int</th>
                    <th>Fai</th>
                    <th>Arc</th>
                </tr>
            </thead>
            <tbody>
                ${otherSpellOutput}
            </tbody>
        </table>
        `;

    }

    initialize()
    {
        this.directDamageListContainer = document.getElementById("outputDirectDamage");
        this.otherSpellsListContainer = document.getElementById("outputOtherSpells");

        if (this.configuration.schoolActive == null)
        {
            this.configuration.schoolActive = {};
        }

        this.initializeStaffAndSealControls();
        this.initializeDefenseAndNegation();
        this.initializeMainStats();
        this.initializeUpgrades();
        this.initializeSpellTypeAndSorting();
        this.initializeStaffAndSealScaling();
        this.initializeSpellSchools();

        this.populateStaffList();
        this.populateSealList();

        this.applyLoadedValues();
        this.updateDisplay();
    }

    initializeStaffAndSealScaling()
    {
        this.scalingDisplayStaff = document.getElementById("scalingStaff");
        this.scalingDisplaySeal = document.getElementById("scalingSeal");
    }

    initializeStaffAndSealControls()
    {
        this.controlStaff = document.getElementById("controlStaff");
        this.controlSeal = document.getElementById("controlSeal");
        this.controlStaff.addEventListener("change", this.toolStaffChange.bind(this));
        this.controlSeal.addEventListener("change", this.toolSealChange.bind(this));
    }

    initializeSpellTypeAndSorting()
    {
        this.controlSorting = document.getElementById("controlSorting");
        this.controlSpellType = document.getElementById("controlSpellType");
        this.controlSpellType.addEventListener("change", this.toolFilterChange.bind(this));
        this.controlSorting.addEventListener("change", this.onSortChange.bind(this));
    }

    initializeSpellSchools()
    {
        this.schoolsContainer = document.getElementById("schoolsContainer");
        this.populateSchoolList();

        for (let i = 0; i < spellSchools.length; i++)
        {
            spellSchools[i].control = document.getElementById("schoolSelect" + i);
            spellSchools[i].control.addEventListener("click", this.toggleSpellSchool.bind(this));
        }
    }

    initializeUpgrades()
    {
        this.regularSmithingStoneControl = document.getElementById("upgradeControl0");
        this.somberSmithingStoneControl = document.getElementById("upgradeControl1");
        this.regularSmithingStoneControl.addEventListener("change", this.upgradeControlInput.bind(this));
        this.somberSmithingStoneControl.addEventListener("change", this.upgradeControlInput.bind(this));
    }

    initializeMainStats()
    {
        this.statControls = ["strength", "dexterity", "intelligence", "faith", "arcane"];
        for (const controlId of this.statControls)
        {
            const control = document.querySelector("input#" + controlId);
            control.addEventListener("change", this.statControlInput.bind(this));
        }
    }

    initializeDefenseAndNegation()
    {
        this.defenseControls = [];
        for (let i = 0; i < this.configuration.damageTypes.length; i++)
        {
            this.defenseControls[i] = document.getElementById("statControlDefense" + i);
            this.defenseControls[i].addEventListener("change", this.defenseControlInput.bind(this));

        }

        this.negationControls = [];
        for (let i = 0; i < this.configuration.damageTypes.length; i++)
        {
            this.negationControls[i] = document.getElementById("statControlNegation" + i);
            this.negationControls[i].addEventListener("change", this.negationControlInput.bind(this));

        }
    }

    applyLoadedValues()
    {
        this.updateOnChange = false;
        this.regularSmithingStoneControl.value = this.configuration.weaponLevels.regular;
        this.somberSmithingStoneControl.value = this.configuration.weaponLevels.somber;

        this.controlSorting.value = this.configuration.sort;
        this.controlSpellType.value = this.configuration.filter;

        for (const controlId of this.statControls)
        {
            const control = document.querySelector("input#" + controlId);
            const stat = this.configuration.stats.find(it => it.name === controlId);
            control.value = parseInt(stat.value);
        }

        for (let i = 0; i < this.configuration.damageTypes.length; i++)
        {
            this.negationControls[i].value = this.configuration.damageTypes[i].negation;
            this.defenseControls[i].value = this.configuration.damageTypes[i].defense;
        }
        this.updateOnChange = true;
    }

    resetToDefaults()
    {
        this.configuration = PlayerConfigStorage.getDefaultConfig();
        this.applyLoadedValues();
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