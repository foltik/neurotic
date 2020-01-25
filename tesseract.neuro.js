neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(800, 800, WEBGL);
});

const tapply1 = (p, t, a1, a2) => {
    const [l, k] = [
         Math.cos(t) * p[a1] + Math.sin(t) * p[a2],
        -Math.sin(t) * p[a1] + Math.cos(t) * p[a2]
    ];
    p[a1] = l;
    p[a2] = k;
};

const tapply2 = (p, t, a1, a2) => {
    const [l, k] = [
         Math.cos(t) * p[a1] - Math.sin(t) * p[a2],
         Math.sin(t) * p[a1] + Math.cos(t) * p[a2]
    ];
    p[a1] = l;
    p[a2] = k;
};

const tverts = (xy, yz, xw, xz, yw, zw) =>
    range(16).amap(i => {
        const p = range(4).amap(j => ((i >> j) & 1) * 2 - 1);
        tapply1(p, xy, 0, 1);
        tapply1(p, yz, 1, 2);
        tapply1(p, xw, 0, 3);
        tapply2(p, xz, 0, 2);
        tapply2(p, yw, 1, 3);
        tapply2(p, zw, 2, 3);
        return p;
    });

const tindices = (() => {
    let inds = [];
    const t = tverts(0, 0, 0, 0, 0, 0);
    range(t.length).each(i => {
        range(i + 1, t.length).each(j => {
            let count = 0;
            range(4).each(k => t[i][k] == t[j][k] && count++);
            count == 3 && inds.push([i, j]);
        });
    });
    return inds;
})();

const tproject = ([x, y, z, w], sz) => [
    (x + Math.SQRT2 * z) * sz,
    (y + Math.SQRT2 * w) * sz
];

function tesseract(color, sz, xy = 0, yz = 0, xw = 0, xz = 0, yw = 0, zw = 0) {
    const verts = tverts(xy, yz, xw, xz, yw, zw).map(p => tproject(p, sz));

    fill(255);
    verts.each(p => {
        circle(...p, 5);
    });

    noFill();
    stroke(...color);
    beginShape(LINES);
    tindices.map(([v0, v1]) => [verts[v0], verts[v1]]).each(([p0, p1]) => {
        vertex(...p0);
        vertex(...p1);
    });
    endShape();
}


neuro_draw(() => {
    let t = neuro_get('t', 0);
    background(0);

    tesseract(rgb(0.95, 1, 1), 50, t * 0.1, 0.4, 0.1, t * 0.01, 0, 0);

    neuro_set('t', t + amp.getLevel());
});
