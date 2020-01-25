neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(100, 100);
});

neuro_draw(() => {
    background(0);

    let f = bezier(0.77, 0.05, 0.7, 0.92);
    let c = 5;

    fill(255, 255, 255, lerp(0, 255)(f(amp.getLevel() * c)));
    rect(0, 0, 100, 100);
});
