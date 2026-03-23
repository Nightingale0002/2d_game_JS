function playsound(sound) {
    let audio = new Audio(sound);
    audio.play();
}
audio = new Audio('includes/sound/bong.mp3');
audio.play();
let playButton = document.querySelector('.play-button');
playButton.addEventListener('click', function() {
    audio.play();
});

