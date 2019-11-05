# Camera Based Level Creator

A small experiment with creating and playing on a platformer level by drawing the platforms on paper.

The express server uses OpenCV to recognize blue shapes and sends that info over to the frontend via websockets. The frontend uses that info to display platforms for the player to land on and interact with. 

## Relevant Links

[node-opencv](https://www.npmjs.com/package/opencv)

- Follow the instructructions to install the correct version of OpenCV on your machine

[Phaser Docs](https://photonstorm.github.io/phaser3-docs/index.html)

- Docs for the Phaser game engine, which is running the physics and character control on the frontend

## Run on your machine

Make sure you have node installed.

Steps:

1. Clone this repository
2. Run `yarn` to install all the dependencies
3. Run `node app.js` to start the server. You'll be able to access the frontend at `localhost:8080`
4. Allow the webcam access both in the system dialog for the backend and in the browser permissions dialog for the frontend. 
5. Draw solid blue shapes on paper and hold it up for the camera to see
6. Mess with `app.js` and `pubic/js/main.js` to do cool things