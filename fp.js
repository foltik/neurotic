const id = (...args) => args.length == 1 ? args[0] : args;
const add = (...vs) => vs.reduce((vs, v) => vs + v, 0);

function* range(i, j, delta) {
    if (arguments.length === 1) {
        yield* range(0, i, 1);
    } else if (arguments.length === 2) {
        yield* range(i, j, 1);
    }

    let n = 0;
    while (i < j) {
        yield i;
        i += delta;
    }
};

function* cycle(v) {
    while (true)
        yield v;
}

function* fmap(arr, fn) {
    for (let v of arr)
        yield fn(v);
}

const fzip = fn => function*(...iters) {
    iters = iters.map(i => i[Symbol.iterator]());
    while (true) {
        let xs = iters.map(i => i.next());
        if (xs.some(x => x.done))
            return;
        else
            yield fn(...xs.map(x => x.value));
    }
};

const zip = fzip(id);

Array.prototype.zip = function(...iters) { return [...zip(this, ...iters)]; };

const GeneratorFunction = (function*(){}).__proto__;
GeneratorFunction.prototype.map = function(fn) { return fmap(this, fn); };
GeneratorFunction.prototype.amap = function(fn) { return [...fmap(this, fn)]; };
GeneratorFunction.prototype.zip = function(...iters) { return zip(this, ...iters); };
GeneratorFunction.prototype.each = function(fn) { for (let v of this) fn(v); };
