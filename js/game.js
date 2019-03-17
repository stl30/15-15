
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombsExplosion;
var bombs;

var bombsTimer;
var time = new Date();
var bombTime = time.getMilliseconds();
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var enemyNumber = 3;

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
    this.load.image('veo', 'assets/veorica1.png');
    // this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('dudex2', 'assets/dudex2.png', { frameWidth: 135, frameHeight: 200 });
    // this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 200, frameHeight: 128 });
    this.load.spritesheet('explosion', 'assets/explosionx2big.png', { frameWidth: 200, frameHeight: 256 });


    this.load.spritesheet('enemy', 'assets/enemy.png', {frameWidth: 32, frameHeight: 48});
    this.load.image("tiles", "assets/Tiles_32x32.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
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

    const map = this.make.tilemap({key: "map"});
    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("Tiles_32x32", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const groundLayer = map.createStaticLayer("GroundLayer", tileset, 0, 0);

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
        frames: this.anims.generateFrameNumbers('dudex2', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dudex2', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dudex2', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'explosion',
        frames: this.anims.generateFrameNumbers('explosion', { start: 1, end: 9 }),
        frameRate: 9,
        repeat: -1
    });

    enemies = this.physics.add.group();

    for (var i = 0; i < enemyNumber; i++) {
        var randomy = Math.random() * 3200;

        var name = 'enemy' + i;
        enemy = this.physics.add.sprite(randomy, player.y + 16, 'dudex2');
        this.physics.add.collider(enemy, groundLayer);

        //  Player physics properties. Give the little guy a slight bounce.
        enemy.setBounce(0.2);
        enemy.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(name, {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{key: name, frame: 4}],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(name, {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        var rdnNumber = Math.random() * 100;
        if (rdnNumber < 50) {
            enemy.anims.play('left', true);
            enemy.setVelocityX(-160);

        } else {
            enemy.anims.play('right', true);
            enemy.setVelocityX(160);
        }

        // var ufo = this.add.sprite(200, 240, 'ufo');

    }

    // var randomy = Math.random() * 3200;
    //
    // enemy = this.physics.add.sprite(randomy + player.x, player.y + 16, 'enemy');
    // this.physics.add.collider(enemy, groundLayer);

    // //  Player physics properties. Give the little guy a slight bounce.
    // enemy.setBounce(0.2);
    // enemy.setCollideWorldBounds(true);
    //
    // //  Our player animations, turning, walking left and walking right.
    // this.anims.create({
    //     key: 'left',
    //     frames: this.anims.generateFrameNumbers('enemy', {start: 0, end: 3}),
    //     frameRate: 10,
    //     repeat: -1
    // });
    //
    // this.anims.create({
    //     key: 'turn',
    //     frames: [{key: 'enemy', frame: 4}],
    //     frameRate: 20
    // });
    //
    // this.anims.create({
    //     key: 'right',
    //     frames: this.anims.generateFrameNumbers('enemy', {start: 5, end: 8}),
    //     frameRate: 10,
    //     repeat: -1
    // });
    //
    // enemy.anims.play('left', true);
    // enemy.setVelocityX(-160);

    // player 1 will use WASD

    // the returned object will have the same properties as the cursor keys, so it's easier to work with them

    this.keys = this.input.keyboard.addKeys({

        'bomb': Phaser.Input.Keyboard.KeyCodes.B,

        'fight': Phaser.Input.Keyboard.KeyCodes.F

    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 1,
        setXY: {x: 12, y: 0, stepX: 70}
    });

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
    scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});
    livesText = this.add.text(16, 48, 'lives: 3', {fontSize: '32px', fill: '#000'});
    scoreText.setScrollFactor(0);
    livesText.setScrollFactor(0);


    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // this.physics.add.collider(player, bombs, hitBomb, null, this);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
}

function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
        // addEnemy();
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        enemy.anims.play('left', true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.bomb)) {
        addBomb(player);
    }


    // for (var i = 0; i < enemyNumber; i++) {
    //     if (enemy[i].x < 90) {
    //         enemies.anims.play('right', true);
    //         enemies.setVelocityX(160);
    //     } else if (enemies[i].x > 3110) {
    //         enemies.anims.play('left', true);
    //         enemies.setVelocityX(-160);
    //     }
    // }

    // for (var i = 0; i < enemies.length; i++) {
    //     if (enemies[i].x < 90) {
    //         enemies.anims.play('right', true);
    //         enemies.setVelocityX(160);
    //     } else if (enemies[i].x > 3110) {
    //         enemies.anims.play('left', true);
    //         enemies.setVelocityX(-160);
    //     }
    // }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);
    scoreText.setColor('red');

    if (stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function addBomb(player) {

  var bombCreated = bombs.create(player.x, player.y-76, 'bomb');
  var bushesCreated = bushes.create(player.x+500, player.y-30, 'bush');

  setTimeout(function() {
      addExplosion(bombCreated)
    },3000)
}

function addExplosion(bombCreated) {
  bombCreated.destroy();
  var explosionBomb = bombsExplosion.create(bombCreated.x, bombCreated.y, 'explosion');
  explosionBomb.setBounce(1);
  explosionBomb.setCollideWorldBounds(true);
  explosionBomb.allowGravity = false;
  explosionBomb.anims.play('explosion', true)
  setTimeout(function() {
    explosionBomb.destroy();
  },1000)
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
