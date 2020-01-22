neuro_preload(() => {
    neuro_load_font('rave', 'da_mad_rave_italic.otf');
});

neuro_setup(() => {
    //neuro_source('in');
    let canvas = createCanvas(1200, 200);
});

function typer(strs, period) {
    const tc = neuro_get('t', 0);

    const [pd, ppd] = [period, period * strs.length];
    const [t, tt] = [(tc % pd) / pd, (tc % ppd) / ppd];

    const str = strs[Math.floor(tt * strs.length)];
    const width = textWidth(str) + 8;
    const len = str.length;

    const animate = (start, end, fn) =>
        t >= start && t <= end && fn((t - start) / (end - start));

    animate(0, 0.1, fr => {
        const i = Math.floor(fr * len);
        text(str.slice(0, i), 0, 0);
        rect(i * (width / len), 2, width / len, 5);
    });

    animate(0.1, 0.11, fr => rect(width, 2, (1 - ease_in_out(fr)) * (width / len), 5));
    animate(0.1, 0.9, () => text(str, 0, 0));
    animate(0.89, 0.9, fr => rect(width, 2, fr * (width / len), 5));

    animate(0.9, 1, fr => {
        const i = len - Math.floor(fr * len);
        text(str.slice(0, i), 0, 0);
        rect(i * (width / len), 2, width / len, 5);
    });
}

neuro_draw(() => {
    let t = neuro_get('t', 0);

    background(0);
    textFont(neuro_font('rave'));
    textAlign(LEFT);
    textSize(15);

    stroke(0, 255, 0);
    strokeWeight(0.5);
    noFill();

    scale(3);
    translate(10, 20);
    typer(['NEUROTIC', 'THOMAS_LEGACY', 'FOLTIK', '4FTERLIFE_ONLINE'], 500);

    neuro_set('t', t + 1);
});
