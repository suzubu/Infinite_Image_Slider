// === [ Imports ] ===
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders"; // Custom GLSL shaders
import { slides } from "./slides";

// === [ DOM References ] ===
const container = document.querySelector(".container"); // Main canvas container
const projectTitle = document.getElementById("project-title"); // Title element for active slide
const projectLink = document.getElementById("project-link"); // Clickable link for active slide

// === [ Scroll-Driven Shader Parameters ] ===
let scrollIntensity = 0; // Current scroll velocity (affects distortion)
let targetScrollIntensity = 0; // Smoothed scroll velocity (used in shader)
const maxScrollIntensity = 1.0; // Clamp value for intensity
const scrollSmoothness = 0.5; // How quickly current → target scroll velocity blends

// === [ Scroll Position Logic ] ===
let scrollPosition = 0; // Current scroll position (used to control texture transition)
let targetScrollPosition = 0; // Smooth scroll target (approaches nearest integer)
const scrollPositionSmoothness = 0.05; // Scroll easing for lerping to next image

// === [ Interaction State Flags ] ===
let isMoving = false; // Whether user is currently scrolling
const movementThreshold = 0.001; // Scroll speed below which snapping can begin
let isSnapping = false; // True if we're snapping to a new image index

// === [ Slide Tracking and UI Sync ] ===
let stableCurrentIndex = 0; // Index of the current fully-viewed image
let stableNextIndex = 1; // Index of the next upcoming image
let isStable = false; // Becomes true when scroll has settled near an index

// === [ Title Animation State ] ===
let titleHidden = false; // Tracks if title is hidden (e.g. during transition)
let titleAnimating = false; // Prevents animation overlap
let currentProjectIndex = 0; // Currently active project index (used for DOM updates)

// === [ Initialize Title and Link ] ===
projectTitle.textContent = slides[0].title; // Set initial title from slides array
projectLink.href = slides[0].url; // Set initial link href from slides array

// === [ Three.js Scene Setup ] ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 0);
container.appendChild(renderer.domElement);

// === [ Calculate Plane Size Based on Camera FOV ] ===
const calculatePlaneDimensions = () => {
  const fov = camera.fov * (Math.PI / 180);
  const viewportHeight = 2 * Math.tan(fov / 2) * camera.position.z;
  const viewportWidth = viewportHeight * camera.aspect;

  const widthFactor = window.innerWidth < 900 ? 0.9 : 0.5;
  const planeWidth = viewportWidth * widthFactor;
  const planeHeight = planeWidth * (9 / 16);

  return { width: planeWidth, height: planeHeight };
};

const dimensions = calculatePlaneDimensions();

// === [ Load Textures from Slide Data ] ===
const loadTextures = () => {
  const textLoader = new THREE.TextureLoader();

  return slides.map((slide) => {
    const texture = textLoader.load(slide.image, undefined, undefined, () => {
      console.log(`Using fallback for ${slide.image}`);
    });
    texture.minFilter = THREE.LinearFilter;
    texture.maxFilter = THREE.LinearFilter;
    return texture;
  });
};

const textures = loadTextures();

function preloadAllTextures() {
  textures.forEach((texture) => {
    texture.needsUpdate = true;
  });
}

preloadAllTextures();

// === [ Plane Geometry and Shader Material ] ===
const geometry = new THREE.PlaneGeometry(
  dimensions.width,
  dimensions.height,
  32,
  32
);

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uScrollIntensity: { value: scrollIntensity },
    uScrollPosition: { value: scrollPosition },
    uCurrentTexture: { value: textures[0] },
    uNextTexture: { value: textures[1] },
  },
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// === [ Slide Positioning + Texture Index Tracking ] ===
function determineTextureIndices(position) {
  const totalImages = slides.length;

  const baseIndex = Math.floor(position % totalImages);
  const positiveBaseIndex =
    baseIndex >= 0 ? baseIndex : (totalImages + baseIndex) % totalImages;

  const nextIndex = (positiveBaseIndex + 1) % totalImages;

  let normalizedPosition = position % 1;
  if (normalizedPosition < 0) normalizedPosition += 1;

  return {
    currentIndex: positiveBaseIndex,
    nextIndex: nextIndex,
    normalizedPosition: normalizedPosition,
  };
}

function updateTextureIndices() {
  if (isStable) {
    material.uniforms.uCurrentTexture.value = textures[stableCurrentIndex];
    material.uniforms.uNextTexture.value = textures[stableNextIndex];
    return;
  }
  const indices = determineTextureIndices(scrollPosition);

  material.uniforms.uCurrentTexture.value = textures[indices.currentIndex];
  material.uniforms.uNextTexture.value = textures[indices.nextIndex];
}

// === [ Snapping Logic for Scroll Lock-In ] ===
function snapToNearestImage() {
  if (!isSnapping) {
    isSnapping = true;
    const roundedPosition = Math.round(scrollPosition);
    targetScrollPosition = roundedPosition;

    const indices = determineTextureIndices(roundedPosition);
    stableCurrentIndex = indices.currentIndex;
    stableNextIndex = indices.nextIndex;

    currentProjectIndex = indices.currentIndex;
    showTitle();
  }
}

function hideTitle() {
  if (!titleHidden && !titleAnimating) {
    titleAnimating = true;
    projectTitle.style.transform = "translateY(20px)";
    projectTitle.style.opacity = "0";

    setTimeout(() => {
      titleAnimating = false;
      titleHidden = true;
    }, 500);
  }
}

function showTitle() {
  if (titleHidden && !titleAnimating) {
    projectTitle.textContent = slides[currentProjectIndex].title;
    projectLink.href = slides[currentProjectIndex].url;

    titleAnimating = true;
    projectTitle.style.transform = "translateY(0px)";
    projectTitle.style.opacity = "1";

    setTimeout(() => {
      titleAnimating = false;
      titleHidden = false;
    }, 500);
  }
}

// === [ Resize Event Listener for Responsive Behavior ] ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const newDimensions = calculatePlaneDimensions();
  plane.geometry.dispose();
  plane.geometry = new THREE.PlaneGeometry(
    newDimensions.width,
    newDimensions.height,
    32,
    32
  );
});

// === [ Mouse Wheel Event Listener for Scroll Handling ] ===
window.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    isSnapping = false;
    isStable = false;

    hideTitle();
    targetScrollIntensity += event.deltaY * 0.001;
    targetScrollIntensity = Math.max(
      -maxScrollIntensity,
      Math.min(maxScrollIntensity, targetScrollIntensity)
    );

    targetScrollPosition += event.deltaY * 0.001;

    isMoving = true;
  },
  { passive: false }
);

// === [ Animation Loop ] ===
function animate() {
  requestAnimationFrame(animate);

  scrollIntensity +=
    (targetScrollIntensity - scrollIntensity) * scrollSmoothness;
  material.uniforms.uScrollIntensity.value = scrollIntensity;

  scrollPosition +=
    (targetScrollPosition - scrollPosition) * scrollPositionSmoothness;

  let normalizedPosition = scrollPosition % 1;
  if (normalizedPosition < 0) normalizedPosition += 1;

  if (isStable) {
    material.uniforms.uScrollPosition.value = 0;
  } else {
    material.uniforms.uScrollPosition.value = normalizedPosition;
  }

  updateTextureIndices();

  // Scale plane based on scroll velocity
  const baseScale = 1.0;
  const scaleIntensity = 0.1;
  const scale =
    scrollIntensity > 0
      ? baseScale + scrollIntensity * scaleIntensity
      : baseScale - Math.abs(scrollIntensity) * scaleIntensity;
  plane.scale.set(scale, scale, 1);

  // Apply drag/friction and snap detection
  targetScrollIntensity *= 0.98;
  const scrollDelta = Math.abs(targetScrollPosition - scrollPosition);

  if (scrollDelta < movementThreshold) {
    if (isMoving && !isSnapping) snapToNearestImage();

    if (scrollDelta < 0.0001) {
      if (!isStable) {
        isStable = true;
        scrollPosition = Math.round(scrollPosition);
        targetScrollPosition = scrollPosition;
      }

      isMoving = false;
      isSnapping = false;
    }
  }

  renderer.render(scene, camera);
}

animate();
