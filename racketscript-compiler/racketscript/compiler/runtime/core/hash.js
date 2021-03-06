import * as $ from './lib.js';
import * as Pair from './pair.js';
import { Primitive } from './primitive.js';
import { isEqual, isEqv, isEq } from './equality.js';
import { hashForEqual, hashForEqv, hashForEq } from './hashing.js';

const hashConfigs = {
    eq: {
        hash: hashForEq,
        keyEq: isEq
    },
    eqv: {
        hash: hashForEqv,
        keyEq: isEqv
    },
    equal: {
        hash: hashForEqual,
        keyEq: isEqual
    }
};

class Hash extends Primitive {
    constructor(hash, type, mutable) {
        super();
        this._h = hash;
        this._mutable = mutable;
        this._type = type;
    }

    toString() {
        const items = [];
        for (const [k, v] of this._h) {
            items.push(`(${$.toString(k)} . ${$.toString(v)})`);
        }
        let typeSuffix = '';
        if (this._type === 'eq' || this._type === 'eqv') {
            typeSuffix = this._type;
        }
        return `#hash${typeSuffix}(${items.join(' ')})`;
    }

    toRawString() {
        return `'${this.toString()}`;
    }

    isImmutable() {
        return !this._mutable;
    }

    ref(k, fail) {
        const result = this._h.get(k);
        if (result !== undefined) {
            return result;
        } else if (fail !== undefined) {
            return fail;
        }
        throw $.racketCoreError(`hash-ref: no value found for key\n  key: ${$.toString(k)}`);
    }

    set(k, v) {
        const newH = this._h.set(k, v);

        if (this._mutable) {
            this._h = newH;
        } else {
            return new Hash(newH, this._type, false);
        }
    }

    size() {
        return this._h.size;
    }

    equals(v) {
        if (!check(v)) {
            return false;
        }

        if (this._h.size !== v._h.size || this._type !== v._type ||
            this._mutable !== v._mutable) {
            return false;
        }

        for (const [key, val] of this._h) {
            const vv = v._h.get(key);
            if (vv === undefined || !isEqual(val, vv)) {
                return false;
            }
        }

        return true;
    }
}

function make(items, type, mutable) {
    const h = items.reduce((acc, item) => {
        const [k, v] = item;
        return acc.set(k, v);
    }, $.hamt.make(hashConfigs[type]));
    return new Hash(h, type, mutable);
}

export function makeEq(items, mutable) {
    return make(items, 'eq', mutable);
}

export function makeEqv(items, mutable) {
    return make(items, 'eqv', mutable);
}

export function makeEqual(items, mutable) {
    return make(items, 'equal', mutable);
}

function makeFromAssocs(assocs, type, mutable) {
    const items = [];
    Pair.listForEach(assocs, (item) => {
        items.push([item.hd, item.tl]);
    });
    return make(items, type, mutable);
}

export function makeEqFromAssocs(assocs, mutable) {
    return makeFromAssocs(assocs, 'eq', mutable);
}

export function makeEqvFromAssocs(assocs, mutable) {
    return makeFromAssocs(assocs, 'eqv', mutable);
}

export function makeEqualFromAssocs(assocs, mutable) {
    return makeFromAssocs(assocs, 'equal', mutable);
}

export function map(hash, proc) {
    let result = Pair.EMPTY;
    hash._h.forEach((value, key) => {
        result = Pair.make(proc(key, value), result);
    });
    return result;
}

export function check(v1) {
    return (v1 instanceof Hash);
}

export function isEqualHash(h) {
    return check(h) && h._type === 'equal';
}
export function isEqvHash(h) {
    return check(h) && h._type === 'eqv';
}
export function isEqHash(h) {
    return check(h) && h._type === 'eq';
}
