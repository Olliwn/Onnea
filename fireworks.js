const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const explosions = [];

// Configuration
const gravity = 0.1;
const airResistance = 0.995;
const explosionParticleCount = 150;
const explosionVelocity = 10;
const fireworkLaunchVelocity = 8;
const fireworkChance = 0.02; // Chance of a firework launching each frame

// Add configuration object
const config = {
    rocketSize: 3,
    fadeDuration: 0.015,
    rocketFrequency: 0.02,
    particleCount: 150,
    crackling: true
};

// Add event listeners for controls
document.getElementById('rocketSize').addEventListener('input', (e) => config.rocketSize = parseFloat(e.target.value));
document.getElementById('fadeDuration').addEventListener('input', (e) => config.fadeDuration = parseFloat(e.target.value));
document.getElementById('rocketFrequency').addEventListener('input', (e) => config.rocketFrequency = parseFloat(e.target.value));
document.getElementById('particleCount').addEventListener('input', (e) => config.particleCount = parseInt(e.target.value));
document.getElementById('crackling').addEventListener('input', (e) => config.crackling = e.target.checked);

class Particle {
    constructor(x, y, color, radius, dx, dy, delay = 0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.opacity = 1;
        this.decay = config.fadeDuration;
        this.delay = delay;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }

    update() {
        this.dx *= airResistance;
        this.dy *= airResistance;
        this.dy += gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.opacity -= this.decay;
    }
}

class Firework {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = config.rocketSize;
        this.dx = 0;
        this.dy = -Math.random() * fireworkLaunchVelocity - 5; // Vary launch velocity
        this.isExploded = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${this.color})`;
        ctx.fill();
    }

    update() {
        if (!this.isExploded) {
            this.dy += gravity;
            this.y += this.dy;

            // Explode at the top of the trajectory
            if (this.dy >= 0) {
                this.isExploded = true;
                this.explode();
            }
        }
    }

    explode() {
        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * explosionVelocity;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;

            particles.push(new Particle(this.x, this.y, this.color, 2, dx, dy));

            // Add crackling effect
            if (config.crackling && Math.random() < 0.3) {
                const delay = Math.random() * config.fadeDuration;
                particles.push(new Particle(this.x, this.y, this.color, 2, dx, dy, delay));
            }
        }
    }
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const color = `${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}`;
    explosions.push(new Firework(x, y, color));
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < fireworkChance) {
        createFirework();
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].draw();
        explosions[i].update();

        if (explosions[i].isExploded) {
            explosions.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        particles[i].update();

        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

animate();