neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(500, 500);
});

const spectrum = widget((w, h) => {
    let data = fft.analyze().slice(0, 645);
    const len = data.length;

    noStroke();

    range(len).map(i => {
        const x = map(i, 0, len, 0, w);
        const level = map(data[i], 0, 255, 0, h);
        rect(x, h - level, w / len, h);
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

    const [cx, cy] = [20, 20];

    push();
    stroke(50);
    range(h / cy).map(y => {
        beginShape(QUAD_STRIP);
        range(w / cx).map(x => {
            vertex(x * cx, y * cy);
            vertex(x * cx, (y + 1) * cy);
        });
        endShape();
    });
    pop();

    beginShape();
    range(len).map(i => {
        const x = map(i, 0, len, 0, w);
        const y = map(wave[i], -1, 1, 0, h);
        vertex(x, y);
    });
    endShape();

});

neuro_draw(() => {
    background(0);
    background(255, 0, 0, 30);

    fill(0, 255, 0);
    //spectrum(width - 50, height);

    stroke(0, 255, 0);
    strokeWeight(1);
    waveform(width - 50, height);

    at(width - 50, 0, () => meter(50, height));

    noStroke();
    fill(0, 255, 0);
    rect(width - 51, 0, 1, height);
});
