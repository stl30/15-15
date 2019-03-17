var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false,
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
var bossCanChangeDirection = true;
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
var heroLives = 10;
var canTakeDamage = true;
var bossNumberOfHits = 3;

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

    this.load.spritesheet('boss', 'assets/boss-sprite.png',
        {frameWidth: 176, frameHeight: 213});
    this.load.spritesheet('hero', 'assets/hero-sprite.png', {frameWidth: 175, frameHeight: 238});
    this.load.spritesheet('dudex2', 'assets/dudex2.png',
        {frameWidth: 135, frameHeight: 200});
    // this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 200, frameHeight: 128 });
    this.load.spritesheet('explosion', 'assets/explosionx2big.png',
        {frameWidth: 200, frameHeight: 256});

    // this.load.spritesheet('enemy', 'assets/enemy.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('tiles', 'assets/Tiles_32x32.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');

    this.load.audio("bomb", "sounds/bomb.wav");
    this.load.audio("bossFight", "sounds/boss_fight.wav");
    this.load.audio("damage", "sounds/damage.wav");
    this.load.audio("jump", "sounds/jump.wav");
    this.load.audio("regularFight", "sounds/regular_fight.wav");
}

function create() {
    window.sfx = {
        bomb: this.sound.add("bomb"),
        bossFight: this.sound.add("bossFight"),
        damage: this.sound.add("damage"),
        jump: this.sound.add("jump"),
        regularFight: this.sound.add("regularFight")
    };

    //  A simple background for our game
    this.add.image(1600, 320, 'mountain');

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
    player = this.physics.add.sprite(100, 450, 'hero').setScale(0.75);
    this.physics.add.collider(player, groundLayer);

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero', {start: 4, end: 7}),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'turn',
        frames: [{key: 'hero', frame: 3}],
        frameRate: 20,
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero', {start: 0, end: 3}),
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

        'bomb': Phaser.Input.Keyboard.KeyCodes.SPACE,

        'fight': Phaser.Input.Keyboard.KeyCodes.F,

    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, groundLayer);
    this.physics.add.overlap(bombs, bombs, null);

    bombsExplosion = this.physics.add.group();
    this.physics.add.collider(bombsExplosion, groundLayer);

    bushes = this.physics.add.group();
    this.physics.add.collider(bushes, groundLayer);

    //  The score
    scoreText = this.add.text(16, 16, 'Km autostrada: 0',
        {fontSize: '32px', fill: '#000'});
    livesText = this.add.text(16, 48, 'lives: ' + heroLives,
        {fontSize: '32px', fill: '#000'});
    // damageOffText = this.add.text(16, 80, 'Invulnerabil ' + !canTakeDamage,
    //     {fontSize: '22px', fill: '#000'});
    scoreText.setScrollFactor(0);
    livesText.setScrollFactor(0);
    // damageOffText.setScrollFactor(0);

    bossLife = this.add.text(16, 80, 'DRAKNEAH : ' + bossLifeText(bossNumberOfHits), {fontSize: '22px', fill: '#000'});
    bossLife.setScrollFactor(0);

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(bombs, platforms);

    this.physics.add.overlap(bushes, bombsExplosion, bushBombHit, null, this);

    // this.physics.add.collider(enemies, bombsExplosion, enemyBombHit, null, this);
    this.physics.add.overlap(enemies, bombsExplosion, enemyBombHit, null, this);


    // this.physics.add.collider(player, bombsExplosion, heroBombHit, null, this);
    this.physics.add.overlap(player, bombsExplosion, heroBombHit, null, this);

    // this.physics.add.collider(player, bushes, heroBushHit, null, this);
    this.physics.add.overlap(player, bushes, heroBushHit, null, this);

    // this.physics.add.collider(player, enemies, heroEnemyHit, null, this);
    this.physics.add.overlap(player, enemies, heroEnemyHit, null, this);


    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player, true, 0.05, 0.05);

    boss = this.physics.add.sprite(200, 300, 'boss');

    this.physics.add.overlap(player, boss, heroBossHit, null, this);
    this.physics.add.overlap(boss, bombsExplosion, bossBombHit, null, this);

    this.physics.add.collider(boss, groundLayer);
    //  Player physics properties. Give the little guy a slight bounce.
    boss.setBounce(0.2);
    boss.setCollideWorldBounds(false);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'bossleft',
        frames: this.anims.generateFrameNumbers('boss', {start: 0, end: 1}),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'turn',
        frames: [{key: 'boss', frame: 3}],
        frameRate: 20,
    });

    this.anims.create({
        key: 'bossright',
        frames: this.anims.generateFrameNumbers('boss', {start: 2, end: 3}),
        frameRate: 10,
        repeat: -1,
    });

    boss.setCollideWorldBounds(true)


}

function startBoss(boss) {
    // boss.anims.play( 'bossright', true);
    // boss.setVelocityX(160);
    startBossFight(player, boss);
}

function startBossFight(player, boss) {

    var randomy = Math.random() * 3200;
    // console.dir(player.body.velocity)
    // console.log('boss'+boss.x)

    if (boss.x < 90) {
        boss.anims.play('bossright', true);
        boss.setVelocityX(160);
    } else if (boss.x > 3110) {
        boss.anims.play('bossleft', true);
        boss.setVelocityX(-160);
    }

    if (bossCanChangeDirection) {
        if (player.x < boss.x + 350) {

            boss.anims.play('bossleft', true);
            boss.setVelocityX(-160);

        }
        if (player.x >= boss.x - 400) {

            boss.anims.play('bossright', true);
            boss.setVelocityX(160);


        }
        bossCanChangeDirection = false;
        setTimeout(function () {
            bossCanChangeDirection = true;
        }, 4000)
    }

}

function update() {

    if (bossCanArrive) {
        startBoss(boss)
    }

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
        setTimeout(function () {
            canFly = true;
        }, cantFlyTime);
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.up) && canFly) {
        time = new Date();

        player.setVelocityY(-170);

        window.sfx.jump.play();
        if (time.getTime() > flyTime + 5000) {
            canFly = false;
            setTimeout(function () {
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
            enemies[i].setVelocityX(-1 * enemySpeed);
        }
    }


}

function startLayingBush(enemy) {
    var seedIn = Math.random() * bushMaxSeedingTime;
    setTimeout(function () {
        if (laidBushes < maxBushes) {
            addBush(enemy);
        }
        else {
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

    setTimeout(function () {
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
    setTimeout(function () {
        explosionBomb.destroy();
        window.sfx.bomb.play();
    }, bombsTimer);

}

function hitBomaaaab(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function bushBombHit(bush, bombExplosion) {
    bush.destroy();
    bushesDestroyed++;
    score += 100;
    updateText(scoreText, 'Km autostrada: ' + score, 'red');
    laidBushes--;
    // player.setTint(0xff0000);
}

function enemyBombHit(enemy, bombExplosion) {
    enemy.destroy();
    enemyNumber--;
    score += 500;
    updateText(scoreText, 'Km autostrada: ' + score, 'red');
    window.sfx.regularFight.play();
}

function heroBombHit(player, bombExplosion) {
    if (canTakeDamage) {
        heroLives--;
        testifGameOver();
        score -= 50;
        updateText(scoreText, 'Km autostrada: ' + score, 'red');
        updateText(livesText, 'Lives: ' + heroLives, 'red');
        setTimedDamageOff();
        window.sfx.damage.play();
    }
}

function updateText(textObject, text, color) {
    textObject.setText(text);
    textObject.setColor(color);
}

function setTimedDamageOff() {
    canTakeDamage = false;
    // updateText(damageOffText,'Invulnerabil ' + !canTakeDamage,'red');
    setTimeout(function () {
        canTakeDamage = true;
        // updateText(damageOffText,'Invulnerabil ' + !canTakeDamage,'black');
    }, 1500)
}

function heroBushHit(player, bushes) {
    if (canTakeDamage) {
        heroLives--;
        testifGameOver();
        score -= 25;
        updateText(scoreText, 'Km autostrada: ' + score, 'red')
        updateText(livesText, 'Lives: ' + heroLives, 'red');
        setTimedDamageOff();
    }

}

function heroEnemyHit(player, enemies) {
    if (canTakeDamage) {
        heroLives--;
        testifGameOver();
        score -= 50;
        updateText(scoreText, 'Km autostrada: ' + score, 'red')
        updateText(livesText, 'Lives: ' + heroLives, 'red');
        setTimedDamageOff();
    }

}

function heroBossHit(player, boss) {
    if (canTakeDamage) {
        heroLives--;
        testifGameOver();
        score -= 5;
        updateText(scoreText, 'Km autostrada: ' + score, 'red')
        updateText(livesText, 'Lives: ' + heroLives, 'red');
        setTimedDamageOff();
    }
}

function bossLifeText(bossNumberOfHits) {
    var lifeText = '';
    for (i = 0; i < bossNumberOfHits; i++) {
        lifeText += '=== '
    }
    return lifeText;
}

function bossBombHit(boss, bombsExplosion) {
    bossNumberOfHits--;
    testifGameOver();
    score += 1000;
    updateText(scoreText, 'Km autostrada: ' + score, 'red')
    updateText(livesText, 'Lives: ' + heroLives, 'red');
    updateText(bossLife, 'DRAKNEAH :' + bossLifeText(bossNumberOfHits), 'red');
    setTimedDamageOff();

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
    if (heroLives < 1) {
        gameOver = true;
    }
    if (bossNumberOfHits < 1) {
        gameOver = true;
    }
}

function gameOverScreen(player) {
    // location.href = 'lose.html';
}