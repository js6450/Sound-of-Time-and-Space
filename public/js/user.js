/*
Built by Jiwon Shin
 October 2017
 */

'use strict';

//screen.orientation.lock("portrait");

var cvs;
var socket = io();

var DELAY = 500;

/*
 MODES

 0: ready
 1: touch & shake
 2: melody
 3: seun sounds
 4: closing
 5: test
 6: opening

 */

var MODE = 0;
//var soundIndex = 0;

var colorH, colorS, colorB, hue, saturation, brightness;

var osc;
//var midiNotes = [48, 50, 52, 53, 55, 57, 59, 60, 62];
//var midiNotes = [64, 65, 67, 69, 71, 72, 74, 76, 77, 78];
var intervalShaked = false;

var currentMelody = 0;

var title;
var titleW, titleH, titleX, titleY;

var seoul;
var seoulW, seoulH, seoulX, seoulY;

var sangsang;
var sangsangW, sangsangH, sangsangX, sangsangY;

var moqn;
var moqnW, moqnH, moqnX, moqnY;

var lastClicked, clickTime;

var orientation = "portrait";

function setup(){

    cvs = createCanvas(windowWidth, windowHeight);
    cvs.id('canvas');

    //user properties
    socket.emit('requestProperties');
    socket.on('setProperties', onSetProperties);

    //modes
    socket.on('setMode', function(data){
        console.log("setting mode to " + data);
        MODE = parseInt(data);
    });
    socket.on('changeMode', onChangeMode);

    //melody
    socket.on('setMelody', onSetMelody);

    lastClicked = new Date().getTime();

    noStroke();
    setShakeThreshold(30);

    // hue = random(360);
    colorH = hue;
    colorS = 100;
    colorB = 100;
    colorMode(HSB);

    osc = new p5.Oscillator('sine');
    osc.start();
    osc.amp(0.0); //slient

    seoul = loadImage("assets/img/seoul.png");
    title = loadImage("assets/img/title.png");
    sangsang = loadImage("assets/img/sangsang.png");
    moqn = loadImage("assets/img/moqn.png");

    imageMode(CENTER);
}


function draw(){

    // if(deviceOrientation != orientation){
    //     orientation = deviceOrientation;
    //     resizeCanvas(windowWidth, windowHeight);
    // }

    colorH = (hue + sin(frameCount * 0.03) * 15 + 360) % 360;
    if (colorS < saturation - 1) {
        colorS = lerp(colorS, saturation, 0.03);
    } else {
        colorS = saturation;
    }

    if (colorB < brightness - 1) {
        colorB = lerp(colorB, brightness, 0.015);
    } else {
        colorB = brightness;
    }

    background(colorH, colorS, colorB);

    switch(MODE){
        case 1:
            mode_TS_shaked();
            break;
        case 2:
            mode_melody_shaked();
            break;
        case 3:
            mode_seun_shaked();
            break;
        case 4:
            mode_closing_shaked();
            break;
        case 5:
            mode_test_shaked();
            break;
        default:
            mode_ready_shaked();
    }

    switch(MODE){
        case 1:
            mode_TS_display();
            break;
        case 2:
            mode_melody_display();
            break;
        case 3:
            mode_seun_display();
            break;
        case 4:
            mode_closing_display();
            break;
        case 5:
            mode_test_display();
            break;
        default:
            mode_ready_display();
    }

    image(title, titleX, titleY, titleW, titleH);
    image(seoul, seoulX, seoulY, seoulW, seoulH);
    image(sangsang, sangsangX, sangsangY, sangsangW, sangsangH);
    image(moqn, moqnX, moqnY, moqnW, moqnH);

    //text("시간과 공간의 소리, 다시 함께 세운");
    fill(255);
    textSize(24);
    text(MODE, textWidth(MODE) / 2, 24);
    // text(hue, textWidth(hue) / 2, 48);
    // text(soundIndex, textWidth(soundIndex) / 2, 72);
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
    switch(MODE){
        case 1:
            mode_TS_touch();
            break;
        case 2:
            mode_melody_touch();
            break;
        case 3:
            mode_seun_touch();
            break;
        case 4:
            mode_closing_touch();
            break;
        case 5:
            mode_test_touch();
            break;
        default:
            mode_ready_touch();
    }
}

function touchEnded() {
    switch(MODE){
        case 1:
            mode_TS_touchEnded();
            break;
        case 2:
            mode_melody_touchEnded();
            break;
        case 3:
            mode_seun_touchEnded();
            break;
        case 4:
            mode_closing_touchEnded();
            break;
        case 5:
            mode_test_touchEnded();
            break;
        default:
            mode_ready_touchEnded();
    }
}

function deviceShaken() {
    switch(MODE){
        case 1:
            mode_TS_shake();
            break;
        case 2:
            mode_melody_shake();
            break;
        case 3:
            mode_seun_shake();
            break;
        case 4:
            mode_closing_shake();
            break;
        case 5:
            mode_test_shake();
            break;
        default:
            mode_ready_shake();
    }
}

function onSetProperties(data){
    hue = parseInt(data.substr(0, 3));
    saturation = map(parseInt(data.substr(3, 1)), 0, 9, 50, 100);
    brightness = map(parseInt(data.substr(4, 1)), 0, 9, 50, 100);
    //soundIndex = data.soundIndex;
}

function onChangeMode(data){
    console.log("Mode changed to: " + data);
    MODE = data;
}

function onSetMelody(data){
    currentMelody = parseInt(data);
}

/*
 MODE FUNCTIONS
 */

//READY MODE
function mode_ready_display(){

    seoulW = width/2;
    seoulH = seoulW * seoul.height / seoul.width;
    seoulX = width/2;
    seoulY = height/2;

    titleW = width * 3 / 4;
    titleH = titleW * title.height / title.width;
    titleX = width/2;
    titleY = titleH;

    moqnW = width * 1.5 / 7;
    moqnH = moqnW * moqn.height / moqn.width;
    moqnX = width / 2;
    moqnY = height - moqnH;

    sangsangW = width * 3 / 7;
    sangsangH = sangsangW * sangsang.height / sangsang.width;
    sangsangX = width / 2;
    sangsangY = height - sangsangH - moqnH * 3 / 2;

    if(deviceOrientation == 'landscape' || width > height){
        seoulW = height/2;
        seoulH = seoulW * seoul.height / seoul.width;
        seoulX = width/2;
        seoulY = height/2;

        titleW = width * 4 / 7;
        titleH = titleW * title.height / title.width;
        titleX = width/2;
        titleY = titleH;

        moqnW = width / 7;
        moqnH = moqnW * moqn.height / moqn.width;
        moqnX = width / 2;
        moqnY = height - moqnH;

        sangsangW = width * 2 / 7;
        sangsangH = sangsangW * sangsang.height / sangsang.width;
        sangsangX = width / 2;
        sangsangY = height - sangsangH - moqnH * 3 / 2;
    }

}

function mode_ready_touch() {
    clickTime = new Date().getTime();

    if(clickTime - lastClicked >= DELAY){
        colorS = 0;

        //var midiIndex = floor(map(mouseX, 0, width, 0, midiNotes.length));
        // var oscFreq = midiToFreq(64);
        // osc.freq(oscFreq);
        // osc.amp(1, 0.01); // volume, fadeOut Speed

        var x = Math.floor(map(mouseX, 0, width, 0, 99));
        var y = Math.floor(map(mouseY, 0, height, 0, 99));

        var xStr = ('00' + x).substr(-2);
        var yStr = ('00' + y).substr(-2);

        var xyStr = xStr + yStr;

        console.log("sending data");
        socket.emit('drawing', xyStr);

        lastClicked = clickTime;
    }else{
        console.log("too fast! wait!");
    }
}

function mode_ready_touchEnded(){

}

function mode_ready_shake() {

}

function mode_ready_shaked(){

}

//TOUCH & SHAKE MODE
function mode_TS_display(){

    var newSeoulW = width * 0.175;
    var newSeoulH = newSeoulW * seoul.height / seoul.width;
    var newSeoulY = height - newSeoulH * 3 / 4;

    if(seoulW > newSeoulW - 1){
        seoulW = lerp(seoulW, newSeoulW, 0.1);
    }else{
        seoulW = newSeoulW;
    }
    if(seoulH > newSeoulH - 1){
        seoulH = lerp(seoulH, newSeoulH, 0.1);
    }else{
        seoulH = newSeoulH;
    }
    seoulX = width / 2;
    if(seoulY < newSeoulY - 1){
        seoulY = lerp(seoulY, newSeoulY, 0.1);
    }else{
        seoulY = newSeoulY;
    }

    var newTitleW = width / 2;

    if(titleW > newTitleW - 1){
        titleW = lerp(titleW, newTitleW, 0.1);
    }else{
        titleW = newTitleW;
    }
    titleH = titleW * title.height / title.width;
    titleX = width/2;
    titleY = titleH;

    var newSangsangW = width / 4;
    var newSangsangH = newSangsangW * sangsang.height / sangsang.width;
    var newSangsangX = width / 6;

    if(sangsangW > newSangsangW - 1){
        sangsangW = lerp(sangsangW, newSangsangW, 0.1);
    }else{
        sangsangW = newSangsangW;
    }
    if(sangsangH > newSangsangH - 1){
        sangsangH = lerp(sangsangH, newSangsangH, 0.1);
    }else{
        sangsangH = newSangsangH;
    }
    if(sangsangX > newSangsangX - 1){
        sangsangX = lerp(sangsangX, width / 6, 0.1);
    }else{
        sangsangX = newSangsangX;
    }
    if(sangsangY < newSeoulY - 1){
        sangsangY = lerp(sangsangY, newSeoulY, 0.1);
    }else{
        sangsangY = newSeoulY;
    }

    if(moqnH < newSangsangH - 1){
        moqnH = lerp(moqnH, newSangsangH, 0.1);
    }else{
        moqnH = newSangsangH;
    }

    var newMoqnW = moqnH * moqn.width / moqn.height;
    var newMoqnX = width * 5 / 6;

    if(moqnW < newMoqnW - 1){
        moqnW = lerp(moqnW, newMoqnW, 0.1);
    }else{
        moqnW = newMoqnW;
    }
    if(moqnX < newMoqnX - 1){
        moqnX = lerp(moqnX, width * 5 / 6, 0.1);
    }else{
        moqnX = newMoqnX;
    }
    if(moqnY > newSeoulY - 1){
        moqnY = lerp(moqnY, newSeoulY, 0.1);
    }else{
        moqnY = newSeoulY;
    }
}

function mode_TS_touch(){
    clickTime = new Date().getTime();

    if(clickTime - lastClicked >= DELAY){
        colorS = 0;

        //var midiIndex = floor(map(mouseX, 0, width, 0, midiNotes.length));
        var oscFreq = midiToFreq(64);
        osc.freq(oscFreq);
        osc.amp(1, 0.01); // volume, fadeOut Speed

        var x = Math.floor(map(mouseX, 0, width, 0, 99));
        var y = Math.floor(map(mouseY, 0, height, 0, 99));

        var xStr = ('00' + x).substr(-2);
        var yStr = ('00' + y).substr(-2);

        var xyStr = xStr + yStr;

        console.log("sending data");

        socket.emit('drawing', xyStr);

        lastClicked = clickTime;
    }else{
        console.log("too fast! wait!");
    }
}

function mode_TS_touchEnded(){
    osc.amp(0, 0.5);
}

function mode_TS_shake(){
    intervalShaked = 10;
}

function mode_TS_shaked(){
    if (intervalShaked > 1) {
        intervalShaked--;
        var oscFreq = midiToFreq(79);
        osc.freq(oscFreq);
        osc.amp(1, 0.01)
    } else if (intervalShaked == 1) {
        socket.emit('changeProperties');
        intervalShaked--;
        osc.amp(0, 0.5);
    } else {
        intervalShaked = 0;
    }
}

//MELODY MODE
function mode_melody_display(){

    var newSeoulW = width * 0.175;
    var newSeoulH = newSeoulW * seoul.height / seoul.width;
    var newSeoulY = height - newSeoulH * 3 / 4;

    if(seoulW > newSeoulW - 1){
        seoulW = lerp(seoulW, newSeoulW, 0.1);
    }else{
        seoulW = newSeoulW;
    }
    if(seoulH > newSeoulH - 1){
        seoulH = lerp(seoulH, newSeoulH, 0.1);
    }else{
        seoulH = newSeoulH;
    }
    seoulX = width / 2;
    if(seoulY < newSeoulY - 1){
        seoulY = lerp(seoulY, newSeoulY, 0.1);
    }else{
        seoulY = newSeoulY;
    }

    var newTitleW = width / 2;

    if(titleW > newTitleW - 1){
        titleW = lerp(titleW, newTitleW, 0.1);
    }else{
        titleW = newTitleW;
    }
    titleH = titleW * title.height / title.width;
    titleX = width/2;
    titleY = titleH;

    var newSangsangW = width / 4;
    var newSangsangH = newSangsangW * sangsang.height / sangsang.width;
    var newSangsangX = width / 6;

    if(sangsangW > newSangsangW - 1){
        sangsangW = lerp(sangsangW, newSangsangW, 0.1);
    }else{
        sangsangW = newSangsangW;
    }
    if(sangsangH > newSangsangH - 1){
        sangsangH = lerp(sangsangH, newSangsangH, 0.1);
    }else{
        sangsangH = newSangsangH;
    }
    if(sangsangX > newSangsangX - 1){
        sangsangX = lerp(sangsangX, width / 6, 0.1);
    }else{
        sangsangX = newSangsangX;
    }
    if(sangsangY < newSeoulY - 1){
        sangsangY = lerp(sangsangY, newSeoulY, 0.1);
    }else{
        sangsangY = newSeoulY;
    }

    if(moqnH < newSangsangH - 1){
        moqnH = lerp(moqnH, newSangsangH, 0.1);
    }else{
        moqnH = newSangsangH;
    }

    var newMoqnW = moqnH * moqn.width / moqn.height;
    var newMoqnX = width * 5 / 6;

    if(moqnW < newMoqnW - 1){
        moqnW = lerp(moqnW, newMoqnW, 0.1);
    }else{
        moqnW = newMoqnW;
    }
    if(moqnX < newMoqnX - 1){
        moqnX = lerp(moqnX, width * 5 / 6, 0.1);
    }else{
        moqnX = newMoqnX;
    }
    if(moqnY > newSeoulY - 1){
        moqnY = lerp(moqnY, newSeoulY, 0.1);
    }else{
        moqnY = newSeoulY;
    }
}

function mode_melody_touch(){
    clickTime = new Date().getTime();

    if(clickTime - lastClicked >= DELAY){
        colorS = 0;

        lastClicked = clickTime;
    }
}

function mode_melody_touchEnded(){

}

function mode_melody_shake(){
    intervalShaked = 10;
}

function mode_melody_shaked(){
    if (intervalShaked > 1) {
        intervalShaked--;
        if(currentMelody > 0){
            var oscFreq = midiToFreq(currentMelody);
            osc.freq(oscFreq);
            osc.amp(1, 0.01)
        }else{
            osc.amp(0, 0.03);
        }
    } else if (intervalShaked == 1) {
        intervalShaked--;
        osc.amp(0, 0.5);
    } else {
        intervalShaked = 0;
    }
}

//SEUN MODE
function mode_seun_display(){

    var newSeoulW = width * 0.175;
    var newSeoulH = newSeoulW * seoul.height / seoul.width;
    var newSeoulY = height - newSeoulH * 3 / 4;

    if(seoulW > newSeoulW - 1){
        seoulW = lerp(seoulW, newSeoulW, 0.1);
    }else{
        seoulW = newSeoulW;
    }
    if(seoulH > newSeoulH - 1){
        seoulH = lerp(seoulH, newSeoulH, 0.1);
    }else{
        seoulH = newSeoulH;
    }
    seoulX = width / 2;
    if(seoulY < newSeoulY - 1){
        seoulY = lerp(seoulY, newSeoulY, 0.1);
    }else{
        seoulY = newSeoulY;
    }

    var newTitleW = width / 2;

    if(titleW > newTitleW - 1){
        titleW = lerp(titleW, newTitleW, 0.1);
    }else{
        titleW = newTitleW;
    }
    titleH = titleW * title.height / title.width;
    titleX = width/2;
    titleY = titleH;

    var newSangsangW = width / 4;
    var newSangsangH = newSangsangW * sangsang.height / sangsang.width;
    var newSangsangX = width / 6;

    if(sangsangW > newSangsangW - 1){
        sangsangW = lerp(sangsangW, newSangsangW, 0.1);
    }else{
        sangsangW = newSangsangW;
    }
    if(sangsangH > newSangsangH - 1){
        sangsangH = lerp(sangsangH, newSangsangH, 0.1);
    }else{
        sangsangH = newSangsangH;
    }
    if(sangsangX > newSangsangX - 1){
        sangsangX = lerp(sangsangX, width / 6, 0.1);
    }else{
        sangsangX = newSangsangX;
    }
    if(sangsangY < newSeoulY - 1){
        sangsangY = lerp(sangsangY, newSeoulY, 0.1);
    }else{
        sangsangY = newSeoulY;
    }

    if(moqnH < newSangsangH - 1){
        moqnH = lerp(moqnH, newSangsangH, 0.1);
    }else{
        moqnH = newSangsangH;
    }

    var newMoqnW = moqnH * moqn.width / moqn.height;
    var newMoqnX = width * 5 / 6;

    if(moqnW < newMoqnW - 1){
        moqnW = lerp(moqnW, newMoqnW, 0.1);
    }else{
        moqnW = newMoqnW;
    }
    if(moqnX < newMoqnX - 1){
        moqnX = lerp(moqnX, width * 5 / 6, 0.1);
    }else{
        moqnX = newMoqnX;
    }
    if(moqnY > newSeoulY - 1){
        moqnY = lerp(moqnY, newSeoulY, 0.1);
    }else{
        moqnY = newSeoulY;
    }
}

function mode_seun_touch(){
    clickTime = new Date().getTime();

    if(clickTime - lastClicked >= DELAY){
        colorS = 0;

        //var midiIndex = floor(map(mouseX, 0, width, 0, midiNotes.length));
        var oscFreq = midiToFreq(64);
        osc.freq(oscFreq);
        osc.amp(1, 0.01); // volume, fadeOut Speed

        var x = Math.floor(map(mouseX, 0, width, 0, 99));
        var y = Math.floor(map(mouseY, 0, height, 0, 99));

        var xStr = ('00' + x).substr(-2);
        var yStr = ('00' + y).substr(-2);

        var xyStr = xStr + yStr;

        console.log("sending data");
        socket.emit('drawing', xyStr);

        lastClicked = clickTime;
    }else{
        console.log("too fast! wait!");
    }
}

function mode_seun_touchEnded(){
    osc.amp(0, 0.5);
}

function mode_seun_shake(){
    intervalShaked = 10;
}

function mode_seun_shaked(){
    if (intervalShaked > 1) {
        intervalShaked--;
        // var oscFreq = midiToFreq(79);
        // osc.freq(oscFreq);
        // osc.amp(1, 0.01)
    } else if (intervalShaked == 1) {
        socket.emit('changeProperties');
        intervalShaked--;
        // osc.amp(0, 0.5);
    } else {
        intervalShaked = 0;
    }
}

//CLOSING MODE
function mode_closing_display(){
    if(seoulW < width / 2 - 1){
        seoulW = lerp(seoulW, width/2, 0.1);
    }else{
        seoulW = width / 2;
    }
    if(seoulH < seoulW * seoul.height / seoul.width - 1){
        seoulH = lerp(seoulH, seoulW * seoul.height / seoul.width, 0.1);
    }else{
        seoulH = seoulW * seoul.height / seoul.width - 1;
    }
    seoulX = width / 2;
    if(seoulY > height / 2 - 1){
        seoulY = lerp(seoulY, height/2, 0.1);
    }else{
        seoulY = height / 2;
    }

    if(titleW < width * 3 / 4 - 1){
        titleW = lerp(titleW, width * 3 / 4, 0.1);
    }else{
        titleW = width * 3 / 4;
    }
    if(titleH < titleW * title.height / title.width - 1){
        titleH = lerp(titleH, titleW * title.height / title.width, 0.1);
    }else{
        titleH = titleW * title.height / title.width;
    }
    titleX = width/2;
    if(titleY < titleH - 1){
        titleY = lerp(titleY, titleH, 0.1);
    }else{
        titleY = titleH;
    }

    if(moqnW > width * 1.5 / 7 - 1){
        moqnW = lerp(moqnW, width * 1.5 / 7, 0.1);
    }else{
        moqnW = width * 1.5 / 7;
    }
    if(moqnH > moqnW * moqn.height / moqn.width - 1){
        moqnH = lerp(moqnH, moqnW * moqn.height / moqn.width, 0.1);
    }else{
        moqnH = moqnW * moqn.height / moqn.width;
    }
    if(moqnX > width / 2 - 1){
        moqnX = lerp(moqnX, width / 2, 0.1);
    }else{
        moqn = width / 2;
    }
    if(moqnY < height - moqnH - 1){
        moqnY = lerp(moqnY, height - moqnH, 0.1);
    }else{
        moqnY = height - moqnH;
    }

    if(sangsangW < width * 3 / 7){
        sangsangW = lerp(sangsangW, width * 3 / 7, 0.1);
    }else{
        sangsangW = width * 3 / 7;
    }
    if(sangsangH < sangsangW * sangsang.height / sangsang.width - 1){
        sangsangH = lerp(sangsangH, sangsangW * sangsang.height / sangsang.width, 0.1);
    }else{
        sangsangH = sangsangW * sangsang.height / sangsang.width;
    }
    if(sangsangX < width / 2 - 1){
        sangsangX = lerp(sangsangX, width / 2, 0.1);
    }else{
        sangsangX = width / 2;
    }
    if(sangsangY > height - sangsangH - moqnH * 3 / 2 - 1){
        sangsangY = lerp(sangsangY, height - sangsangH - moqnH * 3 / 2, 0.1);
    }else{
        sangsangY = height - sangsangH - moqnH * 3 / 2;
    }

    if(deviceOrientation == 'landscape' || width > height){

        if(seoulW < height/2 - 1){
            seoulW = lerp(seoulW, height/2, 0.1);
        }else{
            seoulW = height / 2;
        }
        if(seoulH < seoulW * seoul.height / seoul.width - 1){
            seoulH = lerp(seoulH, seoulW * seoul.height / seoul.width, 0.1);
        }else{
            seoulH = seoulW * seoul.height / seoul.width;
        }
        seoulX = width / 2;
        if(seoulY > height/2 - 1){
            seoulY = lerp(seoulY, height/2, 0.1);
        }else{
            seoulY = height / 2;
        }

        if(titleW < width * 4 / 7 - 1){
            titleW = lerp(titleW, width * 4 / 7, 0.1);
        }else{
            titleW = width * 4 / 7;
        }
        if(titleH < titleW * title.height / title.width - 1){
            titleH = lerp(titleH, titleW * title.height / title.width, 0.1);
        }else{
            titleH = titleW * title.height / title.width;
        }
        titleX = width / 2;
        if(titleY < titleH - 1){
            titleY = lerp(titleY, titleH, 0.1);
        }else{
            titleY = titleH;
        }

        if(moqnW > width / 7 - 1){
            moqnW = lerp(moqnW, width / 7, 0.1);
        }else{
            moqnW = width / 7;
        }
        if(moqnH > moqnW * moqn.height / moqn.width - 1){
            moqnH = lerp(moqnH, moqnW * moqn.height / moqn.width, 0.1);
        }else{
            moqnH = moqnW * moqn.height / moqn.width;
        }
        if(moqnX > width / 2 - 1){
            moqnX = lerp(moqnX, width / 2, 0.1);
        }else{
            moqnX = width / 2;
        }
        if(moqnY > height - moqnH){
            moqnY = lerp(moqnY, height - moqnH, 0.1);
        }else{
            moqnY = height - moqnH;
        }

        if(sangsangW < width * 2 / 7 - 1){
            sangsangW = lerp(sangsangW, width * 2 / 7, 0.1);
        }else{
            sangsangW = width * 2 / 7;
        }
        if(sangsangH < sangsangW * sangsang.height / sangsang.width - 1){
            sangsangH = lerp(sangsangH, sangsangW * sangsang.height / sangsang.width, 0.1);
        }else{
            sangsangH = sangsangW * sangsang.height / sangsang.width;
        }
        if(sangsangX < width / 2 - 1){
            sangsangX = lerp(sangsangX, width / 2, 0.1);
        }else{
            sangsangX = width / 2;
        }
        if(sangsangY > height - sangsangH - moqnH * 3 / 2 - 1){
            sangsangY = lerp(sangsangY, height - sangsangH - moqnH * 3 / 2, 0.1);
        }else{
            sangsangY = height - sangsangH - moqnH * 3 / 2;
        }
    }

}

function mode_closing_touch(){

}

function mode_closing_touchEnded(){

}

function mode_closing_shake(){

}

function mode_closing_shaked(){

}

//TEST MODE
function mode_test_display(){

    var newSeoulW = width * 0.175;
    var newSeoulH = newSeoulW * seoul.height / seoul.width;
    var newSeoulY = height - newSeoulH * 3 / 4;

    if(seoulW > newSeoulW - 1){
        seoulW = lerp(seoulW, newSeoulW, 0.1);
    }else{
        seoulW = newSeoulW;
    }
    if(seoulH > newSeoulH - 1){
        seoulH = lerp(seoulH, newSeoulH, 0.1);
    }else{
        seoulH = newSeoulH;
    }
    seoulX = width / 2;
    if(seoulY < newSeoulY - 1){
        seoulY = lerp(seoulY, newSeoulY, 0.1);
    }else{
        seoulY = newSeoulY;
    }

    var newTitleW = width / 2;

    if(titleW > newTitleW - 1){
        titleW = lerp(titleW, newTitleW, 0.1);
    }else{
        titleW = newTitleW;
    }
    titleH = titleW * title.height / title.width;
    titleX = width/2;
    titleY = titleH;

    var newSangsangW = width / 4;
    var newSangsangH = newSangsangW * sangsang.height / sangsang.width;
    var newSangsangX = width / 6;

    if(sangsangW > newSangsangW - 1){
        sangsangW = lerp(sangsangW, newSangsangW, 0.1);
    }else{
        sangsangW = newSangsangW;
    }
    if(sangsangH > newSangsangH - 1){
        sangsangH = lerp(sangsangH, newSangsangH, 0.1);
    }else{
        sangsangH = newSangsangH;
    }
    if(sangsangX > newSangsangX - 1){
        sangsangX = lerp(sangsangX, width / 6, 0.1);
    }else{
        sangsangX = newSangsangX;
    }
    if(sangsangY < newSeoulY - 1){
        sangsangY = lerp(sangsangY, newSeoulY, 0.1);
    }else{
        sangsangY = newSeoulY;
    }

    if(moqnH < newSangsangH - 1){
        moqnH = lerp(moqnH, newSangsangH, 0.1);
    }else{
        moqnH = newSangsangH;
    }

    var newMoqnW = moqnH * moqn.width / moqn.height;
    var newMoqnX = width * 5 / 6;

    if(moqnW < newMoqnW - 1){
        moqnW = lerp(moqnW, newMoqnW, 0.1);
    }else{
        moqnW = newMoqnW;
    }
    if(moqnX < newMoqnX - 1){
        moqnX = lerp(moqnX, width * 5 / 6, 0.1);
    }else{
        moqnX = newMoqnX;
    }
    if(moqnY > newSeoulY - 1){
        moqnY = lerp(moqnY, newSeoulY, 0.1);
    }else{
        moqnY = newSeoulY;
    }
}

function mode_test_touch(){
    clickTime = new Date().getTime();

    if(clickTime - lastClicked >= DELAY){
        colorS = 0;

        //var midiIndex = floor(map(mouseX, 0, width, 0, midiNotes.length));
        var oscFreq = midiToFreq(64);
        osc.freq(oscFreq);
        osc.amp(1, 0.01); // volume, fadeOut Speed

        var x = Math.floor(map(mouseX, 0, width, 0, 99));
        var y = Math.floor(map(mouseY, 0, height, 0, 99));

        var xStr = ('00' + x).substr(-2);
        var yStr = ('00' + y).substr(-2);

        var xyStr = xStr + yStr;

        //send data
        console.log("sending data");
        socket.emit('drawing', xyStr);

        //before requesting change
        socket.emit('changeProperties');

        lastClicked = clickTime;
    }else{
        console.log("too fast! wait!");
    }
}

function mode_test_touchEnded(){
    osc.amp(0, 0.5);
}

function mode_test_shake(){

}

function mode_test_shaked(){

}