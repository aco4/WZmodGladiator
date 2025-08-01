const {
    x: initialScrollLimitMinX,
    y: initialScrollLimitMinY,
    x2: initialScrollLimitMaxX,
    y2: initialScrollLimitMaxY,
} = getScrollLimits();

const initialScrollLimitDiameter = Math.min(
    initialScrollLimitMaxX - initialScrollLimitMinX,
    initialScrollLimitMaxY - initialScrollLimitMinY,
);
const initialScrollLimitRadius = initialScrollLimitDiameter / 2;

function gladiatorSetup() {
    // Mission timer
    setMissionTime(CONFIG.preparationTimeSeconds);

    hackNetOff();
    for (let player = 0; player < maxPlayers; player++) {
        if (!isSpectator(player)) {
            if (CONFIG.mapVisionReveal) {
                addSpotter(...mapCenter(), player, initialScrollLimitRadius*128, false, 0);
            }
            setExperienceModifier(player, CONFIG.experienceModifier);
            setPower(CONFIG.startingPower, player);
            setDroidLimit(player, CONFIG.droidLimitAny, DROID_ANY);
            setDroidLimit(player, CONFIG.droidLimitCommand, DROID_COMMAND);
            setDroidLimit(player, CONFIG.droidLimitConstruct, DROID_CONSTRUCT);
            Object.entries(CONFIG.structureLimits).forEach(([key, value]) => {
                setStructureLimits(key, value, player);
            });
            CONFIG.giveResearch.forEach(res => {
                completeResearch(res, player);
            });
        }
    }
    hackNetOn();

    // Starting camera position
    if (!isSpectator(selectedPlayer)) {
        let [x, y] = findFactory();
        centreView(x, y);
    }

    // Starting messages
    queue("message1", 8*1000); // run this function 8 seconds later
    queue("message2", 13*1000); // run this function 13 seconds later
}

function mapCenter() {
    return [Math.floor(mapWidth / 2), Math.floor(mapHeight / 2)];
}

// Locate the (x, y) position of the player's factory
function findFactory() {
    if (isSpectator(selectedPlayer)) {
        return;
    }
    for (s of enumStruct(selectedPlayer, FACTORY)) {
        return [s.x, s.y];
    }
    return [0, 0];
}
