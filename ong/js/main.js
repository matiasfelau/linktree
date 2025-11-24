import { VideoPlayer } from "./player.js";

const videoElement = document.getElementById("video");
const player = new VideoPlayer(videoElement);

// Botones de cámaras
const cam1Btn = document.getElementById("cam1");
const cam2Btn = document.getElementById("cam2");

cam1Btn.addEventListener("click", () => {
    player.loadVideo(0);
    cam1Btn.classList.add("active");
    cam2Btn.classList.remove("active");
});

cam2Btn.addEventListener("click", () => {
    player.loadVideo(1);
    cam2Btn.classList.add("active");
    cam1Btn.classList.remove("active");
});

// Primera carga
player.loadVideo(0);
