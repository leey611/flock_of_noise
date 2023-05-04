// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM

class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 5));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 3;
    this.sw = 90
		this.r = 4;
  }

  edges() {
    if (this.position.x + this.sw/2 > width) {
      this.position.x = this.sw/2;
    } else if (this.position.x - this.sw/2 < 0) {
      this.position.x = width - this.sw/2;
    }
    if (this.position.y + this.sw/2 > height) {
      this.position.y = this.sw/2;
    } else if (this.position.y - this.sw/2 < 0) {
      this.position.y = height - this.sw/2;
    }
  }

  align(boids) {
    let perceptionRadius = 10//25;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let perceptionRadius = 60//24;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  

  cohesion(boids) {
    let perceptionRadius = 20//50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }
	
	attractCenter(attractor, d) {
		const centerVec = attractor//acreateVector(attractor.x, height/2)
    let force = p5.Vector.sub(centerVec,this.position);
		let distance = force.mag()
		if (distance > d) {
            this.maxSpeed = 10;
            this.maxForce = 1;
			force.setMag(0.5)
		} else {
            this.maxSpeed = 3;
            this.maxForce = 0.2;
			force.mult(0)
		}
    //let distanceSq = constrain(force.magSq(), 100, 1000);
    //let G = 5;
    //let strength = G * (this.mass * mover.mass) / distanceSq;
    //force.setMag(strength);
    //mover.applyForce(force);
		return force
  }

  separateCenter(attractor) {
    let force = p5.Vector.sub(attractor, this.position)
    let distance = force.mag()
    if (distance < this.sw * 1.2) {
      force.setMag(-0.1)
    } else {
      force.mult(0)
    }
    return force
  }

  flock(boids, attractor, d) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
		
		let centerForce = this.attractCenter(attractor, d);
    let separationCenter = this.separateCenter(attractor)

    // alignment.mult(alignSlider.value());
    // cohesion.mult(cohesionSlider.value());
    // separation.mult(separationSlider.value());
		alignment.mult(alignSlider);
		cohesion.mult(cohesionSlider);
		separation.mult(separationSlider);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
	  this.acceleration.add(centerForce)
    this.acceleration.add(separationCenter)
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  show(g, eyeG) {
		g.push()
		g.translate(this.position.x, this.position.y)
		//g.rotate(this.velocity.heading());
    //g.strokeWeight(6);
		

		g.stroke(255)
		//g.fill("yellow")
		//g.triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
		g.strokeWeight(this.sw)
		g.point(0,0)
    //point(this.position.x, this.position.y);
		g.pop()
		
		eyeG.push()
			eyeG.noStroke()
			eyeG.translate(this.position.x, this.position.y)
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
}
