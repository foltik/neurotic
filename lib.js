const range = x => [...Array(x)].map((_, i) => i);

function arange(i, j, delta) {
    if (arguments.length === 1) {
        return arange(0, i, 1);
    } else if (arguments.length === 2) {
        return arange(i, j, 1);
    }

    let result = [];
    let n = 0;
    while (i < j) {
        result[n++] = i;
        i += delta;
    }
    return result;
};

const widget = fn => (...args) => {
    push();
    fn(...args);
    pop();
};

const wit = (pre, fn) => {
    push();
    pre();
    fn();
    pop();
};

const at = (x, y, fn) => wit(() => translate(x, y), fn);
