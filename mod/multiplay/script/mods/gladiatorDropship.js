namespace("Dropship_");

const SPAWN_INTERVAL_SECONDS = CONFIG.dropshipSpawnIntervalSeconds;
const SPAWN_COUNT = CONFIG.dropshipSpawnCount;
const DROPSHIP_UPDATE_INTERVAL_SECONDS = CONFIG.dropshipUpdateIntervalSeconds;

const BORDER = Object.freeze({
    NORTH: 0,
    SOUTH: 1,
    EAST: 2,
    WEST: 3,
});

const DROP_SHAPE = CONFIG.dropshipDropShape;

const DROP_COUNT = DROP_SHAPE.flat().reduce((a, b) => a + b, 0);

class Dropship {
    objectives; // Array of Objective objects
    curr = 0; // Current objective (represented as an index in objectives)
    droidID;
    onDeath;
    onMissionComplete;

    constructor(player, x, y, objectives, onDeath, onMissionComplete) {
        this.objectives = objectives;
        this.onDeath = onDeath;
        this.onMissionComplete = onMissionComplete;

        hackNetOff();
        const droid = addDroid(player, x, y, "Dropship", "SuperTransportBody", "V-Tol", "", "", ["MG1-VTOL"]);
        hackNetOn();

        this.droidID = droid?.id;
    }

    // Main update routine
    update() {
        if (this.dead) {
            this.onDeath(this);
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

function spawnDropships() {
    for (let player = 0; player < maxPlayers; player++) {
        for (let i = 0; i < SPAWN_COUNT; i++) {
            if (hasDroid(player)) {
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
    const targetDroid = pick(enumDroid(player).filter(d => !d.isVTOL && d.droidType !== DROID_SUPERTRANSPORTER));
    if (!targetDroid) {
        return;
    }
    const dropLocation = { x: targetDroid.x, y: targetDroid.y };

    function pickLocationOnBorder() {
        const { x: x1, y: y1, x2, y2 } = getScrollLimits();
        const MARGIN = 1;
        switch (syncRandom(4)) {
            case 0: return { x: fuzz(dropLocation.x, x1+1, x2-1), y: y1+MARGIN };
            case 1: return { x: fuzz(dropLocation.x, x1+1, x2-1), y: y2-MARGIN };
            case 2:  return { x: x1+MARGIN, y: fuzz(dropLocation.y, y1+1, y2-1) };
            case 3:  return { x: x2-MARGIN, y: fuzz(dropLocation.y, y1+1, y2-1) };
        }
    }

    const spawnLocation = onBorder(dropLocation.x, dropLocation.y);
    const departLocation = onBorder(dropLocation.x, dropLocation.y);

    const objectives = [
        {
            getLocation: (dropship) => dropLocation,
            isComplete: (dropship) => isDroidAt(dropship.droid, dropLocation.x, dropLocation.y),
            onComplete: (dropship) => {
                if (dropship.player === me) {
                    playSound("pcv442.ogg"); // "Reinforcements landing"
                }

                // WARNING templates are not synced across clients!
                const templates = enumTemplates(dropship.player)
                                 .filter(t => t.droidType === DROID_WEAPON)
                                 .map(t => makeTemplate(dropship.player, t.fullname, t.body, t.propulsion, "", t.weapons))
                                 .filter(t => t != null)
                                 .slice(-2); // Only consider the 2 most recent templates

                let i = 0;
                for (let row = 0; row < DROP_SHAPE.length; row++) {
                    for (let col = 0; col < DROP_SHAPE[row].length; col++) {
                        for (let count = 0; count < DROP_SHAPE[row][col]; count++) {
                            const x = dropLocation.x - 1 + col;
                            const y = dropLocation.y - 1 + row;
                            if (dropship.player === me) {
                                // Use Math.random() instead of syncRandom for picking template
                                const droid = pick(templates, false);
                                // Serialize the picked template, and send it to everyone
                                const serializedDroid = serialize(droid);
                                syncRequest(serializedDroid, x, y, targetDroid);
                            }
                        }
                    }
                }

                if (hasConstructionDroid(dropship.player) && dropship.player === me) {
                    setReticuleButton(3, _("Build (F3)"), "image_build_up.png", "image_build_down.png");
                }
            },
        },
        {
            getLocation: (dropship) => departLocation,
            isComplete: (dropship) => isDroidNearBorder(dropship.droid),
            onComplete: (dropship) => dropship.despawn(),
        },
    ];

    const onDeath = (dropship) => dropships.delete(dropship);

    const dropship = new Dropship(player, spawnLocation.x, spawnLocation.y, objectives, onDeath, () => {});
    dropships.add(dropship);
}


////////////////////////////////////////////////////////////////////////////////

// Snap (x, y) to the nearest border
function onBorder(x, y) {
  const { x: x1, y: y1, x2, y2 } = getScrollLimits();

  // Distances to each border
  const distLeft   = Math.abs(x - x1);
  const distRight  = Math.abs(x2 - x);
  const distTop    = Math.abs(y - y1);
  const distBottom = Math.abs(y2 - y);

  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distLeft) {
      x = x1;
  } else if (minDist === distRight) {
      x = x2;
  } else if (minDist === distTop) {
      y = y1;
  } else {
      y = y2;
  }

  return { x, y };
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

function isCyborg(droid) {
    return droid.propulsion.toUpperCase().includes("CYBORG");
}

function pickCombatDroids(player, count) {
    const combatDroids = getCombatDroids(player);
    return Array.from({ length: count }, () => pick(combatDroids));
}

function pickNonCyborgTemplates(player, count) {
    const nonCyborgTemplates = getNonCyborgTemplates(player);
    return Array.from({ length: count }, () => pick(nonCyborgTemplates));
}

function pickCombatDroid(player) {
    return pick(getCombatDroids(player));
}

function pickDroid(player) {
    return pick(enumDroid(player));
}

function pickNonCyborgTemplate(player) {
    return pick(getNonCyborgTemplates(player));
}

function getCombatDroids(player) {
    return [...enumDroid(player, DROID_WEAPON), ...enumDroid(player, DROID_CYBORG)];
}

function getNonCyborgTemplates(player) {
    return enumTemplates(player).filter(t => !isCyborg(t));
}

function hasNonCyborgTemplate(player) {
    return enumTemplates(player).some(t => !isCyborg(t));
}

function hasTemplate(player) {
    return enumTemplates(player).length > 0;
}

function hasDroid(player) {
    return enumDroid(player).length > 0;
}

function hasCombatDroid(player) {
    return getCombatDroids(player).length > 0;
}

function hasConstructionDroid(player) {
    return enumDroid(player, DROID_CONSTRUCT).length > 0;
}
