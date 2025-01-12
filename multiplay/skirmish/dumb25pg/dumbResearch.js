//#region BEGIN
function goodResearch(id = "") {
    var cost = getResearch(id, me).power
    var power = playerPower(me) - queuedPower(me) - enumStruct(me, FACTORY).filter(i => structureIdle(i)).length * 400

    const HIGH = -10000
    const NORMAL = 0
    const LOW = 10000

    function toward(researchName) {
        return findResearch(researchName).map(i => i.id).includes(id)
    }
    function reached(researchName, player = me) {
        var res = getResearch(researchName, player)
        return res.started || res.done
    }
    function done(researchName, player = me) {
        return getResearch(researchName, player).done
    }
    function prefix(researchName) {
        return id.startsWith(researchName)
    }

    if (getResearch(id, me).started) return Infinity


    if (prefix("R-Struc-Power-Upgrade")) return LOW
    if (prefix("R-Struc-RprFac-Upgrade")) return LOW
    if (prefix("R-Vehicle-Engine")) return LOW
    if (prefix("R-Struc-RepairFacility")) return LOW

    if (prefix("R-Struc-Factory-Upgrade")) return HIGH - 100
    if (prefix("R-Sys-Sensor-Upgrade01")) return HIGH + cost + 100

    //core
    if (prefix("R-Sys-Autorepair-General")) return HIGH - 2000
    if (toward("R-Struc-Research-Upgrade09")) return HIGH - 1000

    //armor & body
    if (toward("R-Vehicle-Prop-Halftracks")) return HIGH - 50

    if (prefix("R-Vehicle-Prop-Tracks")) return (reached("R-Vehicle-Body10")) ? HIGH : LOW
    if (toward("R-Vehicle-Body11")) return HIGH + cost - 70
    if (prefix("R-Cyborg-Hvywpn")) return HIGH + cost - 200
    if (toward("R-Vehicle-Metals09")) return NORMAL + cost - 120
    if (toward("R-Cyborg-Metals09")) return NORMAL + cost + 1


    switch (dumbSchema) {
        case SCHEMA_MACGUN:
            if (prefix("R-Wpn-Laser") || toward("R-Wpn-Laser01")) return HIGH
            if (prefix("R-Wpn-MG-ROF")) return HIGH - 50
            if (prefix("R-Wpn-MG5")) return HIGH - 40
            if (prefix("R-Wpn-MG3")) return HIGH - 40
            if (prefix("R-Wpn-MG")) return HIGH + cost + 400
            break

        default:
        case SCHEMA_CANNON:
            if (false && toward("R-Defense-WallTower-DoubleAAgun02")) return HIGH
            if (prefix("R-Wpn-Cannon") || prefix("R-Wpn-Rail")) {
                if (prefix("R-Wpn-Rail")) return HIGH
                if (prefix("R-Wpn-Cannon-ROF")) return HIGH - 50
                if (toward("R-Wpn-RailGun01")) {
                    if (prefix("R-Wpn-Cannon-Damage")) return HIGH
                    if (reached("R-Wpn-Cannon-Damage07")) return HIGH// Accuracy 1,2 & HPV Cannon
                    return LOW + 100
                }
                if (toward("R-Wpn-Cannon3Mk1")) return HIGH + cost
                if (reached("R-Wpn-RailGun01")) return LOW + cost + 200
                return NORMAL + cost + 400
            }
            if (toward("R-Wpn-MG3Mk1")) return HIGH
            break

        case SCHEMA_ROCKET:
            if (prefix("R-Cyborg-Hvywpn-A-T")) return HIGH - 100
            if (prefix("R-Wpn-Rocket03-HvAT")) return LOW//Bunker Buster Rocket
            if (toward("R-Wpn-Rocket02-MRL")) return HIGH - 46

            if (prefix("R-Wpn-Rocket")) {
                if (prefix("R-Wpn-RocketSlow-Accuracy")) return LOW
                if (prefix("R-Wpn-Rocket-ROF")) return HIGH - 100
                if (prefix("R-Wpn-Rocket-Accuracy01")) return reached("R-Wpn-Rocket-Damage04") ? HIGH - 50 : LOW
                if (prefix("R-Wpn-Rocket-Damage05")) return HIGH - 50
                if (toward("R-Wpn-Missile2A-T")) return HIGH - 60

                if (toward("R-Wpn-Rocket-ROF03")) return HIGH - 55
                //if (prefix("R-Wpn-Rocket02-MRL")) return HIGH-45
                return NORMAL + cost + 200
            }

            if (prefix("R-Wpn-Missile2A-T")) return HIGH - 95

            if (prefix("R-Wpn-Missile")) {
                if (prefix("R-Wpn-Missile-LtSAM")) return NORMAL + cost + 400
                if (prefix("R-Wpn-Missile-Accuracy")) return LOW - 200
                if (prefix("R-Wpn-Missile-ROF")) return HIGH + cost - 400
                return HIGH + cost
            }
            break

        case SCHEMA_MORTAR:
            //if (toward("R-Wpn-MG3Mk1"))return HIGH
            if (toward("R-Wpn-Mortar3")) return HIGH
            if (toward("R-Defense-MortarPit-Incendiary")) return HIGH + cost + 100

            if (prefix("R-Wpn-Mortar-Acc")) return LOW + cost
            if (prefix("R-Wpn-Mortar-ROF")) return HIGH + cost - 50

            return NORMAL + cost + 600


        case SCHEMA_FLAMER:
            //if (toward("R-Wpn-MG3Mk1"))return HIGH
            if (toward("R-Defense-PlasmiteFlamer")) return HIGH
            if (prefix("R-Wpn-Flamer-")) return HIGH + 150
            if (toward("R-Defense-MortarPit-Incendiary")) return NORMAL + cost
            break
    }

    return LOW + 1000
}


function goodResearch2(id = "") {
    return goodResearch(id) - getResearch(id, me).points / 100000
}

//#region END

function monoResearch(lab) {
    var research = enumResearch()
    if (research.length == 0) return

    pursueResearch(lab, min(research, i => goodResearch2(i.id)).id)
}


function dumbResearch() {
    var lab = enumStruct(me, RESEARCH_LAB)
    lab.filter(structureIdle).forEach(monoResearch)
}

/**
* @param {_research} research
* @param {_struct} structure
* @param {Number} player
*/

function eventResearched(research, structure, player) {
    if (player !== me) return
    if (gameTime < 100) return
    monoResearch(structure)
}
