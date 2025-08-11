namespace("gladiator_");

function gladiator_eventStartLevel() {
    gladiatorSetup();
    dropshipSetup();
}

function gladiator_eventSyncRequest(from, req_id, x, y, obj_id, obj_id2) {
    const droid = deserialize(req_id);
    if (droid) {
        hackNetOff();
        addDroid(from, Math.floor(x / 128), Math.floor(y / 128), "Droid", droid.body, droid.propulsion, "", "", droid.weapons);
        hackNetOn();
    } else {
        // NOTE It should be impossible to reach this code
        hackNetOff();
        addDroid(from, Math.floor(x / 128), Math.floor(y / 128), "Truck Viper Wheels", "Body1REC", "wheeled01", "", "", ["Spade1Mk1"]);
        hackNetOn();
    }
}

function gladiator_eventResearched(research, structure, player) {
    if (player !== me) {
        return;
    }
    setReticuleFlash(4, true); // Design
}
