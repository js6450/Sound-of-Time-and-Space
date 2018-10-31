/*
 Built by Jiwon Shin
 October 2017
 */

"use strict";

var cvs;
var socket = io();

var melodyIndex = 0;
var melodies = [];
//var BREAK = 75;
var OCTAVE = 0;

var indianBoy;
var butterfly;
var schoolBell;
var closingSong;

var gui;

var params = {
    MODE: 0,
    ready: function(){changeMode(0)},
    touch_shake: function(){changeMode(1)},
    SONG: 0,
    melody_1: function(){
        changeMode(2);
        params.SONG = 0;
        melodyIndex = 0;
    },
    melody_2: function(){
        changeMode(2);
        params.SONG = 1;
        melodyIndex = 0;
    },
    melody_3: function(){
        changeMode(2);
        params.SONG = 2;
        melodyIndex = 0;
    },
    melody_4: function(){
        changeMode(2);
        params.SONG = 3;
        melodyIndex = 0;
    },
    seun: function(){changeMode(3)},
    closing: function(){changeMode(4)},
    test: function(){changeMode(5)},
    opening: function(){changeMode(6)},
    clearOutput: function(){socket.emit('clearOutput')},
    userCount: 0
};


function preload(){
    indianBoy = loadStrings('assets/data/indianBoy.txt');
    butterfly = loadStrings('assets/data/butterfly.txt');
    schoolBell = loadStrings('assets/data/schoolBell.txt');
    closingSong = loadStrings('assets/data/closing.txt');
}

function setup(){
    cvs = createCanvas(windowWidth, windowHeight);
    cvs.id('canvas');

    socket.emit('requestUserCount');

    socket.on('setUserCount', onSetUserCount);

    socket.on('setMode', function(data){
        console.log("setting mode: " + data);
        params.MODE = parseInt(data);
    });

    gui = new dat.GUI({autoPlace: false, width: "100vw"});
    document.body.append(gui.domElement);

    gui.add(params, 'MODE').listen();
    gui.add(params, 'ready');
    gui.add(params, 'touch_shake');
    gui.add(params, 'SONG').listen();
    gui.add(params, 'melody_1');
    gui.add(params, 'melody_2');
    gui.add(params, 'melody_3');
    gui.add(params, 'melody_4');
    gui.add(params, 'seun');
    gui.add(params, 'closing');
    gui.add(params, 'test');
    gui.add(params, 'opening');
    gui.add(params, 'clearOutput');
    gui.add(params, 'userCount').listen();

    //gui styling
    gui.domElement.style = "width:100vw !important; position: absolute; top: 0px;";
    var numOptions = gui.__controllers.length;
    var optionHeight = windowHeight / numOptions;
    for(var i = 0; i < numOptions; i++){
        gui.__ul.children[i].style = "height:" + optionHeight + "px; line-height:" + optionHeight + "px; font-size:" + (optionHeight / 3) + "px";
        gui.__controllers[i].domElement.children[0].style = "font-size:" + (optionHeight / 2) + "px; margin-top:" + (optionHeight / 8) + "px";
    }
    gui.__closeButton.style = "display: none";

    //0 - 학교종 1 - 나비야 2 - 인디언 3 - 클로징
    setMelody(schoolBell);
    setMelody(butterfly);
    setMelody(indianBoy);
    setMelody(closingSong);

}

function draw(){
    background(255);

    // buttonState.onFinishChange(function(value){
    //     socket.emit('changeState', value);
    // });

    if(params.MODE == 2){
        var songIndex = params.SONG;
        var currentMelody = melodies[songIndex][melodyIndex];

        if(currentMelody.startTime == 0){
            currentMelody.startTime = millis();
            currentMelody.play();
        }

        if(currentMelody.hasEnded()){
            currentMelody.startTime = 0;
            melodyIndex++;
            if(melodyIndex > melodies[songIndex].length - 1){
                melodyIndex = 0;
            }
            //console.log("new index: " + melodyIndex);
        }
    }

}

function changeMode(val){
    params.MODE = val;
    socket.emit('changeMode', val);
}

function onSetUserCount(count){
    console.log("received new user count: " + count);
    params.userCount = parseInt(count);
}

class Melody{
    constructor(_note, _duration){
        this.note = _note;
        this.duration = _duration;
        this.startTime = 0;
    }

    play(){
        // this.startTime = millis();
        socket.emit('changeMelody', this.note);
    }

    hasEnded(){
        if(this.startTime + this.duration < millis()){
            return true;
        }else{
            return false;
        }
    }
}

function setMelody(song){
    var tune = [];

    for(var i = 0; i < song.length; i++){
        var tempMelody = song[i].split(" / ");
        tune.push(new Melody(parseInt(tempMelody[0]) + 12 * OCTAVE, parseInt(tempMelody[1])));
        //tune.push(new Melody(0, BREAK));
    }

    melodies.push(tune);
}