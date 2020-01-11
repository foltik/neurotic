const range = x => [...Array(x)].map((_, i) => i);

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
