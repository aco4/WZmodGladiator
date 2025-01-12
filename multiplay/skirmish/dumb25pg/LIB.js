//#region random
/**
 * Return random integer in range [a, b], including both end points.
 * @param {Number} a 
 * @param {Number} b 
 */
function randint(a, b) {
    return Math.floor(a + Math.random() * (b - a + 1))
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function choose(arr = []) {
    return arr[randint(0, arr.length - 1)]
}




//#region collection T[]->T[]
/**
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>String | Number} key
 * @returns {T[]}
 */
function unique(arr = [], key = i => JSON.stringify(i)) {
    return [...new Map(arr.map(i => [key(i), i])).values()]
}


function dropna(arr = []) {
    return arr.filter(i => !isNaN(i))
}

/**
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>Number} key
 * @returns {T[][]}
 */
function groupBy(arr = [], key = i => Number(i)) {
    var group = []
    arr.forEach((i) => {
        var k = key(i)
        if (group[k] === undefined) group[k] = []
        group[k].push(i)
    })
    return group
}






//#region aggregation  T[]->T

/** return index of minimum
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>Number} key
 * @returns {Number}
 * */
function argmin(arr = [], key = i => Number(i)) {
    var k = arr.map(x => key(x))
    var kmin = Math.min(...dropna(k))
    return k.findIndex(x => x == kmin)
}
/**
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>Number} key
 * @returns {T}
 */
function min(arr, key = i => Number(i)) {
    return arr[argmin(arr, key)]
}
/**
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>Number} key
 * @returns {T}
 */
function max(arr = [], key = i => Number(i)) {
    return min(arr, i => -key(i))
}

/**
 * @param {Number[]} arr
 */
function sum(arr = []) {
    arr = dropna(arr.map(i => Number(i)))
    return arr.reduce((a, b) => (a + b), 0)
}

/**
 * @param {Number[]} arr
 */
function mean(arr = []) {
    arr = dropna(arr.map(i => Number(i)))
    return sum(arr) / arr.length
}










//#region mapping  T1[]->T2[]

/** return index，from minimum's to maximum's
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>Number} key
 * @returns {Number[]}
 * */
function argsort(arr = [], key = i => Number(i)) {
    var k = arr.map((x, i) => key(x)).map(x => isNaN(x) ? Infinity : x).map((x, i) => [x, i])
    k.sort((a, b) => (a[0] - b[0]))
    return k.map(a => a[1])
}

/** return index in sorted array
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>Number} key
 * @returns {Number[]}
 * */
function argmap(arr = [], key = i => Number(i)) {
    var arr2 = argsort(arr, key)
    var arr3 = new Array(arr.length)
    arr2.forEach((i, j) => arr3[i] = j)
    return arr3
}











//#region vector
function distBetween(object, object2) {
    return Math.hypot(object.x - object2.x, object.y - object2.y)
}

function distTo(object) {
    return (object2) => distBetween(object, object2)
}

/**
 * 
 * @param {_pos} src 
 * @param {_pos} dst 
 * @param {Number} yaw 
 * @param {Number} dist 
 * @returns {_pos}
 */
function yawTo(src, dst, yaw = 0, dist = 5) {
    var [dx, dy] = [dst.x - src.x, dst.y - src.y]
    var norm = Math.hypot(dx, dy)
    var [dx, dy] = [dx / norm, dy / norm]
    var [nx, ny] = [-dy, dx]
    return {
        "type": POSITION,
        "x": Math.round(src.x + dx * dist + nx * yaw),
        "y": Math.round(src.y + dy * dist + ny * yaw),
    }
}

/**
 * 
 * @param {_pos[]} posArr 
 * @param {Number[]} weightArr 
 * @returns {_pos}
 */
function mix(posArr, weightArr) {
    var [x, y] = [0, 0]

    for (var i = 0; i < posArr.length; i++) {
        x += posArr[i].x * weightArr[i]
        y += posArr[i].y * weightArr[i]
    }

    return {
        "type": POSITION,
        "x": x,
        "y": y
    }
}

/**
 * 
 * @param {Number} x 
 * @param {Number} a 
 * @param {Number} b 
 * @returns 
 */
function clip(x, a, b) {
    if (b < a) [a, b] = [b, a]
    if (x < a) x = a
    if (x > b) x = b
    return x
}



/**
 * @template T
 * @param {(a:T)=>Number} func
 * @returns {(a:T,b:T)=>Number}
 */
function by(func) {
    return (a, b) => (func(a) - func(b))
}

/**
 * Remove a element from array
 * @template T
 * @param {T[]} arr
 * @param {T} x
 */
function remove(arr, x) {
    arr.splice(arr.findIndex(i => i == x), 1)
}

/**
 * Moveable, but invalid for order or structure destination
 * @param {Number} x 
 * @param {Number} y 
 * @returns 
 */
function isEdge(x, y) {
    const rect = getScrollLimits()
    return x < rect.x + 4 || x > rect.x2 - 4 || y < rect.y + 4 || y > rect.y2 - 4
}

/**
 * 
 * @param {_pos} pos 
 * @returns {_pos}
 */
function validPosition(pos) {
    const rect = getScrollLimits()
    return {
        "type": POSITION,
        x: clip(pos.x, rect.x + 4, rect.x2 - 5),
        y: clip(pos.y, rect.y + 4, rect.y2 - 5)
    }
}






//#region object
/**
 * @param {_droid | _struct} object 
 * @returns {_weaponStat}
 */
function objectWeaponStat(object) {
    return Stats.Weapon[object.weapons[0].fullname]
}




//#region droid
/**
 * Legacy hit & run
 * @param {_droid} droid 
 * @param {_pos} dest target (no enemy in range)
 * @param {_pos} dest2 target (enemy in range)
 */
function droidControl_ABShuffle(droid, dest, dest2) {
    const stat = objectWeaponStat(droid)
    const arr = enumRange(droid.x, droid.y, stat.MaxRange / 128, ENEMIES)

    const posYaw = yawTo(droid, arr.length > 0 ? dest2 : dest, droid.id % 3 - 1, 5)
    orderDroidLoc(droid, DORDER_MOVE, posYaw.x, posYaw.y)
}

/**
 * Legacy patrol, don't chase target exceed range
 * @param {_droid} droid 
 * @param {_pos} dest target
 */
function droidControl_NPartol(droid, dest) {
    const stat = objectWeaponStat(droid)
    const arr = enumRange(droid.x, droid.y, stat.MaxRange / 128, ENEMIES)

    if (arr.length > 0) {
        orderDroidObj(droid, DORDER_ATTACK, arr[0])
    }
    else {
        const posYaw = yawTo(droid, dest, droid.id % 3 - 1, 5)
        orderDroidLoc(droid, DORDER_PATROL, posYaw.x, posYaw.y)
    }
}

/**
 * 
 * @param {_droid} droid 
 * @param {Number} range 
 */
function droidControl_chaseNearest(droid, dest, range) {
    const arr = enumRange(droid.x, droid.y, range, ENEMIES)
    if (arr.length > 0) {
        const target = min(arr, distTo(droid))
        orderDroidLoc(droid, DORDER_MOVE, target.x, target.y)
    }
    else {
        orderDroidLoc(droid, DORDER_MOVE, dest.x, dest.y)
    }
}