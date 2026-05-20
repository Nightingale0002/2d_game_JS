// JavaScript Document 
// copyright Rafcorp 2026
let button = document.querySelector('.play-button');

function playsound(sound) {
    let audio = new Audio(sound);
    audio.play();
}
audio = new Audio('project_3.wav');
audio.play();
let playButton = document.querySelector('.play-button');
playButton.addEventListener('click', function() {
    audio.play();
});
function playgame() { let playbutton = document.querySelector('.play-button');
    playbutton.addEventListener('click', function() {window.open('game.html');});
}
