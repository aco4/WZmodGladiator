class Deadbeef {
    f() {
        this.t0 = Date.now()
    }
    ff() {
        var t1 = Date.now()
        debug("" + (t1 - this.t0))
        this.t0 = t1
    }

    benchmark() {
        this.f()

        for (var i = 0; i < 10e6; i++);
        this.ff()//100ms / 10e6 Ops

        for (var i = 0; i < 10e3; i++)
            enumRange(randint(0, mapWidth), randint(0, mapHeight), 16, ALL_PLAYERS, false)
        this.ff()//250ms / (10e3 Ops * 80 Droids)

        var sx = 0, sy = 0
        for (var i = 0; i < 10e3; i++) {
            for (const j of enumDroid(choose(enumEnemy()))) {
                sx += j.x
                sy += j.y
            }
        }
        this.ff()//700ms / (10e3 Ops * 16 Droids)
        debug("DONE " + me)
    }

    benchmark2() {
        function g(i, j) {
            if (i > 500) {
                j = j * 1.13
            }
            if (Math.random() < .5) {
                [i, j] = [j, i + 1]
            }
            const k = Math.exp(Math.log(i) + Math.log(j))
            const k2 = Math.atan2(k, Math.hypot(1, 1, k))
            return k2
        }
        this.f()

        const arr = []
        for (var i = 0; i < 1000; i++) {
            for (var j = 0; j < 1000; j++) {
                arr.push(g(i, j))
            }
        }
        this.ff()// 1300ms
    }

    main() {
        debug(`Map: ${mapWidth}*${mapHeight}`)
    }

}


function deadbeef_main() {
    new Deadbeef().benchmark2()
}
//250 350 450 550
//setTimer(deadbeef_main.name, 1e3)

