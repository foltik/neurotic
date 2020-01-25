neuro_preload(() => {
    neuro_load_font('rave', 'da_mad_rave_italic.otf');
    neuro_load_font('go', 'Go-Mono-Italic.ttf');
});

neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(800, 800);
});

neuro_on_message(msg => {
    const queue = neuro_get('queue', []);
    queue.push(msg);
    queue.length > 100 && queue.shift();
    neuro_set('queue', queue);
});

neuro_init(() => {
    const bpm = 250;
    onset = new OnsetDetect(40, 120, 0.015, bpm);
    decay = new Decay(1, 1.05, 1 / (bpm / 60), 50);

    neuro_set_all({onset, decay});
});

function messages(w, h) {
    const queue = neuro_get('queue', []);

    const fmt = ({name, msg}) => `${name}: ${msg}`;

    let max = 9999;
    queue.each(m => {
        msg = [...fmt(m)];
        let t = [];
        while (textWidth(t.join('')) < w && msg.length) {
            t.push(msg[0]);
            msg.shift();
        }
        if (msg.length)
            max = Math.min(max, t.length - 1);
    });

    let buf = [];
    queue.each(m => {
        const {name, msg} = m;
        let s = fmt(m);

        if (s.length > max) {
            buf.push({name, msg: msg.slice(0, max - name.length - 2)});
            s = s.slice(max);
            while (s.length) {
                buf.push({msg: s.slice(0, max)});
                s = s.slice(max);
            }
        } else {
            buf.push(m);
        }
    });

    const n = Math.floor(h / 16);
    const msgs = buf.slice(Math.max(buf.length - n, 0));

    return msgs;
}

function chat1(color1, color2, w, h, t) {
    noFill();
    stroke(...color1);

    const pad = 10;

    strokeWeight(2);
    rect(-pad, -pad, w + 2 * pad, h + 2 * pad);
    strokeWeight(1);

    const msgs = messages(w, h);
    msgs.reverse().map(({name, msg}, i) => {
        const y = h - i * 16;
        if (name) {
            fill(...color2);
            noStroke();
            text(name, 0, h - i * 16);
            fill(255);
            stroke(...color2);
            text(`: ${msg}`, textWidth(name), y);
        } else {
            fill(255);
            stroke(...color2);
            text(msg, 0, y);
        }
    });
}

function chat2(w, h, t) {
    const msgs = messages(w, h);
    msgs.reverse().map(({name, msg}, i) => {
        const y = h - i * 16;
        if (name) {
            fill(0, 195, 255);
            text(name, 0, h - i * 16);
            fill(255);
            text(`: ${msg}`, textWidth(name), y);
        } else {
            fill(255);
            text(msg, 0, y);
        }
    });
}

function chat3(w, h, t) {
    const msgs = messages(w, h);
    msgs.reverse().map(({name, msg}, i) => {
        const y = h - i * 16;
        if (name) {
            fill(0, 195, 255);
            text(name, 0, h - i * 16);
            fill(255);
            text(`: ${msg}`, textWidth(name), y);
        } else {
            fill(255);
            text(msg, 0, y);
        }
    });
}

neuro_draw(() => {
    let t = neuro_get('t', 0);
    //const [onset, decay] = neuro_get_all('onset', 'decay');

    blendMode(BLEND);
    background(0);

    fill(255);
    textAlign(LEFT);

    const color1 = rgb(0.33, 1, 1);
    const color2 = rgb(0.45, 1, 1);

    translate(100, 100);
    //textFont(neuro_font('rave'));
    textFont(neuro_font('go'));
    chat1(color1, color2, 400, 600, t);

    t += amp.getLevel();
    neuro_set('t', t + amp.getLevel());
});
