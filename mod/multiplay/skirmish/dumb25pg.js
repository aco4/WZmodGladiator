//#region vscode 1.88.0+
const DEBUG = ("25pg" == "".concat("@", "{", "V", "E", "R", "S", "I", "O", "N", "}"))
const home = enumStruct(me, FACTORY)[0]
const center = { type: POSITION, x: mapWidth / 2, y: mapHeight / 2 }

const SCHEMA_MACGUN = 0
const SCHEMA_CANNON = 1
const SCHEMA_ROCKET = 2
const SCHEMA_MORTAR = 3
const SCHEMA_FLAMER = 4

function dumbug(x) {
    const fname = debugGetCallerFuncName()
    debug(`${"dumb".padEnd(8)}|${Date().slice(16, 24)}: [${fname}] ${JSON.stringify(x)}`)
}

const _PATH = "dumb25pg/"
include(_PATH + "argParse.js")
const argv = argParse()

var dumbSchema = argv.schema ?? Math.floor(Math.random() * 5)

//include(_PATH+"EXT_DACTION.js")
include(_PATH + "LIB.js")
//The bot
include(_PATH + "dumbProduction.js")
include(_PATH + "dumbResearch.js")
include(_PATH + "dumbTank.js")

include(_PATH + "deadbeef.js")

const mainList = [dumbProduction, dumbResearch, dumbTank]
mainList.forEach((i, index) => setTimer(i.name, 500 + index + me))

function eventChat(from, to, message = "") {
    if (!(argv.flags & argEnum.flags.ENABLE_CHATCMD)) return

    if (to != me) return
    if (message[0] != "!") return
    message = message.slice(1)

    if (message[0].toLowerCase() == "s") {
        var i = Number(message[1])
        if (isNaN(i)) return chat(ALL_PLAYERS, `not a number:${message[1]}`)
        dumbSchema = i
        chat(ALL_PLAYERS, `schema:${i}`)
    }
}

/** */