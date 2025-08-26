function setupBase(player)	// inside hackNetOff()
{
	if (baseType === CAMP_CLEAN)
	{
		completeResearchOnTime(cleanTech, player);
	}
	else if (baseType === CAMP_BASE)
	{
		completeResearchOnTime(timeBaseTech, player);
	}
	else // CAMP_WALLS
	{
		completeResearchOnTime(timeAdvancedBaseTech, player);
	}
}
