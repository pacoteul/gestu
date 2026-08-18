// -------------------------------------------------------------
// GËSTÜ RECHERCHE - LIGNES ARCHITECTURALES SUR TOUTE LA PAGE
// Animation plein écran active uniquement sur #view-recherche
// -------------------------------------------------------------

let canvas = null;
let ctx = null;
let viewEl = null;
let animFrameId = null;
let isRunning = false;

let width = 0;
let height = 0;
let dpr = 1;

// Mouse tracking in viewport
let mouse = { x: -1000, y: -1000 };
let prevMouse = { x: -1000, y: -1000 };
let mouseSpeed = 0;
let targetActivity = 0;
let activity = 0;
let mouseTimeout = null;

// Trail points for fluid curve
const trail = [];
const maxTrailLength = 22;

// Floating architectural nodes distributed across viewport
const nodesCount = 45;
const nodes = [];

function isLightMode() {
    return document.documentElement.classList.contains('light-mode');
}

function getGoldColor(alpha, isLight) {
    if (isLight) {
        return `rgba(154, 108, 53, ${alpha})`;
    }
    return `rgba(216, 168, 106, ${alpha})`;
}

function getBrightGoldColor(alpha, isLight) {
    if (isLight) {
        return `rgba(175, 125, 65, ${alpha})`;
    }
    return `rgba(245, 215, 160, ${alpha})`;
}

function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < nodesCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            size: Math.random() * 1.5 + 1.0,
            pulse: Math.random() * Math.PI * 2
        });
    }
}

function resizeCanvas() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (ctx) {
        ctx.scale(dpr, dpr);
    }
    initNodes();
}

function handlePointerMove(clientX, clientY) {
    if (!isRunning || !viewEl) return;
    if (!viewEl.classList.contains('active') && viewEl.style.display === 'none') return;

    const dx = clientX - prevMouse.x;
    const dy = clientY - prevMouse.y;
    mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 40);

    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;
    mouse.x = clientX;
    mouse.y = clientY;

    targetActivity = 1.0;

    trail.push({ x: clientX, y: clientY, alpha: 1.0 });
    if (trail.length > maxTrailLength) {
        trail.shift();
    }

    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
        targetActivity = 0.0;
    }, 1200);
}

export function initRechercheWebGL() {
    canvas = document.getElementById('webgl-recherche');
    viewEl = document.getElementById('view-recherche');
    if (!canvas || !viewEl) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Mouse tracking on whole window / view
    window.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    document.addEventListener('mouseleave', () => {
        targetActivity = 0.0;
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Touch tracking for mobile
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('resize', resizeCanvas);

    // If currently on #recherche, start loop
    if (window.location.hash === '#recherche' || (viewEl && viewEl.classList.contains('active'))) {
        startRechercheLoop();
    }
}

function render() {
    if (!isRunning || !ctx) return;

    // Smooth activity transition
    activity += (targetActivity - activity) * 0.08;

    // Clear frame completely
    ctx.clearRect(0, 0, width, height);

    const light = isLightMode();

    // Update floating nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.pulse += 0.02;
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around viewport edges
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;
    }

    // Render interactive lines ONLY when there is activity
    if (activity > 0.01) {

        // 1. ARCHITECTURAL CROSSHAIR ALIGNMENT AXES (1PX GOLD)
        if (mouse.x > 0 && mouse.x < width && mouse.y > 0 && mouse.y < height) {
            const rayAlpha = Math.min(activity * 0.35, 0.35);
            ctx.lineWidth = 0.75;

            // Horizontal line across entire viewport
            ctx.strokeStyle = getGoldColor(rayAlpha, light);
            ctx.beginPath();
            ctx.moveTo(0, mouse.y);
            ctx.lineTo(width, mouse.y);
            ctx.stroke();

            // Vertical line across entire viewport
            ctx.beginPath();
            ctx.moveTo(mouse.x, 0);
            ctx.lineTo(mouse.x, height);
            ctx.stroke();

            // Subtle center crosshair tick
            const tick = 8;
            ctx.strokeStyle = getBrightGoldColor(rayAlpha * 1.6, light);
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(mouse.x - tick, mouse.y);
            ctx.lineTo(mouse.x + tick, mouse.y);
            ctx.moveTo(mouse.x, mouse.y - tick);
            ctx.lineTo(mouse.x, mouse.y + tick);
            ctx.stroke();
        }

        // 2. VECTOR TRIANGULATION CONNECTORS
        const connectDist = 170;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectDist) {
                const proximity = 1 - (dist / connectDist);
                const lineAlpha = proximity * activity * 0.65;

                ctx.strokeStyle = getGoldColor(lineAlpha, light);
                ctx.lineWidth = 0.8 + proximity * 0.5;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(node.x, node.y);
                ctx.stroke();

                // Inter-node connections
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dxx = node.x - nodeB.x;
                    const dyy = node.y - nodeB.y;
                    const dNode = Math.sqrt(dxx * dxx + dyy * dyy);

                    if (dNode < 110) {
                        const interAlpha = (1 - dNode / 110) * proximity * activity * 0.4;
                        ctx.strokeStyle = getGoldColor(interAlpha, light);
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();
                    }
                }

                // Glowing node anchor point
                ctx.fillStyle = getBrightGoldColor(lineAlpha * 1.3, light);
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 3. FLUID TRAILING SPLINE
        if (trail.length > 2) {
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);

            for (let i = 1; i < trail.length - 1; i++) {
                const xc = (trail[i].x + trail[i + 1].x) / 2;
                const yc = (trail[i].y + trail[i + 1].y) / 2;
                ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
            }

            const trailAlpha = activity * 0.5;
            ctx.strokeStyle = getBrightGoldColor(trailAlpha, light);
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    // Decay trail
    for (let i = 0; i < trail.length; i++) {
        trail[i].alpha *= 0.9;
    }
    if (trail.length > 0 && trail[0].alpha < 0.05) {
        trail.shift();
    }

    animFrameId = window.requestAnimationFrame(render);
}

export function startRechercheLoop() {
    if (isRunning) return;
    isRunning = true;
    if (canvas) {
        canvas.style.display = 'block';
    }
    resizeCanvas();
    render();
}

export function stopRechercheLoop() {
    isRunning = false;
    if (canvas) {
        canvas.style.display = 'none';
    }
    if (animFrameId) {
        window.cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    if (ctx) {
        ctx.clearRect(0, 0, width, height);
    }
}

window.initRechercheWebGL = initRechercheWebGL;
window.startRechercheLoop = startRechercheLoop;
window.stopRechercheLoop = stopRechercheLoop;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initRechercheWebGL();
    });
} else {
    initRechercheWebGL();
}
