var config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 300},
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player;
var stars;
var bombsExplosion;
var bombs;
var maxBombs = 3;
var cantFlyTime = 4000;
var enemySpeed = 160;

var bombsTimer = 1000;
var time = new Date();
var maxBushes = 5;
var laidBushes = 0;
var bushMaxSeedingTime = 10000;
var bushesDestroyed = 0;
var bushesToDestroyForBoss = 10;
var canFly = true;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var enemyNumber = 3;
var bossCanArrive = false;
var lives = 10;

var game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('mountain', 'assets/mountains_3200x640.png');
  // this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bush', 'assets/bush.png');
  // this.load.image('bomb', 'assets/bomb.png');
  this.load.image('bomb', 'assets/bombx2.png');
  this.load.image('bush', 'assets/bush.png');
  this.load.spritesheet('enemy0', 'assets/devil-sprite-calin.png',
      {frameWidth: 120, frameHeight: 96});
  this.load.spritesheet('enemy1', 'assets/devil-sprite-tudorel.png',
      {frameWidth: 120, frameHeight: 96});
  this.load.spritesheet('enemy2', 'assets/devil-sprite-veorica.png',
      {frameWidth: 120, frameHeight: 96});
  // this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('dudex2', 'assets/dudex2.png',
      {frameWidth: 135, frameHeight: 200});
  // this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 200, frameHeight: 128 });
  this.load.spritesheet('explosion', 'assets/explosionx2big.png',
      {frameWidth: 200, frameHeight: 256});

  // this.load.spritesheet('enemy', 'assets/enemy.png', {frameWidth: 32, frameHeight: 48});
  this.load.image('tiles', 'assets/Tiles_32x32.png');
  this.load.tilemapTiledJSON('map', 'assets/map.json');
}

function create() {
  // var background = this.add.tileSprite(0, 0, 500, 500, "sky");
  // //  A simple background for our game
  this.add.image(1600, 320, 'mountain');

  // this.physics.world.setBounds(0, 0, 3392, 240);
  //
  // //  The platforms group contains the ground and the 2 ledges we can jump on
  // platforms = this.physics.add.staticGroup();
  //
  // //  Here we create the ground.
  // //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  // platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  const map = this.make.tilemap({key: 'map'});
  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage('Tiles_32x32', 'tiles');

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const groundLayer = map.createStaticLayer('GroundLayer', tileset, 0, 0);

  groundLayer.setCollisionByExclusion([-1]);

  //  Now let's create some ledges
  // platforms.create(600, 400, 'ground');
  // platforms.create(50, 250, 'ground');
  // platforms.create(750, 220, 'ground');

  // The player and its settings
  player = this.physics.add.sprite(200, 450, 'dudex2');
  this.physics.add.collider(player, groundLayer);

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dudex2', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: 'turn',
    frames: [{key: 'dudex2', frame: 4}],
    frameRate: 20,
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dudex2', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: 'explosion',
    frames: this.anims.generateFrameNumbers('explosion', {start: 1, end: 9}),
    frameRate: 9,
    repeat: -1,
  });

  // enemies = this.physics.add.group();
  enemies = [];

  for (var i = 0; i < enemyNumber; i++) {
    var randomy = Math.random() * 3200;

    var name = 'enemy' + i;
    // console.log(name)
    enemies[i] = this.physics.add.sprite(randomy, player.y + 16, name);
    this.physics.add.collider(enemies[i], groundLayer);

    //  Player physics properties. Give the little guy a slight bounce.
    enemies[i].setBounce(0.2);
    enemies[i].setCollideWorldBounds(true);

    enemies[i].canLayBushes = true;

    startLayingBush(enemies[i]);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: name + 'left',
      frames: this.anims.generateFrameNumbers(name, {start: 0, end: 1}),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: name + 'turn',
      frames: [{key: name, frame: 3}],
      frameRate: 20,
    });

    this.anims.create({
      key: name + 'right',
      frames: this.anims.generateFrameNumbers(name, {start: 2, end: 3}),
      frameRate: 10,
      repeat: -1,
    });

    var rdnNumber = Math.random() * 100;
    if (rdnNumber < 50) {
      enemies[i].anims.play(name + 'left', true);
      enemies[i].setVelocityX(-1 * enemySpeed);

    } else {
      enemies[i].anims.play(name + 'right', true);
      enemies[i].setVelocityX(enemySpeed);
    }

    // var ufo = this.add.sprite(200, 240, 'ufo');

  }

  this.keys = this.input.keyboard.addKeys({

    'bomb': Phaser.Input.Keyboard.KeyCodes.B,

    'fight': Phaser.Input.Keyboard.KeyCodes.F,

  });

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();



  // stars.children.iterate(function (child) {
  //
  //     //  Give each star a slightly different bounce
  //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  //
  // });

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, groundLayer);

  bombsExplosion = this.physics.add.group();
  this.physics.add.collider(bombsExplosion, groundLayer);

  bushes = this.physics.add.group();
  this.physics.add.collider(bushes, groundLayer);

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0',
      {fontSize: '32px', fill: '#000'});
  livesText = this.add.text(16, 48, 'lives: ' + lives,
      {fontSize: '32px', fill: '#000'});
  scoreText.setScrollFactor(0);
  livesText.setScrollFactor(0);

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(bombs, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  // this.physics.add.overlap(player, stars, collectStar, null, this);

  // this.physics.add.collider(player, bombs, hitBomb, null, this);
  this.physics.add.collider(bushes, bombsExplosion, bushBombHit, null, this);
  this.physics.add.collider(enemies, bombsExplosion, enemyBombHit, null, this);

  const camera = this.cameras.main;
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.cameras.main.startFollow(player, true, 0.05, 0.05);
}

function update() {
  testifGameOver();
  if (gameOver) {
    gameOverScreen(player);
  }
  testIfBossCanArrive();

  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (player.body.onFloor()) {
    time = new Date();
    flyTime = time.getTime();
  }

  // daca ajunge prea sus nu mai poate zbura 4 secunde
  if (player.y < 120) {
    canFly = false;
    setTimeout(function() {
      canFly = true;
    }, cantFlyTime);
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up) && canFly) {
    time = new Date();
    // console.log(time.getTime())
    // console.log(flyTime)

    player.setVelocityY(-170);

    if (time.getTime() > flyTime + 5000) {
      canFly = false;
      setTimeout(function() {
        canFly = true;
      }, cantFlyTime);
    }

  }

  if (Phaser.Input.Keyboard.JustDown(this.keys.bomb)) {
    // console.log(bombs.children.entries.length)
    if (bombs.children.entries.length < maxBombs) {

      addBomb(player);
    }
  }

  for (var i = 0; i < enemies.length; i++) {
    enemyName = 'enemy' + i;

    if (enemies[i].x < 90) {
      enemies[i].anims.play(enemyName + 'right', true);
      enemies[i].setVelocityX(enemySpeed);
    } else if (enemies[i].x > 3110) {
      enemies[i].anims.play(enemyName + 'left', true);
      enemies[i].setVelocityX(-1*enemySpeed);
    }
  }


}

function startLayingBush(enemy) {
  var seedIn = Math.random() * bushMaxSeedingTime;
  setTimeout(function() {
    if (laidBushes < maxBushes) {
      addBush(enemy);
    }
    else{
      startLayingBush(enemy)
    }
  }, seedIn);
  console.log(laidBushes)
}

function addBush(enemy) {
  if (enemy.active) {
    var bushesCreated = bushes.create(enemy.x - 20, enemy.y - 30, 'bush');
    laidBushes++;
  }
  startLayingBush(enemy)

}

function addBomb(player) {

  var bombCreated = bombs.create(player.x, player.y - 76, 'bomb');

  setTimeout(function() {
    addExplosion(bombCreated);
  }, 3000);
}

function addExplosion(bombCreated) {
  bombCreated.destroy();
  var explosionBomb = bombsExplosion.create(bombCreated.x, bombCreated.y,
      'explosion');
  explosionBomb.setBounce(1);
  explosionBomb.setCollideWorldBounds(true);
  explosionBomb.allowGravity = false;
  explosionBomb.anims.play('explosion', true);
  setTimeout(function() {
    explosionBomb.destroy();
  }, bombsTimer);

}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}

function bushBombHit(bush, bombExplosion) {
  bush.destroy();
  bushesDestroyed++;
  score += 100;
  scoreText.setText('Score: ' + score);
  scoreText.setColor('red');
  laidBushes--;
  // player.setTint(0xff0000);
}
function enemyBombHit(enemy, bombExplosion) {
  enemy.destroy();
  enemyNumber--;
  score += 500;
  scoreText.setText('Score: ' + score);
  scoreText.setColor('red');
  // player.setTint(0xff0000);
}

function testIfBossCanArrive() {

  if (bushesDestroyed >= bushesToDestroyForBoss) {
    bossCanArrive = true;
  }
  if ((enemies.length === 0 && bushes.children.entries.length)) {
    bossCanArrive = true;
  }

}

function testifGameOver() {
  if (lives < 1) {
    gameOver = true;
  }
}

function gameOverScreen(player) {
  alert('Game Over');
  location.reload();
}