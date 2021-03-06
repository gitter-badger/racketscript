import * as Core from './core.js';

/* --------------------------------------------------------------------------*/
// Immutable

export function isImmutable(v) {
    if (Core.Primitive.check(v)) {
        return v.isImmutable();
    } else if (Core.Bytes.check(v)) {
        return true;
    }
    $.racketCoreError(`isImmutable not implemented for ${v}`);
}

/* --------------------------------------------------------------------------*/
// String construction and manipulation

export function format(pattern, ...args) {
    // TODO: Only ~a and ~x are supported
    let matched = 0;
    return Core.UString.makeMutable(pattern.toString().replace(/~[axs]/g, (match) => {
        if (matched >= args.length) {
            throw Core.racketContractError('insufficient pattern arguments');
        }
        switch (match[1]) {
        case 'a': return args[matched++];
        case 'x': return args[matched++].toString(16);
        case 's': return ((v) => {
            // TODO: This is very broken, fix it (likely needs a new Primitive method).
            if (typeof v === 'number') {
                return v.toString();
            }
            return JSON.stringify(v.toString());
        })(args[matched++]);
        }
    }));
}

export function listToString(lst) {
    return Core.UString.makeMutableFromChars(Core.Pair.listToArray(lst));
}

/* --------------------------------------------------------------------------*/
// Printing to Console

export function display(v, out) {
    /* TODO: this is still line */
    out.write(v);
}

export function print(v, out) {
    /* TODO: this is still line */
    out.write(v);
}


/* --------------------------------------------------------------------------*/
// Errors

export function error(...args) {
    if (args.length === 1 && Core.Symbol.check(args[0])) {
        throw Core.racketCoreError(args[0].toString());
    } else if (args.length > 0 && typeof args[0] === 'string') {
        throw Core.racketCoreError(args.map(v => v.toString()).join(' '));
    } else if (args.length > 0 && Core.Symbol.check(args[0])) {
        throw Core.racketCoreError(format(`${args[0].toString()}: ${args[1]}`, ...args.slice(2)));
    } else {
        throw Core.racketContractError('error: invalid arguments');
    }
}

/* --------------------------------------------------------------------------*/
// Not Implemented/Unorganized/Dummies

export function random(...args) {
    switch (args.length) {
    case 0: return Math.random();
    case 1:
        if (args[0] > 0) {
            return Math.floor(Math.random() * args[0]);
        }
        error('random: argument should be positive');

    case 2:
        if (args[0] > 0 && args[1] > args[0]) {
            return Math.floor(args[0] + Math.random() * (args[1] - args[0]));
        }
        error('random: invalid arguments');

    default:
        error('random: invalid number of arguments');
    }
}

// TODO: add optional equal? pred

export function memv(v, lst) {
    while (Core.Pair.isEmpty(lst) == false) {
        if (Core.isEqv(v, lst.hd)) {
            return lst;
        }
        lst = lst.tl;
        continue;
    }
    return false;
}

export function memq(v, lst) {
    while (Core.Pair.isEmpty(lst) == false) {
        if (Core.isEq(v, lst.hd)) {
            return lst;
        }
        lst = lst.tl;
        continue;
    }
    return false;
}

export function memf(f, lst) {
    while (Core.Pair.isEmpty(lst) == false) {
        if (f(lst.hd)) {
            return lst;
        }
        lst = lst.tl;
        continue;
    }
    return false;
}

export function findf(f, lst) {
    while (Core.Pair.isEmpty(lst) == false) {
        if (f(lst.hd)) {
            return list.hd;
        }
        lst = lst.tl;
        continue;
    }
    return false;
}


// TODO: more faithfully reproduce Racket sort?
// this implements raw-sort from #%kernel, see racket/private/list
export function sort9(lst, cmp) {
    const arr = Core.Pair.listToArray(lst);
    const x2i = new Map();
    arr.forEach((x, i) => { x2i.set(x, i); });
    const srted = arr.sort((x, y) => {
        if (cmp(x, y)) {
            return -1;
        } else if (cmp(y, x)) {
            return 1;
        } // x = y, simulate stable sort by comparing indices
        return x2i.get(x) - x2i.get(y);
    });

    return Core.Pair.listFromArray(srted);
}

export function assv(k, lst) {
    while (Core.Pair.isEmpty(lst) === false) {
        if (Core.isEqv(k, lst.hd.hd)) {
            return lst.hd;
        }
        lst = lst.tl;
    }
    return false;
}

export function assq(k, lst) {
    while (Core.Pair.isEmpty(lst) === false) {
        if (Core.isEq(k, lst.hd.hd)) {
            return lst.hd;
        }
        lst = lst.tl;
    }
    return false;
}

export function assf(f, lst) {
    while (Core.Pair.isEmpty(lst) === false) {
        if (f(lst.hd.hd)) {
            return lst.hd;
        }
        lst = lst.tl;
    }
    return false;
}
