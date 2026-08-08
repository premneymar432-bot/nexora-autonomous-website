/* =========================================================
   NEXORA — THREE.JS SCENE SETUP
   Hero: floating wireframe "Core" + particle field + glow lights
   About: secondary rotating Core fragment
========================================================= */

(function(){

  const isMobile = window.innerWidth < 680;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Shared helpers
  --------------------------------------------------------- */
  function makeGlowSprite(color, size){
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64,64,0,64,64,64);
    grad.addColorStop(0, color + 'ff');
    grad.addColorStop(0.4, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,128,128);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent:true, depthWrite:false, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size,size,1);
    return sprite;
  }

  /* ===========================================================
     HERO SCENE
  =========================================================== */
  const heroCanvas = document.getElementById('webgl-hero');
  let heroScene, heroCamera, heroRenderer, core, wireGroup, particles, glowA, glowB;
  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  let scrollProgress = 0;

  function initHero(){
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.FogExp2(0x050816, 0.045);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 0, 9);

    heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias:true, alpha:true });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setClearColor(0x000000, 0);

    /* -------- The Core: layered wireframe geometry -------- */
    wireGroup = new THREE.Group();

    const icoGeo = new THREE.IcosahedronGeometry(2.1, isMobile ? 1 : 2);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x7C3AED, wireframe:true, transparent:true, opacity:.85 });
    core = new THREE.Mesh(icoGeo, icoMat);
    wireGroup.add(core);

    const innerGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe:true, transparent:true, opacity:.55 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    wireGroup.add(innerMesh);

    const ringGeo = new THREE.TorusGeometry(3.1, 0.008, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x14F195, transparent:true, opacity:.5 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI/2.3;
    const ring2 = ring1.clone();
    ring2.rotation.x = -Math.PI/2.6;
    ring2.rotation.y = Math.PI/4;
    wireGroup.add(ring1, ring2);

    heroScene.add(wireGroup);

    /* -------- Glow sprites (faux bloom, cheap on GPU) -------- */
    glowA = makeGlowSprite('#7C3AED', 7);
    glowB = makeGlowSprite('#38BDF8', 5);
    glowA.position.set(0,0,-0.5);
    glowB.position.set(0,0,0.3);
    heroScene.add(glowA, glowB);

    /* -------- Particle field -------- */
    const particleCount = isMobile ? 420 : 1100;
    const posArr = new Float32Array(particleCount*3);
    for(let i=0;i<particleCount;i++){
      const r = 6 + Math.random()*10;
      const theta = Math.random()*Math.PI*2;
      const phi = Math.acos((Math.random()*2)-1);
      posArr[i*3]   = r*Math.sin(phi)*Math.cos(theta);
      posArr[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
      posArr[i*3+2] = r*Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32; pCanvas.height = 32;
    const pctx = pCanvas.getContext('2d');
    const pg = pctx.createRadialGradient(16,16,0,16,16,16);
    pg.addColorStop(0,'#ffffff'); pg.addColorStop(1,'#ffffff00');
    pctx.fillStyle = pg; pctx.fillRect(0,0,32,32);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      map: pTex,
      transparent:true,
      opacity:.55,
      color: 0xbfe4ff,
      blending: THREE.AdditiveBlending,
      depthWrite:false
    });
    particles = new THREE.Points(particleGeo, particleMat);
    heroScene.add(particles);

    /* -------- Lights (kept minimal since materials are basic/wireframe) -------- */
    const ambient = new THREE.AmbientLight(0xffffff, .4);
    const point1 = new THREE.PointLight(0x7C3AED, 6, 20);
    point1.position.set(4,3,4);
    const point2 = new THREE.PointLight(0x38BDF8, 6, 20);
    point2.position.set(-4,-2,3);
    heroScene.add(ambient, point1, point2);

    animateHero();
  }

  function animateHero(){
    requestAnimationFrame(animateHero);
    const t = performance.now()*0.0001;

    if(!reducedMotion){
      wireGroup.rotation.y = t*4 + targetRotY;
      wireGroup.rotation.x = Math.sin(t*2)*0.15 + targetRotX;
      particles.rotation.y = t*1.4;
      particles.rotation.x = t*0.6;
      glowA.material.rotation += 0.0008;
    }

    // mouse parallax (smoothed)
    targetRotY += (mouseX*0.6 - targetRotY)*0.04;
    targetRotX += (mouseY*0.4 - targetRotX)*0.04;

    // scroll-driven camera dolly + tilt
    heroCamera.position.z = 9 - scrollProgress*3.2;
    heroCamera.position.y = scrollProgress*-1.2;
    heroCamera.rotation.z = scrollProgress*0.08;
    wireGroup.scale.setScalar(1 + scrollProgress*0.25);

    heroRenderer.render(heroScene, heroCamera);
  }

  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX/window.innerWidth - 0.5)*2;
    mouseY = (e.clientY/window.innerHeight - 0.5)*2;
  });

  window.addEventListener('resize', debounce(()=>{
    if(!heroRenderer) return;
    heroCamera.aspect = window.innerWidth/window.innerHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
  }, 150));

  /* expose a setter for scroll progress, called from script.js via ScrollTrigger */
  window.__setHeroScroll = (p)=>{ scrollProgress = p; };

  /* ===========================================================
     ABOUT SCENE — small rotating Core fragment
  =========================================================== */
  function initAbout(){
    const canvas = document.getElementById('webgl-about');
    if(!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    camera.position.set(0,0,5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize(){
      const size = canvas.parentElement.clientWidth;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', debounce(resize, 150));

    const geo = new THREE.IcosahedronGeometry(1.6, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe:true, transparent:true, opacity:.8 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const innerGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x7C3AED, wireframe:true, transparent:true, opacity:.7 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    let hoverRotY = 0, hoverRotX = 0;
    canvas.parentElement.addEventListener('mousemove', (e)=>{
      const rect = canvas.parentElement.getBoundingClientRect();
      hoverRotY = ((e.clientX-rect.left)/rect.width - 0.5)*1.2;
      hoverRotX = ((e.clientY-rect.top)/rect.height - 0.5)*1.2;
    });

    function loop(){
      requestAnimationFrame(loop);
      if(!reducedMotion){
        mesh.rotation.y += 0.004;
        mesh.rotation.x += 0.0016;
        innerMesh.rotation.y -= 0.006;
        innerMesh.rotation.x += 0.003;
      }
      mesh.rotation.y += (hoverRotY - mesh.rotation.y)*0.01;
      renderer.render(scene, camera);
    }
    loop();
  }

  function debounce(fn, wait){
    let tid;
    return function(...args){
      clearTimeout(tid);
      tid = setTimeout(()=>fn.apply(this,args), wait);
    };
  }

  /* init once DOM ready */
  document.addEventListener('DOMContentLoaded', ()=>{
    initHero();
    initAbout();
  });

})();
