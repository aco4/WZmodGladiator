// Scroll limits
let x1 = 40;
let y1 = 40;
let x2 = 210;
let y2 = 210;

const num_voters = count_voters(); // number of eligible voters
const vote_threshold = Math.floor(num_voters / 2); // number of votes needed to add more time
let votes = Array(num_voters).fill(false); // keep track of who voted

namespace("gladiator_");

function gladiator_eventGameInit() {
    receiveAllEvents(true);
}

function gladiator_eventStartLevel() {
    setMissionTime(4*60); // 4 minutes

    setScrollLimits(x1, y1, x2, y2);

    hackNetOff();
    for (let player = 0; player < maxPlayers; player++) {
        if (!isSpectator(player)) {
            addSpotter(125, 125, player, 84*128, false, 0);
            setExperienceModifier(player, 0);
        }
    }
    hackNetOn();

    if (!isSpectator(selectedPlayer)) {
        let [x, y] = find_factory();
        centreView(x-2, y+1);  // Move the camera to the base
    }

    queue("info1", 8*1000); // run this function 8 seconds later
    queue("info2", 13*1000); // run this function 13 seconds later
}

function gladiator_eventMissionTimeout() {
    setMissionTime(-1); // Remove the mission timer

    for (let player = 0; player < maxPlayers; player++) {
        if (!isSpectator(player)) {
            enumStruct(player).forEach((s) => {
                if (s.stattype == FACTORY || s.stattype == CYBORG_FACTORY || s.stattype == RESEARCH_LAB) {
                    removeObject(s);
                }
            });
        }
    }

    enumFeature(ALL_PLAYERS).forEach((f) => {
        removeObject(f, true);
    });

    if (!isSpectator(selectedPlayer)) {
        setStructureLimits("A0LightFactory", 0, selectedPlayer);
        setStructureLimits("A0CyborgFactory", 0, selectedPlayer);
        setStructureLimits("A0ResearchFacility", 0, selectedPlayer);
    }

    setTimer("shrink_map", 5*1000);

    setTimer("fire_las_sat", 100);

    queue("info3", 5*1000); // run this function 5 seconds later
}

function gladiator_eventChat(from, to, message) {
    if (getMissionTime() == -1) { // voting not allowed after walls break
        return;
    }

    if (isSpectator(from)) { // ignore spectator chat
        return;
    }

    // English, Russian, Portuguese (Brazil)
    if (message == "more time" || message == "больше времени" || message == "mais tempo") {
        process_vote(from);
    }
}

function shrink_map() {
    if (x2-x1 <= 16 && y2-y1 <= 16) {
        return;
    }
    setScrollLimits(++x1, ++y1, --x2, --y2);
    // setScrollLimits(x1++, y1++, x2--, y2--);

    kill();
}

function fire_las_sat() {
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

function info1() {
    console(" ");
    console(" ");
    console(_("Your base will explode in 4 minutes."));
    console(" ");
    console(" ");
    playSound("beep9.ogg");
}

function info2() {
    console(" ");
    console(" ");
    console(_("Prepare for battle!"));
    console(" ");
    console(" ");
    playSound("beep9.ogg");
}

function info3() {
    console(" ");
    console(" ");
    console(_("FIGHT!"));
    console(" ");
    console(" ");
    playSound("beep9.ogg");
}

function out_of_bounds(obj) {
    return obj.x <= x1 || obj.y <= y1 || obj.x >= x2 || obj.y >= y2;
}

// Locate the (x, y) position of the player's factory
function find_factory() {
    if (isSpectator(selectedPlayer)) {
        return;
    }
    for (s of enumStruct(selectedPlayer, FACTORY)) {
        return [s.x, s.y];
    }
    return null;
}

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                   Voting                                   //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function process_vote(player) {
    // If the player already voted
    if (votes[player] == true) {
        return;
    }

    votes[player] = true;

    const num_votes = count_votes();

    if (num_votes > vote_threshold) {
        console(_("More time added."));
        setMissionTime(getMissionTime() + 2*60); // add 2 minutes
        reset_votes();
    } else {
        console(_(`Player ${player} voted for more time. (${num_votes}/${vote_threshold})`));
    }
}

// An eligible voter is human and non-spectator
function count_voters() {
    let count = 0;
    for (player of playerData) {
        if (player.isHuman && !isSpectator(player.position)) {
            count++;
        }
    }
    return count;
}

function reset_votes() {
    for (let i = 0; i < votes.length; i++) {
        votes[i] = false;
    }
}

function count_votes() {
    let count = 0;
    for (vote of votes) {
        if (vote == true) {
            count++;
        }
    }
    return count;
}

