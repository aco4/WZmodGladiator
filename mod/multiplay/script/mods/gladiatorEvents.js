namespace("gladiator_");

function gladiator_eventGameInit() {
    receiveAllEvents(true);
}

function gladiator_eventStartLevel() {
    gladiatorSetup();
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
        setStructureLimits("A0VTolFactory1", 0, selectedPlayer);
        setStructureLimits("A0ResearchFacility", 0, selectedPlayer);
    }

    setTimer("shrinkMap", CONFIG.shrinkIntervalMilliseconds);

    setTimer("fireLassat", CONFIG.lassatIntervalMilliseconds);

    queue("message3", 5*1000); // run this function 5 seconds later
}

function gladiator_eventChat(from, to, message) {
    if (!CONFIG.votingEnabled) { // voting must be enabled
        return;
    }

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
