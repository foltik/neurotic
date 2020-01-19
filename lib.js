///////// Helpers

function range(i, j, delta) {
    if (arguments.length === 1) {
        return range(0, i, 1);
    } else if (arguments.length === 2) {
        return range(i, j, 1);
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

        const rate = (max - min) / t;

        setInterval(() => {
            this.x > min && (this.x -= (1 / step) * rate);
            this.x > max && (this.x = max);
        }, 1 / step * 1000);
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

// Init function that runs on script reload and post setup
let neuro_init_fn;
const neuro_init = fn => neuro_init_fn = fn;

// Handler for script changes
let neuro_script_fn;
const neuro_on_script = (name, fn) => neuro_script_fn = fn;

// Handler for messages
let neuro_message_fn;
const neuro_on_message = fn => neuro_handler = fn;

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

const neuro_structure = (name, pre, post = () => {}) => fn =>
    (window[name] = () => (pre(), fn(), post()));

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

