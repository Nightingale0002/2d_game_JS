// made by lil Raffie vraag dr drake maar
// copyright (c) 2026 lil Raffie, all rights reserved
onload = draw

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Expand map size
canvas.width = 2000;
canvas.height = 600;

// Character properties
const characterImage = new Image();
characterImage.src = 'img/character.png';
const character = {
	x: 50,
	y: canvas.height - 150,
	width: 64,
	height: 128,
	dx: 0,
	dy: 0,
	speed: 3,
	jumpPower: 10,
	onGround: false
};

const gravity = 0.5;
let groundLevel = canvas.height - character.height;

// Parkour platforms (some require small, some require big)
const platforms = [
	{ x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }, // ground
	{ x: 100, y: 500, width: 120, height: 20 }, // normal
	{ x: 150, y: 750, width: 40, height: 30 }, // only big can fit
	{ x: 300, y: 450, width: 60, height: 20 }, // only big can fit
	{ x: 350, y: 420, width: 60, height: 20 }, // only small can fit
	{ x: 500, y: 350, width: 200, height: 20 }, // only big can jump
	{ x: 800, y: 250, width: 80, height: 20 }, // only small can reach
	{ x: 1000, y: 380, width: 120, height: 20 }, // finish
	// --- Small character parkour ---
	{ x: 1150, y: 400, width: 40, height: 20 }, // small gap
	{ x: 1200, y: 350, width: 40, height: 20 }, // small gap
	{ x: 1250, y: 300, width: 40, height: 20 }, // small gap
	{ x: 1300, y: 250, width: 40, height: 20 }, // small gap
	// Low ceiling tunnel
	{ x: 1400, y: 0, width: 200, height: 200 }, // ceiling
	{ x: 1400, y: 320, width: 200, height: 20 }, // floor
	// Small jump sequence
	{ x: 1650, y: 270, width: 40, height: 20 },
	{ x: 1700, y: 250, width: 40, height: 20 },
	{ x: 1750, y: 230, width: 40, height: 20 },
	{ x: 1800, y: 210, width: 40, height: 20 },
	// Tiny vertical shaft
	{ x: 1980, y: 180, width: 40, height: 80 }, // right wall
	{ x: 1900, y: 180, width: 120, height: 10 }, // top
	{ x: 1900, y: 250, width: 120, height: 10 } // bottom
];

const keys = {};

document.addEventListener('keydown', (e) => {
	keys[e.key.toLowerCase()] = true;
	// Math question for shrink/grow
	switch (e.key) {
		case 'q':
			askMathQuestion('shrink');
			break;
		case 'w':
			askMathQuestion('grow');
			break;
	}
});
document.addEventListener('keyup', (e) => {
	keys[e.key.toLowerCase()] = false;
});

let gameWon = false;
function update() {
	if (gameWon) return;
	// Horizontal movement
	if (keys['a']) character.dx = -character.speed;
	else if (keys['d']) character.dx = character.speed;
	else character.dx = 0;

	// Jump
	if (keys[' '] && character.onGround) {
		character.dy = -character.jumpPower;
		character.onGround = false;
		playsound('sound/jump.mp3'); 
	}

	// Vertical movement (gravity)
	character.dy += gravity;
	character.x += character.dx;
	character.y += character.dy;

	// Store previous position
	const prevX = character.x - character.dx;
	const prevY = character.y - character.dy;

	// Platform collision detection (full block, all sides)
	character.onGround = false;
	for (let platform of platforms) {
		// AABB collision check
		if (
			character.x < platform.x + platform.width &&
			character.x + character.width > platform.x &&
			character.y < platform.y + platform.height &&
			character.y + character.height > platform.y
		) {
			// Calculate overlap on each side
			const overlapBottom = (platform.y + platform.height) - character.y;
			const overlapTop = (character.y + character.height) - platform.y;
			const overlapLeft = (character.x + character.width) - platform.x;
			const overlapRight = (platform.x + platform.width) - character.x;

			// Find the smallest overlap
			const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

			if (minOverlap === overlapTop) {
				// Landed on top
				character.y = platform.y - character.height;
				character.dy = 0;
				character.onGround = true;
			} else if (minOverlap === overlapBottom) {
				// Hit from below
				character.y = platform.y + platform.height;
				character.dy = 0;
			} else if (minOverlap === overlapLeft) {
				// Hit left side
				character.x = platform.x - character.width;
				character.dx = 0;
			} else if (minOverlap === overlapRight) {
				// Hit right side
				character.x = platform.x + platform.width;
				character.dx = 0;
			}
		}
	}

	// WIN CONDITION: Enter shaft (right wall)
	// Shaft: x:1980, y:180, width:40, height:80
	if (
		character.x + character.width > 1950 &&
		character.x < 1950 + 40 &&
		character.y + character.height > 180 &&
		character.y < 180 + 80
	) {
		gameWon = true;
		showWinOverlay();
	}

	// Prevent going out of bounds
	if (character.x < 0) character.x = 0;
	if (character.x + character.width > canvas.width) character.x = canvas.width - character.width;
	if (character.y + character.height > canvas.height) {
		character.y = canvas.height - character.height;
		character.dy = 0;
		character.onGround = true;
	}
}

function showWinOverlay() {
	const overlay = document.createElement('div');
	overlay.id = 'win-overlay';
	overlay.style.position = 'absolute';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100vw';
	overlay.style.height = '100vh';
	overlay.style.background = 'rgba(0,0,0,0.8)';
	overlay.style.display = 'flex';
	overlay.style.flexDirection = 'column';
	overlay.style.justifyContent = 'center';
	overlay.style.alignItems = 'center';
	overlay.style.zIndex = '10000';
	overlay.style.backgroundImage = 'url("img/les.jpg")';
	overlay.style.backgroundSize = 'cover';
	playsound('sound/win.wav');
	overlay.innerHTML = '<h1 style="color: #fff; font-size: 3em;">You Win!</h1>'
	overlay.innerHTML = '<h1 style="color: #fff; font-size: 2em;">Congratulations, you reached the Les!</h1>';
	document.body.appendChild(overlay);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Draw platforms
	ctx.fillStyle = '#00008';
	for (let platform of platforms) {
		ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
	}
	// Draw character image if loaded, otherwise draw black rectangle
	if (characterImage.complete && characterImage.naturalWidth !== 0) {
		ctx.drawImage(characterImage, character.x, character.y, character.width, character.height);
	} else {
		ctx.fillStyle = "black";
		ctx.fillRect(character.x, character.y, character.width, character.height);
	}
}

function shrink() {
	character.width = Math.max(16, character.width - 8);
	character.height = Math.max(32, character.height - 16);
		// Lower jump power when smaller (min 5)
		character.jumpPower = Math.max(5, Math.round(character.height / 12));
		character.y += 16; // Adjust position to prevent sinking into ground
		character.onGround = false; // Force re-check for ground collision
		character.speed = 3 + (128 - character.width) / 16; // Faster when smaller
		playsound('sound/shrink.mp3');
		if (character.width === 16) stopSound();
}

function grow() {
	character.width = Math.min(128, character.width + 8);
	character.height = Math.min(256, character.height + 16);
		// Higher jump power when bigger (max 22)
		character.jumpPower = Math.min(22, Math.round(character.height / 12));
		character.y -= 16; // Adjust position to prevent floating above ground
		character.onGround = false; // Force re-check for ground collision
		character.speed = 3 - (character.width - 64) / 16; // Slower when bigger
		playsound('sound/grow.mp3');
		if (character.width === 128) stopSound();
}

// Math question mechanic

// Math question with timer overlay
function askMathQuestion(action) {
	// Remove any existing overlay
	let old = document.getElementById('math-question-overlay');
	if (old) old.remove();
	let askMathQuestion=true; // Prevent multiple questions at once

	// Generate random math question
	const a = Math.floor(Math.random() * 99) + 1;
	const b = Math.floor(Math.random() * 9) + 1;
	const op = ['+', '-', '*'][Math.floor(Math.random() * 3)];
	let answer;
	switch (op) {
		case '+': answer = a + b; break;
		case '-': answer = a - b; break;
		case '*': answer = a * b; break;

	}

	// Create overlay
	const overlay = document.createElement('div');
	overlay.id = 'math-question-overlay';
	overlay.style.position = 'fixed';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100vw';
	overlay.style.height = '100vh';
	overlay.style.background = 'rgba(0,0,0,0.6)';
	overlay.style.display = 'flex';
	overlay.style.flexDirection = 'column';
	overlay.style.justifyContent = 'center';
	overlay.style.alignItems = 'center';
	overlay.style.zIndex = '9999';

	// Timer
	
	let timeLeft = 15;
	const timer = document.createElement('div');
	timer.style.fontSize = '2em';
	timer.style.color = 'white';
	timer.style.marginBottom = '16px';
	timer.textContent = `Time left: ${timeLeft}s`;
	overlay.appendChild(timer);

	// Question
	const question = document.createElement('div');
	question.style.fontSize = '2em';
	question.style.color = 'white';
	question.style.marginBottom = '16px';
	question.textContent = `Solve to ${action}:  ${a} ${op} ${b} = ?`;
	overlay.appendChild(question);

	// Input
	const input = document.createElement('input');
	input.type = 'number';
	input.style.fontSize = '2em';
	input.style.padding = '8px';
	input.style.textAlign = 'center';
	overlay.appendChild(input);

	// Submit button
	const submit = document.createElement('button');
	submit.textContent = 'Submit';
	submit.style.fontSize = '1.5em';
	submit.style.marginTop = '16px';
	overlay.appendChild(submit);

	document.body.appendChild(overlay);
	input.focus();

	let timerId = setInterval(() => {
		timeLeft--;
		timer.textContent = `Time left: ${timeLeft}s`;
		if (timeLeft <= 0) {
			clearInterval(timerId);
			failQuestion();
		}
	}, 1000);

	function finish(success) {
		clearInterval(timerId);
		overlay.remove();
		let askMathQuestion=false;
		if (success) {
			if (action === 'shrink') shrink();
			else if (action === 'grow') grow();
		} else {
			alert('Wrong answer!');
			character.x = 0;
			character.y = canvas.height - character.height;
			character.dx = 0;
			character.dy = 0;
			character.onGround = true;
			let askMathQuestion=false;
		}
	}

	function failQuestion() {
		finish(false);
	}

	submit.onclick = () => {
		const user = Number(input.value);
		if (user === answer) finish(true);
		else finish(false);
	};
	input.addEventListener('keydown', function(e) {
		if (e.key === 'Enter') submit.click();
	});
}

// Store all playing audio objects
let playingAudios = [];
function playsound(sound) {
	let audio = new Audio(sound);
	audio.play();
	playingAudios.push(audio);
	// Remove from array when ended
	audio.addEventListener('ended', function() {
		const idx = playingAudios.indexOf(audio);
		if (idx !== -1) playingAudios.splice(idx, 1);
	});
}

// Stop all currently playing sounds
function stopSound() {
	for (let audio of playingAudios) {
		audio.pause();
		audio.currentTime = 1;
	}
	playingAudios = [];
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

gameLoop();
