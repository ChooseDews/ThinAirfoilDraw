

import * as _ from "lodash";
//App imports
import Vue from "vue/dist/vue.js";
//import css
import "normalize.css/normalize.css";
import "purecss/build/pure-min.css";
import "./main.css";

let drawPoint = (x, c, r) => {
    let graphics = new PIXI.Graphics();
    graphics.beginFill(c || 0xe74c3c); // Red
    graphics.drawCircle(...coordinateTransform(x), r || 1); // drawCircle(x, y, radius)
    graphics.endFill();
    stage.addChild(graphics);
};

function transpose(a) {

    // Calculate the width and height of the Array
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) {
        return [];
    }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];

    // Loop through every item in the outer array (height)
    for (i = 0; i < h; i++) {

        // Insert a new row (array)
        t[i] = [];

        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {

            // Save transposed data.
            t[i][j] = a[j][i];
        }
    }

    return t;
}



var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

var h
var w




var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

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

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;
    else y = 2;

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


function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
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


function getTop() {
    var imageData = ctx.getImageData(0, 0, 500, 300);
    let dataWidth = 500;
    let dataHeight = 300;


    console.log(dataWidth * dataHeight)

    var data = imageData.data;


    //
    // iterate over all pixels
    let points = [];
    for (var i = 0, n = data.length; i < n; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var alpha = data[i + 3];
        points.push(red + green + blue + alpha)

    }

    console.log(points, points.length);

    let rows = _.chunk(points, 500);
    rows = _.drop(rows, 50)
    rows = _.dropRight(rows, 50);
    let dashed = rows.splice(99, 2) //remove dashed line from data
    console.log(rows);
    let cols = transpose(rows)




    let lastFoundX;
    let lastFoundY;


    let topScatter = [];
    let bottomScatter = [];
    let TopXVales = [];
    let BottomXVales = [];



    for (let c in cols) {
        let col = cols[c];
        for (let i in col) {
            let pixel = col[i];

            if (pixel > 200) {



                if (lastFoundX == c && Math.abs(lastFoundY - i) < 3) {



                } else {


                    if (i < 99) {
                        topScatter[c] = Math.abs(i - 99);
                        TopXVales.push(c);
                    }
                    if (i >= 99) {
                        bottomScatter[c] = -Math.abs(i - 99);
                        BottomXVales.push(c);
                    }

                }


                lastFoundX = c;
                lastFoundY = i;

            } else {
                cols[c][i] = 0
            }



        }
    }
    let XVales = _.intersection(TopXVales, BottomXVales);


    let meanCord = [];

    for (let x of XVales) {

        let meanY = (topScatter[x] + bottomScatter[x]) / 2;
        meanCord[x] = meanY;

        ctx.fillStyle = "#FF0000";

        ctx.fillRect(x, 150 - meanY, 1, 1);




    }


    let cord = XVales[XVales.length - 1] - XVales[0];




    //a_0 =

    function solveA_0() {


        let stepSize = 0.005
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
            value += stepSize * slope;
        }

        return -value / Math.PI




    }


    function solveA_1() {


        let stepSize = 0.005
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
            value += stepSize * inside;
        }

        return value * 2 / Math.PI



    }

    let A_0 = solveA_0();
    let A_1 = solveA_1();

    console.log('solveA_0', A_0);
    console.log('solveA_1', A_1);

    let liftCoef = 2 * Math.PI * (A_0 + A_1 / 2);
    let liftCoefAtAngle = function(angle){
      let a = (angle/360) * 2 * Math.PI
      return 2 * Math.PI * (a + A_0 + A_1 / 2)
    }


    return {
      liftCoef,
      liftCoefAtAngle,
      A_0,
      A_1
    }


    //
}



let app = new Vue({
    data() {
        return {
            instructions: 'Draw Top And Bottom Of Airfoil',
            fresh: true,
            stats: null
        }
    },
    methods: {
        getTop(){
          let stats = getTop();

          console.log(stats);

          this.stats = stats;

          this.fresh = false;
        }
    },
    mounted() {




        init()

        drawDashedLine([0, 150], [500, 150])
        drawText([30, 30], 'Top of Airfoil')
        drawText([30, 300 - 30], 'Bottom of Airfoil')




    },
    components: {}
}).$mount("#app");
