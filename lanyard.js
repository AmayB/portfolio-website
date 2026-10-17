import * as THREE from 'three';

const container = document.getElementById('lanyard');
if (container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 9.6);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    container.setAttribute('data-webgl-fallback', 'true');
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'lanyard-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.append(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-3, 5, 6);
    scene.add(keyLight);

    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 800;
    cardCanvas.height = 800;
    const cardContext = cardCanvas.getContext('2d');
    const abImage = new Image();
    abImage.src = '/assets/ab-card.png';
    cardContext.fillStyle = '#f6f6f6';
    cardContext.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
    abImage.onload = () => {
      cardContext.drawImage(abImage, 0, 0, cardCanvas.width, cardCanvas.height);
      cardTexture.needsUpdate = true;
    };

    const cardTexture = new THREE.CanvasTexture(cardCanvas);
    cardTexture.colorSpace = THREE.SRGBColorSpace;
    const card = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 2.65, 0.09),
      new THREE.MeshStandardMaterial({ color: '#f6f6f6', roughness: 0.34, metalness: 0.04 })
    );
    card.position.set(0, -0.95, 0);
    scene.add(card);
    const imageFace = new THREE.Mesh(
      new THREE.PlaneGeometry(2.64, 2.64),
      new THREE.MeshBasicMaterial({ map: cardTexture, side: THREE.DoubleSide, toneMapped: false })
    );
    imageFace.position.set(0, 0, 0.08);
    card.add(imageFace);
    const imageOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.64, 2.64)),
      new THREE.LineBasicMaterial({ color: '#343434', transparent: true, opacity: 0.9, depthTest: false })
    );
    imageOutline.position.z = 0.085;
    imageOutline.renderOrder = 2;
    card.add(imageOutline);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.025, 16, 40),
      new THREE.MeshStandardMaterial({ color: '#c5c7ca', metalness: 0.95, roughness: 0.18 })
    );
    ring.position.set(0, 0.58, 0);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    const connector = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.28, 0.12),
      new THREE.MeshStandardMaterial({ color: '#8d9096', metalness: 0.9, roughness: 0.2 })
    );
    connector.position.set(0, 0.45, 0);
    scene.add(connector);

    const strapMaterial = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.78, metalness: 0.05 });
    let strap = null;
    const strapPoints = (time, dropOffset, cardX) => [
      new THREE.Vector3(0, 3.5, -0.1),
      new THREE.Vector3(Math.sin(time * 0.85) * 0.22, 2.5 + dropOffset * 0.18, 0),
      new THREE.Vector3(Math.sin(time * 0.85 + 0.7) * 0.34, 1.55 + dropOffset * 0.5, 0.05),
      new THREE.Vector3(cardX, 0.58 + dropOffset, 0.02)
    ];

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const startedAt = performance.now();
    let animationFrame = 0;
    const animate = () => {
      const time = (performance.now() - startedAt) / 1000;
      const dropProgress = Math.min(1, time / 1.9);
      const dropEase = 1 - Math.pow(1 - dropProgress, 3);
      const dropOffset = (1 - dropEase) * 3.4;
      const cardX = Math.sin(time * 0.85 + 0.5) * 0.34;
      const points = strapPoints(time, dropOffset, cardX);
      const curve = new THREE.CatmullRomCurve3(points);
      if (strap) {
        scene.remove(strap);
        strap.geometry.dispose();
      }
      strap = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.085, 8, false), strapMaterial);
      scene.add(strap);
      card.rotation.x = Math.sin(time * 1.1) * 0.055;
      card.rotation.y = Math.sin(time * 0.8 + 0.5) * 0.16;
      card.rotation.z = Math.sin(time * 0.9) * 0.035;
      card.position.x = cardX;
      card.position.y = -0.95 + dropOffset;
      ring.position.x = card.position.x;
      ring.position.y = 0.58 + dropOffset;
      ring.rotation.z = card.rotation.y;
      connector.position.x = card.position.x;
      connector.position.y = 0.45 + dropOffset;
      connector.rotation.z = card.rotation.y;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      card.geometry.dispose();
      card.material.dispose();
      imageFace.geometry.dispose();
      imageFace.material.dispose();
      imageOutline.geometry.dispose();
      imageOutline.material.dispose();
      cardTexture.dispose();
      strapMaterial.dispose();
      connector.geometry.dispose();
      connector.material.dispose();
      if (strap) strap.geometry.dispose();
      renderer.dispose();
    }, { once: true });
  }
}
