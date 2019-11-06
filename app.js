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
const blueLower = [80, 50, 50];
const blueUpper = [245, 256, 256];
const MIN_PLATFORM_AREA = 700;

const VIDEO_PREVIEW = false;
const ORIGINAL_VIDEO = false;

let window, output;

try {
  let camera = new cv.VideoCapture(0);
  if (VIDEO_PREVIEW) {
    window = new cv.NamedWindow('OpenCV Mask', 0);
  }

  function processFrame() {
    camera.read((err, im) => {
      if (err) {
        throw err;
      }

      im = im.flip(1);
      if (ORIGINAL_VIDEO) {
        output = im.copy();  
      }

      im.convertHSVscale();
      im.inRange(blueLower, blueUpper);
      let verticalStructure = cv.imgproc.getStructuringElement(1, [1, 5]);
      im.erode(1, verticalStructure);
      
      let platforms = [];
      let contours = im.findContours();

      if (VIDEO_PREVIEW) {
        if (ORIGINAL_VIDEO) window.show(output)
        else window.show(im)
        window.blockingWaitKey(0, 50);
      }

      for (let i = 0; i < contours.size(); i++) {
        if (contours.area(i) < MIN_PLATFORM_AREA) {
          continue;
        }

        let arcLength = contours.arcLength(i, false);
        contours.approxPolyDP(i, 0.02 * arcLength, true)

        platforms.push({
          points: contours.points(i),
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