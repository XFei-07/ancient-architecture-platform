import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const modelPaths = {
  qiaoliang: "/models/untitled.glb",
  siheyuan: "/models/siheyuan.glb",
  guanshu: "/models/chinese_hall.glb",
  pailou: "/models/chinese_archway_01.glb",
  pingyao: "/models/pingyao_city_walls_-_china.glb",
  lingyuan: "/models/ancient_chinese_courtyard_park.glb",
};

const compactDevice =
  window.matchMedia("(max-width: 768px)").matches ||
  window.matchMedia("(pointer: coarse)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const container = document.getElementById("canvas-container");
const loadingBar = document.getElementById("loading-bar");
const loadingPercent = document.getElementById("loading-percent");
const loadingOverlay = document.getElementById("loading-overlay");
const retryButton = document.getElementById("loading-retry");

let currentModel = null;
let currentKey = compactDevice ? "guanshu" : "qiaoliang";
let requestId = 0;
let lastFrame = 0;

const setLoading = (text, percent = 0) => {
  loadingOverlay.style.display = "flex";
  loadingOverlay.classList.remove("fade-out");
  loadingBar.style.width = `${percent}%`;
  loadingPercent.textContent = text;
  retryButton.hidden = true;
};

const setError = (message) => {
  loadingBar.style.width = "100%";
  loadingPercent.textContent = message;
  retryButton.hidden = false;
};

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: !compactDevice,
    alpha: false,
    powerPreference: "high-performance",
  });
} catch (error) {
  console.error("WebGL initialization failed:", error);
  setError("当前浏览器无法启动 WebGL，请开启硬件加速后重试");
  throw error;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1410);
scene.fog = new THREE.FogExp2(0x1a1410, 0.002);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(80, 60, 80);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1 : 1.5));
renderer.shadowMap.enabled = !compactDevice;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = !compactDevice && !reducedMotion;
controls.autoRotateSpeed = 0.8;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 10;
controls.maxDistance = 300;

scene.add(new THREE.AmbientLight(0xe8d5b5, compactDevice ? 0.85 : 0.6));

const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
dirLight.position.set(50, 80, 50);
dirLight.castShadow = !compactDevice;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 500;
dirLight.shadow.camera.left = -100;
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.top = 100;
dirLight.shadow.camera.bottom = -100;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xc9a96e, 0.4);
fillLight.position.set(-30, 40, -30);
scene.add(fillLight);
scene.add(new THREE.HemisphereLight(0xf0d89d, 0x1a1410, 0.3));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600),
  new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.95, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = !compactDevice;
scene.add(ground);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setWorkerLimit(compactDevice ? 2 : 4);
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const disposeMaterial = (material) => {
  Object.values(material).forEach((value) => {
    if (value?.isTexture) value.dispose();
  });
  material.dispose();
};

const disposeModel = (model) => {
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial);
    else if (child.material) disposeMaterial(child.material);
  });
};

const fetchArrayBuffer = async (url, token) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), compactDevice ? 60000 : 45000);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    if (!response.body) return response.arrayBuffer();

    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (token !== requestId) {
        controller.abort();
        throw new DOMException("Model request superseded", "AbortError");
      }
      chunks.push(value);
      loaded += value.byteLength;
      if (total > 0) {
        const percent = Math.min(92, Math.round((loaded / total) * 92));
        loadingBar.style.width = `${percent}%`;
        loadingPercent.textContent = `模型下载中 ${percent}%`;
      } else {
        loadingPercent.textContent = `模型下载中 ${(loaded / 1024 / 1024).toFixed(1)} MB`;
      }
    }
    const merged = new Uint8Array(loaded);
    let offset = 0;
    chunks.forEach((chunk) => {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return merged.buffer;
  } finally {
    window.clearTimeout(timeout);
  }
};

const loadModel = async (key) => {
  const url = modelPaths[key];
  if (!url) return;
  currentKey = key;
  const token = ++requestId;
  setLoading("正在连接模型资源…", 2);

  try {
    const buffer = await fetchArrayBuffer(url, token);
    if (token !== requestId) return;
    loadingBar.style.width = "96%";
    loadingPercent.textContent = "模型解码中…";
    const basePath = new URL(url, window.location.href).href.replace(/[^/]+$/, "");
    const gltf = await loader.parseAsync(buffer, basePath);
    if (token !== requestId) {
      disposeModel(gltf.scene);
      return;
    }

    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(maxDim > 0 ? 60 / maxDim : 1);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const center = scaledBox.getCenter(new THREE.Vector3());
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= scaledBox.min.y;
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = !compactDevice;
      child.receiveShadow = !compactDevice;
    });

    if (currentModel) {
      scene.remove(currentModel);
      disposeModel(currentModel);
    }
    scene.add(model);
    currentModel = model;

    const distance = Math.max(scaledSize.x, scaledSize.z) * 1.5;
    camera.position.set(distance, distance * 0.6, distance);
    controls.target.set(0, scaledSize.y * 0.3, 0);
    controls.update();

    loadingBar.style.width = "100%";
    loadingPercent.textContent = "加载完成";
    loadingOverlay.classList.add("fade-out");
    window.setTimeout(() => {
      if (token === requestId) loadingOverlay.style.display = "none";
    }, 450);
  } catch (error) {
    if (error?.name === "AbortError" && token !== requestId) return;
    console.error("Model load error:", error);
    const message = error?.name === "AbortError"
      ? "模型加载超时，请检查网络后重试"
      : "模型加载失败，请重试或切换其他模型";
    setError(message);
  }
};

retryButton.addEventListener("click", () => loadModel(currentKey));
window.addEventListener("switch-model", (event) => loadModel(event.detail.key));

renderer.domElement.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  setError("3D 渲染上下文已中断，请刷新页面重试");
});

const animate = (time) => {
  requestAnimationFrame(animate);
  if (document.hidden) return;
  if (compactDevice && time - lastFrame < 33) return;
  lastFrame = time;
  controls.update();
  renderer.render(scene, camera);
};
requestAnimationFrame(animate);

const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", resize, { passive: true });

if (compactDevice && typeof window.switchBuilding === "function") {
  window.switchBuilding("guanshu");
} else {
  loadModel(currentKey);
}
