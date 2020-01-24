neuro_setup(() => {
    let canvas = createCanvas(1100, 500);
});

neuro_init(() => {
    neuro_set('decay', new Decay(0, 1, 3, 10));
    neuro_set('color', 0.83);
});

neuro_on_message(msg => {
    const decay = neuro_get('decay');
    decay.set(1);
    neuro_set('msg', msg.body);
    console.log(msg);
});

// Call this function
// curl localhost:8000/http/emit/test
neuro_on('test', () => {
    console.log('We got a test!');
});

neuro_draw(() => {
    const t = neuro_get('t', 0);
    const decay = neuro_get('decay');

    background(0);

    stroke(255);



    // Change the color
    // curl localhost:8000/http/set?color=0.83
    stroke(...rgb(neuro_get('color'), 1, 1));
    const poly = (n, r) => range(0, 2*PI, 2*PI / n).amap(t => rectangular(r, t));
    at(150, 150, () => {
        poly(6, 100).each(([x, y]) =>
            circle(x, y, 8));

        poly(6, 100).zip_next().each(([[x0, y0], [x1, y1]]) =>
            line(x0, y0, x1, y1));
    });

    // Pulse a message
    // curl localhost:8000/http/send?body=hello!
    noStroke();
    fill(255);
    textSize(50 * decay.get());
    decay.get() && text(neuro_get('msg'), 100, 375);

    neuro_set('t', t + amp.getLevel());
});
