function pos(x, y) {
    return { type: POSITION, x: x, y: y }
}

/**
 * @param {_pos} pos 
 */
function radPos(pos) {
    return Math.atan2(pos.y - mapHeight / 2, pos.x - mapWidth / 2)
}

function enumEnemy() {
    const arr = []
    for (var i = 0; i < maxPlayers; i++) {
        if (isSpectator(i)) continue
        if (allianceExistsBetween(me, i)) continue
        arr.push(i)
    }
    return arr
}

const state = {
    enemy: choose(enumEnemy()),
    target: center,
    wall: true
}

/** 
* @param {_droid | _struct} victim
* @param {_droid | _struct} attacker
*/
function eventAttacked(victim, attacker) {
    if (allianceExistsBetween(me, attacker.player)) return
    const victimTeam = enumRange(victim.x, victim.y, 16, ALLIES, false)
    const attackerTeam = enumRange(attacker.x, attacker.y, 16, ENEMIES, false)
    if (attackerTeam.length > .1 * countDroid(DROID_ANY, me)) {
        state.enemy = attacker.player
        state.target = mix(attackerTeam,Array(attackerTeam.length).fill(1/attackerTeam.length))
    }
}




function dumbTank() {
    const arr = enumDroid(me)
    if (arr.length == 0) return

    const anchor = min(arr, distTo(center))
    if (state.wall) {
        if (gameTime>240e3) {
            state.wall=false
        }
        return
    }

    const prevArr = enumRange(state.target.x, state.target.y, 16, ENEMIES, false)
    if (prevArr.length < .05 * countDroid(DROID_ANY, me)) {
        state.target = center
    }

    const rect = getScrollLimits()
    const toEdge = Math.min(anchor.x + 4 - rect.x, rect.x2 - 4 - anchor.x, anchor.y + 4 - rect.y, rect.y2 - 4 - anchor.y)

    if (argv.flags & argEnum.flags.LAZY_MOVE) {
        if (distBetween(anchor, state.target) > 20 && toEdge > 16) return
    }



    if (toEdge > 12) {
        var retreatDest = yawTo(state.target, anchor, 0, 24)
    }
    else {
        var mRotate = 16// Avoid droid run into edge
        if (radPos(anchor) > radPos(state.target)) {
            //mRotate = -mRotate
        }
        var retreatDest = yawTo(anchor, center, -mRotate, 0)
    }


    if (dumbSchema == SCHEMA_FLAMER) {
        arr.forEach(i => {
            droidControl_chaseNearest(i, state.target, 8)
        })
        return
    }

    arr.forEach(i => {
        const stat = objectWeaponStat(i)
        if (i.droidType == DROID_CONSTRUCT) {

        }
        if (stat.FireOnMove) {
            droidControl_ABShuffle(i, state.target, retreatDest)
        }
        else {
            droidControl_NPartol(i, state.target)
        }
        //orderDroidLoc(i,DORDER_PATROL,mapWidth/2,mapHeight/2)
    })
}

