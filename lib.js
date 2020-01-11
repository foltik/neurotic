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

const stream = url => {
    const el = document.createElement('audio');
    el.src = url;
    el.crossOrigin = 'anonymous';
    el.autoplay = true;
    el.loop = true;
    el.controls = true;
    document.body.append(el);
    //const el = document.getElementById('stream');

    const ctx = getAudioContext();
    const src = ctx.createMediaElementSource(el);
    src.connect(p5.soundOut);

    return el;
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





let amp;
let fft;
let bands;

const preload_hook = () => {

};

const setup_hook = () => {
    amp = new p5.Amplitude();
    fft = new p5.FFT();
    bands = fft.getOctaveBands();
};

const draw_hook = () => {
    fft.analyze();
};
