# Gladiator Mod
- Warzone 2100 multiplayer battle royale
- No base. Only army
- Units are delivered by transport
- Shrinking map border
- Free-For-All or Teams (3v3, 5v5, 2v2v2v2v2, etc.)

## Play
1. Download the map `📦10c-Gladiator-test8.wz`. Put in `📁maps/`.
2. Compress/zip/pack `📁multiplay/` and `📁stats/` into `📦GladiatorMod.zip`. Put in `📁mods/4.5.5/autoload/`.
3. Restart Warzone 2100

## Settings
Edit `📄multiplay/script/rules/gladiatorSettings.json` before compress/zip/pack:
```
{
    "mapShrinkEnabled": true,
    "shrinkIntervalMilliseconds": 5000, // time between map shrinks
    "lassatIntervalMilliseconds": 100,  // how often lassat will fire
    "experienceModifier": 0,            // units do not gain ranks
    "mapVisionReveal": true,            // circular satellite uplink
    "startingPower": 1000000,           // 1 million power
    "vtolEnabled": true,                // spawn vtol factory when VTOL researched?

    "dropshipSpawnIntervalSeconds": 40, // dropship will come every 40 seconds
    "dropshipSpawnCount": 1,            // 1 dropship comes each time
    "dropshipUpdateIntervalSeconds": 2, // controls movement and reaction time
    "dropshipDropShape": [              // drop droids in a 3x3 pattern
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ],

    "structureLimits": {
        "A0LightFactory": 1,
        "A0CyborgFactory": 1,
        "A0VTolFactory1": 0,
        "A0ResearchFacility": 5,
        "A0PowerGenerator": 0,
        "A0ComDroidControl": 0
    },

    "vtolFactorySpawnPositions": [      // Spawn VTOL factory if research vtol
        { x: 22, y: 245 },              // Player 0
        { x: 43, y: 245 },              // Player 1
        { x: 64, y: 245 },              // Player 2
        { x: 85, y: 245 },              // Player 3
        { x: 106, y: 245 },             // Player 4
        { x: 127, y: 245 },             // Player 5
        { x: 148, y: 245 },             // Player 6
        { x: 169, y: 245 },             // Player 7
        { x: 190, y: 245 },             // Player 8
        { x: 211, y: 245 }              // Player 9
    ],

    "droidLimitAny": 0,                 // dropships circumvent limits
    "droidLimitCommand": 0,             // dropships circumvent limits
    "droidLimitConstruct": 0,           // dropships circumvent limits

    "giveResearch": [                   // complete some research for the player
        ...
    ]
}
```

## Maps
- The player must start with:
  - 1 Command Center
  - 5 Research labs
  - 1 Factory (with 2 modules)
  - 1 Cyborg Factory
  - Space for VTOL Factory to spawn (3x3 area)
- To hide the base outside of the fighting area, use custom Scroll Limits
