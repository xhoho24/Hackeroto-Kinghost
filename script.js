document.addEventListener('DOMContentLoaded', () => {
    initCatGalaxy();
    typeWriterEffect();
    initScrollObserver();
});

/* Cat Galaxy 3D System */
function initCatGalaxy() {
    const scene = new THREE.Scene();
    // Fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.0005);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 800;
    camera.position.y = 200;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('particles'),
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Load Texture
    const textureLoader = new THREE.TextureLoader();
    const catTexture = textureLoader.load('assets/cat_planet.jpg');

    // Data for Planets
    const planetsData = [
        { name: "Udyat", url: "https://t.me/udyatt_bot", color: 0xbc13fe, distance: 250, speed: 0.005, size: 60 },
        { name: "JLYsearch", url: "https://t.me/JLySearch_bot", color: 0x00f3ff, distance: 350, speed: 0.003, size: 55 },
        { name: "SRT Translate", url: "https://t.me/Jly_subtitle_traslate_bot", color: 0x00ff00, distance: 450, speed: 0.002, size: 50 },
        { name: "SearchEbook", url: "#", color: 0xffff00, distance: 530, speed: 0.004, size: 45 },
        { name: "Compresor", url: "#", color: 0xff0000, distance: 600, speed: 0.0025, size: 45 },
        { name: "JLY IA", url: "#", color: 0x00ffff, distance: 680, speed: 0.0015, size: 50 },
        { name: "JLYlecch", url: "#", color: 0xff00ff, distance: 750, speed: 0.001, size: 55 }
    ];

    const planets = [];
    const labels = [];
    const labelsContainer = document.getElementById('labels-container');

    // Create Sun (Orange Cat)
    const sunMaterial = new THREE.SpriteMaterial({
        map: catTexture,
        color: 0xffaa00
    });
    const sun = new THREE.Sprite(sunMaterial);
    sun.scale.set(200, 200, 1);
    scene.add(sun);

    // Create Planets
    planetsData.forEach(data => {
        const material = new THREE.SpriteMaterial({
            map: catTexture,
            color: data.color
        });
        const planet = new THREE.Sprite(material);
        planet.scale.set(data.size, data.size, 1);

        // Random starting angle
        planet.userData = {
            angle: Math.random() * Math.PI * 2,
            distance: data.distance,
            speed: data.speed,
            url: data.url,
            name: data.name
        };

        scene.add(planet);
        planets.push(planet);

        // Create Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'planet-label';
        labelDiv.textContent = data.name;
        labelsContainer.appendChild(labelDiv);
        labels.push({ div: labelDiv, obj: planet });
    });

    // Create Stars Background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: true, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Mouse Tracking Variables
    let targetCameraX = 0;
    let targetCameraY = 200;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Orbit Logic
        planets.forEach(planet => {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        });

        // Sun Rotation (Subtle)
        sun.material.rotation += 0.001;

        // Update Labels Position
        labels.forEach(item => {
            const vector = item.obj.position.clone();
            vector.project(camera);

            const x = (vector.x * .5 + .5) * window.innerWidth;
            const y = (-(vector.y * .5) + .5) * window.innerHeight;

            // Only show if in front of camera
            if (vector.z < 1) {
                item.div.style.display = 'block';
                item.div.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + 40}px)`; // Offset below planet
            } else {
                item.div.style.display = 'none';
            }
        });

        // Smooth Camera Movement
        camera.position.x += (targetCameraX - camera.position.x) * 0.05;
        camera.position.y += (targetCameraY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Interaction Handlers
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mousemove', (e) => {
        // Update mouse vector for raycasting
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Camera movement target
        targetCameraX = mouse.x * 200;
        targetCameraY = 200 + (mouse.y * 100);
    });

    document.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);

        if (intersects.length > 0) {
            const url = intersects[0].object.userData.url;
            if (url && url !== '#') {
                window.open(url, '_blank');
            }
        }
    });
}

/* Typewriter Effect */
function typeWriterEffect() {
    const text = "WELCOME TO THE CAT GALAXY";
    const element = document.getElementById('typing-text');
    let i = 0;

    if (!element) return;

    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }

    type();
}

/* Scroll Observer */
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.project-card, .stack-item, .about-grid').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
