/**
 * Interactive Starry Sky Engine for Dark Mode Login.
 */

const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
let shootingStars = [];
const STAR_COUNT = 150; // Total count of stars on background
const SHOOTING_STAR_INTERVAL = 3000; // Average spawn gap in milliseconds

// Cursor visual interactiveness
const mouse = { x: null, y: null, radius: 100 };

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Auto-adjust size of viewport on resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

window.addEventListener('resize', resizeCanvas);

// Star constructor
class Star {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5; // Multi-size star field depth
        
        // Random star glow variables
        this.alpha = initial ? Math.random() : 0;
        this.fadeSpeed = Math.random() * 0.01 + 0.003;
        this.isGlowing = Math.random() > 0.5;
        
        this.vx = (Math.random() - 0.5) * 0.04; // Drift speed in X
        this.vy = (Math.random() - 0.5) * 0.04; // Drift speed in Y
    }

    update() {
        // Celestial drift
        this.x += this.vx;
        this.y += this.vy;

        // Dynamic star twinkling glow loop
        if (this.isGlowing) {
            this.alpha += this.fadeSpeed;
            if (this.alpha >= 1) this.isGlowing = false;
        } else {
            this.alpha -= this.fadeSpeed;
            if (this.alpha <= 0.1) this.isGlowing = true;
        }

        // Relocates if out of canvas viewport
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset(false);
        }

        // Subtly react to the cursor
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.hypot(dx, dy);
            if (distance < mouse.radius) {
                // Interactive star motion deflection based on drag proximity
                const force = (mouse.radius - distance) / mouse.radius;
                this.x += (dx / distance) * force * 1.2;
                this.y += (dy / distance) * force * 1.2;
            }
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Shooting Star constructor
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * (canvas.width * 0.6);
        this.y = Math.random() * (canvas.height * 0.4);
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 12 + 6;
        this.angle = Math.PI / 4; // Drifting diagonal angle (45 degrees)
        this.alpha = 1;
        this.fadeSpeed = Math.random() * 0.03 + 0.01;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.alpha -= this.fadeSpeed;
    }

    draw() {
        if (this.alpha <= 0) return;
        
        // Draws linear meteor tail trail fade
        ctx.strokeStyle = `rgba(139, 92, 246, ${this.alpha})`; // Galactic gradient colors matching borders
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.angle) * this.length,
            this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }
}

// Spawn new Shooting Star sporadically
function triggerShootingStar() {
    if (shootingStars.length < 2) { // Limit concurrent count to avoid crowded skies
        shootingStars.push(new ShootingStar());
    }
    const nextSpawn = Math.random() * SHOOTING_STAR_INTERVAL + 2000;
    setTimeout(triggerShootingStar, nextSpawn);
}

// Core drawing engine tick loop
function animate() {
    // Slight frame overlay fade to blur stars nicely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background star fields
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Draw shooting star meteor trails
    shootingStars.forEach((sStar, index) => {
        sStar.update();
        sStar.draw();
        if (sStar.alpha <= 0) {
            shootingStars.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

// Kickstart animation lifecycle
resizeCanvas();
setTimeout(triggerShootingStar, 1500);
animate();