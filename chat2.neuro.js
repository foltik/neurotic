neuro_preload(() => {
    neuro_load_font('rave', 'da_mad_rave_italic.otf');
    neuro_load_font('go', 'Go-Mono-Italic.ttf');
});

neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(1200, 800);
});

neuro_on_message(msg => {
    const queue = neuro_get('queue', []);
    queue.push({...msg, r: random()});
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

function chat2(color1, color2, w, h, t) {
    fill(50);
    //rect(0, 0, w, h);
    noFill();
    stroke(...color1);

    beginShape();
    vertex(-10, h + 14);
    vertex(-10, 40);
    vertex(-20, 30);
    vertex(-20, -20);
    vertex(0, -40);
    vertex(260, -40);
    vertex(280, -20);
    vertex(330, -20);
    vertex(340, -10);
    endShape();

    beginShape();
    vertex(70, -20);
    vertex(280, -20);
    endShape();

    beginShape(LINES);
    vertex(50, -40);
    vertex(70, -20);
    vertex(110, -40);
    vertex(130, -20);
    vertex(185, -40);
    vertex(205, -20);
    endShape();

    fill(...color1);
    rect(339, -10, 4, 4);
    rect(w - 182, -10, 4, 4);

    text('uplink', 2, -26);
    text('stage', 72, -26);
    text('control', 132, -26);
    text('setting', 208, -26);

    noFill();
    beginShape();
    vertex(w - 180, -10);
    vertex(w - 180, -30);
    vertex(w - 175, -35);
    vertex(w - 45, -35);
    vertex(w - 35, -45);
    vertex(w + 10, -45);
    vertex(w + 30, -25);
    vertex(w + 30, 65);
    vertex(w + 5, 90);
    vertex(w + 5, h - 1);
    vertex(w - 10, h + 14);
    vertex(-10, h + 14);
    endShape();

    noStroke();
    fill(255);
    const f = 22;
    range(5).each(i => {
        beginShape();
        vertex(w + 30, 74 + i * f);
        vertex(w + 10, 92 + i * f);
        vertex(w + 10, 107 + i * f);
        vertex(w + 30, 89 + i * f);
        endShape();
    });

    rect(w - 170, -27, lerp(0, 80)(mirror(2)(t * 0.8)), 3);
    rect(w - 170, -22, lerp(0, 100)(mirror(2)(t * 0.5)), 3);
    rect(w - 170, -17, lerp(0, 110)(mirror(2)(t * 0.6)), 3);

    textFont(neuro_font('go'));

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

    const color1 = rgb(0.73, 1, 1);
    const color2 = rgb(0.78, 1, 1);

    translate(100, 100);
    chat2(color1, color2, 600, 200, t);

    t += amp.getLevel();
    neuro_set('t', t + amp.getLevel());
});
