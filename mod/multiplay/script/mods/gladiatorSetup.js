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
    if (!isSpectator(me)) {
        let [x, y] = findDroid();
        centreView(x, y);
    }

    // Remove irrelevant structures and features
    // Execute twice to fully remove oil derricks
    queue("clean");
    queue("clean", 500);

    queue("initReticules", 1 * 1000);

    if (CONFIG.mapShrinkEnabled) {
        setTimer("shrinkMap", CONFIG.shrinkIntervalMilliseconds);
    }
    setTimer("fireLassat", CONFIG.lassatIntervalMilliseconds);
}

function mapCenter() {
    return [Math.floor(mapWidth / 2), Math.floor(mapHeight / 2)];
}

// Return the [x, y] position of any droid belonging to the current player
function findDroid() {
    if (isSpectator(me)) {
        return;
    }
    for (d of enumDroid(me)) {
        return [d.x, d.y];
    }
    return [0, 0];
}

function initReticules() {
    setReticuleButton(1, _("Transport (F1)"), "image_manufacture_up.png", "image_manufacture_down.png");
    setReticuleFlash(2, true); // Research
}

// Remove irrelevant structures and features
function clean() {
    hackNetOff();
    const REMOVE_STRUCTS = [POWER_GEN, VTOL_FACTORY, RESOURCE_EXTRACTOR, COMMAND_CONTROL];
    for (let player = 0; player < maxPlayers; player++) {
        enumStruct(player).forEach(s => {
            if (REMOVE_STRUCTS.includes(s.stattype)) {
                removeObject(s);
            }
        });
    }
    enumFeature(ALL_PLAYERS).forEach(f => removeObject(f));
    hackNetOn();
}
