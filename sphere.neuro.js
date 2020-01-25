neuro_setup(() => {
    neuro_source('in');
    let canvas = createCanvas(800, 800, WEBGL);
});

function psphere(color, dx, dy, r) {

    const verts = [];
    const norms = [];
    const uvs = [];

    noFill();
    stroke(...color);
    scale(r);

    const t = neuro_get('t');

    const geom = new p5.Geometry(dx, dy, function() {
        range(dx + 1).each(i => {
            const theta = 2 * Math.PI * (i / dx);

            range(dy + 1).each(j => {
                const phi = Math.PI * (j / dy) - Math.PI / 2;

                const p = [cos(phi) * sin(theta), sin(phi), cos(phi) * cos(theta)];

                const vec = createVector(...p);

                this.vertices.push(vec);
                this.vertexNormals.push(vec);
                this.uvs.push(i / dx, j / dy);
            });
        });
    });

    geom.computeFaces();

    beginShape(TRIANGLES);
    geom.faces.map(is => is.map(i => geom.vertices[i])).map(([p0, p1, p2]) => {
        vertex(p0.x, p0.y, p0.z);
        vertex(p1.x, p1.y, p1.z);
        vertex(p2.x, p2.y, p2.z);
    });
    endShape();

    stroke(255);
    geom.vertices.map(v => point(v.x, v.y, v.z));
}

neuro_draw(() => {
    let t = neuro_get('t', 0);
    background(0);

    rotateY(t * 0.1);
    rotateX(t * 0.03);

    psphere(rgb(0.95, 1, 1), 11, 11, 80);

    neuro_set('t', t + amp.getLevel());
});
