neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(1280, 720, WEBGL);
});

const [rows, cols] = [50, 50, 10];

neuro_init(() => {
    const bpm = 250;
    let onset = new OnsetDetect(40, 120, 0.025, bpm);
    let decay = new Decay(1, 1.05, 1 / (bpm / 60), 50);
    neuro_set_all({onset, decay});
});

neuro_draw(() => {
    const t = neuro_get('t', 0);
    const tc = neuro_get('tc', 0);
    const [onset, decay] = neuro_get_all('onset', 'decay');

    let terrain = range(rows).map(i =>
        range(cols).map(j =>
            map(noise(i * 0.1, j * 0.1 + tc * 0.03), 0, 1, -10, 10)));

    onset.detect() && decay.set(1.05);

    background(0);
    rotateX(radians(60));
    translate(1280 / -2, 720 / -2);

    scale(20);

    range(rows - 1).map(i => {
        stroke(255);
        noFill();
        beginShape(TRIANGLE_STRIP);
        range(cols).map(j => {
            vertex(j, i, terrain[j][i]);
            vertex(j, i + 1, terrain[j][i + 1]);
        });
        endShape();
    });

    neuro_set('t', t + 2 * amp.getLevel());
    neuro_set('tc', tc + 1);
});
