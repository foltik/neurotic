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

const rgb = (h, s, v) => {
    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
};

function hsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0;
    } else {
        switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [h, s, v];
}
