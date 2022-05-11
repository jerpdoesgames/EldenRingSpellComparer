class eldenRingScalingCalc
{
	statNames = [
		"strength",
		"dexterity",
		"intelligence",
		"faith",
		"arcane"
	];

    damageTypeNames = [
        "physical",
        "magic",
        "fire",
        "lightning",
        "holy"
    ]

    getScalingMapByID(aMapID)
    {
        for (var i = 0; i < statScalingMap.length; i++)
        {
            if (statScalingMap[i].id == aMapID)
            {
                return statScalingMap[i];
            }
        }
    }

    isToolScaledByStat(aTool, aStatIndex, aDamageTypeIndex)
    {
        let scalingMap = this.getScalingMapByID(aTool.scalingMapID);
        return (scalingMap != null && scalingMap[this.damageTypeNames[aDamageTypeIndex]][this.statNames[aStatIndex]]);
    }

    isToolRequiredStatMet(aTool, aStatIndex, aStatValue)
    {
		let toolReq = aTool.requirements[this.statNames[aStatIndex]];
		return aStatValue >= toolReq;
    }

    calculateToolScalingForStat(aTool, aStatIndex, aDamageTypeIndex, aWeaponLevel)
    {
        let statIndex = aStatValue - 1;
        let scalingMap = this.getScalingMapByID(aTool.scalingMapID);
        if (scalingMap != null && scalingMap[this.damageTypeNames[aDamageTypeIndex]][this.statNames[aStatIndex]])
        {
            let calcCorrect = scalingPaths[aTool.scalingPath][statIndex];
            let statScaling = aTool.scalingEntries[aWeaponLevel][this.statNames[aStatIndex]]

            if (statScaling == 0)
                return 0;
            else
                return statScaling * calcCorrect;
        }
        else
        {
            return 0;
        }
    }	
}