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
