/*
 * @name Applying Shaders as Textures
 * @description Shaders can be applied to 2D/3D shapes as textures.
 * To learn more about shaders and p5.js: https://itp-xstory.github.io/p5js-shaders/
 */

let theShader;
let webGLCanvas;
let originalGraphics;
let eyeGraphics;
const flock = [];

function preload() {
  // load the shader
  theShader = loadShader("texture.vert", "texture.frag");
}

function setup() {
  // disables scaling for retina screens which can create inconsistent scaling between displays
  //pixelDensity(1);
  // shaders require WEBGL mode to work
  // createCanvas(1000, 1000);
  createCanvas(displayWidth, displayHeight);
  noCursor()
  noStroke();

  webGLCanvas = createGraphics(width, height, WEBGL);
  originalGraphics = createGraphics(width, height);
  eyeGraphics = createGraphics(width, height);

  alignSlider = 2; //createSlider(0, 2, 1.5, 0.1);
  cohesionSlider = 0; //createSlider(0, 2, 1, 0.1);
  separationSlider = 2; //createSlider(0, 2, 2, 0.1);

  originalGraphics.noStroke();
  webGLCanvas.noStroke();
  noStroke();

  for (let i = 0; i < 40; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  // here we're using setUniform() to send our uniform values to the shader
  theShader.setUniform("resolution", [width, height]);
  theShader.setUniform("time", millis() / 1000.0);
  theShader.setUniform("mouse", [mouseX, map(mouseY, 0, height, height, 0)]);

  webGLCanvas.shader(theShader);
  theShader.setUniform("u_resolution", [width / width, height / height]);
  theShader.setUniform("u_time", millis() / 1000);
  theShader.setUniform("u_mouse", [mouseX / width, mouseY / height]);
  theShader.setUniform("u_tex", originalGraphics);
  //console.log(mouseX/width)

  webGLCanvas.clear();
  webGLCanvas.rect(-width / 2, -height / 2, width, height);

  originalGraphics.background(0);
  eyeGraphics.clear();
  for (let boid of flock) {
    //boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show(originalGraphics, eyeGraphics);
  }

  image(webGLCanvas, 0, 0);
  image(eyeGraphics, 0, 0);
  //image(originalGraphics,0,0)
  //image(eyeGraphics,0,0)
  //console.log(flock[0].velocity)
  socket.emit('depth', flock[0].velocity.x)
  socket.emit('harmonic', flock[1].velocity.y)
  socket.emit('pitch', flock[2].velocity.x)
  //socket.emit('')
}

function windowResized() {
  //resizeCanvas(windowWidth, windowHeight);
  
}

function keyPressed() {
  if (key === "f" || key === "F") {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  // if (mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
  //   let fs = fullscreen();
  //   fullscreen(!fs);
  // }
}
