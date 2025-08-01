# Gladiator Mod
- Warzone 2100 multiplayer battle royale
- Prepare, then fight
- Shrinking map border
- Custom AI bot
- Faster research and factory speed
- Free-For-All or Teams (3v3, 5v5, 2v2v2v2v2, etc.)

## Play
1. Download the map `📦10c-Gladiator-test6.wz`. Put in `📁maps/`.
2. Compress/zip/pack `📁multiplay/` and `📁stats/` into `📦GladiatorMod.zip`. Put in `📁mods/4.5.5/autoload/`.
3. Restart Warzone 2100

## Settings
Edit `📄multiplay/script/rules/gladiatorSettings.json` before compress/zip/pack:
```
{
    "preparationTimeSeconds": 240,      // how many seconds before bases explode
    "shrinkIntervalMilliseconds": 5000, // time between map shrinks
    "lassatIntervalMilliseconds": 100,  // how often lassat will fire
    "votingEnabled": true,              // vote for more time (broken)
    "experienceModifier": 0,            // units do not gain ranks
    "mapVisionReveal": true,            // circular satellite uplink
    "startingPower": 1000000,           // 1 million power

    "structureLimits": {
        "A0LightFactory": 1,
        "A0CyborgFactory": 1,
        "A0VTolFactory1": 0,
        "A0ResearchFacility": 5,
        "A0PowerGenerator": 0
    },

    "droidLimitAny": 300,               // unit limit
    "droidLimitCommand": 10,            // commander limit
    "droidLimitConstruct": 50,          // truck limit

    "giveResearch": [                   // complete some research for the player
        ...
    ]
}
```

## Maps
- Square map recommended
- Use `WallCorner` or boulders to trap the player
- You can use custom Scroll Limits to hide the Command Center and Research Facilities outside of the map

## Stat changes

### Faster research speed
`Gladiator/stats/structure.json`

```diff
-   "researchPoints": 14,
-   "moduleResearchPoints": 7,
+   "researchPoints": 20,
+   "moduleResearchPoints": 10,
```

### 3x factory speed
`Gladiator/stats/structure.json`

```diff
"A0LightFactory": {
    ...
-   "productionPoints": 10,
-   "moduleProductionPoints": 10,
+   "productionPoints": 30,
+   "moduleProductionPoints": 30,
    ...
},
```

### 3x cyborg factory speed
`Gladiator/stats/structure.json`

```diff
"A0CyborgFactory": {
    ...
-   "productionPoints": 10,
-   "moduleProductionPoints": 10,
+   "productionPoints": 30,
+   "moduleProductionPoints": 30,
    ...
},
```

### No auto-repair (unless T4)
`Gladiator/stats/research.json`
```diff
"requiredResearch": [
-   "R-Struc-Research-Upgrade08"
],
```

### Indestructible WallCorner feature
`Gladiator/stats/features.json`

```diff
"WallCorner": {
    ...
+   "damageable": 0,
    ...
},
```

### No oil drums
`Gladiator/multiplay/script/rules/oildrum.js`

```js
function placeOilDrum() {}

function eventPickup() {}

function oilDrumInit() {
    oilDrumData.maxOilDrums = 0;
}
```

