neuro_setup(() => {
    let canvas = createCanvas(1000, 350);
});

neuro_draw(() => {
    const t = neuro_get('t', 0);
    background(0);

    fill(255);

    ['ease', 'ease_in', 'ease_out', 'ease_in_out', 'rstep(10)', 'bezier(0.77, 0.05, 0.7, 0.92)'].map((fn, i) => {
        circle(200 + (eval(fn)(mirror(2)(t)) * 700), 50 * (i + 1), 50);
        text(fn, 40, 50 * (i + 1));
    });

    neuro_set('t', t + 0.005);
});
