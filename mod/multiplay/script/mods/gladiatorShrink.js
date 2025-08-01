// The map gets smaller
// Map shrink functions
// Lassat map border

// Scroll limits
let x1 = initialScrollLimitMinX;
let y1 = initialScrollLimitMinY;
let x2 = initialScrollLimitMaxX;
let y2 = initialScrollLimitMaxY;

function shrinkMap() {
    if (x2-x1 <= 16 && y2-y1 <= 16) {
        return;
    }
    setScrollLimits(++x1, ++y1, --x2, --y2);
    // setScrollLimits(x1++, y1++, x2--, y2--);

    kill();
}

function fireLassat() {
    // Pick a random border (north, south, east, or west)
    const [x, y] = (() => {
        switch (syncRandom(4)) {
            case 0: // north
                return [x1+syncRandom(x2 - x1), y1];
            case 1: // south
                return [x1+syncRandom(x2 - x1), y2];
            case 2: // east
                return [x2, y1+syncRandom(y2 - y1)];
            case 3: // west
                return [x1, y1+syncRandom(y2 - y1)];
        }
    })();
    fireWeaponAtLoc("LasSat", x, y, scavengerPlayer);

    // Fire on all 4 borders
    // fireWeaponAtLoc("LasSat", x1+syncRandom(x2 - x1), y1, scavengerPlayer);
    // fireWeaponAtLoc("LasSat", x1+syncRandom(x2 - x1), y2, scavengerPlayer);
    // fireWeaponAtLoc("LasSat", x2, y1+syncRandom(y2 - y1), scavengerPlayer);
    // fireWeaponAtLoc("LasSat", x1, y1+syncRandom(y2 - y1), scavengerPlayer);
}

// Blow up droids outside the scroll limits
function kill() {
    for (let player = 0; player < maxPlayers; player++) {
        if (!isSpectator(player)) {
            enumDroid(player).forEach((d) => {
                if (out_of_bounds(d)) {
                    removeObject(d, true);
                }
            });
        }
    }
}

function out_of_bounds(obj) {
    return obj.x <= x1 || obj.y <= y1 || obj.x >= x2 || obj.y >= y2;
}
