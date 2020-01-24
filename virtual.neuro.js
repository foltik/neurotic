neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(800, 800);
});

function virtual(color) {
    color = [255, 255, 255];

    const outline = w => (noFill(), stroke(...color), strokeWeight(w));
    const full = () => fill(...color);

    outline(2);
    circle(0, 0, 200);
}

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

    translate(400, 400);
    virtual();
});
