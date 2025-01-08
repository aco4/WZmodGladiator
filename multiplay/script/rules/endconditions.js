namespace("conditions_");

function conditions_eventGameInit() {
    if (alliancesType == NO_ALLIANCES || alliancesType == ALLIANCES) {
        queue("check_gameover_ffa", 4*60*1000);
    } else {
        queue("check_gameover_teams", 4*60*1000);
    }
}

function check_gameover_ffa() {
    // Get players that have units
    let contenders = [];
    for (let player = 0; player < maxPlayers; player++) {
        if (countDroid(DROID_ANY, player) > 0) {
            contenders.push(player);
        }
    }

    // Do not end the game if multiple players remain
    if (contenders.length >= 2) {
        queue("check_gameover_ffa", 3*1000); // Check again 3 seconds later
        return;
    }

    // Only 1 player left. They are the winner.
    if (contenders[0] == selectedPlayer) {
        gameOverMessage(true); // win
    } else {
        gameOverMessage(false); // lose
    }
}

function check_gameover_teams() {
    // Get teams that have units
    let teams = [];
    for (data of playerData) {
        if (!teams.includes(data.team) && countDroid(DROID_ANY, data.position) > 0) {
            teams.push(data.team);
        }
    }

    // Do not end the game if multiple teams remain
    if (teams.length >= 2) {
        queue("check_gameover_teams", 3*1000); // Check again 3 seconds later
        return;
    }

    // Only 1 team left. They are the winner.
    for (data of playerData) {
        if (data.position == selectedPlayer && data.team == teams[0]) {
            gameOverMessage(true); // win
            return;
        }
    }

    gameOverMessage(false); // lose
}
