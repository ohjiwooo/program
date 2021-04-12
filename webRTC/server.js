const mySql = require('mysql')

const info = {
    host: 'localhost',
    user: 'root',
    password: '2992',
    port:  3306 ,
    database: 'signUpIn'
}

let mysql = mySql.createConnection(info);

mysql.connect((error)=> {
    if(error){
        console.log("DB 연동 실패 : ", error);
    }
    else {
        console.log("DB 연동 성공!");
    }
});

module.exports = {
    mysql, info
}

const express = require('express')
const app = express()
const https = require('https');
const { v4: uuidV4 } = require('uuid')

const fs=require('fs');

const options={
  key:fs.readFileSync('./key.pem'),
  cert:fs.readFileSync('./server.crt')
};
////////////////////
const server = https.createServer(options, app)
const io = require('socket.io')(server)
var socketList = [];

app.set('view engine', 'ejs')
app.use(express.static('public'))

var user_id;
app.get('/', function(req, res) {
  let { name,room } = req.query;
  user_id=name;
  if(room=='undefined'){
    res.redirect(`/${uuidV4()}`)
  }
  else{res.redirect(`/${room}`)}
});


app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));


var color_list =["#ff00ff40","#0000ff40","#00ff0040","blue"];
var count=0;
var num;
var name;


io.sockets.on('connection', function(socket) {

  console.log(user_id);

  var rid;
  
  socket.on('roomid',function(room_id){
    mysql.query("INSERT INTO room_info (roomid, user) VALUES (?, ?)", [room_id,user_id], (err) => {
      if (err) {
          console.log(err);
      }
    });
    rid=room_id; 
});

if(count==0){infiniteStream("오지우");}


  name = count++;
  socket.num=name;
  socket.color=color_list[name];
  socket.uid=user_id;
  socket.on('disconnect',function(){
    console.log('user disconnected', socket.id);
  });

  socketList.push(socket);

  socket.on('SEND',function(msg,roomid,n){
   
    socket.join(roomid);
    var content = socket.uid+' '+':'+' '+msg;
    console.log(content);
    
///채팅저장

mysql.query("INSERT INTO contents (roomid, content,date) VALUES (?, ?,now())", [roomid,content], (err) => {
  if (err) {
      console.log(err);
  }
});

    if(n==0){
      //change
      io.to(roomid).emit('SEND',content,socket.color);
    }
    else{ ///////////////////////////tts

      ///////////////
      var f = require('fs');
      var client_id = 'ipygjvve8f';
      var client_secret = 'CA4z8HOMRAbLrr6PHt1gzlCGhOGnUdxGjC3sq0Hh';
      var api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
      var request = require('request');
      var options = {
    url: api_url,
    form: { speaker: 'nara', volume: '0', speed: '0', pitch: '0', text: msg, format: 'mp3' },
    headers: { 'X-NCP-APIGW-API-KEY-ID': client_id, 'X-NCP-APIGW-API-KEY': client_secret },
  };
  var writeStream = f.createWriteStream('public/tts1.mp3');
  var _req = request.post(options).on('response', function(response) {
    console.log(response.statusCode); // 200
    console.log(response.headers['content-type']);
  });
  file = _req.pipe(writeStream); // file로 출력

  io.to(roomid).emit('audio',file,content,socket.color);
  io.to(roomid).emit('ftts');
    }
  });


  socket.on('ff',function(data){
    io.to(rid).emit('ff2',data);
  });

//////////stt////////////////
'use strict';

function infiniteStream(
 user
) {

  encoding = 'LINEAR16',
  sampleRateHertz =16000,
  languageCode='ko-KR',
  streamingLimit = 290000

  const chalk = require('chalk');
  const {Writable} = require('stream');

  // Node-Record-lpcm16
  const recorder = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  // Currently, only v1p1beta1 contains result-end-time
  const speech = require('@google-cloud/speech').v1p1beta1;

  const client = new speech.SpeechClient();

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const request = {
    config,
    interimResults: true,
  };

  let recognizeStream = null;
  let restartCounter = 0;
  let audioInput = [];
  let lastAudioInput = [];
  let resultEndTime = 0;
  let isFinalEndTime = 0;
  let finalRequestEndTime = 0;
  let newStream = true;
  let bridgingOffset = 0;
  let lastTranscriptWasFinal = false;

  function startStream() {
    // Clear current audioInput
    audioInput = [];
    // Initiate (Reinitiate) a recognize stream
    recognizeStream = client
      .streamingRecognize(request)
      .on('error', err => {
        if (err.code === 11) {
          // restartStream();
        } else {
          console.error('API request error ' + err);
        }
      })
      .on('data', speechCallback);

    // Restart stream when streamingLimit expires
    setTimeout(restartStream, streamingLimit);
  }

  const speechCallback = stream => {
    // Convert API result end time from seconds + nanoseconds to milliseconds
    resultEndTime =
      stream.results[0].resultEndTime.seconds * 1000 +
      Math.round(stream.results[0].resultEndTime.nanos / 1000000);

    // Calculate correct time based on offset from audio sent twice
    const correctedTime =
      resultEndTime - bridgingOffset + streamingLimit * restartCounter;

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let stdoutText = '';
    if (stream.results[0] && stream.results[0].alternatives[0]) {
      stdoutText =
        correctedTime + ': ' + stream.results[0].alternatives[0].transcript;
    }

    if (stream.results[0].isFinal) {
      process.stdout.write(chalk.green(`${stdoutText}\n`));

      isFinalEndTime = resultEndTime;
      lastTranscriptWasFinal = true;
  //////////////////////////////////////////
  //////////////////////////////////////////
  //var t=socket.uid+' '+':'+' '+stream.results[0].alternatives[0].transcript;
  var t=user+' '+':'+' '+stream.results[0].alternatives[0].transcript;
 io.to(rid).emit('stt',t,socket.color);
  mysql.query("INSERT INTO contents (roomid, content,date) VALUES (?, ?,now())", 
  [rid,t], (err) => {
    if (err) {
        console.log(err);
    }
  });

    } else {
      // Make sure transcript does not exceed console character length
      if (stdoutText.length > process.stdout.columns) {
        stdoutText =
          stdoutText.substring(0, process.stdout.columns - 4) + '...';
      }
      process.stdout.write(chalk.red(`${stdoutText}`));

      lastTranscriptWasFinal = false;
    }
  };

  const audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
      if (newStream && lastAudioInput.length !== 0) {
        // Approximate math to calculate time of chunks
        const chunkTime = streamingLimit / lastAudioInput.length;
        if (chunkTime !== 0) {
          if (bridgingOffset < 0) {
            bridgingOffset = 0;
          }
          if (bridgingOffset > finalRequestEndTime) {
            bridgingOffset = finalRequestEndTime;
          }
          const chunksFromMS = Math.floor(
            (finalRequestEndTime - bridgingOffset) / chunkTime
          );
          bridgingOffset = Math.floor(
            (lastAudioInput.length - chunksFromMS) * chunkTime
          );

          for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
            recognizeStream.write(lastAudioInput[i]);
          }
        }
        newStream = false;
      }

      audioInput.push(chunk);

      if (recognizeStream) {
        recognizeStream.write(chunk);
      }
      
      next();
    },

    final() {
      if (recognizeStream) {
        recognizeStream.end();
      }
    },
  });

  function restartStream() {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.removeListener('data', speechCallback);
      recognizeStream = null;
    }
    if (resultEndTime > 0) {
      finalRequestEndTime = isFinalEndTime;
    }
    resultEndTime = 0;

    lastAudioInput = [];
    lastAudioInput = audioInput;

    restartCounter++;

    if (!lastTranscriptWasFinal) {
      process.stdout.write('\n');
    }
    process.stdout.write(
      chalk.yellow(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`)
    );

    newStream = true;

    startStream();
  }
  // Start recording and send the microphone input to the Speech API
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0, // Silence threshold
      silence: 1000,
      keepSilence: true,
      recordProgram: 'rec', // Try also "arecord" or "sox"
    })
    .stream()
    .on('error', err => {
      console.error('Audio recording error ' + err);
    })
    .pipe(audioInputStreamTransform);

  console.log('');
  console.log('Listening, press Ctrl+C to stop.');
  console.log('');
  console.log('End (ms)       Transcript Results/Status');
  console.log('=========================================================');

  startStream();
  // [END speech_transcribe_infinite_streaming]
}

/////////////////////////////////////////////

socket.on('join-room', (roomId, userId) => {
  socket.join(roomId)
  socket.to(roomId).broadcast.emit('user-connected', userId)

  socket.on('disconnect', () => {
    socket.to(roomId).broadcast.emit('user-disconnected', userId)
  })
})

})

var roomRouter = require('./routes/room')
var noRouter = require('./routes/no')
var existRouter = require('./routes/exist')

app.use('/room', roomRouter);
app.use('/no', noRouter);
app.use('/exist', existRouter);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

server.listen(3001);
