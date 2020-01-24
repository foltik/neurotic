///////// Helpers

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

const rectangular = (r, theta) => [r * cos(theta), r * sin(theta)];
const polar = (x, y) => [sqrt(x * x + y * y), atan(y / x)];

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


///////// Interpolation


const A = (p1, p2) => 1 - 3 * p2 + 3 * p1;
const B = (p1, p2) => 3 * p2 - 6 * p1;
const C = (p1)     => 3 * p1;
const bezier_calc = (t, p1, p2) => ((A(p1, p2) * t + B(p1, p2)) * t + C(p1)) * t;
const bezier_slope = (t, p1, p2) => 3 * A(p1, p2) * t * t + 2 * B(p1, p2) * t + C(p1);

var subdivide_precision = 0.0000001;
var subdivision_max_iters = 10;
function binary_subdivide (x, a, b, p1, p2) {
    let [ca, cb] = [a, b];
    let cx, t, i = 0;

    do {
        t = ca + (cb - ca) / 2.0;
        cx = bezier_calc(t, p1, p2) - x;
        cx > 0 ? cb = t : ca = t;
    } while (Math.abs(cx) > subdivide_precision && ++i < subdivision_max_iters);

    return t;
}

const newton_min_slope = 0.001;
const newton_iters = 4;
const newton_raphson = (x, guess, p1, p2) => {
    let t = guess;

    for (let i = 0; i < newton_iters; i++) {
        const slope = bezier_slope(t, p1, p2);
        if (slope == 0) return t;

        const cx = bezier_calc(t, p1, p2) - x;
        t -= cx / slope;
    }

    return t;
};

const bezier = (x1, y1, x2, y2) => {
    if (x1 === y1 && x2 === y2) return x => x;

    const table_size = 11;
    const table_step = 1 / (table_size - 1);
    const table = range(table_size).amap(i =>
        bezier_calc(i * table_step, x1, x2));

    const t = x => {
        const idx = table.findIndex(v => v > x) - 1;
        const start = idx * table_step;

        var dist = (x - table[idx]) / (table[idx + 1] - table[idx]);
        var guess = start + dist * table_step;
        const slope = bezier_slope(guess, x1, x2);

        if (slope == 0)
            return guess;

        if (slope >= newton_min_slope)
            return newton_raphson(x, guess, x1, x2);

        return binary_subdivide(x, start, start + table_step, x1, x2);
    };

    return x => x == 0 || x == 1 ? x : bezier_calc(t(x % 1), y1, y2);
};

const ease = bezier(0.25, 0.1, 0.25, 1);
const ease_in = bezier(0.42, 0, 1.0, 1.0);
const ease_out = bezier(0, 0, 0.58, 1.0);
const ease_in_out = bezier(0.42, 0, 0.58, 1);

const istep = n => x => Math.floor(n * (x % 1));
const irstep = n => x => Math.floor((n + 1) * (x % 1));

const step = n => x => istep(n)(x) / n;
const rstep = n => x => irstep(n)(x) / n;

const mirror = delta => x => x % delta > delta / 2 ? delta - (x % delta) : x % delta;

const cmap = (x0, x1, y0, y1) => x => map(x, x0, x1, y0, y1);
const amap = (xs0, xs1, ys0, ys1) => x =>
      zip(zip(xs0, xs1), zip(ys0, ys1))
          .map(([[x0, x1], [y0, y1]]) => map(x, x0, x1, y0, y1));

const lerp = (y0, y1) => x => cmap(0, 1, y0, y1)(x % 1);
const ilerp = (x0, x1) => x => cmap(x0, x1, 0, 1)(x) % 1;

const alerp = (ys0, ys1) =>
      zip(ys0, ys1).map(([y0, y1]) => cmap(0, 1, y0, y1));

const ailerp = (xs0, xs1) =>
      zip(xs0, xs1).map(([x0, x1]) => cmap(x0, x1, 0, 1));

const gradient = (c0, c1) => x =>
      alerp(c0, c1).amap(f => f(x));

const ngradient = (...pts) => {
    const [[p0], ...ps] = pts;

    const [fn] = ps.reduce(([fn, [c0, x0]], [c1, x1]) => [
        x => x >= x0 && x < x1 ? gradient(c0, c1)(ilerp(x0, x1)(x)) : fn(x),
        [c1, x1]
    ], [
        () => {},
        [p0, 0]
    ]);

    return x => fn(x % 1);
};

const ninterp = (...pts) => {
    const [[v0], ...ps] = pts;

    const [fn] = ps.reduce(([fn, [v0, x0]], [v1, x1]) => [
        x => x >= x0 && x < x1 ? lerp(v0, v1)(ilerp(x0, x1)(x)) : fn(x),
        [v1, x1]
    ], [
        () => {},
        [v0, 0]
    ]);

    return x => fn(x % 1);
};

///////// Classes


class OnsetDetect {
    constructor(f0, f1, thres, bpm) {
        this.f0 = f0;
        this.f1 = f1;
        this.thres = thres;

        this.e0 = 0;
        this.e = 0;

        this.lock = false;
        this.sens = 1 / (bpm / 60) * 1000;
    }

    sens(bpm) {
        this.sens = 1 / (bpm / 60) * 1000;
    }

    detect() {
        const [e, e0] = [fft.getEnergy(this.f0, this.f1) / 255, this.e0];
        this.e0 = e;

        if (!this.lock && e - e0 > this.thres) {
            this.lock = true;
            setTimeout(() => this.lock = false, this.sens);
            return true;
        }

        return false;
    }
}

class BeatDetect {
    constructor(f0, f1, thres, bpm) {
        this.f0 = f0;
        this.f1 = f1;
        this.thres = thres;

        this.lock = false;
        this.sens = 1 / (bpm / 60) * 1000;
    }

    sens(bpm) {
        this.sens = 1 / (bpm / 60) * 1000;
    }

    detect() {
        const e = fft.getEnergy(this.f0, this.f1) / 255;

        if (!this.lock && e > this.thres) {
            this.lock = true;
            setTimeout(() => this.lock = false, this.sens);
            return true;
        }

        return false;
    }
}

class Beat {
    constructor(bpm) {
        this.bpm = bpm;
        this.last = Date.now();
    }

    bpm(x) {
        this.bpm = x;
    }

    beat() {
        const now = Date.now();
        if (now - this.last > 1 / (this.bpm / 60) * 1000) {
            this.last = now;
            return true;
        }
        return false;
    }
}

class Decay {
    constructor(min, max, t, step) {
        this.x = min;
        this.max = max;

        const rate = (max - min) / t;

        setInterval(() => {
            this.x > min && (this.x -= (1 / step) * rate);
            this.x > max && (this.x = max);
        }, 1 / step * 1000);
    }

    max() {
        this.x = this.max;
    }

    set(x) {
        this.x = x;
    }

    get() {
        return this.x;
    }
}


///////// Registries and handlers


// General config interface for internals
let neuro_cfg = {
    fft_smooth: undefined,
    fft_bins: undefined
};
const neuro_config = cfg => neuro_cfg = cfg;

// Global font map
const neuro_fonts = new Map();
const neuro_font = name => neuro_fonts.get(name);
const neuro_load_font = (name, path) => {
    neuro_fonts.set(name, loadFont('assets/' + path));
};

// Global map for maintaining variable persistence across reloads
const neuro_vars = new Map();
const neuro_set = (k, v) => neuro_vars.set(k, v);
const neuro_set_all = obj => Object.entries(obj).map(([k,v]) => neuro_vars.set(k, v));
const neuro_get = (k, def) => neuro_vars.has(k) ? neuro_vars.get(k) : def;
const neuro_get_all = (...args) => args.map(k => neuro_vars.get(k));

const neuro_slider = (k, min, max) => {
    const el = document.createElement('input');
    el.type = 'range';
    el.min = min;
    el.max = max;
    el.value = min;
    el.oninput = () => neuro_set(k, +el.value);
    document.body.append(el);
};

// Init function that runs on script reload and post setup
let neuro_init_fn;
const neuro_init = fn => neuro_init_fn = fn;

// Handler for script changes
let neuro_script_fn;
const neuro_on_script = (name, fn) => neuro_script_fn = fn;

// Handler for messages
let neuro_message_fn;
const neuro_on_message = fn => neuro_message_fn = fn;

// Handler mapping for events
const neuro_event_fns = new Map();
const neuro_on = (event, fn) => neuro_event_fns.set(event, fn);

// Cross file script registry
let neuro_scripts = new Map();


///////// Runtime


let neuro_src;
let neuro_sound;
let neuro_stream;

// Globals accessible in any script
let amp;
let fft;
let bands;

const neuro_source = (type, cfg) => {
    neuro_src = type;

    if (type == 'in') {
        neuro_sound = new p5.AudioIn();
        neuro_sound.start();
        neuro_sound.connect(fft);
        neuro_sound.connect(amp);
    }

    if (type == 'file') {
        neuro_sound = loadSound('assets/' + cfg.path);
    }

    if (type == 'stream') {
        const el = document.createElement('audio');
        el.src = cfg.url;
        el.crossOrigin = 'anonymous';
        el.autoplay = true;
        document.body.append(el);

        const ctx = getAudioContext();
        neuro_stream = ctx.createMediaElementSource(el);
        neuro_stream.connect(p5.soundOut);
    }
};

const neuro_structure = (name, pre, post = () => {}) => fn => {
    let err = false;
    let prev = window[name];

    window[name] = () => {
        if (!err) {
            try {
                pre();
                fn();
                post();
            } catch (e) {
                console.error(e.stack);
                err = true;
            }
        } else {
            prev && prev();
        }
    };
};

const neuro_preload = neuro_structure('preload', () => {

});

const neuro_setup = neuro_structure('setup', () => {
    amp = new p5.Amplitude();
    fft = new p5.FFT(neuro_cfg.fft_smooth, neuro_cfg.fft_bins);
    bands = fft.getOctaveBands();
}, () => {
    neuro_init_fn && neuro_init_fn();
});

const neuro_draw = neuro_structure('draw', () => {
    fft.analyze();
});


///////// Socket Setup


const path = window.location.pathname;
const self = path.substring(path.lastIndexOf('/') + 1);

const socket = io();
socket.emit('init', self);

socket.on('msg', d => neuro_message_fn && neuro_message_fn(d));

socket.on('set', obj =>
    Object.entries(obj).map(([k,v]) => neuro_set(k, v)));

socket.on('event', ({event, data}) =>
    neuro_event_fns.has(event) && neuro_event_fns.get(event)(data));

let first = true;
socket.on('script', ({name, data}) => {
    neuro_scripts.set(name, data);
    neuro_script_fn && neuro_script_fn(name, data);

    if (name == self) {
        eval(data);
        first && (new p5(), first = false);
        neuro_init_fn && neuro_init_fn();
    }
});

