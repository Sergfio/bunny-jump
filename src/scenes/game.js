import Phaser from "../lib/phaser.js";

// import carrot class here
import Carrot from "../game/carrot.js";

export default class Game extends Phaser.Scene {

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms() {}


    /** @type {Phaser.Physics.Arcade.Sprite} */
    player() {}

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors() {}

    /** @type { Phaser.Physics.Arcade.Group} */
    carrots() {}

    constructor() {
        super('game');
    }
    preload() {
        this.load.image('background', '/assets/PNG/Background/bg_layer1.png');

        // load the platform image
        this.load.image('platform', '/assets/PNG/Environment/ground_grass.png');

        // add player input
        this.cursors = this.input.keyboard.createCursorKeys();

        // createing the player
        this.load.image('bunny-stand', '/assets/PNG/Players/bunny1_stand.png');

        this.load.image('carrot', '/assets/PNG/Items/carrot.png');
    }
    create() {
        this.add.image(240, 320, 'background').setScrollFactor(1, 0);
        // create the group
        this.platforms = this.physics.add.staticGroup();

        // then create 5 platform from the group
        for (let i = 0; i < 5; ++i) {
            const x = Phaser.Math.Between(80, 400);
            const y = 150 * i;

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const platform = this.platforms.create(x, y, 'platform');
            platform.scale = 0.5;

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body;
            body.updateFromGameObject();
        }


        // create a bunny sprite
        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);
        this.physics.add.collider(this.platforms, this.player);

        this.player.body.checkCollision.up = false;
        this.player.body.checkCollision.left = false;
        this.player.body.checkCollision.right = false;

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setDeadzone(this.scale.width * 1.5);

        // create carrot group => test

        this.carrots = this.physics.add.group({
            classType: Carrot
        });
        this.physics.add.collider(this.platforms, this.carrots);

        // formatted this way to make it easier to read
        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot, // called on overlap
            undefined,
            this
        );
    }



    update(t, dt) {

        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child;

            const scrollY = this.cameras.main.scrollY;
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100);
                platform.body.updateFromGameObject();




                // create a carrot above the platform being reused
                this.addCarrotAbove(platform);
            }
        });

        // this.carrots.children.iterate(child => {
        //     /** @type {Phaser.Physics.Arcade.Sprite} */
        //     const carrots = child;

        //     const scrollY = this.cameras.main.scrollY;
        //     if(carrot.y >= scrollY + 700) {
        //         carrot.y = scrollY - Phaser.Math.Between(50, 100);
        //         carrot.body.updateFromGameObject();

        //     }
        // });

        // find out from Arcade Physics if the player's body
        // is touching something below it
        const touchingDown = this.player.body.touching.down;
        if (touchingDown) {
            // this makes the bunny jump straight up
            this.player.setVelocityY(-300);
        }

        // left and right input logic
        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200);
        } else {
            // stop movement if not right or left
            this.player.setVelocityX(0);
        }


        // ergibt die Möglichkeit zu Teleportieren
        this.horizontalWrap(this.player);
    }



    /**
     *
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5; // <= eien Konstante 1/2 Breite = sprite(ein parameter um die img's zu animieren)
        const gameWidth = this.scale.width;
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth;
        } else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth;
        }
    }

    /**
     *
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight;

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot');

        carrot.setActive(true);
        carrot.setVisible(true);

        this.add.existing(carrot);

        carrot.body.setSize(carrot.width, carrot.height);

        this.physics.world.enable(carrot);

        return carrot;
    }

    /**
     *
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
     */
    handleCollectCarrot(player, carrot) {
        // hide from display
        this.carrots.killAndHide(carrot);

        // disable from physics world
        this.physics.world.disableBody(carrot.body);
    }


}