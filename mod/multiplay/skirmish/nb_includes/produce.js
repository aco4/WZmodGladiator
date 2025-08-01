
/*
 * This file is responsible for droid production.
 *
 */

(function(_global) {
////////////////////////////////////////////////////////////////////////////////////////////

function ourBuildDroid(factory, name, bodies, propulsions, weapons1, weapons2, weapons3) {
	return buildDroid(factory, name, bodies, propulsions, "", "", weapons1, weapons2, weapons3);
}

function chooseWeapon(forVtol) {
	if (!defined(forVtol))
		forVtol = false;
	if (forVtol) {
		var ret = chooseAvailableWeaponPathByRoleRatings(getProductionPaths(), chooseAttackWeaponRole(), 3);
		if (defined(ret))
			return ret.vtols.concat().reverse();
	} else {
		var ret = chooseAvailableWeaponPathByRoleRatings(getProductionPaths(), chooseAttackWeaponRole(), 0);
		if (defined(ret))
			return ret.weapons.concat().reverse();
	}
}

function chooseBodyWeaponPair(bodies, weapons) {
	if (!defined(bodies))
		return undefined;
	if (!defined(weapons))
		return undefined;
	for (let i = 0; i < weapons.length; ++i) {
		var w = weapons[i].stat, ww = weapons[i].weight;
		if (!componentAvailable(w))
			continue;
		for (let j = 0; j < bodies.length; ++j) {
			var b = bodies[j].stat, bw = bodies[j].weight;
			if (!componentAvailable(b))
				continue;
			/* eslint-disable no-unreachable */
			switch (ww) {
				case WEIGHT.ULTRALIGHT:
					if (bw <= WEIGHT.LIGHT)
						return {b: b, w: w};
					break;
				case WEIGHT.LIGHT:
					if (bw <= WEIGHT.MEDIUM)
						return {b: b, w: w};
					break;
				case WEIGHT.MEDIUM:
						return {b: b, w: w};
					break;
				case WEIGHT.HEAVY:
					if (bw >= WEIGHT.MEDIUM)
						return {b: b, w: w};
					break;
				case WEIGHT.ULTRAHEAVY:
					if (bw >= WEIGHT.HEAVY)
						return {b: b, w: w};
					break;
			}
			/* eslint-enable no-unreachable */
		}
	}
}

function produceTank(factory) {
	// TODO: needs refactoring. Make some more clever sorting.
	var bodies = [];
	if (chooseBodyClass() === BODYCLASS.KINETIC) {
		bodies = bodies.concat(
			filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.KINETIC),
			filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.THERMAL)
		);
	} else {
		bodies = bodies.concat(
			filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.THERMAL),
			filterBodyStatsByUsage(BODYUSAGE.GROUND, BODYCLASS.KINETIC)
		);
	}
	var propulsions;
	var ret = scopeRatings();
	var rnd = random(ret.land + ret.sea);
	if (!defined(rnd)) // we need only vtols?
		return false;
	propulsions = getPropulsionStatsComponents(PROPULSIONUSAGE.GROUND);
	if (iHaveHover()) {
		if (rnd >= ret.land)
			propulsions = getPropulsionStatsComponents(PROPULSIONUSAGE.HOVER);
	} else {
		if (ret.land === 0)
			return false;
	}
	var bwPair = chooseBodyWeaponPair(bodies, chooseWeapon());
	if (!defined(bwPair))
		return false;
	return ourBuildDroid(factory, "Tank", bwPair.b, propulsions, bwPair.w, bwPair.w, bwPair.w);
}

function produceTemplateFromList(factory, list) {
	var ret = scopeRatings();
	for (let i = list.length - 1; i >= 0; --i) {
		if (ret.land === 0 && !isHoverPropulsion(list[i].prop) && !isVtolPropulsion(list[i].prop))
			continue;
		if (ret.land === 0 && ret.sea === 0 && !isVtolPropulsion(list[i].prop))
			continue;
		if (isVtolPropulsion(list[i].prop) !== (factory.stattype === VTOL_FACTORY))
			continue;
		if ((!randomTemplates) || withChance(100 / (i + 1)))
			if (ourBuildDroid(factory, "Template Droid", list[i].body, list[i].prop, list[i].weapons[0], list[i].weapons[1], list[i].weapons[2]))
				return true;
	}
	return false;
}

function produceTemplate(factory) {
	var path = chooseAvailableWeaponPathByRoleRatings(getProductionPaths(), chooseAttackWeaponRole(), 1);
	if (defined(path))
		return produceTemplateFromList(factory, path.templates);
	return false;
}

function checkTankProduction() {
	if (!iCanDesign())
		return false; // don't cheat by producing tanks before design is available (also saves money for early generators)
	var success = false;
	enumIdleStructList(structures.factories).forEach((factory) => {
		success = success || produceTank(factory);
	});
	return success;
}

function checkTemplateProduction() {
	var success = false;
	enumIdleStructList(structures.templateFactories)
		.concat(enumIdleStructList(structures.vtolFactories))
		.forEach((factory) => {
		success = success || produceTemplate(factory);
	});
	return success;
}

_global.checkProduction = function() {
	switch (chooseObjectType()) {
		case 1:
			if (checkTemplateProduction())
				return;
		default:
			if (checkTankProduction())
				return;
	}
	// if having too much energy, don't care about what we produce
	if (myPower() > personality.maxPower) {
		checkTemplateProduction();
		checkTankProduction();
	}
}

////////////////////////////////////////////////////////////////////////////////////////////
})(this);
