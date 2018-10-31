/*
Node.js app built by Jiwon Shin
October 2017
 */

//set up requirements
const express = require('express');
var bodyParser = require('body-parser');
const WebSocket = require('ws');

//server setup
const app = express();

app.set("views", __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

//const http = require('http').Server(app);
const http = require('http');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, function listening(){
    console.log("Listening on %d", server.address().port);
});

//routes
app.get("/", function(req, res){
    res.render('index');
});

app.get("/interface", function(req, res){
    res.render('control');
});

app.get("/bot", function(req, res){
    res.render('bot');
});

app.get("/crazyBot", function(req, res){
    res.render('crazyBot');
});

//socket actions
var outputString = "";

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

var MODE = 5;

var userCount = 0;
var userIds = [];

var colorIndex = 0;
//var soundIndex = 0;

wss.on('connection', function connection(ws, req){

    ws.on('message', function incoming(message) {
        //console.log('received: %s', message);
        if(outputString != ""){
            console.log("send to of: " + outputString);
            ws.send(outputString);
            outputString = "";
        }
    });

});

function genUserId(){
    var setUserId = false;

    while(!setUserId){
        //ranges:
        //0 - 72
        //72 - 144
        //144 - 216
        //216 - 288
        //288 - 360
        var userH = Math.floor(Math.random() * 72) + (colorIndex * 72) ;
        var userS = Math.floor(Math.random() * 10);
        var userB = Math.floor(Math.random() * 10);
        var userId = ('000' + userH).substr(-3) + userS + userB;

        var count = 0;
        for(var i = 0; i < userIds.length; i++){
            if(parseInt(userIds[i].substr(0, 3)) != userH){
                count++;
            }
        }
        if(count == userIds.length){
            colorIndex++;
            if(colorIndex > 4){
                colorIndex = 0;
            }
            console.log("new color index: " + colorIndex);
            setUserId = true;
            return userId;
        }
    }
}

io.on('connection', function (socket) {

    //var userIndex, userId, userSoundIndex;
    var userIndex, userId;

    console.log("on all connection, user count: " + userCount);
    console.log("color index: " + colorIndex);

    /*

    SET UP

     */

    socket.on('requestUserCount', function(){
        console.log("user count requested");
        socket.emit('setUserCount', userCount);
    });

    socket.on('requestProperties', function(){
        userIndex = userCount;
        userCount++;
        //remove
        // socket.broadcast.emit('setUserCount', userCount);
        // console.log('user count: ' + userCount);
        //
        // var userCountToSend = ('000' + userCount).substr(-3);
        //
        // if(outputString != ""){
        //     outputString += "," + userCountToSend;
        // }else{
        //     outputString += userCountToSend;
        // }

        console.log('total output string: ' + outputString);

        userId = genUserId();
        userIds.push(userId);

        console.log("User id: " + userId);
        console.log("Ids of all users: " + userIds);

        // userSoundIndex = soundIndex;
        // soundIndex++;
        // if(soundIndex >= 10){
        //     soundIndex = 0;
        // }
        //
        // console.log("User sound index: " + userSoundIndex);
        //
        // socket.emit('setProperties', {
        //     id: userId,
        //     soundIndex: userSoundIndex
        // });

        socket.emit('setProperties', userId);
    });

    socket.emit('setMode', MODE);

    /*

    CHANGE

     */

    socket.on('changeProperties', function(){
        console.log('request to change properties');

        if(MODE == 5){
            socket.emit('echoPrevious', userId);
        }

        userId = genUserId();
        userIds[userIndex] = userId;
        // userSoundIndex = soundIndex;
        // soundIndex++;
        // if(soundIndex >= 10){
        //     soundIndex = 0;
        // }
        // console.log("new user properties: " + userId + ", " + userSoundIndex);

        console.log("new user id: " + userId);

        // socket.emit('setProperties',{
        //     id: userId,
        //     soundIndex: userSoundIndex
        // });

        socket.emit('setProperties', userId);
    });

    socket.on('changeMode', function(data){
        console.log("New mode: " + data);
        MODE = data;

        var modeToSend = ('00' + MODE).substr(-2);

        if(outputString != ""){
            outputString += "," + modeToSend;
        }else{
            outputString += modeToSend;
        }

        console.log('total output string: ' + outputString);

        socket.broadcast.emit('changeMode', data);
    });

    /*

    MELODY MODE

     */

    socket.on('changeMelody', function(data){
        console.log("change melody of index " + data);
        socket.broadcast.emit('setMelody', data);
    });

    /*

    SEND DATA

     */

    socket.on('drawing', function(data){
        //var userIdToSend = ('0000' + userId).substr(-4);
        // var userProperty = userId + soundIndex + data;

        if(MODE == 5){
            socket.emit('echoSend', userId);
        }

        var userProperty = userId + data;

        if(outputString != ""){
            outputString += "," + userProperty;
        }else{
            outputString += userProperty;
        }

        console.log('current string: ' + userProperty);
        console.log('total output string: ' + outputString);
    });

    /*

    CLEAR OUTPUT STRING

     */

    socket.on('clearOutput',function(){
       outputString = "";
       console.log("output string cleared");
    });

    /*

    USER DISCONNECT

     */

    socket.on('disconnect', function(){
        if(userId != null){
            userCount--;
            socket.broadcast.emit('setUserCount', userCount);
            console.log("now user count is: " + userCount);
            //
            // var userCountToSend = ('000' + userCount).substr(-3);
            //
            // if(outputString != ""){
            //     outputString += "," + userCountToSend;
            // }else{
            //     outputString += userCountToSend;
            // }
            //
            // console.log('total output string: ' + outputString);

            var userIndex = userIds.findIndex(function(val){
                return val == userId;
            });
            userIds.splice(userIndex, 1);

            console.log("removing " + userId);
            console.log("remaining users: " + userIds);
        }
    });
});


