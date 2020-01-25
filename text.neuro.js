neuro_preload(() => {
    neuro_load_font('rave', 'da_mad_rave_italic.otf');
});

neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(430, 300);
});

neuro_init(() => {
    const bpm = 250;
    onset = new OnsetDetect(40, 120, 0.015, bpm);
    decay = new Decay(1, 1.05, 1 / (bpm / 60), 50);

    neuro_set_all({onset, decay});
});

neuro_draw(() => {
    let t = neuro_get('t', 0);
    const [onset, decay] = neuro_get_all('onset', 'decay');

    blendMode(BLEND);
    background(0);
    textFont(neuro_font('rave'));
    textAlign(CENTER);

    if (onset.detect()) {
        decay.set(1.05);
    }

    fill(255, 255, 255);
    scale(3 * decay.get());
    range(3).each(i => {
        const factor = 0.5 * sin(t + i * 0.5) + 0.5;

        const [r, g, b] = rgb(0.320, factor, 1);
        fill(r, g, b);
        text('NEUROTIC', 65, i * 14 + 20);
    });

    t += amp.getLevel();
    neuro_set('t', t);
});
