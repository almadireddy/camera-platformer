const cv = require('opencv');
const express = require('express');
const app = express();

let server = require('http').Server(app)
let io = require("socket.io")(server);

server.listen(8080);
app.use(express.static('public'));

app.get('/phaser/phaser.js', function (req, res) {
  res.sendFile(__dirname + '/node_modules/phaser/dist/phaser.min.js');
});

// Hue Saturation Value
const blueLower = [80, 110, 100];
const blueUpper = [220, 256, 256];

const MIN_PLATFORM_AREA = 700;

try {
  let camera = new cv.VideoCapture(0);

  function processFrame() {
    camera.read((err, im) => {
      if (err) {
        throw err;
      }
      
      im = im.flip(1);
      im.convertHSVscale();
      im.inRange(blueLower, blueUpper);
      let verticalStructure = cv.imgproc.getStructuringElement(1, [1, 5]);
      im.erode(1, verticalStructure);

      let platforms = [];
      let contours = im.findContours();

      for (let i = 0; i < contours.size(); i++) {
        if (contours.area(i) < MIN_PLATFORM_AREA) {
          continue;
        }

        let rect = contours.minAreaRect(i);
        let angle = 0;

        if (rect.size.width < rect.size.height) {
          angle = rect.angle + 180;
        } else {
          angle = rect.angle;
        }

        platforms.push({
          height: rect.size.height,
          width: rect.size.width,
          points: rect.points,
          angle: angle
        })
      }

      io.sockets.emit('newFrameContents', platforms);
      processFrame();
    });
  }

  processFrame();

} catch (e) {
  console.log("Couldn't run: ", e);
}