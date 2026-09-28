import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Get DOM elements
const canvas = document.getElementById('monteroCanvas');
const loadingElement = document.getElementById('loading');
const progressBar = document.getElementById('progress-bar');
const errorMessage = document.getElementById('error-message');
const modelPathInput = document.getElementById('model-path');
const loadModelButton = document.getElementById('load-model');
const modelButtons = document.querySelectorAll('.model-button');

// Set up scene
const scene = new THREE.Scene();
scene.background = null; // Make scene background transparent

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ 
  canvas, 
  antialias: true,
  alpha: true // Enable transparency
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0); // Transparent background

// Controls setup - rotation only
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false; // Disable zooming
controls.enablePan = false;  // Disable panning
controls.rotateSpeed = 0.7;

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2, 5).normalize();
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-2, 2, -5).normalize();
scene.add(fillLight);

const topLight = new THREE.DirectionalLight(0xffffff, 0.2);
topLight.position.set(0, 5, 0).normalize();
scene.add(topLight);

// Placeholder cube setup
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cube.position.set(0, 0.5, 0);
scene.add(cube);

let currentModel = null;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (cube && cube.visible) cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

// Start animation loop immediately
animate();

// Function to load model with error handling
function loadModel(modelPath) {
  // Update input field with current path
  modelPathInput.value = modelPath;
  
  // Show loading screen
  loadingElement.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  progressBar.style.width = '0%';

  // Remove existing model if any
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  // Hide placeholder cube
  cube.visible = false;

  // Set up loading manager for progress tracking
  const loadingManager = new THREE.LoadingManager();
  
  loadingManager.onProgress = (url, loaded, total) => {
    if (total > 0) {
      const progress = Math.round(loaded / total * 100);
      progressBar.style.width = `${progress}%`;
    }
  };
  
  loadingManager.onLoad = () => {
    loadingElement.classList.add('hidden');
  };
  
  loadingManager.onError = (url) => {
    console.error("Error loading: ", url);
    loadingElement.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.innerText = `Failed to load: ${modelPath}. Using fallback cube.`;
    cube.visible = true;
  };

  // Create GLTF loader with our loading manager
  const loader = new GLTFLoader(loadingManager);
  
  // Add a timeout to handle stuck loading
  const loadingTimeout = setTimeout(() => {
    if (loadingElement.classList.contains('hidden') === false) {
      console.warn("Loading timed out, showing placeholder");
      loadingElement.classList.add('hidden');
      errorMessage.classList.remove('hidden');
      errorMessage.innerText = `Loading timed out for: ${modelPath}. Using fallback cube.`;
      cube.visible = true;
    }
  }, 10000); // 10 second timeout
  
  // Load the model
  try {
    loader.load(
      modelPath,
      (gltf) => {
        clearTimeout(loadingTimeout);
        
        const model = gltf.scene;
        
        // Calculate bounding box for proper scaling
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
               // Scale model consistently
        const maxDimension = Math.max(size.x, size.y, size.z);
        const desiredSize = 1.5; // Target world size (increased from 3 to make model bigger)
        const scale = desiredSize / maxDimension;
        
        // Center the model
        model.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );
        
        // Add to scene
        scene.add(model);
        currentModel = model;

        // Position camera appropriately
        camera.position.set(
          desiredSize * 1.5, 
          desiredSize * 0.75, 
          desiredSize * 1.5
        );
        
        // Update orbit controls target
        controls.target.set(0, 0, 0);
        controls.update();
        
        // Hide loading screen
        loadingElement.classList.add('hidden');
      },
      (xhr) => {
        // Progress updates
        if (xhr.lengthComputable) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100);
          progressBar.style.width = `${progress}%`;
        }
      },
      (error) => {
        // Error handling
        clearTimeout(loadingTimeout);
        console.error('Error loading model:', error);
        loadingElement.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorMessage.innerText = `Error: ${error.message || 'Failed to load model'}`;
        cube.visible = true;
      }
    );
  } catch (err) {
    // Handle any exceptions
    clearTimeout(loadingTimeout);
    console.error('Exception while loading model:', err);
    loadingElement.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorMessage.innerText = `Exception: ${err.message || 'Unknown error'}`;
    cube.visible = true;
  }
}

// Set up model button event listeners
modelButtons.forEach(button => {
  button.addEventListener('click', () => {
    modelButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    loadModel(button.dataset.model);
  });
});

// Set up load button event listener
loadModelButton.addEventListener('click', () => {
  const modelPath = modelPathInput.value.trim();
  if (modelPath) {
    loadModel(modelPath);
    // Update active button state if matching path found
    modelButtons.forEach(btn => {
      if (btn.dataset.model === modelPath) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Reset view function
window.resetView = function() {
  if (currentModel) {
    const box = new THREE.Box3().setFromObject(currentModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    camera.position.set(
      maxDim * 1.5,
      maxDim * 0.75,
      maxDim * 1.5
    );
    controls.target.set(0, 0, 0);
    controls.update();
  }
};

// Force show cube initially to prevent blank screen
cube.visible = true;

// Try loading initial model or show fallback after short delay
// This gives the page time to initialize properly
setTimeout(() => {
  try {
    loadModel(modelPathInput.value);
  } catch (err) {
    console.error("Failed to load initial model:", err);
    loadingElement.classList.add('hidden');
    cube.visible = true;
  }
}, 100);

console.log("3D viewer initialized with rotation only");