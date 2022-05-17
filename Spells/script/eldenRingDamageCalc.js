class eldenRingDamageCalc
{
    static reduceARByAllDefenses(aAttackRating, aDefense, aNegation)
    {
        return this.reduceARByNegation(this.reduceARByDefense(aAttackRating, aDefense), aNegation);
    }

    static reduceARByNegation(aAttackRating, aNegation)
    {
        return aAttackRating * ((100 - aNegation) / 100);
    }

	static reduceARByDefense(aAttackRating, aDefense)
    {
        if (aDefense > (aAttackRating * 8))
        {
            return aAttackRating * 0.1;
        } else if (aDefense > aAttackRating) {
            return (19.2/49 * Math.pow((aAttackRating / aDefense - 0.125), 2) + 0.1) * aAttackRating;
        } else if (aDefense > (aAttackRating * 0.4))
        {
            return (-0.4/3 * Math.pow((aAttackRating / aDefense - 2.5), 2) + 0.7) * aAttackRating;
        } else if (aDefense > (aAttackRating * 0.125) )
        {
            return (-0.8/121 * Math.pow((aAttackRating / aDefense - 8), 2) + 0.9) * aAttackRating;
        } else
        {
            return aAttackRating * 0.9;
        }
    }
}