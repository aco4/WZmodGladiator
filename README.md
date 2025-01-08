# Gladiator Mod

**Prepare your army**. In 4 minutes, your base will explode and players will fight to the death!

- Singleplayer ✓
- Multiplayer ✓
- 4.5.5 ✓
- Working AI bot ✓

# How to play
1. Download the map `10c-Gladiator-test5.wz`. Put in maps folder.
2. Compress `multiplay` and `stats` into a single `.zip` file. Put in autoload folder.
3. Restart Warzone 2100

# Technical Details

### 99999 power
`Gladiator/multiplay/script/rules/setup/base.js`

```diff
-   setPower(2500, player);
+   setPower(99999, player);
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

### Natural experience gain OFF
`Gladiator/multiplay/script/mods/init.js`

```js
setExperienceModifier(player, 0);
```

### Unbreakable walls
`Gladiator/stats/features.json`

```diff
"WallCorner": {
    ...
-   "hitpoints": 150,
+   "hitpoints": 65536,
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

### 500 units limit
`Gladiator/multiplay/script/rules/setup/droidlimits.js`

```diff
function droidLimit(player)	// inside hackNetOff()
{
-   setDroidLimit(player, 150, DROID_ANY);
+   setDroidLimit(player, 500, DROID_ANY);
    setDroidLimit(player, 10, DROID_COMMAND);
    setDroidLimit(player, 15, DROID_CONSTRUCT);
}

```
