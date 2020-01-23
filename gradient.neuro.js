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
});

neuro_draw(() => {
    let t = neuro_get('t', 0);
    const [onset, decay] = neuro_get_all('onset', 'decay');

    background(0);

    const c0 = [0, 255, 0];
    const c1 = [0, 0, 255];
    const c2 = [255, 0, 0];

    const g1 = gradient(c0, c1);
    //const g2 = ngradient(c0, c1, c2);

    range(100).each(x => {
        stroke(...g1(x/100));
        //line(x, 20, x, 40);
    });

    t += amp.getLevel();
    neuro_set('t', t);
});
