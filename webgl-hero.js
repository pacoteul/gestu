import * as THREE from 'three';

// Only run this logic if we are on a page that has the webgl-hero canvas
const canvas = document.getElementById('webgl-hero');
const homeView = document.getElementById('view-home');

if (canvas && homeView) {
    const scene = new THREE.Scene();
    // Use a dark background to match the aesthetic
    scene.background = new THREE.Color('#050505');

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Mouse tracking for interactivity
    let mouse = new THREE.Vector2(0, 0);
    let targetMouse = new THREE.Vector2(0, 0);
    let isMouseActive = false;
    let mouseTimeout;
    
    window.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        isMouseActive = true;
        clearTimeout(mouseTimeout);
        // Wait 1.5s of total inactivity before reforming the structure
        mouseTimeout = setTimeout(() => {
            isMouseActive = false;
        }, 1500);
    });

    // --- GROUP 1 : NUAGE DE POINTS (Chaos vers Architecture) ---
    const group1 = new THREE.Group();
    scene.add(group1);

    const particlesCount = 8000;
    const posArray = new Float32Array(particlesCount * 3);
    const targetPositions = new Float32Array(particlesCount * 3);
    const randomPositions = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount; i++) {
        // --- 1. RANDOM STATE (Floating Cylinder) ---
        randomPositions[i * 3 + 0] = (Math.random() - 0.5) * 8; 
        randomPositions[i * 3 + 1] = (Math.random() - 0.5) * 12; 
        randomPositions[i * 3 + 2] = (Math.random() - 0.5) * 4; 
        
        // --- 2. ARCHITECTURAL STATE (Parametric Twisting Tower) ---
        const progress = i / particlesCount; 
        const y = progress * 20 - 10; 
        const radius = 3 + Math.sin(progress * Math.PI * 4) * 0.5; 
        const angle = y * 0.4 + (i % 4) * (Math.PI / 2); 
        
        targetPositions[i * 3 + 0] = Math.cos(angle) * radius;
        targetPositions[i * 3 + 1] = y;
        targetPositions[i * 3 + 2] = Math.sin(angle) * radius;
        
        // Start in random state
        posArray[i * 3 + 0] = randomPositions[i * 3 + 0];
        posArray[i * 3 + 1] = randomPositions[i * 3 + 1];
        posArray[i * 3 + 2] = randomPositions[i * 3 + 2];
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        color: 0xb88645, 
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    group1.add(particlesMesh);
    
    let morphLerp = 0;

    // --- GROUP 2 : GÉOMÉTRIE INFINIE (Option B) ---
    const group2 = new THREE.Group();
    scene.add(group2);
    group2.visible = false; // Hidden initially

    const cubesGroup = new THREE.Group();
    const cubeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x555555, 
        roughness: 0.1,  
        metalness: 0.9,  
        transparent: true,
        opacity: 0
    });
    
    for(let i = 0; i < 30; i++) {
        const width = Math.random() * 2 + 0.5;
        const height = Math.random() * 10 + 2;
        const depth = Math.random() * 2 + 0.5;
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geo, cubeMaterial);
        mesh.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10 - 2,
            (Math.random() - 0.5) * 15 - 5
        );
        mesh.rotation.x = 0.2;
        cubesGroup.add(mesh);
    }
    group2.add(cubesGroup);

    const dirLight = new THREE.DirectionalLight(0xb88645, 8); 
    dirLight.position.set(2, 2, 5);
    group2.add(dirLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
    group2.add(ambientLight);

    // --- GROUP 3 : VOILE PARAMÉTRIQUE (Option C) ---
    const group3 = new THREE.Group();
    scene.add(group3);
    group3.visible = false;

    const planeGeo = new THREE.PlaneGeometry(25, 25, 40, 40);
    const planeMat = new THREE.MeshBasicMaterial({
        color: 0xb88645,
        wireframe: true,
        transparent: true,
        opacity: 0
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI / 2 + 0.3; 
    planeMesh.position.y = -2;
    group3.add(planeMesh);
    
    const initialPositions = planeGeo.attributes.position.array.slice();

    // --- SCROLL LOGIC ---
    let currentScroll = 0;
    const texts = document.querySelectorAll('.hero-text-content');
    const scrollIcon = document.querySelector('.scroll-down-fixed');

    homeView.addEventListener('scroll', () => {
        currentScroll = homeView.scrollTop;
        if (currentScroll + homeView.clientHeight >= homeView.scrollHeight - 50) {
            if (scrollIcon) scrollIcon.classList.add('at-end');
        } else {
            if (scrollIcon) scrollIcon.classList.remove('at-end');
        }
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();
        const wh = window.innerHeight;
        
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        const sectionHeight = wh * 3; 
        texts.forEach((text, index) => {
            const sectionStart = index * sectionHeight;
            const localScroll = currentScroll - sectionStart;
            if (localScroll > -wh * 0.5 && localScroll < sectionHeight - wh * 0.5) {
                text.classList.add('visible');
            } else {
                text.classList.remove('visible');
            }
        });
        
        // --- Group 1 (Points) : Section 1 ---
        if (currentScroll < sectionHeight * 1.1) {
            group1.visible = true;
            let p = currentScroll / sectionHeight; 
            let op = 1;
            if (p > 0.8) op = 1 - ((p - 0.8) / 0.2);
            particlesMaterial.opacity = Math.max(0, op * 0.8);
            
            // --- EXTREMELY SMOOTH MORPH ANIMATION ---
            const targetLerp = isMouseActive ? 0.0 : 1.0; 
            morphLerp += (targetLerp - morphLerp) * 0.01; 
            
            const positions = particlesGeometry.attributes.position.array;
            for(let i = 0; i < particlesCount; i++) {
                const delayOffset = (i % 100) / 100; 
                let individualLerp = Math.max(0, Math.min(1, morphLerp * 1.5 - delayOffset * 0.5));
                individualLerp = individualLerp < 0.5 ? 4 * individualLerp * individualLerp * individualLerp : 1 - Math.pow(-2 * individualLerp + 2, 3) / 2;

                const floatX = randomPositions[i*3+0] + Math.sin(elapsedTime * 0.3 + i) * 0.5;
                const floatY = randomPositions[i*3+1] + Math.cos(elapsedTime * 0.4 + i) * 0.5;
                const floatZ = randomPositions[i*3+2] + Math.sin(elapsedTime * 0.5 + i) * 0.5;
                
                positions[i*3+0] = floatX + (targetPositions[i*3+0] - floatX) * individualLerp;
                positions[i*3+1] = floatY + (targetPositions[i*3+1] - floatY) * individualLerp;
                positions[i*3+2] = floatZ + (targetPositions[i*3+2] - floatZ) * individualLerp;
            }
            particlesGeometry.attributes.position.needsUpdate = true;
            
            // Slow, majestic rotation
            particlesMesh.rotation.y = elapsedTime * 0.05 + mouse.x * 0.15;
            particlesMesh.rotation.x = mouse.y * 0.15;
            
            // Gently follow mouse when active
            let targetPosX = 0;
            let targetPosY = 0;
            if (isMouseActive) {
                targetPosX = mouse.x * 2;
                targetPosY = mouse.y * 2;
            }
            particlesMesh.position.x += (targetPosX - particlesMesh.position.x) * 0.02;
            particlesMesh.position.y += (targetPosY - particlesMesh.position.y) * 0.02;
        } else {
            group1.visible = false;
        }

        // --- Group 2 (Blocks) : Section 2 ---
        // Expanded active range to start earlier and end later
        if (currentScroll > sectionHeight * 0.5 && currentScroll < sectionHeight * 2.2) {
            group2.visible = true;
            let localScroll = currentScroll - sectionHeight;
            let p = localScroll / sectionHeight; // -0.5 to 1.2
            
            // Fade in and out
            let op = 1;
            if (currentScroll < sectionHeight * 0.9) { 
                // Fade in earlier (0.6 to 0.9)
                op = (currentScroll - sectionHeight * 0.6) / (sectionHeight * 0.3);
            } else if (currentScroll > sectionHeight * 1.9) { 
                // Fade out (1.9 to 2.1)
                op = 1 - ((currentScroll - sectionHeight * 1.9) / (sectionHeight * 0.2));
            }
            
            cubeMaterial.opacity = Math.max(0, op);
            
            // Animation
            cubesGroup.rotation.y = mouse.x * 0.3;
            // Subtle parallax
            cubesGroup.position.y = -p * 3; 
            
            // Move light with mouse
            dirLight.position.x = mouse.x * 10;
            dirLight.position.y = mouse.y * 10 + 5;
        } else {
            group2.visible = false;
        }

        // --- Group 3 (Parametric Wireframe) : Section 3 ---
        if (currentScroll > sectionHeight * 1.8) {
            group3.visible = true;
            let localScroll = currentScroll - sectionHeight * 2;
            let p = localScroll / sectionHeight; 
            
            let op = 1;
            if (currentScroll < sectionHeight * 2.1) { 
                // Fade in (1.9 to 2.1) to perfectly overlap Group 2's fade out
                op = (currentScroll - sectionHeight * 1.9) / (sectionHeight * 0.2);
            }
            planeMat.opacity = Math.max(0, op * 0.8);
            
            // Animation
            const positions = planeGeo.attributes.position.array;
            for(let i = 0; i < positions.length; i += 3) {
                const ix = initialPositions[i];
                const iy = initialPositions[i+1];
                
                // Create waves that react to time and mouse
                const wave1 = Math.sin(ix * 0.3 + elapsedTime) * 0.5;
                const wave2 = Math.cos(iy * 0.3 + elapsedTime * 0.8) * 0.5;
                const mouseDist = Math.max(0, 1 - (Math.abs(ix - mouse.x * 10) * 0.1 + Math.abs(iy - mouse.y * 10) * 0.1));
                const interaction = mouseDist * 2.0 * Math.sin(elapsedTime * 2);
                
                positions[i+2] = wave1 + wave2 + interaction;
            }
            planeGeo.attributes.position.needsUpdate = true;
            
            planeMesh.rotation.z = mouse.x * 0.2;
            // Move from -5 to 0
            planeMesh.position.z = (1 - p) * -5; 
        } else {
            group3.visible = false;
        }

        // Render
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }

    tick();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
