// Players can vote for more preparation time

const num_voters = count_voters(); // number of eligible voters
const vote_threshold = Math.floor(num_voters / 2); // number of votes needed to add more time
let votes = Array(num_voters).fill(false); // keep track of who voted

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
        console(_(`Player ${player} voted for more time.`) + `(${num_votes}/${vote_threshold})`);
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

