const bins = 64;
neuro_config({
    fft_smooth: 0.8,
    fft_bins: bins
});

neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(1600, 900, WEBGL);
});

neuro_draw(() => {
    let t = neuro_get('t', 0);
    t += 0.3 * amp.getLevel();

    background(0);

    fill(0, 0, 0, 0);
    stroke(255, 255, 255, 255);
    strokeWeight(1);
    rotateZ(t);
    rotateY(t);

    const spec = fft.analyze();

    push();
    range(0, 2*PI, 2*PI / bins).map((f, i) => {
        const d = spec[i] / 255;
        const ir = 100 + (100 * d);
        const or = 200 + (50 * d);

        const [tx, ty] = [or * cos(f), or * sin(f)];
        const [r, g, b] = rgb(0.83, d, 1);

        push();
        rotate(90, createVector(tx, ty, 0));
        point(tx, ty, 0);
        stroke(r, g, b);
        circle(tx, ty, ir);
        pop();
    });
    pop();

    neuro_set('t', t);
});
