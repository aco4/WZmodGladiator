namespace("gladiator_");

function gladiator_eventStartLevel() {
    gladiatorSetup();
    dropshipSetup();
}

// TODO make players start with VTOL factory if techLevel > 1
function gladiator_eventResearched(research, structure, player) {
    if (CONFIG.vtolEnabled && research.id === "R-Vehicle-Prop-VTOL") { // VTOL Propulsion
        // TODO replace hardcoded location with wzapi::structureCanFit (4.6.0)
        // TODO automatically choose a spot near startPosition maybe
        const position = playerData[player].position; // Get the position of the player in the setup screen
        const { x, y } = CONFIG.vtolFactorySpawnPositions[position];
        hackNetOff();
        setStructureLimits("A0VTolFactory1", 1, player);
        addStructure("A0VTolFactory1", player, x*128, y*128);
        addStructure("A0FacMod1", player, x*128, y*128);
        addStructure("A0FacMod1", player, x*128, y*128);
        hackNetOn();
    }
}
