
const templateBody = {
    //red4, red3, black3, black2, blue3, yellow3, grey3, blue2, yellow2, grey2, black1, blue1, yellow1, grey1
    HEAVY: ["Body14SUP", "Body13SUP", "Body10MBT", "Body7ABT", "Body9REC", "Body12SUP", "Body11ABT", "Body6SUPP", "Body8MBT", "Body5REC", "Body3MBT", "Body2SUP", "Body4ABT", "Body1REC"],
    //red4, red3, black3, black2, blue3, blue2, yellow3, grey3, black1, blue1, yellow2, grey2, yellow1, grey1
    COMPACT: ["Body14SUP", "Body13SUP", "Body10MBT", "Body7ABT", "Body9REC", "Body6SUPP", "Body12SUP", "Body11ABT", "Body3MBT", "Body2SUP", "Body8MBT", "Body5REC", "Body4ABT", "Body1REC"],
    //red4, black2, black1, blue2, yellow2, blue1, grey2, yellow1, grey1
    VTOL: ["Body14SUP", "Body7ABT", "Body3MBT", "Body6SUPP", "Body8MBT", "Body2SUP", "Body5REC", "Body4ABT", "Body1REC"],

    MEDIUM: ["Body7ABT", "Body6SUPP", "Body8MBT", "Body5REC", "Body3MBT", "Body2SUP", "Body4ABT", "Body1REC"],
    LIGHT: ["Body3MBT", "Body2SUP", "Body4ABT", "Body1REC"],
    VLIGHT: ["Body4ABT", "Body1REC"],
}

const templateProp = {
    //red4, red3, black3, black2, blue3, yellow3, grey3, blue2, yellow2, grey2, black1, blue1, yellow1, grey1
    HEAVY: ["tracked01", "HalfTrack", "wheeled01"],
    MEDIUM: ["HalfTrack", "wheeled01"],
    LIGHT: ["hover01", "wheeled01"],
    VTOL: ["V-Tol"]
}

const templateWeapon = {
    MG: ["HeavyLaser", "Laser2PULSEMk1", "Laser3BEAMMk1", "MG5TWINROTARY", "MG4ROTARYMk1", "MG3Mk1", "MG2Mk1", "MG1Mk1"],
    CANNON: ["RailGun3Mk1", "RailGun2Mk1", 'RailGun1Mk1', "Laser4-PlasmaCannon", "Cannon6TwinAslt", 'Cannon375mmMk1', "Cannon5VulcanMk1", "Cannon4AUTOMk1", "Cannon2A-TMk1", "Cannon1Mk1"],
    ROCKET: ["Missile-A-T", "Rocket-HvyA-T", "Rocket-LtA-T", "Rocket-Pod"],
    ROCKET2: ["Missile-MdArt", "Rocket-MRL-Hvy", "Rocket-MRL", "Rocket-Pod"],
    MORTAR: ["Howitzer150Mk1", "Howitzer-Incendiary", "Howitzer03-Rot", "Howitzer105Mk1", "Mortar-Incendiary", "Mortar3ROTARYMk1", "Mortar2Mk1", "Mortar1Mk1"],
    FLAME: ["PlasmiteFlamer", "Flame2", "Flame1Mk1"],
    BOME: ["Bomb5-VTOL-Plasmite", "Bomb4-VTOL-HvyINC", "RailGun2-VTOL", "Bomb2-VTOL-HvHE", "RailGun1-VTOL", "Bomb1-VTOL-LtHE", "Cannon4AUTO-VTOL"],
    REPAIR: ["HeavyRepair", "LightRepair1"],
    SENSOR: ["Sensor-WideSpec", "SensorTurret1Mk1", "Sys-CBTurret01"]
}

const _droidAA = ["Missile-HvySAM", "AAGunLaser", "Missile-LtSAM", "AAGun2Mk1Quad", "QuadRotAAGun", "QuadMg1AAGun", "AAGun2Mk1", "Rocket-Sunburst"]
const _droidAA2 = ["Missile-HvySAM", "AAGun2Mk1Quad", "Missile-LtSAM", "AAGunLaser", "QuadRotAAGun", "AAGun2Mk1", "QuadMg1AAGun", "Rocket-Sunburst"]

const cyborgWeapon = {
    MG: ["Cyb-Hvywpn-PulseLsr", "Cyb-Wpn-Laser", "CyborgRotMG", "CyborgChaingun"],
    CANNON: ["Cyb-Hvywpn-RailGunner", "Cyb-Wpn-Rail1", "Cyb-Hvywpn-HPV", "Cyb-Hvywpn-Mcannon", "CyborgCannon", "CyborgChaingun"],
    ROCKET: ["Cyb-Hvywpn-A-T", "Cyb-Hvywpn-TK", "CyborgRocket", "CyborgChaingun"],
    MORTAR: ["Cyb-Wpn-Thermite", "CyborgFlamer01"],
    FLAME: ["Cyb-Wpn-Thermite", "CyborgFlamer01"]
}


var _dumbProduction_N = 0
var _dumbProduction_AT = 0
function monoFactory(factory) {
    var weap = templateWeapon.CANNON
    switch (dumbSchema) {
        case SCHEMA_MACGUN:
            weap = templateWeapon.MG
            break
        case SCHEMA_CANNON:
            weap = templateWeapon.CANNON
            //if (enumDroid(me,DROID_WEAPON).filter(weapon=>droidWeaponStat(weapon).ImpactClass="MORTARS").length<10)w=_droidMortar
            break
        case SCHEMA_ROCKET:
            if (_dumbProduction_AT < _dumbProduction_N * .6) {
                weap = templateWeapon.ROCKET
            }
            else {
                weap = templateWeapon.ROCKET2
            }
            break
        case SCHEMA_MORTAR:
            weap = templateWeapon.MORTAR
            break
        case SCHEMA_FLAMER:
            weap = templateWeapon.FLAME
            break
    }

    const name = weap.find(i => componentAvailable(undefined, i))
    const prop = componentAvailable(undefined, "Body10MBT") ? templateProp.HEAVY : templateProp.MEDIUM
    return buildDroid(factory, name, templateBody.COMPACT, prop, 0, 0, weap, weap)
}

function monoFactory2(factoryCyborg) {
    var weap = cyborgWeapon.CANNON
    switch (dumbSchema) {
        case SCHEMA_MACGUN:
            weap = cyborgWeapon.MG
            break
        case SCHEMA_CANNON:
            weap = cyborgWeapon.CANNON
            if (!componentAvailable(undefined, "Cannon375mmMk1") && Math.random() < .25) weap = cyborgWeapon.FLAME
            break
        case SCHEMA_ROCKET:
            weap = cyborgWeapon.ROCKET
            if (!componentAvailable(undefined, "Rocket-LtA-T") && Math.random() < .2) weap = cyborgWeapon.FLAME
            break
        case SCHEMA_MORTAR:
            weap = cyborgWeapon.FLAME
            break
        case SCHEMA_FLAMER:
            weap = cyborgWeapon.FLAME
            break
    }

    const w = weap.find(i => componentAvailable(undefined, i))
    const body = w.startsWith("Cyb-Hvywpn") ? "CyborgHeavyBody" : "CyborgLightBody"
    return buildDroid(factoryCyborg, w, body, 'CyborgLegs', 0, 0, w)
}



function dumbProduction() {
    var factory = enumStruct(me, FACTORY)
    var cyborg_factory = enumStruct(me, CYBORG_FACTORY)

    factory.filter(structureIdle).forEach(monoFactory)
    cyborg_factory.filter(structureIdle).forEach(monoFactory2)
}

/** 
* @param {_droid} droid
* @param {_struct} structure
*/
function eventDroidBuilt(droid, structure) {
    if (structure.stattype == FACTORY) {
        _dumbProduction_N += 1
        if (Stats.Weapon[droid.weapons[0].fullname].Effect == "ANTI TANK") _dumbProduction_AT += 1
    }
    
    switch (structure.stattype) {
        case FACTORY:
            return monoFactory(structure)
        case CYBORG_FACTORY:
            return monoFactory2(structure)
    }
}