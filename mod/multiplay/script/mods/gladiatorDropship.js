namespace("Dropship_");

// Setup configuration variables
const SPAWN_INTERVAL_SECONDS = CONFIG.dropshipSpawnIntervalSeconds;
const SPAWN_COUNT = CONFIG.dropshipSpawnCount;
const DROPSHIP_UPDATE_INTERVAL_SECONDS = CONFIG.dropshipUpdateIntervalSeconds;
const DROP_SHAPE = CONFIG.dropshipDropShape;
const DROP_COUNT = DROP_SHAPE.flat().reduce((a, b) => a + b, 0);

////////////////////////////////////////////////////////////////////////////////

class Dropship {
    objectives; // Array of Objective objects
    curr = 0; // Current objective (represented as an index in objectives)
    droidID;
    onDeath;
    onMissionComplete;

    constructor(player, x, y, objectives, onDeath, onMissionComplete, isCyborgTransport = false) {
        this.objectives = objectives;
        this.onDeath = onDeath;
        this.onMissionComplete = onMissionComplete;

        hackNetOff();
        const body = isCyborgTransport ? "TransporterBody" : "SuperTransportBody";
        const droid = addDroid(player, x, y, "Dropship", body, "V-Tol", "", "", ["Null-VTOL-Transport-Turret"]);
        hackNetOn();

        this.droidID = droid?.id;
    }

    // Main update routine
    update() {
        if (this.dead) {
            this.onDeath(this); // TODO this gets called each time the Dropship is updated!
            return;
        }
        if (this.currentObjective.isComplete(this)) {
            this.completeObjective();
        } else {
            this.move();
        }
    }

    completeObjective() {
        this.currentObjective.onComplete(this);
        this.curr++;

        if (this.isMissionComplete) {
            this.onMissionComplete(this);
        } else {
            this.move();
        }
    }

    move() {
        const { x, y } = this.currentObjective.getLocation(this);
        hackNetOff();
        orderDroidLoc(this.droid, DORDER_MOVE, x, y);
        hackNetOn();
    }

    kill() {
        hackNetOff();
        removeObject(this.droid, true); // sfx
        hackNetOn();
    }

    despawn() {
        hackNetOff();
        removeObject(this.droid, false); // no sfx
        hackNetOn();
    }

    get isMissionComplete() {
        return this.curr >= this.objectives.length;
    }
    get currentObjective() {
        return this.objectives[this.curr];
    }
    get alive() {
        return this.droid != null;
    }
    get dead() {
        return this.droid == null;
    }
    get droid() {
        return getDroidByID(this.droidID);
    }
    get player() {
        return getDroidByID(this.droidID)?.player;
    }
}


////////////////////////////////////////////////////////////////////////////////


const dropships = new Set();

function dropshipSetup() {
    playSound("pcv440.ogg"); // "Reinforcements are available"
    setTimer("spawnDropships", SPAWN_INTERVAL_SECONDS * 1000);
    setTimer("updateDropships", DROPSHIP_UPDATE_INTERVAL_SECONDS * 1000);
}

// TODO make VTOL fly into the map instead
// TODO also make cyborg transport fly in too.
// TODO need to split the 9 units between all 3 types
function spawnDropships() {
    for (let player = 0; player < maxPlayers; player++) {
        for (let i = 0; i < SPAWN_COUNT; i++) {
            if (hasNonTransporterDroid(player) && !hasDropship(player)) {
                spawnDropship(player);
            }
        }
        if (player === me) {
            playSound("pcv441.ogg"); // "Reinforcements in transit"
        }
    }
}

function updateDropships() {
    dropships.forEach(d => d.update());
}

function spawnDropship(player) {
    const targetDroid = pickTargetDroid(player);
    if (!targetDroid) {
        return;
    }
    const dropLocation = pickDropLocation(player, targetDroid);
    const spawnLocation = onBorder(dropLocation.x, dropLocation.y, margin = -10);
    const departLocation = spawnLocation;
    const cargo = pickCargo(player);
    const objectives = [
        {
            getLocation: (dropship) => {
                const updatedLocation = pickDropLocation(player, targetDroid);
                if (updatedLocation) {
                    dropLocation.x = updatedLocation.x;
                    dropLocation.y = updatedLocation.y;
                }
                return dropLocation;
            },
            isComplete: (dropship) => isDroidAt(dropship.droid, dropLocation.x, dropLocation.y),
            onComplete: (dropship) => {
                if (dropship.player === me) {
                    playSound("pcv442.ogg"); // "Reinforcements landing"
                }

                const updatedCargo = pickCargo(dropship.player, cargo);

                hackNetOff();
                let i = 0;
                for (let row = 0; row < DROP_SHAPE.length; row++) {
                    for (let col = 0; col < DROP_SHAPE[row].length; col++) {
                        for (let count = 0; count < DROP_SHAPE[row][col]; count++) {
                            const x = dropLocation.x - 1 + col;
                            const y = dropLocation.y - 1 + row;
                            const droid = updatedCargo?.[i++];
                            if (droid) {
                                const turrets = getTurrets(droid);
                                addDroid(dropship.player, x, y, droid.name, droid.body, droid.propulsion, "", "", turrets);
                            } else {
                                addDroid(dropship.player, x, y, "Truck Viper Wheels", "Body1REC", "wheeled01", "", "", ["Spade1Mk1"]);
                            }

                        }
                    }
                }
                hackNetOn();

                if (hasConstructionDroid(dropship.player) && dropship.player === me) {
                    setReticuleButton(3, _("Build (F3)"), "image_build_up.png", "image_build_down.png");
                }
            },
        },
        {
            getLocation: (dropship) => onBorder(dropship.droid.x, dropship.droid.y, margin = -10),
            isComplete: (dropship) => isDroidNearBorder(dropship.droid),
            onComplete: (dropship) => dropship.despawn(),
        },
    ];

    dropships.add(new Dropship(
        /* player            = */ player,
        /* spawnLocation     = */ spawnLocation.x, spawnLocation.y,
        /* objectives        = */ objectives,
        /* onDeath           = */ (dropship) => dropships.delete(dropship),
        /* onMissionComplete = */ () => {},
        /* isCyborgTransport = */ false,
    ));
}

// Returns an array of droids to be dropped (the dropship's "cargo")
// Returns the fallback in case of failure
function pickCargo(player, fallback = null) {
    const factories = getAllFactories(player);
    const droids = factories
                  .map(f => getDroidProduction(f))
                  .filter(d => d != null && getTurrets(d));
    if (droids.length > 0) {
        return Array.from({ length: DROP_COUNT }, () => pick(droids));
    } else if (hasCombatDroid(player)) {
        return pickCombatDroids(player, DROP_COUNT);
    } else {
        return fallback;
    }
}

// Return { x, y } of a droid, or null on failure (it died)
function pickDropLocation(player, targetDroid) {
    targetDroid = getDroidByID(targetDroid.id);
    if (!targetDroid) {
        return null;
    }
    // Find empty 3x3 area
    const safeLocation = pickStructLocation(
        targetDroid,
        "A0HardcreteMk1Wall",
        targetDroid.x, targetDroid.y
    );
    return safeLocation || { x: targetDroid.x, y: targetDroid.y };
}

// The dropship will pick a random droid and use its {x, y} as the dropLocation
function pickTargetDroid(player) {
    return pick(enumDroid(player).filter(droid =>
        !droid.isVTOL && droid.droidType !== DROID_SUPERTRANSPORTER && droid.droidType !== DROID_TRANSPORTER
    ));
}

////////////////////////////////////////////////////////////////////////////////

// Identify a droid's turret, if possible
// Returns an array on success, null otherwise
function getTurrets(droid) {
    // Return null for turrets we cannot reliably identify (e.g. Wide Spectrum Sensor)
    switch (droid.droidType) {
        case DROID_WEAPON:    return droid.weapons.map(w => w.id);
        case DROID_CYBORG:    return droid.weapons.map(w => w.id);
        case DROID_CONSTRUCT: return droid.propulsion === "CyborgLegs" ? ["CyborgSpade"] : ["Spade1Mk1"];
        case DROID_REPAIR:    return droid.propulsion === "CyborgLegs" ? ["CyborgRepair"] : null;
        default:              return null;
    }
}

// Snap (x, y) to the nearest border
// Optional margin specifying an offset (e.g. 2 tiles inwards, -3 tiles outward)
function onBorder(x, y, margin = 0) {
    const { x: x1, y: y1, x2, y2 } = getScrollLimits();

    // Distances to each border
    const distLeft   = Math.abs(x - x1);
    const distRight  = Math.abs(x2 - x);
    const distTop    = Math.abs(y - y1);
    const distBottom = Math.abs(y2 - y);

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) {
        x = x1 + margin;
    } else if (minDist === distRight) {
        x = x2 - margin;
    } else if (minDist === distTop) {
        y = y1 + margin;
    } else { // bottom
        y = y2 - margin;
    }

    return {
        x: Math.max(0, Math.min(mapWidth, x)),
        y: Math.max(0, Math.min(mapHeight, y)),
    };
}

// Returns the closest border to x, y
function closestBorder(x, y) {
    const { x: x1, y: y1, x2, y2 } = getScrollLimits();

    // Distances to each border
    const distLeft   = Math.abs(x - x1);
    const distRight  = Math.abs(x2 - x);
    const distTop    = Math.abs(y - y1);
    const distBottom = Math.abs(y2 - y);

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) {
        return "WEST";
    } else if (minDist === distRight) {
        return "EAST";
    } else if (minDist === distTop) {
        return "NORTH"
    } else {
        return "SOUTH";
    }
}

// Returns a location on the border that is near (x, y)
function pickLocationOnBorder(x, y) {
    const { x: x1, y: y1, x2, y2 } = getScrollLimits();
    const MARGIN = 1;
    switch (syncRandom(4)) {
        case 0: return { x: fuzz(x, x1+1, x2-1), y: y1+MARGIN };
        case 1: return { x: fuzz(x, x1+1, x2-1), y: y2-MARGIN };
        case 2: return { x: x1+MARGIN, y: fuzz(y, y1+1, y2-1) };
        case 3: return { x: x2-MARGIN, y: fuzz(y, y1+1, y2-1) };
    }
}

// fuzz(8, 0, 8) returns a number in the interval [4, 8]
// fuzz(7, 0, 8) returns a number in the interval [4, 8]
// fuzz(6, 0, 8) returns a number in the interval [4, 8]
// fuzz(5, 0, 8) returns a number in the interval [3, 7]
// fuzz(4, 0, 8) returns a number in the interval [2, 6]
// fuzz(3, 0, 8) returns a number in the interval [1, 5]
// fuzz(2, 0, 8) returns a number in the interval [0, 4]
// fuzz(1, 0, 8) returns a number in the interval [0, 4]
// fuzz(0, 0, 8) returns a number in the interval [0, 4]
// WARNING only works for ranges >= 8
function fuzz(n, min, max) {
    const range = max - min;
    const radius = Math.floor(range / 8); // <--- configurable

    let start = n - radius;
    let end = n + radius;

    // Clamp window to [min, max]
    if (start < min) {
        end += min - start;
        start = min;
    }
    if (end > max) {
        start -= end - max;
        end = max;
    }

    return start + syncRandom(end - start + 1);
}

// Check if the given droid is at x, y
function isDroidAt(droid, x, y, margin = 1) {
    const objects = enumArea(
        x - margin,
        y - margin,
        x + margin,
        y + margin,
        ALL_PLAYERS,
        false
    );
    return objects.some(o => o.id === droid.id);
}

function isDroidNearBorder(droid, margin = 1) {
    const { x, y, x2, y2 } = getScrollLimits();
    return droid.x <= x + margin
        || droid.y <= y + margin
        || droid.x >= x2 - margin
        || droid.y >= y2 - margin;
}

// Get an updated reference to the droid with the given id
function getDroidByID(id) {
    for (let player = 0; player < maxPlayers; player++) {
        const droid = getObject(DROID, player, id);
        if (droid) {
            return droid;
        }
    }
    return null;
}

// Pick a random element from an array
function pick(arr, synced = true) {
    if (!arr || arr.length === 0) {
        return null;
    }
    if (synced) {
        return arr[syncRandom(arr.length)];
    } else {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}

function pickCombatDroids(player, count) {
    const combatDroids = getCombatDroids(player);
    return Array.from({ length: count }, () => pick(combatDroids));
}

function getCombatDroids(player) {
    return [...enumDroid(player, DROID_WEAPON), ...enumDroid(player, DROID_CYBORG)];
}

function getAllFactories(player) {
    return [...enumStruct(player, FACTORY), ...enumStruct(player, CYBORG_FACTORY), ...enumStruct(player, VTOL_FACTORY)];
}

function hasCombatDroid(player) {
    return getCombatDroids(player).length > 0;
}

function hasConstructionDroid(player) {
    return enumDroid(player, DROID_CONSTRUCT).length > 0;
}

function hasNonTransporterDroid(player) {
    const TRANSPORTERS = [DROID_TRANSPORTER, DROID_SUPERTRANSPORTER];
    return enumDroid(player).filter(d => !TRANSPORTERS.includes(d.droidType)).length > 0
}

function hasDropship(player) {
    for (const dropship of dropships) {
        if (dropship.player === player) {
           return true;
        }
    }
    return false;
}
