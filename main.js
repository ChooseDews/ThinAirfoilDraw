import * as _ from "lodash";
import Vue from "vue/dist/vue.js";
import "normalize.css/normalize.css";
import "purecss/build/pure-min.css";
import "./main.css";


let transpose = s => s[0].map((_, c) => s.map(r => r[c]));

let x = "black",
    y = 2,
    h,
    w,
    canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

function init() {
    canvas = document.getElementById('airfoil');
    console.log(canvas.width)
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;
    canvas.addEventListener("mousemove", function(e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function(e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function(e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function(e) {
        findxy('out', e)
    }, false);
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function drawLine(from, to) {
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function drawText(pos, text, color, font) {
    ctx.font = font || '14px serif';
    ctx.fillText(text, pos[0], pos[1]);
}

function drawDashedLine(from, to) {
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.strokeStyle = x;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);
}


function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;
        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}

function Runtime() {
    var imageData = ctx.getImageData(0, 0, 500, 300); //get all the pixel data
    let dataWidth = 500; //width and height hard coded
    let dataHeight = 300;
    var data = imageData.data;
    //
    // iterate over all pixels
    let points = [];
    for (var i = 0, n = data.length; i < n; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var alpha = data[i + 3];
        points.push(red + green + blue + alpha); //just add'em all together why not white would = 0
    }
    let rows = _.chunk(points, 500); //1D -> 2D Array
    rows = _.drop(rows, 50);
    rows = _.dropRight(rows, 50); //drop top and bottom 50 rows to remove text from data
    let dashed = rows.splice(99, 2) //remove dashed cord line from data
    let cols = transpose(rows);
    let lastFoundX;
    let lastFoundY;
    let topScatter = []; //all the position[x]=y of the edge of the top
    let bottomScatter = [];
    let TopXVales = [];
    let BottomXVales = [];
    for (let c in cols) {
        let col = cols[c];
        for (let i in col) {
            let pixel = col[i];
            if (pixel > 200) { //if the pixel is not white

                //this part does a little pixel fuzzy work within each col of the image to locate top and bottom positions
                if (lastFoundX == c && Math.abs(lastFoundY - i) < 3) {} else {
                    if (i < 99) {
                        topScatter[c] = Math.abs(i - 99); //absolte value just ensure we are on the right side of the line
                        TopXVales.push(c);
                    }
                    if (i >= 99) {
                        bottomScatter[c] = -Math.abs(i - 99); //always negative
                        BottomXVales.push(c);
                    }
                }
                lastFoundX = c;
                lastFoundY = i;
            }
        }
    }
    let XVales = _.intersection(TopXVales, BottomXVales); //find x-values where we have a top and bottom
    let meanCord = [];
    for (let x of XVales) {
        let meanY = (topScatter[x] + bottomScatter[x]) / 2; //calculate mean of two numbers
        meanCord[x] = meanY;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(x, 150 - meanY, 1, 1);
    }
    let cord = XVales[XVales.length - 1] - XVales[0]; //cord length in pixels
    let stepSize = 0.001;
    console.log('Cord', cord+"px")

    //see theory link for math behind A_0 & A_1
    function solveA_0() {//We are solving an integral 0->PI Riemann Sum
        let value = 0;
        for (let θ = 0; θ < Math.PI; θ = θ + stepSize) {
            let x = cord * (1 - Math.cos(θ)) / 2 + Number(XVales[0]); //coordinate transform
            let found;
            let last = 2;
            for (let val of XVales) { //find closest value to estimate slope (dx/dy)
                if (Math.abs(val - x) < last) {
                    found = val;
                    last = Math.abs(val - x);
                }
            }
            let y_0 = meanCord[found];
            let y_1 = meanCord[found + 1] || meanCord[found + 2];
            let x_0 = found;
            let x_1 = found + 1;
            if (!y_1) { //this is for the last point / if theres a missing point
                y_1 = meanCord[found];
                y_0 = meanCord[found - 1] || meanCord[found - 2];
                x_0 = found - 1;
                x_1 = found;
            }
            let slope = (y_1 - y_0) / (x_1 - x_0) || 0 //compute slope or just assume 0
            value += stepSize * slope; //Riemann Sum
        }
        return -value / Math.PI
    }

    function solveA_1() { //We are solving an integral 0->PI Riemann Sum
        let value = 0;
        for (let θ = 0; θ < Math.PI; θ = θ + stepSize) {
            let x = cord * (1 - Math.cos(θ)) / 2 + Number(XVales[0]);
            let found;
            let last = 2;
            for (let val of XVales) {
                if (Math.abs(val - x) < last) {
                    found = val;
                    last = Math.abs(val - x);
                }
            }
            let y_0 = meanCord[found];
            let y_1 = meanCord[found + 1] || meanCord[found + 2];
            let x_0 = found;
            let x_1 = found + 1;
            if (!y_1) {
                y_1 = meanCord[found];
                y_0 = meanCord[found - 1] || meanCord[found - 2];
                x_0 = found - 1;
                x_1 = found;
            }
            let slope = (y_1 - y_0) / (x_1 - x_0) || 0
            let inside = slope * Math.cos(1 * θ);
            value += stepSize * inside; //Riemann Sum
        }
        return value * 2 / Math.PI
    }
    let A_0 = solveA_0();
    let A_1 = solveA_1();
    console.log('solve A_0 @ 0 degree', A_0);
    console.log('solve A_1', A_1);
    let liftCoef = 2 * Math.PI * (A_0 + A_1 / 2);
    console.log('Lift Coeff', liftCoef);
    let liftCoefAtAngle = function(angle) {
        let a = (angle / 360) * 2 * Math.PI
        return 2 * Math.PI * (a + A_0 + A_1 / 2)
    }
    return {
        liftCoef,
        liftCoefAtAngle,
        A_0,
        A_1,
        cord
    }
}


let app = new Vue({
    data() {
        return {
            fresh: true,
            stats: null
        }
    },
    methods: {
        Runtime() {
            console.time('And It Only Took:')
            let stats = Runtime();
            console.log(stats);
            this.stats = stats;
            this.fresh = false;
            console.timeEnd('And It Only Took:')
        }
    },
    mounted() { //draw everything thats on the canvas pre-user
        init()
        drawDashedLine([0, 150], [500, 150])
        drawText([30, 30], 'Top of Airfoil')
        drawText([30, 300 - 30], 'Bottom of Airfoil')
    },
    components: {}
}).$mount("#app");
