neuro_setup(() => {
    neuro_source('in');

    let canvas = createCanvas(500, 500);
});

function turntable(bpm) {
    fill(0, 0, 0, 0);
    stroke(255, 255, 255);
    strokeWeight(1);

    const t = millis() / 1000;
    const rpm = bpm / 4;
    const rate = (2 * PI) * (rpm / 60);

    const r = 100;

    const [tx, ty] = [r * cos(t * rate), r * sin(t * rate)];

    circle(r, r, 2 * r);
    line(r, r, r + tx, r + ty);
}

function bigturntable(bpm) {
    const t = millis() / 1000;
    const [w, h] = [300, 150];

    fill(0, 0, 0, 0);
    stroke(255, 255, 255);
    strokeWeight(1);

    rect(0, 0, w, h);
    line(w/2, 0, w/2, h);

    const [cx1, cx2] = [w * (1/5), w * (4/5)];
    const cy = h * (21/32);
    const cr = 40;
    const rpm = bpm / 4;
    const rate = (2 * PI) * (rpm / 60);

    circle(cx1, cy, 2 * cr);
    circle(cx2, cy, 2 * cr);

    const [cpx, cpy] = [(cr + 5) * cos(t * rate), (cr + 5) * sin(t * rate)];
    line(cx1, cy, cx1 + cpx, cy + cpy);
    line(cx2, cy, cx2 + cpx, cy + cpy);
}

neuro_draw(() => {
    background(0);
    translate(10, 10);
    turntable(140);
});
