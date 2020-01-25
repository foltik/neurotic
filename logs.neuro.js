neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(1024, 400);
});

neuro_init(() => {
    textAlign(CENTER);
    textSize(8);
    noStroke();
});

neuro_draw(() => {
    background(0);

    const data = fft.logAverages(bands);
    const len = bands.length;

    range(len).each(i => {
        fill((i * 30) % 100 + 50, 195, ((i * 25) + 50) % 255);

        const h = -height + map(data[i], 0, 255, height, 0);
        rect(((i+1) * width / len) - width/len, height, width/len, h);

        //fill(255);
        //text(bands[i].lo.toFixed(0), (i + 1) * width / len - width / len / 2, 30);
        //text(bands[i].hi.toFixed(0), (i + 1) * width / len - width / len / 2, 45);
    });
});
