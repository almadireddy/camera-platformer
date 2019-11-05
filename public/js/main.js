let socket = io.connect("http://localhost:8080");
let platforms = [];
let videoPreview = true;

const PLATFORM_SIZE = 12;
const DISPLAY_WIDTH = 1280;
const DISPLAY_HEIGHT = 720;

socket.on('newFrameContents', (contents) => {
  platforms = contents;
});

let config = {
  type: Phaser.CANVAS,
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  parent: "phaser",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  dom: {
    createContainer: true
  },
  backgroundColor: 0xffffff
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image('ball', './images/mario.png');
  this.load.image('square', './images/square.png');
}

let ground, width, height, polygon, centroid, rect, angle, ball;
let videoContainer, video;
let cursors;

function create() {
  ground = this.physics.add.staticGroup();
  let z, x, y;

  for (let i = 0; i < DISPLAY_WIDTH/PLATFORM_SIZE; i++) {
    for (let j = 0; j < DISPLAY_HEIGHT/PLATFORM_SIZE; j++) {
      x = i * PLATFORM_SIZE;
      y = j * PLATFORM_SIZE;

      z = ground.create(x, y, "square")
        .setScale(PLATFORM_SIZE/32.0).refreshBody();

      z.setData({x: x, y: y})
    }
  }

  ball = this.physics.add.sprite(50, 50, "ball");
  ball.setScale(64/2048);
  ball.setBounce(0.3);
  ball.setCollideWorldBounds(true);
  ball.body.setGravityY(500)

  this.physics.add.collider(ball, ground);

  cursors = this.input.keyboard.createCursorKeys();

  if (videoPreview) {
    videoContainer = this.add.dom(0, 0, 'video', 'width: 1280px; height: 720px');
    videoContainer.setPosition(640, 360);
    videoContainer.rotate3dAngle = 180;
    videoContainer.setAlpha(0.25);

    video = document.querySelector("video");
    video.autoplay = true;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: true,
      })
      .then(function (stream) {
        stream.getTracks()[0].applyConstraints({
          width: 1280,
          height: 720
        }).then((s) => {
          video.srcObject = stream;
        })
      })
      .catch(function (error) {
        console.log("Something went wrong!", error);
      });
    }
  }
}

function update() {
  for (const c of ground.getChildren()) {
    let visible = false;

    for (const p of platforms) {
      width = p.width;
      height = p.height;
      polygon = p.points;
  
      region = new Region(polygon);
   
      if (region.contains({x: c.x, y: c.y})) {
        visible = true;
      }
    }

    if (visible) {
      c.enableBody(false, c.getData("x"), c.getData("y"), true, true);
    } else {
      c.disableBody(true, true);
    }
  }

  if (cursors.left.isDown) {
    ball.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    ball.setVelocityX(160);
  } else {
    ball.setVelocityX(0);
  }
  if (cursors.up.isDown) {
    ball.setVelocityY(-500);
  }
}