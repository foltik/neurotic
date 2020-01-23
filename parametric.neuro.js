neuro_setup(() => {
    let canvas = createCanvas(1100, 500);
});

neuro_draw(() => {
    const t = neuro_get('t', 0);
    background(0);

    stroke(255);

    const poly = (n, r) => range(0, 2*PI, 2*PI / n).amap(t => rectangular(r, t));

    const polys = [6, 8, 12, 14, 16, 24];
    const r = 900 / (2 * polys.length);
    const xoff = 100;
    const ioff = 2 * r + 20;
    const yoff = 150;

    polys.each((n, i) => {
        const p = (x, y) => [x + xoff + i * ioff, y + yoff];
        poly(n, r).each(([x, y]) =>
            circle(...p(x,y), 8));

        poly(n, r).zip_next().each(([[x0, y0], [x1, y1]]) =>
            line(...p(x0, y0), ...p(x1, y1)));
    });

    const rose = (a, b, k) => theta => a + b * cos(k * theta);
    const spiral = (a, b) => theta => a + b * theta;
    const lemniscate = a => theta => sqrt(a * a * cos(2 * theta));
    const limacon = (a, b) => theta => a + b * cos(theta);
    const conic = (l, e) => theta => l / (1 + e * cos(theta));

    const fns = [
        conic(8, 1),
        lemniscate(50),
        rose(1, 50, 3),
        spiral(0, 10),
        limacon(40, 40),
        limacon(30, 50),
    ];

    fns.each((fn, i) => {
        const p = (x, y) => [x + xoff + i * ioff, y + 350];
        range(0, 2*PI, 2*PI / 500).each(x =>
            circle(...p(...rectangular(fn((x + t) % (2*PI)), x)), 5));
    });

    neuro_set('t', t + 0.005);
});
