neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(800, 800, WEBGL);
});

function tetra(color, s) {
    const vs = [[ 1, 1, 1],
                [-1,-1, 1],
                [-1, 1,-1],
                [ 1,-1,-1]].map(p => p.map(v => v * s));

    const inds = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

    stroke(...color);
    inds.map(([i,j]) => [vs[i], vs[j]]).each(([v0, v1]) => line(...v0, ...v1));

    stroke(255);
    vs.map(([x,y,z]) => point(x, y, z));
}

neuro_draw(() => {
    let t = neuro_get('t', 0);
    background(0);

    rotateY(t * 0.1);
    rotateX(t * 0.12);

    const color = rgb(0.95, 1, 1);
    tetra(color, 80);
    rotateX(radians(90));
    tetra(color, 42);

    neuro_set('t', t + amp.getLevel());
});
