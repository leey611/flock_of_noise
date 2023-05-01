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

let attractor

let video;
let cacheGraphic
let videoW = 640
let videoH = 480
let poseNet;
let poses = [];
let windowCenter

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
  //noCursor()
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
  
  video = createCapture(VIDEO);
  video.size(videoW, videoH);
  
  cacheGraphic = createGraphics(videoW, videoH)
  cacheGraphic.translate(videoW,0)
  cacheGraphic.scale(-1,1)
  windowCenter = createVector(width/2, height/2)
  
  video.hide()
  
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  attractor = createVector(width/2, height/2)
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
  //drawPoseCenter()
  for (let boid of flock) {
    boid.edges();
    boid.flock(flock, attractor);
    boid.update();
    boid.show(originalGraphics, eyeGraphics);
  }
  drawPoseCenter(originalGraphics, eyeGraphics)
  image(webGLCanvas, 0, 0);
  image(eyeGraphics, 0, 0);
  //image(originalGraphics,0,0)
  //image(eyeGraphics,0,0)
  // if (poses.length) {
  //   //cacheGraphic.image(video, 0, 0, videoW, videoH)
  //   image(cacheGraphic, 0, 0, videoW, videoH)
  // }

  socket.emit('depth', flock[0].velocity.x)
  socket.emit('harmonic', flock[1].velocity.y)
  socket.emit('pitch', flock[2].velocity.x)

  
  cacheGraphic.clear()
  drawKeypoints();
  drawSkeleton();
  // drawPoseCenter(originalGraphics, eyeGraphics)
  image(cacheGraphic,0,0, width, height)
  // push()
  // fill(0,0,255)
  // ellipse(attractor.x, attractor.y, 50,50)
  // fill(255,0,0)
  // ellipse(attractor.x, height/2, 20,20)
  // pop()
  // push()
  // fill(0,0,255)
  // ellipse(attractor.x, height/2, 20,20)
  // pop()
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

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        cacheGraphic.fill(0, 255, 0);
        //cacheGraphic.noStroke();
        //cacheGraphic.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        cacheGraphic.text(j, keypoint.position.x, keypoint.position.y)
      }
    }
  }
}

function drawPoseCenter(g, eyeG) {
  if (poses.length) {
    let pose = poses[0]
    let keypoint0 = pose.pose.keypoints[0]
    if (keypoint0.score > 0.2) {
      let keypoint0Vec = createVector(
        map(keypoint0.position.x, 0, 640, width, 0, true),
        map(keypoint0.position.y, 0, 480, 0, height, true),//height/2
      )
      attractor = p5.Vector.lerp(attractor, keypoint0Vec, 0.1)

      // cacheGraphic.fill(0, 255, 0);
      // cacheGraphic.noStroke();
      // cacheGraphic.ellipse(attractor.x, attractor.y, 50, 50);
    }
  } else {
    console.log('no pose')
    attractor = p5.Vector.lerp(attractor, windowCenter, 0.2)//createVector(width/2, height/2)
  }
  g.push()
  g.translate(attractor.x, attractor.y)
  //g.rotate(this.velocity.heading());
  //g.strokeWeight(6);
  

  g.stroke("yellow")
  //g.fill("yellow")
  //g.triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
  g.strokeWeight(90)
  g.point(0,0)
  //point(this.position.x, this.position.y);
  g.pop()
  
  eyeG.push()
    eyeG.noStroke()
    eyeG.translate(attractor.x, attractor.y)
    //eyeG.rotate(this.velocity.heading());
      eyeG.push()
        eyeG.translate(-15, -3)
        eyeG.rotate(PI/6)
        eyeG.fill(0)
        eyeG.arc(0,0,25,25,0,PI)
        // eyeG.fill(50)
        // eyeG.arc(0,0,15,15,0,PI)
        //eyeG.strokeWeight(10)
      eyeG.pop()
  
    
      eyeG.push()
        eyeG.translate(15, -3)
        eyeG.rotate(-PI/6)
        eyeG.fill(0)
        eyeG.arc(0,0,25,25,0,PI)
        // eyeG.fill(50)
        // eyeG.arc(0,0,15,15,0,PI)
        //eyeG.strokeWeight(10)
      eyeG.pop()

  eyeG.pop()
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      cacheGraphic.stroke(0, 255, 0);
      cacheGraphic.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function modelReady() {
  console.log('posenet ready')
}
