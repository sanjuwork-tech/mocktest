import * as THREE from "three";

// No assets, tracking, continuous idle loop or content rendered inside the canvas.
export function mountPathwayScene(host: HTMLDivElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  host.appendChild(renderer.domElement);
  host.dataset.ready = "true";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.z = 5;
  const group = new THREE.Group();
  scene.add(group);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  [0x1f5eff, 0x071a4d, 0x719f17].forEach((color, i) => {
    const geometry = new THREE.TorusGeometry(1, 0.013, 6, 72);
    const material = new THREE.MeshBasicMaterial({ color });
    geometries.push(geometry);
    materials.push(material);
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.set(0.65 + i * 0.7, i * 0.8, i * 0.65);
    group.add(ring);
  });
  const geometry = new THREE.SphereGeometry(0.16, 16, 12);
  const material = new THREE.MeshBasicMaterial({ color: 0xb8ff34 });
  geometries.push(geometry);
  materials.push(material);
  group.add(new THREE.Mesh(geometry, material));
  let frame = 0;
  let remaining = 0;
  let visible = true;
  let lost = false;
  let targetX = 0.15;
  let targetY = -0.25;
  group.rotation.set(-0.1, -0.5, 0);
  const draw = () => {
    frame = 0;
    if (!visible || document.hidden || lost) return;
    group.rotation.x += (targetX - group.rotation.x) * 0.1;
    group.rotation.y += (targetY - group.rotation.y) * 0.1;
    renderer.render(scene, camera);
    if (--remaining > 0) frame = requestAnimationFrame(draw);
  };
  const request = () => {
    remaining = 36;
    if (!frame && visible && !document.hidden && !lost)
      frame = requestAnimationFrame(draw);
  };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    request();
  });
  resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) request();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  intersection.observe(host);
  const board = host.parentElement!;
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const bounds = board.getBoundingClientRect();
    targetX = ((event.clientY - bounds.top) / bounds.height) * 0.45 - 0.15;
    targetY = ((event.clientX - bounds.left) / bounds.width) * 0.65 - 0.45;
    request();
  };
  const leave = () => {
    targetX = 0.15;
    targetY = -0.25;
    request();
  };
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else request();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    delete host.dataset.ready;
    renderer.domElement.style.display = "none";
  };
  board.addEventListener("pointermove", move, { passive: true });
  board.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  request();
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    board.removeEventListener("pointermove", move);
    board.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    geometries.forEach((value) => value.dispose());
    materials.forEach((value) => value.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    delete host.dataset.ready;
  };
}
