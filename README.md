# Gladiator Mod

**Prepare for battle**. In 4 minutes, your base will explode and players will fight to the death!

- Singleplayer ✓
- Multiplayer ✓
- Custom AI bot
- Free-For-All or Teams (3v3, 5v5, 2v2v2v2v2, etc.)
- Shrinking map border
- Increased research and factory speed
- 4.5.5

# How to play
1. Download the map `10c-Gladiator-test5.wz`. Put in maps folder.
2. Compress `multiplay` and `stats` into a single `.zip` file. Put in autoload folder.
3. Restart Warzone 2100

# Technical Details

### Infinite power
`Gladiator/multiplay/script/rules/setup/base.js`

```js
setPower(1000000, player);
```


### 3x research speed
`Gladiator/stats/structure.json`

```diff
-   "researchPoints": 14,
-   "moduleResearchPoints": 7,
+   "researchPoints": 42,
+   "moduleResearchPoints": 21,
```

### 6x factory speed
`Gladiator/stats/structure.json`

```diff
"A0LightFactory": {
    ...
-   "productionPoints": 10,
-   "moduleProductionPoints": 10,
+   "productionPoints": 60,
+   "moduleProductionPoints": 60,
    ...
},
```

### 6x cyborg factory speed
`Gladiator/stats/structure.json`

```diff
"A0CyborgFactory": {
    ...
-   "productionPoints": 10,
-   "moduleProductionPoints": 10,
+   "productionPoints": 60,
+   "moduleProductionPoints": 60,
    ...
},
```

### 2x build speed
`Gladiator/stats/construction.json`

```diff
"CyborgSpade": {
    ...
-   "constructPoints": 5,
+   "constructPoints": 10,
    ...
},
"Spade1Mk1": {
    ...
-   "constructPoints": 8,
+   "constructPoints": 16,
    ...
},
```

### Increased unit limit
`Gladiator/multiplay/script/rules/setup/droidlimits.js`

```diff
function droidLimit(player)
{
-   setDroidLimit(player, 150, DROID_ANY);
+   setDroidLimit(player, 300, DROID_ANY);
    setDroidLimit(player, 10, DROID_COMMAND);
-   setDroidLimit(player, 15, DROID_CONSTRUCT);
+   setDroidLimit(player, 50, DROID_CONSTRUCT);
}
```

### Unbreakable walls
`Gladiator/stats/features.json`

```diff
"WallCorner": {
    ...
-   "hitpoints": 150,
+   "hitpoints": -1,
    ...
},
```

### Natural experience gain OFF
`Gladiator/multiplay/script/mods/init.js`

```js
setExperienceModifier(player, 0);
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

