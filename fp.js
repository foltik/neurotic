const id = (...args) => args.length == 1 ? args[0] : args;
const add = (...vs) => vs.reduce((vs, v) => vs + v, 0);

const arrize = f => (...args) => [...f(...args)];

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
const arange = arrize(range);

function* cycle(v) {
    while (true)
        yield v;
}

function* fmap(arr, fn) {
    for (let v of arr)
        yield fn(v);
}
const afmap = arrize(fmap);

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
const afzip = arrize(fzip);

const zip = fzip(id);
const azip = arrize(zip);

Array.prototype.zip = function(...iters) { return [...zip(this, ...iters)]; };

const GeneratorFunction = (function*(){}).__proto__;
GeneratorFunction.prototype.map = function(fn) { return fmap(this, fn); };
GeneratorFunction.prototype.amap = function(fn) { return afmap(this, fn); };
GeneratorFunction.prototype.zip = function(...iters) { return zip(this, ...iters); };
GeneratorFunction.prototype.azip = function(...iters) { return azip(this, ...iters); };
GeneratorFunction.prototype.each = function(fn) {
    let arr = [...this];
    for (let i = 0; i < arr.length; i++)
        fn(arr[i], i);
};
