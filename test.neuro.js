neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(500, 500);
});

const spectrum = widget((w, h) => {
    let data = fft.analyze().slice(0, 645);
    const len = data.length;

    noStroke();

    range(len).each(i => {
        const x = map(i, 0, len, 0, w);
        const level = map(data[i], 0, 255, 0, h);
        rect(x, h - level, w / len, level);
    });
});

const meter = widget((w, h) => {
    const level = map(amp.getLevel(), 0, 1, 0, h);
    noStroke();
    rect(0, h - level, w, level);
});

const waveform = widget((w, h) => {
    let wave = fft.waveform();
    const len = wave.length;

    noFill();

    const [dx, dy] = [w / 20, h / 20];

    push();
    stroke(50);
    range(0, h, dy).each(y => {
        beginShape(QUAD_STRIP);
        range(0, w + dx, dx).each(x => {
            vertex(x, y);
            vertex(x, y + dy);
        });
        endShape();
    });
    pop();

    beginShape();
    range(len).each(i => {
        const x = map(i, 0, len, 0, w);
        const y = map(wave[i], -1, 1, 0, h);
        vertex(x, y);
    });
    endShape();
});

neuro_draw(() => {
    background(0);

    stroke(0, 255, 0);

    at(0, height - 150, () =>
        spectrum(width - 50, 150));

    at(0, 0, () =>
        waveform(width - 50, height));

    at(width - 50, 0, () =>
        meter(50, height));

    fill(0, 255, 0);
    noStroke();
    rect(width - 51, 0, 1, height);
});
