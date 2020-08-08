const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const myVideoEl = document.createElement("video");
const muteUnmuteBtn = document.querySelector(".main__mute__button");
const playStopBtn = document.querySelector('.main__video__button');
// myVideoEl.muted = true;

// create a peer
const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443"
});

let stream;

async function Streaming() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      // video: true,
      audio: true
    })
    addVideoStream(myVideoEl, stream);

    peer.on('call', call => {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", userId => {
      connectToNewUser(userId, stream);
    });
  } catch (error) {
    alert(error);
  };
};

Streaming();

// after peer connection is done
peer.on("open", id => {
  socket.emit("join-room", ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream)
  });
};

const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  // play video after loaded
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });
  if (stream.getVideoTracks().length > 0) {
    videoGrid.append(videoEl);
  } else {
    setPlayVideo();
  }
  if (stream.getAudioTracks().length = 0) {
    setUnmuteButton();
  }
};

const scrollToBottom = () => {
  const chatWindow = $(".main__chat__window");
  chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
};

const muteUnmute = () => {
  if (stream.getAudioTracks().length > 0) {
    const enabled = stream.getAudioTracks()[0].enabled;
    if (enabled) {
      stream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      stream.getAudioTracks()[0].enabled = true;
    }
  } else {
    setUnmuteButton();
  }
};

const playStopVideo = () => {
  if (stream.getVideoTracks().length > 0) {
    const enabled = stream.getVideoTracks()[0].enabled;
    if (enabled) {
      stream.getVideoTracks()[0].enabled = false;
      setStopButton();
    } else {
      setPlayButton();
      stream.getVideoTracks()[0].enabled = true;
    }
  } else {
    setPlayVideo();
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  muteUnmuteBtn.innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  muteUnmuteBtn.innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  playStopBtn.innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  playStopBtn.innerHTML = html;
};

let inputText = $("input");
$("html").keydown(e => {
  if(e.which == 13 && inputText.val().length !==0) {
    socket.emit("message", inputText.val());
    inputText.val("");
  }
});

socket.on("createMessage", (sender, message) => {
  $("ul").append(
    `<li class="message"><b>${sender}</b></br>${message}</li>`
  )
  scrollToBottom();
});

muteUnmuteBtn.addEventListener("click", muteUnmute);
playStopBtn.addEventListener("click", playStopVideo);