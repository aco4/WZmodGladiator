const argEnum = {
    schema: {
        MACGUN: 0,
        CANNON: 1,
        ROCKET: 2,
        MORTAR: 3,
        FLAMER: 4
    },
    flags: {
        ENABLE_CHATCMD: 1,
        LAZY_MOVE: 2,
    }
}

/**
dumb25pg (default rocket)
dumb25pg-1 (cannon)
dumb25pg-24 (flamer, lazy move, disable chat command)
*/

function argParse() {
    const argvExpr = {
        schema: 4,
        flags: 4
    }

    const argvDefault = {
        schema: argEnum.schema.ROCKET,
        flags: argEnum.flags.ENABLE_CHATCMD
    }

    /**
     * @template T
     * @param {T} expr { varName: bitCount }, var with insufficient bit assign with `undefined`
     * @param {String} data String of [0-9A-F]
     * @returns {T}
     */
    function hexDecode(expr, data) {
        /**
         * f("") -> 0
         * @param {String} x 
         * @returns Number}
         */
        function f(x) {
            return "0123456789ABCDEF".indexOf(x)
        }

        data = data.toUpperCase()
        const expr2 = Object.assign({}, expr)
        var i = data.length
        for (var [k, v] of Object.entries(expr)) {
            var n = Math.floor(v / 4)
            var u = 0
            for (var j = n; j > 0; j--) {
                const x = f(data.charAt(i - j))
                if (((i - j) < 0) || (x === -1)) {
                    u = undefined
                    break
                }
                u = (u << 4) + x
            }
            i -= n
            expr2[k] = u
        }
        return expr2
    }

    /**
     * HACK ---- added for type hint
     * @template T
     * @param {T} argvExpr { varName: bitCount }, var with insufficient bit assign with `undefined`
     * @param {String} data String of [0-9A-F]
     * @returns {typeof argvDefault}
     */
    function parse(argvExpr, data) {
        const argv = hexDecode(argvExpr, data)
        // @ts-ignore
        return Object.fromEntries(Object.entries(argvDefault).map(([k, v]) => [k, argv[k] ?? v]))
    }

    const argExpr = new RegExp('(.*)-([0-9A-F]+)?').exec(playerData[me].name)
    //argExpr[0] full match
    //argExpr[1] prefix name
    return parse(argvExpr, argExpr?.[2] ?? "")
}
