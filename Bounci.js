await Canvas();
world.gravity.y = 10;
camera.zoom = 2;
camera.on();

let levelIndex = 0;
let won = false;
const MAX_LIVES = 3;
const HEALTH_POINTS_PER_LIFE = 100;
const MAX_HEALTH_POINTS = MAX_LIVES * HEALTH_POINTS_PER_LIFE;
let healthPoints = MAX_HEALTH_POINTS;
let healthDrainTimer = 0;
let razorDamageCooldown = 0;
let touchingRazors = new Set();
let gameOver = false;
let gameOverBounce = 0;
const heartImage = "❤️";
const heartSprite = new Sprite(0, 0, 18, 18, null);
heartSprite.autoDraw = false;
heartSprite.physicsEnabled = false;
if (heartImage) heartSprite.img = heartImage;

let ball = new Sprite();
ball.diameter = 10;
ball.img = '🐸';
ball.x = -160;
ball.y = -40;

const platforms = [
	new Sprite(),
	new Sprite(),
	new Sprite(),
	new Sprite(),
	new Sprite(),
	new Sprite()
];

const lowerPlatforms = [
	new Sprite(),
	new Sprite(),
	new Sprite(),
	new Sprite(),
	new Sprite(),
	new Sprite()
];

const sideWalls = Array.from({ length: 4 }, () => new Sprite());

sideWalls.forEach((wall, index) => {
	wall.physics = STATIC;
	wall.width = index < 2 ? 12 : 120;
	wall.height = index < 2 ? 240 : 12;
	wall.visible = true;
});

platforms.forEach((platform) => {
	platform.physics = STATIC;
	platform.height = 12;
	platform.width = 120;
	platform.rotation = 0;
	platform.visible = true;
});

lowerPlatforms.forEach((platform) => {
	platform.physics = STATIC;
	platform.height = 10;
	platform.width = 60;
	platform.rotation = 0;
	platform.visible = false;
});

const treasureChest = new Sprite();
treasureChest.img = "🪰"
treasureChest.width = 10;
treasureChest.height = 10;
treasureChest.bounciness = 0.7;
treasureChest.friction = 0.15;
treasureChest.autoDraw = true;

const razors = Array.from({ length: 4 }, () => new Sprite(0, 0, 18, 18, KINEMATIC));
const chefImage = "👨‍🍳";
const rotationLock = true;
razors.forEach((razor) => {
	razor.deleteColliders();
	razor.addSensor(0, 0, 18, 18);
	razor.img = chefImage;
	razor.rotationLock = rotationLock;
	razor.autoDraw = true;
});

const levels = [
	{
		label: 'Stage 1',
		ballX: -160,
		platforms: [
			{ x: -120, width: 220, rotation: 30 },
			{ x: 120, width: 220, rotation: 0 },
			{ x: -10, width: 220, rotation: 30 },
			{ x: 130, width: 210, rotation: -5 },
			{ x: 180, y: 60, width: 70, height: 12, rotation: 1 },
			{ x: 220, y: 58, width: 8, height: 20 }
		],
		chest: { x: 180, y: 42 }
	},
	{
		label: 'Stage 2',
		ballX: -180,
		platforms: [
			{ x: -150, width: 200, rotation: 20 },
			{ x: 0, width: 180, rotation: 0 },
			{ x: 110, width: 200, rotation: -18 },
			{ x: 210, width: 120, rotation: 0 },
			{ x: 150, y: 55, width: 90, height: 12, rotation: 0 },
			{ x: 200, y: 53, width: 8, height: 18 }
		],
		chest: { x: 150, y: 37 }
	},
	{
		label: 'Stage 3',
		ballX: -200,
		platforms: [
			{ x: -200, width: 180, rotation: 22 },
			{ x: -30, width: 150, rotation: 0 },
			{ x: 90, width: 180, rotation: -18 },
			{ x: 200, width: 180, rotation: 0 },
			{ x: 215, y: 48, width: 90, height: 12, rotation: 0 },
			{ x: 255, y: 46, width: 8, height: 18 }
		],
		chest: { x: 215, y: 34 },
		below: [
			{ x: -150, y: 80, width: 70, height: 10 },
			{ x: -70, y: 95, width: 60, height: 10 },
			{ x: 20, y: 110, width: 70, height: 10 },
			{ x: 120, y: 96, width: 60, height: 10 },
			{ x: 185, y: 82, width: 70, height: 10 },
			{ x: 250, y: 70, width: 45, height: 10 }
		]
	},
	{
		label: 'Stage 4',
		ballX: -210,
		platforms: [
			{ x: -180, width: 180, rotation: 18 },
			{ x: -40, width: 160, rotation: 0 },
			{ x: 95, width: 200, rotation: -12 },
			{ x: 210, width: 140, rotation: 0 },
			{ x: 170, y: 52, width: 80, height: 12, rotation: 0 },
			{ x: 228, y: 50, width: 8, height: 18 }
		],
		chest: { x: 170, y: 36 }
	},
	{
		label: 'Stage 5',
		ballX: -220,
		platforms: [
			{ x: -200, width: 180, rotation: 18 },
			{ x: -50, width: 150, rotation: 0 },
			{ x: 70, width: 180, rotation: -15 },
			{ x: 185, width: 170, rotation: 0 },
			{ x: 248, y: 48, width: 100, height: 12, rotation: 0 },
			{ x: 298, y: 46, width: 8, height: 18 }
		],
		chest: { x: 248, y: 32 }
	},
	{
		label: 'Stage 6',
		ballX: -230,
		platforms: [
			{ x: -210, width: 180, rotation: 12 },
			{ x: -80, width: 150, rotation: 0 },
			{ x: 40, width: 180, rotation: -12 },
			{ x: 170, width: 180, rotation: 0 },
			{ x: 234, y: 56, width: 96, height: 12, rotation: 0 },
			{ x: 286, y: 54, width: 8, height: 18 }
		],
		chest: { x: 234, y: 40 }
	},
	{
		label: 'Stage 7',
		ballX: -240,
		platforms: [
			{ x: -220, width: 190, rotation: 14 },
			{ x: -70, width: 160, rotation: 0 },
			{ x: 70, width: 190, rotation: -14 },
			{ x: 200, width: 180, rotation: 0 },
			{ x: 260, y: 50, width: 96, height: 12, rotation: 0 },
			{ x: 312, y: 48, width: 8, height: 18 }
		],
		chest: { x: 260, y: 34 },
		below: [
			{ x: -170, y: 84, width: 70, height: 10 },
			{ x: -45, y: 100, width: 62, height: 10 },
			{ x: 60, y: 112, width: 70, height: 10 },
			{ x: 150, y: 102, width: 70, height: 10 },
			{ x: 225, y: 92, width: 78, height: 10 },
			{ x: 292, y: 78, width: 46, height: 10 }
		]
	},
	{
		label: 'Stage 8',
		ballX: -250,
		platforms: [
			{ x: -230, width: 170, rotation: 27 },
			{ x: -80, width: 150, rotation: 0 },
			{ x: 55, width: 180, rotation: -22 },
			{ x: 190, width: 180, rotation: 0 },
			{ x: 245, y: 52, width: 96, height: 12, rotation: 0 },
			{ x: 300, y: 50, width: 8, height: 18 }
		],
		chest: { x: 245, y: 34 },
		below: [
			{ x: -170, y: 86, width: 60, height: 10 },
			{ x: -55, y: 100, width: 52, height: 10 },
			{ x: 30, y: 112, width: 60, height: 10 },
			{ x: 125, y: 104, width: 62, height: 10 },
			{ x: 200, y: 90, width: 68, height: 10 },
			{ x: 272, y: 76, width: 46, height: 10 }
		]
	},
	{
		label: 'Stage 9',
		ballX: -260,
		platforms: [
			{ x: -230, width: 170, rotation: 18 },
			{ x: -60, width: 150, rotation: 0 },
			{ x: 90, width: 190, rotation: -18 },
			{ x: 215, width: 170, rotation: 0 },
			{ x: 265, y: 50, width: 110, height: 12, rotation: 0 },
			{ x: 325, y: 48, width: 8, height: 18 }
		],
		chest: { x: 265, y: 34 },
		below: [
			{ x: -180, y: 90, width: 56, height: 10 },
			{ x: -70, y: 106, width: 54, height: 10 },
			{ x: 30, y: 118, width: 60, height: 10 },
			{ x: 150, y: 108, width: 60, height: 10 },
			{ x: 220, y: 94, width: 72, height: 10 },
			{ x: 290, y: 80, width: 46, height: 10 }
		]
	},
	{
		label: 'Stage 10',
		ballX: -270,
		platforms: [
			{ x: -250, width: 180, rotation: 16 },
			{ x: -100, width: 170, rotation: 0 },
			{ x: 20, width: 180, rotation: -18 },
			{ x: 170, width: 200, rotation: 0 },
			{ x: 252, y: 48, width: 115, height: 12, rotation: 0 },
			{ x: 320, y: 46, width: 8, height: 18 }
		],
		chest: { x: 252, y: 32 },
		below: [
			{ x: -190, y: 92, width: 54, height: 10 },
			{ x: -85, y: 108, width: 52, height: 10 },
			{ x: 10, y: 118, width: 60, height: 10 },
			{ x: 110, y: 110, width: 60, height: 10 },
			{ x: 210, y: 96, width: 76, height: 10 },
			{ x: 295, y: 82, width: 42, height: 10 }
		]
	},
	{
		label: 'Stage 11',
		ballX: -290,
		platforms: [
			{ x: -270, width: 180, rotation: 20 },
			{ x: -110, width: 160, rotation: 0 },
			{ x: 18, width: 180, rotation: -20 },
			{ x: 180, width: 210, rotation: 0 },
			{ x: 268, y: 52, width: 118, height: 12, rotation: 0 },
			{ x: 335, y: 50, width: 8, height: 18 }
		],
		chest: { x: 268, y: 34 },
		below: [
			{ x: -210, y: 95, width: 58, height: 10 },
			{ x: -120, y: 108, width: 54, height: 10 },
			{ x: -10, y: 120, width: 62, height: 10 },
			{ x: 120, y: 112, width: 62, height: 10 },
			{ x: 220, y: 98, width: 78, height: 10 },
			{ x: 300, y: 84, width: 50, height: 10 }
		]
	},
	{
		label: 'Stage 12',
		ballX: -300,
		platforms: [
			{ x: -280, width: 200, rotation: 22 },
			{ x: -130, width: 160, rotation: 0 },
			{ x: 0, width: 190, rotation: -22 },
			{ x: 185, width: 210, rotation: 0 },
			{ x: 270, y: 56, width: 125, height: 12, rotation: 0 },
			{ x: 345, y: 54, width: 8, height: 18 }
		],
		chest: { x: 270, y: 38 },
		below: [
			{ x: -220, y: 98, width: 60, height: 10 },
			{ x: -130, y: 110, width: 54, height: 10 },
			{ x: 10, y: 124, width: 64, height: 10 },
			{ x: 140, y: 118, width: 62, height: 10 },
			{ x: 230, y: 100, width: 82, height: 10 },
			{ x: 315, y: 86, width: 52, height: 10 }
		]
	},
	{
		label: 'Stage 13',
		ballX: -310,
		platforms: [
			{ x: -290, width: 200, rotation: 25 },
			{ x: -150, width: 150, rotation: 0 },
			{ x: 30, width: 180, rotation: -18 },
			{ x: 195, width: 220, rotation: 0 },
			{ x: 278, y: 58, width: 130, height: 12, rotation: 0 },
			{ x: 350, y: 56, width: 8, height: 18 }
		],
		chest: { x: 278, y: 40 },
		below: [
			{ x: -240, y: 104, width: 62, height: 10 },
			{ x: -150, y: 116, width: 56, height: 10 },
			{ x: 10, y: 129, width: 66, height: 10 },
			{ x: 150, y: 120, width: 66, height: 10 },
			{ x: 250, y: 104, width: 84, height: 10 },
			{ x: 325, y: 88, width: 54, height: 10 }
		]
	},
	{
		label: 'Stage 14',
		ballX: -320,
		platforms: [
			{ x: -300, width: 210, rotation: 24 },
			{ x: -170, width: 150, rotation: 0 },
			{ x: 20, width: 200, rotation: -24 },
			{ x: 205, width: 220, rotation: 0 },
			{ x: 292, y: 60, width: 138, height: 12, rotation: 0 },
			{ x: 365, y: 58, width: 8, height: 18 }
		],
		chest: { x: 292, y: 42 },
		below: [
			{ x: -250, y: 108, width: 62, height: 10 },
			{ x: -160, y: 118, width: 58, height: 10 },
			{ x: 10, y: 132, width: 70, height: 10 },
			{ x: 160, y: 123, width: 70, height: 10 },
			{ x: 260, y: 108, width: 90, height: 10 },
			{ x: 335, y: 92, width: 58, height: 10 }
		]
	},
	{
		label: 'Stage 15',
		ballX: -330,
		platforms: [
			{ x: -310, width: 220, rotation: 26 },
			{ x: -180, width: 150, rotation: 0 },
			{ x: 30, width: 210, rotation: -22 },
			{ x: 215, width: 230, rotation: 0 },
			{ x: 298, y: 62, width: 148, height: 12, rotation: 0 },
			{ x: 380, y: 60, width: 8, height: 18 }
		],
		chest: { x: 298, y: 44 },
		below: [
			{ x: -260, y: 112, width: 64, height: 10 },
			{ x: -170, y: 122, width: 60, height: 10 },
			{ x: 0, y: 136, width: 72, height: 10 },
			{ x: 165, y: 126, width: 72, height: 10 },
			{ x: 270, y: 110, width: 94, height: 10 },
			{ x: 345, y: 96, width: 60, height: 10 }
		]
	},
	{
		label: 'Stage 16',
		ballX: -340,
		platforms: [
			{ x: -320, width: 220, rotation: 28 },
			{ x: -190, width: 150, rotation: 0 },
			{ x: 40, width: 220, rotation: -24 },
			{ x: 230, width: 240, rotation: 0 },
			{ x: 310, y: 64, width: 160, height: 12, rotation: 0 },
			{ x: 395, y: 62, width: 8, height: 18 }
		],
		chest: { x: 310, y: 46 },
		below: [
			{ x: -270, y: 116, width: 66, height: 10 },
			{ x: -180, y: 126, width: 62, height: 10 },
			{ x: 20, y: 140, width: 74, height: 10 },
			{ x: 180, y: 130, width: 74, height: 10 },
			{ x: 280, y: 112, width: 98, height: 10 },
			{ x: 355, y: 98, width: 62, height: 10 }
		]
	}
];

function resetPlayerToStart() {
	const level = levels[levelIndex];
	ball.x = level.ballX;
	ball.y = -40;
	ball.vel.x = 0;
	ball.vel.y = 0;
	camera.x = ball.x;
	camera.y = ball.y - 10;
}

function playerTouches(x, y, width, height) {
	return Math.abs(ball.x - x) < (ball.width + width) / 2 &&
		Math.abs(ball.y - y) < (ball.height + height) / 2;
}

function chasePlayer() {
	for (const razor of razors) {
		if (!razor.visible) continue;
		const dx = ball.x - razor.x;
		const dy = ball.y - razor.y;
		const distance = Math.hypot(dx, dy) || 1;
		const speed = 0.7 + levelIndex * 0.14;
		razor.vel.x = dx / distance * speed;
		razor.vel.y = dy / distance * speed;
		if (!rotationLock) razor.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
	}
}

function damagePlayer(amount) {
	if (razorDamageCooldown > 0 || gameOver) return;
	healthPoints = Math.max(0, healthPoints - amount);
	razorDamageCooldown = 1000;
	if (healthPoints === 0) {
		gameOver = true;
		ball.vel.x = 0;
		ball.vel.y = -2;
	}
}

function setLevel(index) {
	const level = levels[index];
	allSprites.forEach((sprite) => {
		sprite.visible = true;
	});
	won = false;
	resetPlayerToStart();

	platforms.forEach((platform, i) => {
		const spec = level.platforms[i];
		if (spec) {
			platform.x = spec.x;
			platform.y = spec.y ?? 0;
			platform.width = spec.width;
			platform.height = spec.height ?? 12;
			platform.rotation = (spec.rotation ?? 0) + 1;
			platform.visible = true;
		} else {
			platform.visible = false;
		}
	});

	lowerPlatforms.forEach((platform) => {
		platform.visible = false;
	});

	if (level.below) {
		level.below.forEach((spec, i) => {
			const platform = lowerPlatforms[i];
			if (!platform) return;
			platform.x = spec.x;
			platform.y = spec.y ?? 0;
			platform.width = spec.width;
			platform.height = spec.height ?? 10;
			platform.rotation = 1;
			platform.visible = true;
		});
	}

	const platformExtents = [...level.platforms, ...(level.below ?? [])];
	const leftEdge = Math.min(
		...platformExtents.map((spec) => spec.x - spec.width / 2),
		level.chest.x - treasureChest.width / 2
	) - 24;
	const rightEdge = Math.max(
		...platformExtents.map((spec) => spec.x + spec.width / 2),
		level.chest.x + treasureChest.width / 2
	) + 24;
	sideWalls[0].x = leftEdge;
	sideWalls[0].y = 0;
	sideWalls[1].x = rightEdge;
	sideWalls[1].y = 0;
	sideWalls[2].x = (leftEdge + rightEdge) / 2;
	sideWalls[2].y = -90;
	sideWalls[2].width = rightEdge - leftEdge;
	sideWalls[3].x = (leftEdge + rightEdge) / 2;
	sideWalls[3].y = 90;
	sideWalls[3].width = rightEdge - leftEdge;

	const razorStarts = [
		{ x: leftEdge + 30, y: -60 },
		{ x: rightEdge - 30, y: 60 },
		{ x: leftEdge + 30, y: 60 },
		{ x: rightEdge - 30, y: -60 }
	];
	const activeRazorCount = Math.min(razors.length, 1 + Math.floor(levelIndex / 3));
	touchingRazors.clear();
	razors.forEach((razor, i) => {
		razor.x = razorStarts[i].x;
		razor.y = razorStarts[i].y;
		razor.vel.x = 0;
		razor.vel.y = 0;
		razor.visible = i < activeRazorCount;
	});

	platforms.forEach((platform, i) => {
		const spec = level.platforms[i];
		if (spec && spec.rotation !== undefined) {
			platform.rotation = (spec.rotation ?? 0) + 1 + levelIndex * 0.4;
		}
	});

	treasureChest.x = level.chest.x;
	treasureChest.y = level.chest.y;
	treasureChest.vel.x = (Math.random() - 0.5) * 0.7;
	treasureChest.vel.y = -0.2;
}

function nextLevel() {
	levelIndex = (levelIndex + 1) % levels.length;
	setLevel(levelIndex);
}

function restartGame() {
	healthPoints = MAX_HEALTH_POINTS;
	healthDrainTimer = 0;
	razorDamageCooldown = 0;
	levelIndex = 0;
	gameOver = false;
	gameOverBounce = 0;
	setLevel(levelIndex);
}

function drawLives() {
	camera.off();
	push();
	noStroke();
	fill('#3a2440');
	rect(-width / 2, -height / 2, width, 42);
	fill('#ffffff');
	textAlign('left', 'center');
	text('Lives', -width / 2 + 16, -height / 2 + 21);
	const remainingHearts = Math.ceil(healthPoints / HEALTH_POINTS_PER_LIFE);
	for (let i = 0; i < MAX_LIVES; i += 1) {
		const x = -width / 2 + 68 + i * 27;
		const y = -height / 2 + 21;
		if (heartImage && i < remainingHearts) {
			heartSprite.x = x;
			heartSprite.y = y;
			heartSprite.draw();
		} else {
			drawHeart(x, y, false);
		}
	}
	pop();
	camera.on();
}

function drawHeart(x, y, filled) {
	push();
	noStroke();
	fill(filled ? '#f04f78' : '#755968');
	circle(x - 4, y - 2, 9);
	circle(x + 4, y - 2, 9);
	triangle(x - 8, y, x + 8, y, x, y + 10);
	pop();
}

function drawGameOver() {
	camera.off();
	push();
	noStroke();
	fill('#271c32');
	rect(-160, -90, 320, 180);
	fill('#ffffff');
	textAlign('center', 'center');
	textSize(24);
	text('GAME OVER', 0, -24 + Math.sin(gameOverBounce) * 4);
	textSize(14);
	text('You have been made into cuisses de grenouille', 0, 0);
	text('Click to restart', 0, 20);
	pop();
	camera.on();
}

function constrainTreasureToWalls() {
	const left = sideWalls[0].x + sideWalls[0].width / 2 + treasureChest.width / 2;
	const right = sideWalls[1].x - sideWalls[1].width / 2 - treasureChest.width / 2;
	const top = sideWalls[2].y + sideWalls[2].height / 2 + treasureChest.height / 2;
	const bottom = sideWalls[3].y - sideWalls[3].height / 2 - treasureChest.height / 2;
	const nextX = treasureChest.x + treasureChest.vel.x;
	const nextY = treasureChest.y + treasureChest.vel.y;

	if (nextX < left) {
		treasureChest.x = left;
		treasureChest.vel.x = Math.abs(treasureChest.vel.x) * 0.7;
	} else if (nextX > right) {
		treasureChest.x = right;
		treasureChest.vel.x = -Math.abs(treasureChest.vel.x) * 0.7;
	}
	if (nextY < top) {
		treasureChest.y = top;
		treasureChest.vel.y = Math.abs(treasureChest.vel.y) * 0.7;
	} else if (nextY > bottom) {
		treasureChest.y = bottom;
		treasureChest.vel.y = -Math.abs(treasureChest.vel.y) * 0.7;
	}
}

setLevel(0);

q5.update = function () {
	background('#f7d9ee');
	constrainTreasureToWalls();
	if (razorDamageCooldown > 0) {
		razorDamageCooldown = Math.max(0, razorDamageCooldown - deltaTime);
	}
	if (!gameOver) {
		const cameraTargetX = ball.x;
		const cameraTargetY = ball.y - 10;
		const deadZoneX = 100;
		const deadZoneY = 60;
		if (cameraTargetX > camera.x + deadZoneX) camera.x = cameraTargetX - deadZoneX;
		else if (cameraTargetX < camera.x - deadZoneX) camera.x = cameraTargetX + deadZoneX;
		if (cameraTargetY > camera.y + deadZoneY) camera.y = cameraTargetY - deadZoneY;
		else if (cameraTargetY < camera.y - deadZoneY) camera.y = cameraTargetY + deadZoneY;
	}
	if (gameOver) {
		allSprites.forEach((sprite) => {
			sprite.visible = false;
		});
		gameOverBounce += 0.15;
		ball.vel.y += 0.04;
		ball.y += ball.vel.y;
		if (ball.y > 90) {
			ball.vel.y *= -0.7;
			ball.y = 90;
		}
		if (mouse.presses()) {
			restartGame();
			return;
		}
		drawGameOver();
		return;
	}
	healthDrainTimer += deltaTime;
	while (healthDrainTimer >= 1000) {
		healthPoints = Math.max(0, healthPoints - 1);
		healthDrainTimer -= 1000;
	}
	if (healthPoints === 0) {
		gameOver = true;
		ball.vel.x = 0;
		ball.vel.y = -2;
		return;
	}
	const moveLeft = kb.pressing('arrowLeft') > 0 || kb.pressing('a') > 0;
	const moveRight = kb.pressing('arrowRight') > 0 || kb.pressing('d') > 0;
	const jumpPressed = kb.presses('arrowUp') || kb.presses('w');
	if (moveLeft !== moveRight) {
		ball.vel.x = moveLeft ? -2.5 : 2.5;
	} else if (!moveLeft) {
		ball.vel.x *= 0.9;
	}

	if (!won && playerTouches(treasureChest.x, treasureChest.y, treasureChest.width, treasureChest.height)) {
		healthPoints = MAX_HEALTH_POINTS;
		healthDrainTimer = 0;
		won = true;
		touchingRazors.clear();
		razors.forEach((razor) => {
			razor.visible = false;
			razor.vel.x = 0;
			razor.vel.y = 0;
		});
	}

	if (!won) {
		chasePlayer();
		const currentRazorContacts = new Set(razors.filter((razor) =>
			razor.visible && playerTouches(razor.x, razor.y, razor.width, razor.height)
		));
		if ([...currentRazorContacts].some((razor) => !touchingRazors.has(razor))) {
			damagePlayer(100);
		}
		touchingRazors = currentRazorContacts;
	}

	text(levels[levelIndex].label, 0, -80);
	drawLives();

	if (!won) {
		text('Catch the fly!', 0, -50);
	} else {
		text('You won! Click to continue', 0, -50);
		if (mouse.presses()) nextLevel();
	}

	if (jumpPressed || mouse.presses()) ball.vel.y = -3;
};