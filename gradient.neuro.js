neuro_preload(() => {
});

neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(500, 500);
});

neuro_init(() => {
    const bpm = 250;
    onset = new OnsetDetect(40, 120, 0.015, bpm);
    decay = new Decay(1, 1.05, 1 / (bpm / 60), 50);

    neuro_set_all({onset, decay});

    neuro_set('a', true);
});

neuro_draw(() => {
    let t = neuro_get('t', 0);
    const [onset, decay] = neuro_get_all('onset', 'decay');

    background(0);

    const c0 = [0, 255, 0];
    const c1 = [0, 0, 255];
    const c2 = [255, 255, 0];
    const c3 = [255, 0, 0];

    const g1 = gradient(c0, c1);
    const g2 = ngradient([c0, 0], [c1, 0.5], [c2, 0.75], [c3, 1]);

    if (neuro_get('a')) {
        neuro_set('a', false);
        console.log(g2(0.3));
    }

    range(300).each(x => {
        stroke(...g1(x / 300));
        line(x + 20, 20, x + 20, 80);

        stroke(...g2(x / 300));
        line(x + 20, 100, x + 20, 160);
    });

    t += amp.getLevel();
    neuro_set('t', t);
});
