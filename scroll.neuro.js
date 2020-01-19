neuro_preload(() => {
    neuro_load_font('go', 'Go-Mono-Italic.ttf');
});

neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(900, 900);
});

neuro_init(() => {
    const bpm = 250;
    onset = new OnsetDetect(40, 120, 0.025, bpm);
    decay = new Decay(1, 1.01, 1 / (bpm / 60), 50);

    neuro_set_all({onset, decay});
});

const scroll = str => {
    const lines = str.split('\n');
    const [t, tc] = neuro_get_all('t', 'tc');

    const size = lines.length * 8;
    const p1 = tc % size;
    const p2 = p1 - size;

    wit(() => translate(0, p1), () => {
        lines.map((l, i) => {
            const factor = 0.5 * sin(t + i * 0.15) + 0.5;

            const [r, g, b] = rgb(0.85, factor, 1);
            fill(r, g, b);
            text(l, 0, i * 8);
        });
    });

    wit(() => translate(0, p2), () => {
        lines.map((l, i) => {
            const factor = 0.5 * sin(t + i * 0.15) + 0.5;

            const [r, g, b] = rgb(0.85, factor, 1);
            fill(r, g, b);
            text(l, 0, i * 8);
        });
    });
};

neuro_draw(() => {
    let t = neuro_get('t', 0);
    let tc = neuro_get('tc', 0);
    const [onset, decay] = neuro_get_all('onset', 'decay');

    background(0);
    textFont(neuro_font('go'));
    textAlign(LEFT);
    textSize(6);

    onset.detect() && decay.set(1.01);

    fill(255, 255, 255);
    scale(3 * decay.get());

    translate(3, 0);
    scroll(neuro_scripts.get('torus') || '');

    t += 2 * amp.getLevel();
    tc += 1;
    neuro_set_all({t, tc});
});
