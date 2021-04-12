const socket = io('/');

var chatView = document.getElementById('chatView');
var chatForm = document.getElementById('chatForm');

const videoGrid_0 = document.getElementById('video-container-0');
const videoGrid_1 = document.getElementById('video-container-1');

const myPeer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
var peernum = 0;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {

    addVideoStream_0(myVideo, stream);

    myPeer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      cnt = 0;
      call.on('stream', (userVideoStream) => {
        if(cnt == 0){
         addVideoStream_0(video, userVideoStream);
         cnt++;
       }else{
        addVideoStream_1(video, userVideoStream);
        cnt--;
      }
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);

    });
  });

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    cnt =1;
    if(cnt == 0){
     addVideoStream_0(video, userVideoStream);
     cnt++;
   }else{
    addVideoStream_1(video, userVideoStream);
    cnt--;
  }
  });
  call.on('close', () => {
    video.remove();
    cnt = cnt - 1;
  });

  peers[userId] = call;
}

function addVideoStream_0(video, stream) {

  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid_0.append(video);
}

function addVideoStream_1(video, stream) {

  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid_1.append(video);

}

socket.emit('roomid',ROOM_ID);


chatForm.addEventListener('submit', function() {

   var msg = $('#msg');

    if (msg.val() == '') {
        return;

    } else {
      var n=0;
      if(tts.checked==true){//server.js에서 각자 다른 경로로 이동
        n=1;
        socket.emit('SEND', msg.val(),ROOM_ID,n);
        $('#msg').val(' ');
      }
      else{
        n=0;
        socket.emit('SEND', msg.val(),ROOM_ID,n);
        $('#msg').val(' ');
      }
    }
});


socket.on('SEND', function(text,color) {

  var msgLine = $('<div class="msgLine">');
  var msgBox = $('<div class="msgBox">');

  msgBox.append(text);
  msgBox.css('display', 'inline-block');

  msgBox.css('border', '0.5px solid' + color);
  msgBox.css('font-weight', 'bold');
  msgBox.css('background', color);
  msgBox.css('padding', '5px');
  msgBox.css('line-height', '30px');
  msgBox.css('border-radius', '5px');
  msgLine.css('margin', '15px');
  msgLine.css('text-align', 'right');
  msgLine.append(msgBox);

  $('#chatView').append(msgLine);

  chatView.scrollTop = chatView.scrollHeight;
});



socket.on('stt', function(text,color) {
  var msgLine = $('<div class="msgLine">');
  var msgBox = $('<div class="msgBox">');
  msgBox.append(text);
  msgBox.css('display', 'inline-block');
  msgBox.css('border', '1px solid' + color);
  msgBox.css('font-weight', 'bold');
  msgBox.css('background', color);
  msgBox.css('padding', '5px');
  msgBox.css('line-height', '30px');
  msgBox.css('border-radius', '5px');
  msgLine.css('margin', '15px');
  msgLine.css('text-align', 'right');
  msgLine.append(msgBox);

  $('#chatView').append(msgLine);

  chatView.scrollTop = chatView.scrollHeight;
});

socket.on('audio',function(data,text,color){
  var msgLine = $('<div class="msgLine">');
  var msgBox = $('<div class="msgBox">');
  msgBox.append("<음성전송된 메세지 입니다> ");
  msgBox.append(text);
  msgBox.css('display', 'inline-block');
  msgBox.css('border', '1px solid' + color);
  msgBox.css('font-weight', 'bold');
  msgBox.css('background', color);
  msgBox.css('padding', '5px');
  msgBox.css('line-height', '30px');
  msgBox.css('border-radius', '5px');
  msgLine.css('margin', '15px');
  msgLine.css('text-align', 'right');
  msgLine.append(msgBox);

  $('#chatView').append(msgLine);

  chatView.scrollTop = chatView.scrollHeight;
});

socket.on('ff2',function(data){
  if(data=="s"){
    var a = new Audio("https://storage.cloud.google.com/webrtc-alert-ound/slowly.mp3");
    a.play();}
    if(data=="c"){
      var a = new Audio("https://storage.cloud.google.com/webrtc-alert-ound/correct.mp3");
     a.play();}
     if(data=="p"){
      var a = new Audio("https://storage.cloud.google.com/webrtc-alert-ound/please.mp3");
  a.play();}
     });
  
     
  socket.on('ftts',function(){
    var a = new Audio('tts1.mp3');
    a.play();
  });
  

 