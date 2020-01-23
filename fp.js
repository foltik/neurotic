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
        v[Symbol.iterator] ? yield* v : yield v;
}

const take = n => function*(iter) {
    iter = iter[Symbol.iterator]();
    for (let i of range(n)) {
        let v = iter.next();
        if (v.done)
            return;
        else
            yield v.value;
    }
};
const atake = n => arrize(take(n));

const skip = n => function* skip(iter) {
    iter = iter[Symbol.iterator]();
    for (let i of range(n)) {
        let v = iter.next();
        if (v.done)
            return;
    }

    while (true) {
        let v = iter.next();
        if (v.done)
            return;
        else
            yield v.value;
    }
};
const askip = n => arrize(skip(n));

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

Array.prototype.each = function(fn) {
    for (let i = 0; i < this.length; i++)
        fn(this[i], i);
};
Array.prototype.zip = function(...iters) { return zip(this, ...iters); };
Array.prototype.azip = function(...iters) { return azip(this, ...iters); };
Array.prototype.zip_next = function() { return zip(this, skip(1)(cycle(this))); };
Array.prototype.zip_next = function() { return azip(this, skip(1)(cycle(this))); };
Array.prototype.take = function(n) { return take(n)(this); };
Array.prototype.atake = function(n) { return atake(n)(this); };
Array.prototype.skip = function(n) { return skip(n)(this); };
Array.prototype.askip = function(n) { return askip(n)(this); };
Array.prototype.cycle = function() { return cycle(this); };

const GeneratorFunction = (function*(){}).__proto__;
GeneratorFunction.prototype.each = function(fn) {
    let arr = [...this];
    for (let i = 0; i < arr.length; i++)
        fn(arr[i], i);
};
GeneratorFunction.prototype.map = function(fn) { return fmap(this, fn); };
GeneratorFunction.prototype.amap = function(fn) { return afmap(this, fn); };
GeneratorFunction.prototype.zip = function(...iters) { return zip(this, ...iters); };
GeneratorFunction.prototype.azip = function(...iters) { return azip(this, ...iters); };
GeneratorFunction.prototype.take = function(n) { return take(n)(this); };
GeneratorFunction.prototype.atake = function(n) { return atake(n)(this); };
GeneratorFunction.prototype.skip = function(n) { return skip(n)(this); };
GeneratorFunction.prototype.askip = function(n) { return askip(n)(this); };
GeneratorFunction.prototype.cycle = function() { return cycle(this); };
