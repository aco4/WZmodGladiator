const serialized = {
    body: Object.fromEntries(
        Object.values(Stats.Body).map((entry, i) => [entry.Id, i + 1])
    ),
    propulsion: Object.fromEntries(
        Object.values(Stats.Propulsion).map((entry, i) => [entry.Id, i + 1])
    ),
    weapon: Object.fromEntries(
        Object.values(Stats.Weapon).map((entry, i) => [entry.Id, i + 1])
    )
};

const deserialized = {
    body: invertMapping(serialized.body),
    propulsion: invertMapping(serialized.propulsion),
    weapon: invertMapping(serialized.weapon),
};

function invertMapping(map) {
    return Object.fromEntries(
        Object.entries(map).map(([key, val]) => [val, key])
    );
}

/**
 * Serialize a droid object into a single 32-bit integer.
 * Packs: body (8 bits), propulsion (8 bits), weapon1 (8 bits), weapon2 (8 bits)
 * Missing or unknown fields serialize to 0.
 */
function serialize(droid) {
    if (!droid) {
        return 0;
    }
    const { body, propulsion, weapons } = droid;
    const weapon1 = weapons?.[0];
    const weapon2 = weapons?.[1];

    return pack(
        serializeBody(body),
        serializePropulsion(propulsion),
        serializeWeapon(weapon1),
        serializeWeapon(weapon2),
    );
}

function deserialize(packed) {
    if (!packed) {
        return null;
    }

    const [body, propulsion, weapon1, weapon2] = unpack(packed);

    const weapons = [];

    if (deserializeWeapon(weapon1)) {
        weapons.push(deserializeWeapon(weapon1));
    }

    if (deserializeWeapon(weapon2)) {
        weapons.push(deserializeWeapon(weapon2));
    }

    return {
        body: deserializeBody(body),
        propulsion: deserializePropulsion(propulsion),
        weapons: weapons,
    };
}

function serializeBody(body) {
    return serialized.body[body] || 0;
}

function serializePropulsion(propulsion) {
    return serialized.propulsion[propulsion] || 0;
}

function serializeWeapon(weapon) {
    return serialized.weapon[weapon] || 0;
}

function deserializeBody(body) {
    return deserialized.body[body] || null;
}

function deserializePropulsion(propulsion) {
    return deserialized.propulsion[propulsion] || null;
}

function deserializeWeapon(weapon) {
    return deserialized.weapon[weapon] || null;
}

/**
 * Pack four 8-bit integers into a single 32-bit integer.
 * Byte order: a (MSB), b, c, d (LSB)
 */
function pack(a, b, c, d) {
    return ((a & 0xFF) << 24) |
           ((b & 0xFF) << 16) |
           ((c & 0xFF) << 8)  |
           (d & 0xFF);
}

function unpack(packed) {
    return [
        (packed >>> 24) & 0xFF,  // a (body)
        (packed >>> 16) & 0xFF,  // b (propulsion)
        (packed >>> 8) & 0xFF,   // c (weapon1)
        packed & 0xFF            // d (weapon2)
    ];
}
