neuro_setup(() => {
    let canvas = createCanvas(1000, 350);
});

neuro_draw(() => {
    const t = neuro_get('t', 0);
    background(0);

    fill(255);

    ['ease', 'ease_in', 'ease_out', 'ease_in_out', 'rstep(10)', 'step(10)'].map((fn, i) => {
        const fr = t % 2;
        const x = fr > 1 ? 2 - fr : fr;
        circle(200 + (eval(fn)(x) * 700), 50 * (i + 1), 50);
        text(fn, 40, 50 * (i + 1));
    });

    neuro_set('t', t + 0.005);
});
