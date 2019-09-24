console.log("connected");
let shouldStop = false;
let stopped = false;
const downloadLink = document.getElementById("download");
const stopButton = document.getElementById("stop");
const playerContainer = document.querySelector(".player-container");

stopButton.addEventListener("click", function() {
	shouldStop = true;
});

const handleSuccess = function(stream) {
	stopButton.addEventListener("click", function() {
		mediaRecorder.stop();
	});
	const options = { mimeType: "audio/webm" };
	const recordedChunks = [];
	const mediaRecorder = new MediaRecorder(stream, options);

	mediaRecorder.addEventListener("dataavailable", function(e) {
		if (e.data.size > 0) {
			recordedChunks.push(e.data);
		}

		if (shouldStop === true && stopped === false) {
			console.log("should DEFINITELY stop now");
			mediaRecorder.stop();
			stopped = true;
		}
	});

	mediaRecorder.addEventListener("stop", function() {
		const audioFile = document.getElementById("audioFile");
		const reader = new FileReader();
		let playerEl = document.createElement("div");
		let base64data;
		const playerMarkup = `
	            <audio id="player" controls></audio>
            `;
		downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
		downloadLink.download = "acetest.wav";

		playerEl.classList.add("audio-player");
		playerEl.innerHTML = playerMarkup;
		playerContainer.appendChild(playerEl);
		const player = document.querySelector("#player");

		reader.readAsDataURL(new Blob(recordedChunks));
		reader.onloadend = function() {
			base64data = reader.result;
			audioFile.value = base64data;
		};
		player.src = downloadLink.href;
	});

	mediaRecorder.start();
};

document.querySelector("#start").addEventListener("click", () => {
	navigator.mediaDevices
		.getUserMedia({ audio: true, video: false })
		.then(handleSuccess);
});