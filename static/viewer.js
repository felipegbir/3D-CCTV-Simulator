import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/FBXLoader.js';

const container = document.getElementById('viewer');
const sceneTree = document.getElementById('sceneTree');
const selectedToolbar = document.getElementById('selectedToolbar');
const selectedToolbarLabel = document.getElementById('selectedToolbarLabel');
const toolbarMove = document.getElementById('toolbarMove');
const toolbarRotate = document.getElementById('toolbarRotate');
const toolbarDelete = document.getElementById('toolbarDelete');
const toolbarAlign = document.getElementById('toolbarAlign');
const toolbarLayFace = document.getElementById('toolbarLayFace');
const toolbarCameraView = document.getElementById('toolbarCameraView');
const cameraViewportsContainer = document.getElementById('cameraViewports');
const openCameraViewports = [];
var videoWallRecords = [];
var popupVideoWallRecords = [];
var popupVideoWallWindow = null;
const videoWallPtzEnabledBySource = new Map();
let videoWallOrder = ['scene'];
let videoWallPresetPanelPercent = 20;
let selectedVideoWallTileIndex = 0;
let selectedPopupVideoWallTileIndex = 0;
const APP_VERSION = '8e.7.1';
const PROJECT_SCHEMA_VERSION = 7;
let projectDownloadExtension = 'nmd';
const LEGACY_PROJECT_SCHEMA_VERSION = 1;
let reportSettingsState={projectTitle:'N.O.M.A.D. CCTV Assessment',client:'',location:'',preparedBy:'Felipe Gomez',companyName:'',website:'',subject:'',versionNumber:'',description:'',pageSize:'letter',orientation:'portrait',includeTitlePage:true,includeDescription:true,includeSceneOverview:true,includeOppositeView:true,includeCameraContext:true,includeBom:true,includePresets:true,includeRois:true,showCameraModels:true,watermark:'',imageQuality:85};
const appVersionLabel = document.getElementById('appVersionLabel');
const aboutVersion = document.getElementById('aboutVersion');
if (appVersionLabel) appVersionLabel.textContent = APP_VERSION;
if (aboutVersion) aboutVersion.textContent = APP_VERSION;
document.title = `N.O.M.A.D. CCTV Digital Twin Simulator ${APP_VERSION}`;
const addCameraButton = document.getElementById('addCameraButton');
let cameraCounter = 1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

function applyTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  const isDark = normalizedTheme === 'dark';

  document.body.dataset.theme = normalizedTheme;
  scene.background.set(isDark ? 0x11161c : 0xf2f2f2);
}

const viewerCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 10000);
viewerCamera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

const objectInfoPanel = document.getElementById('objectInfoPanel');
const cameraInfoSection = document.getElementById('cameraInfoSection');
const infoName = document.getElementById('infoName');
const infoType = document.getElementById('infoType');
const infoX = document.getElementById('infoX');
const infoY = document.getElementById('infoY');
const infoZ = document.getElementById('infoZ');
const infoRotX = document.getElementById('infoRotX');
const infoRotY = document.getElementById('infoRotY');
const infoRotZ = document.getElementById('infoRotZ');

const scaleInfoSection = document.getElementById('scaleInfoSection');
const infoScaleUniform = document.getElementById('infoScaleUniform');
const infoScaleX = document.getElementById('infoScaleX');
const infoScaleY = document.getElementById('infoScaleY');
const infoScaleZ = document.getElementById('infoScaleZ');
const realWorldWidth = document.getElementById('realWorldWidth');
const applyRealWorldWidth = document.getElementById('applyRealWorldWidth');

const infoMake = document.getElementById('infoMake');
const infoLens = document.getElementById('infoLens');
const cameraModelSelect = document.getElementById('cameraModelSelect');
const cameraModelResults = document.getElementById('cameraModelResults');
const infoPan = document.getElementById('infoPan');
const infoTilt = document.getElementById('infoTilt');
const infoZoom = document.getElementById('infoZoom');
const ptzPanLeft = document.getElementById('ptzPanLeft');
const ptzPanRight = document.getElementById('ptzPanRight');
const ptzTiltUp = document.getElementById('ptzTiltUp');
const ptzTiltDown = document.getElementById('ptzTiltDown');
const ptzZoomIn = document.getElementById('ptzZoomIn');
const ptzZoomOut = document.getElementById('ptzZoomOut');
const projectionColorInput = document.getElementById('projectionColor');
const projectionDistanceSlider = document.getElementById('projectionDistanceSlider');
const projectionDistanceInput = document.getElementById('projectionDistanceInput');
const projectionDistanceValue = document.getElementById('projectionDistanceValue');
const projectionHfovValue = document.getElementById('projectionHfovValue');
const projectionSceneWidthValue = document.getElementById('projectionSceneWidthValue');
const projectionPixelDensityValue = document.getElementById('projectionPixelDensityValue');
const saveProjectButton = document.getElementById('saveProject');
const loadProjectButton = document.getElementById('loadProject');
const loadProjectFile = document.getElementById('loadProjectFile');
const importModelButton = document.getElementById('importModel');
const importModelFile = document.getElementById('importModelFile');
const importReferenceImageButton = document.getElementById('importReferenceImage');
const importReferenceImageFile = document.getElementById('importReferenceImageFile');
const fitSelectedViewButton = document.getElementById('fitSelectedView');
const openVideoWallButton = document.getElementById('openVideoWall');
const popOutVideoWallButton = document.getElementById('popOutVideoWall');
const videoWallOverlay = document.getElementById('videoWallOverlay');
const videoWallGrid = document.getElementById('videoWallGrid');
const videoWallLayout = document.getElementById('videoWallLayout');
const videoWallSource = document.getElementById('videoWallSource');
const closeVideoWallButton = document.getElementById('closeVideoWall');
const refreshVideoWallButton = document.getElementById('refreshVideoWall');
const popOutVideoWallOverlayButton = document.getElementById('popOutVideoWallOverlay');
const calibrateScaleToolButton = document.getElementById('calibrateScaleTool');
const measureDistanceToolButton = document.getElementById('measureDistanceTool');
const cancelMeasurementToolButton = document.getElementById('cancelMeasurementTool');
const clearMeasurementsButton = document.getElementById('clearMeasurements');
const ptzPresetsInspectorButton = document.getElementById('ptzPresetsInspector');
const measurementStatus = document.getElementById('measurementStatus');
const measurementMagnificationControl = document.getElementById('measurementMagnification');
const measurementMagnificationValue = document.getElementById('measurementMagnificationValue');

const orbitControls = new OrbitControls(viewerCamera, renderer.domElement);
orbitControls.enableDamping = false;
// OrbitControls as True enables scene movement inertia (I disabled it with ChatGPT help)

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(25, 40, 25);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -80;
sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top = 80;
sunLight.shadow.camera.bottom = -80;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-25, 20, -20);
scene.add(fillLight);
const gridHelper = new THREE.GridHelper(100, 100);
const axesHelper = new THREE.AxesHelper(10);
scene.add(gridHelper);
scene.add(axesHelper);
const sceneObjects = [];
const measurements = [];
const measurementVisuals = new THREE.Group();
measurementVisuals.name = 'NOMAD Measurements';
scene.add(measurementVisuals);
let measurementMode = null;
let measurementPoints = [];
let measurementHover = null;
let measurementPreviewLine = null;
let measurementPreviewMarker = null;
let measurementHoverMarker = null;
let measurementEdgeOutline = null;
let measurementOutlinedFaceKey = null;
const measurementMagnifier = document.createElement('div');
measurementMagnifier.className = 'measurement-magnifier';
document.body.appendChild(measurementMagnifier);
const measurementMagnifierRenderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
measurementMagnifierRenderer.setSize(180, 180, false);
measurementMagnifier.appendChild(measurementMagnifierRenderer.domElement);
const DEFAULT_MEASUREMENT_MAGNIFICATION = 3;
const measurementMagnifierCamera = new THREE.PerspectiveCamera(12, 1, 0.01, 10000);
const measurementMagnifierBadge = document.createElement('span');
measurementMagnifierBadge.className = 'measurement-magnifier-level';
measurementMagnifierBadge.textContent = String(DEFAULT_MEASUREMENT_MAGNIFICATION) + '\u00d7';
measurementMagnifier.appendChild(measurementMagnifierBadge);
let measurementMagnifierTarget = null;
let measurementMagnifierView = null;
let measurementPointerStart = null;
let measurementPointerMoved = false;
let selectedId = null;
let sceneNavigationCube = null;
let sceneScaleIndicator = null;
const PREFERENCES_STORAGE_KEY = 'nomadCctvPreferences.v1';
const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'dark',
  reversePan: false,
  reverseTilt: false,
  invertZoom: false,
  rendererQuality: 'high',
  showGrid: true,
  showAxes: true,
  coneOpacity: 0.15,
  fbxAutoScale: true,
  modelImportPreset: 'hvdcMm',
  loupeMagnification: 3,
  ptzPresetSpeed: 10,
  metricDecimals: 3,
  showNavigationCube: true,
  showScaleIndicator: true
});

const preferenceControls = {
  theme: document.getElementById('preferenceTheme'),
  reversePan: document.getElementById('preferenceReversePan'),
  reverseTilt: document.getElementById('preferenceReverseTilt'),
  invertZoom: document.getElementById('preferenceInvertZoom'),
  rendererQuality: document.getElementById('preferenceRendererQuality'),
  showGrid: document.getElementById('preferenceShowGrid'),
  showAxes: document.getElementById('preferenceShowAxes'),
  coneOpacity: document.getElementById('preferenceConeOpacity'),
  coneOpacityValue: document.getElementById('preferenceConeOpacityValue'),
  fbxAutoScale: document.getElementById('preferenceFbxAutoScale'),
  modelImportPreset: document.getElementById('preferenceModelImportPreset'),
  metricDecimals: document.getElementById('preferenceMetricDecimals'),
  showNavigationCube: document.getElementById('preferenceShowNavigationCube'),
  showScaleIndicator: document.getElementById('preferenceShowScaleIndicator'),
  reset: document.getElementById('resetPreferences')
};

function sanitizePreferences(candidate) {
  const safe = { ...DEFAULT_PREFERENCES };
  if (!candidate || typeof candidate !== 'object') return safe;

  if (candidate.theme === 'light' || candidate.theme === 'dark') {
    safe.theme = candidate.theme;
  }

  if (candidate.modelImportPreset === 'hvdcMm' || candidate.modelImportPreset === 'asExported') {
    safe.modelImportPreset = candidate.modelImportPreset;
  }

  if (['performance', 'balanced', 'high'].includes(candidate.rendererQuality)) {
    safe.rendererQuality = candidate.rendererQuality;
  }

  for (const key of ['reversePan', 'reverseTilt', 'invertZoom', 'showGrid', 'showAxes', 'fbxAutoScale', 'showNavigationCube', 'showScaleIndicator']) {
    if (typeof candidate[key] === 'boolean') safe[key] = candidate[key];
  }

  const loupeMagnification = Number.parseInt(candidate.loupeMagnification, 10);
  if (Number.isFinite(loupeMagnification)) {
    safe.loupeMagnification = Math.min(20, Math.max(2, loupeMagnification));
  }

  const metricDecimals = Number.parseInt(candidate.metricDecimals, 10);
  if (Number.isFinite(metricDecimals)) safe.metricDecimals = Math.min(10, Math.max(0, metricDecimals));

  const ptzPresetSpeed = Number.parseFloat(candidate.ptzPresetSpeed);
  if (Number.isFinite(ptzPresetSpeed)) {
    safe.ptzPresetSpeed = Math.min(60, Math.max(1, ptzPresetSpeed));
  }

  const coneOpacity = Number.parseFloat(candidate.coneOpacity);
  if (Number.isFinite(coneOpacity)) {
    safe.coneOpacity = Math.min(0.5, Math.max(0.05, coneOpacity));
  }

  return safe;
}

function loadPreferences() {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return stored ? sanitizePreferences(JSON.parse(stored)) : { ...DEFAULT_PREFERENCES };
  } catch (error) {
    console.warn('Unable to load saved preferences; defaults will be used.', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

function savePreferences() {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Unable to save preferences in this browser.', error);
  }
}

function configureRendererQuality(targetRenderer) {
  if (!targetRenderer) return;

  const pixelRatioCaps = {
    performance: 1,
    balanced: 1.5,
    high: 2
  };
  const cap = pixelRatioCaps[preferences.rendererQuality] || pixelRatioCaps.high;
  targetRenderer.outputColorSpace = renderer.outputColorSpace;
  targetRenderer.toneMapping = renderer.toneMapping;
  targetRenderer.toneMappingExposure = renderer.toneMappingExposure;
  targetRenderer.shadowMap.enabled = preferences.rendererQuality !== 'performance';
  targetRenderer.shadowMap.type = renderer.shadowMap.type;
  targetRenderer.setPixelRatio(Math.min(window.devicePixelRatio, cap));

  if (targetRenderer === renderer) {
    targetRenderer.setSize(container.clientWidth, container.clientHeight);
  } else {
    const host = targetRenderer.domElement?.parentElement;
    if (host) {
      targetRenderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), false);
    }
  }
}

function syncPreferenceControls() {
  preferenceControls.theme.value = preferences.theme;
  preferenceControls.reversePan.checked = preferences.reversePan;
  preferenceControls.reverseTilt.checked = preferences.reverseTilt;
  preferenceControls.invertZoom.checked = preferences.invertZoom;
  preferenceControls.rendererQuality.value = preferences.rendererQuality;
  preferenceControls.showGrid.checked = preferences.showGrid;
  preferenceControls.showAxes.checked = preferences.showAxes;
  preferenceControls.coneOpacity.value = String(preferences.coneOpacity);
  preferenceControls.coneOpacityValue.textContent = `${Math.round(preferences.coneOpacity * 100)}%`;
  preferenceControls.fbxAutoScale.checked = preferences.fbxAutoScale;
  preferenceControls.modelImportPreset.value = preferences.modelImportPreset;
  preferenceControls.metricDecimals.value = String(preferences.metricDecimals);
  preferenceControls.showNavigationCube.checked = preferences.showNavigationCube;
  preferenceControls.showScaleIndicator.checked = preferences.showScaleIndicator;
  measurementMagnificationControl.value = String(preferences.loupeMagnification);
  measurementMagnificationValue.textContent = String(preferences.loupeMagnification) + 'x';
}

function readPreferenceControls() {
  return sanitizePreferences({
    theme: preferenceControls.theme.value,
    reversePan: preferenceControls.reversePan.checked,
    reverseTilt: preferenceControls.reverseTilt.checked,
    invertZoom: preferenceControls.invertZoom.checked,
    rendererQuality: preferenceControls.rendererQuality.value,
    showGrid: preferenceControls.showGrid.checked,
    showAxes: preferenceControls.showAxes.checked,
    coneOpacity: preferenceControls.coneOpacity.value,
    fbxAutoScale: preferenceControls.fbxAutoScale.checked,
    modelImportPreset: preferenceControls.modelImportPreset.value,
    metricDecimals: preferenceControls.metricDecimals.value,
    showNavigationCube: preferenceControls.showNavigationCube.checked,
    showScaleIndicator: preferenceControls.showScaleIndicator.checked,
    loupeMagnification: measurementMagnificationControl.value
  });
}

function applyPreferences({ persist = false } = {}) {
  applyTheme(preferences.theme);
  gridHelper.visible = preferences.showGrid;
  axesHelper.visible = preferences.showAxes;
  configureRendererQuality(renderer);
  openCameraViewports.forEach(viewport => configureRendererQuality(viewport.renderer));
  videoWallRecords.forEach(record => configureRendererQuality(record.renderer));
  popupVideoWallRecords.forEach(record => configureRendererQuality(record.renderer));
  configureRendererQuality(measurementMagnifierRenderer);
  measurementMagnifierRenderer.setSize(180, 180, false);
  measurementMagnifierBadge.textContent = String(preferences.loupeMagnification) + '\u00d7';
  sceneNavigationCube?.classList.toggle('hidden', !preferences.showNavigationCube);
  sceneScaleIndicator?.classList.toggle('hidden', !preferences.showScaleIndicator);

  sceneObjects
    .filter(item => item.type === 'camera')
    .forEach(item => {
      const cone = item.object.userData.projectionCone;
      if (cone?.material) {
        cone.material.opacity = preferences.coneOpacity;
        cone.material.needsUpdate = true;
      }
    });

  syncPreferenceControls();
  if (persist) savePreferences();
}

function formatMetric(value, decimals = preferences?.metricDecimals ?? 5) { const number=Number(value); return Number.isFinite(number) ? number.toFixed(Math.min(10,Math.max(0,Number(decimals)||0))) : "-"; }

let preferences = loadPreferences();
applyPreferences();

function updatePreferencesFromControls() {
  preferences = readPreferenceControls();
  applyPreferences({ persist: true });
}

for (const control of [
  preferenceControls.theme,
  preferenceControls.reversePan,
  preferenceControls.reverseTilt,
  preferenceControls.invertZoom,
  preferenceControls.rendererQuality,
  preferenceControls.showGrid,
  preferenceControls.showAxes,
  preferenceControls.showNavigationCube,
  preferenceControls.showScaleIndicator,
  preferenceControls.fbxAutoScale,
  preferenceControls.modelImportPreset
]) {
  control.addEventListener('change', updatePreferencesFromControls);
}

preferenceControls.coneOpacity.addEventListener('input', updatePreferencesFromControls);
measurementMagnificationControl.addEventListener('input', updatePreferencesFromControls);
preferenceControls.metricDecimals.addEventListener('change',()=>{preferences={...preferences,metricDecimals:Math.min(10,Math.max(0,Number.parseInt(preferenceControls.metricDecimals.value,10)||0))};savePreferences();syncPreferenceControls();if(selectedId)updateObjectInfoPanel();ptzPresetPanel?.refreshLive?.();if(measurements.length)restoreMeasurements(measurements.map(record=>({...record,start:{...record.start},end:{...record.end}}))) });
preferenceControls.reset.addEventListener('click', () => {
  preferences = { ...DEFAULT_PREFERENCES };
  applyPreferences({ persist: true });
});

function animateSceneView(direction, up = new THREE.Vector3(0, 1, 0)) {
  const target = orbitControls.target.clone();
  const distance = Math.max(0.1, viewerCamera.position.distanceTo(target));
  const startPosition = viewerCamera.position.clone();
  const endPosition = target.clone().add(direction.clone().normalize().multiplyScalar(distance));
  const startUp = viewerCamera.up.clone();
  const startedAt = performance.now();
  const duration = 320;
  function step(now) {
    const raw = THREE.MathUtils.clamp((now - startedAt) / duration, 0, 1);
    const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    viewerCamera.position.lerpVectors(startPosition, endPosition, t);
    viewerCamera.up.lerpVectors(startUp, up, t).normalize();
    viewerCamera.lookAt(target);
    viewerCamera.updateMatrixWorld(true);
    if (raw < 1) requestAnimationFrame(step);
    else orbitControls.update();
  }
  requestAnimationFrame(step);
}

function initializeSceneNavigationOverlays() {
  sceneNavigationCube = document.createElement('div');
  sceneNavigationCube.className = 'scene-navigation-cube';
  sceneNavigationCube.setAttribute('aria-label', 'Scene navigation cube');
  sceneNavigationCube.innerHTML = `<div class="nav-cube-core"><button class="nav-cube-face nav-face-front" data-view="front">FRONT</button><button class="nav-cube-face nav-face-back" data-view="back">BACK</button><button class="nav-cube-face nav-face-left" data-view="left">LEFT</button><button class="nav-cube-face nav-face-right" data-view="right">RIGHT</button><button class="nav-cube-face nav-face-top" data-view="top">TOP</button><button class="nav-cube-face nav-face-bottom" data-view="bottom">BOTTOM</button></div>`;
  container.appendChild(sceneNavigationCube);
  const cubeCore = sceneNavigationCube.querySelector('.nav-cube-core');
  const views = {
    front: [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0)],
    back: [new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)],
    left: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0)],
    right: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
    top: [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, -1)],
    bottom: [new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1)]
  };
  sceneNavigationCube.addEventListener('click', event => {
    const face = event.target.closest('[data-view]');
    if (!face || sceneNavigationCube.dataset.dragged === 'true') return;
    const [direction, up] = views[face.dataset.view];
    animateSceneView(direction, up);
  });
  let drag = null;
  cubeCore.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, moved: false };
    sceneNavigationCube.dataset.dragged = 'false';
    cubeCore.classList.add('dragging');
    cubeCore.setPointerCapture?.(event.pointerId);
  });
  cubeCore.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) < 2) return;
    drag.moved = true;
    const target = orbitControls.target.clone();
    const offset = viewerCamera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta -= dx * 0.01;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + dy * 0.01, 0.02, Math.PI - 0.02);
    viewerCamera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
    viewerCamera.up.set(0, 1, 0);
    viewerCamera.lookAt(target);
    viewerCamera.updateMatrixWorld(true);
    drag.x = event.clientX; drag.y = event.clientY;
  });
  const finishDrag = () => {
    if (!drag) return;
    sceneNavigationCube.dataset.dragged = String(drag.moved);
    drag = null;
    cubeCore.classList.remove('dragging');
    requestAnimationFrame(() => { if (sceneNavigationCube) sceneNavigationCube.dataset.dragged = 'false'; });
  };
  cubeCore.addEventListener('pointerup', finishDrag);
  cubeCore.addEventListener('pointercancel', finishDrag);

  sceneScaleIndicator = document.createElement('div');
  sceneScaleIndicator.className = 'scene-scale-indicator';
  sceneScaleIndicator.innerHTML = '<div class="scene-scale-label">Scale</div><div class="scene-scale-bar"></div>';
  container.appendChild(sceneScaleIndicator);
  applyPreferences();
}

function updateSceneNavigationOverlays() {
  if (sceneNavigationCube && !sceneNavigationCube.classList.contains('hidden')) {
    const direction = viewerCamera.position.clone().sub(orbitControls.target).normalize();
    const yaw = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
    const pitch = Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1)) * 180 / Math.PI;
    const core = sceneNavigationCube.querySelector('.nav-cube-core');
    if (core && !core.classList.contains('dragging')) core.style.transform = `rotateX(${pitch - 18}deg) rotateY(${-yaw + 35}deg)`;
  }
  if (sceneScaleIndicator && !sceneScaleIndicator.classList.contains('hidden')) {
    const height = Math.max(1, container.clientHeight);
    const distance = Math.max(0.001, viewerCamera.position.distanceTo(orbitControls.target));
    const worldPerPixel = 2 * distance * Math.tan(THREE.MathUtils.degToRad(viewerCamera.fov / 2)) / height / Math.max(0.001, viewerCamera.zoom || 1);
    const desired = worldPerPixel * 120;
    const exponent = Math.floor(Math.log10(Math.max(desired, 1e-9)));
    const fraction = desired / Math.pow(10, exponent);
    const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : 1;
    const niceMetres = niceFraction * Math.pow(10, exponent);
    const width = THREE.MathUtils.clamp(niceMetres / worldPerPixel, 54, 132);
    let value = niceMetres, unit = 'm';
    if (niceMetres < 0.01) { value = niceMetres * 1000; unit = 'mm'; }
    else if (niceMetres < 1) { value = niceMetres * 100; unit = 'cm'; }
    else if (niceMetres >= 1000) { value = niceMetres / 1000; unit = 'km'; }
    sceneScaleIndicator.querySelector('.scene-scale-label').textContent = `${formatMetric(value, value < 10 ? 2 : 0)} ${unit}`;
    sceneScaleIndicator.querySelector('.scene-scale-bar').style.width = `${width}px`;
  }
}

initializeSceneNavigationOverlays();
const undoStack = [];
const redoStack = [];

// ============================================================
// CAMERA DATABASE
// ============================================================

let cameraDatabase = [];
let cameraDatabaseByModel = {};

const transformControls = new TransformControls(viewerCamera, renderer.domElement);
transformControls.setSize(1.5);
transformControls.visible = false;
transformControls.enabled = false;
scene.add(transformControls);

transformControls.addEventListener('dragging-changed', (event) => {
  orbitControls.enabled = !event.value;

  if (event.value && selectedId) {
    const item = sceneObjects.find(o => o.id === selectedId);
    pushUndoState(item);
    if (item?.type === 'camera') invalidateActivePtzPreset(item, 'Manual camera movement: no preset is active.');
  }
});

function addSceneObject({ id, name, type, object, data = {}, selectable = true }) {
  sceneObjects.push({ id, name, type, object, data, selectable });
  renderSceneTree();
}

const sceneTreeGroups = {
  camera: {
    label: 'Cameras',
    icon: '📹',
    collapsed: false
  },
  model: {
    label: 'Models',
    icon: '🏗️',
    collapsed: false
  },
  object: {
    label: 'Objects',
    icon: '🔹',
    collapsed: true
  },
  zone: {
    label: 'Zones',
    icon: '🟦',
    collapsed: true
  }
};

// ============================================================
// LOAD CAMERA DATABASE
// ============================================================

async function loadCameraDatabase() {
  try {
    const response = await fetch('/api/cameras');

    if (!response.ok) {
      throw new Error(`Camera database API error: ${response.status}`);
    }

    const data = await response.json();

    cameraDatabase = data.cameras || [];
    cameraDatabaseByModel = {};

    cameraDatabase.forEach((camera) => {
      const key =
        camera.display_name ||
        camera.model ||
        camera.base_model ||
        camera.part_number;

      if (key) {
        cameraDatabaseByModel[key] = camera;
      }
    });

    populateCameraModelDropdown();
    console.log(`Loaded ${cameraDatabase.length} camera records from database.`);
  } catch (error) {
    console.error('Failed to load camera database:', error);
  }
}

function populateCameraModelDropdown() {
  if (!cameraModelSelect || !cameraModelResults) return;

  const sortedCameras = cameraDatabase
    .slice()
    .sort((a, b) => {
      const nameA = a.display_name || a.base_model || a.model || '';
      const nameB = b.display_name || b.base_model || b.model || '';
      return nameA.localeCompare(nameB);
    });

  function renderResults(filterText = '') {
    cameraModelResults.innerHTML = '';

    const filter = filterText.toLowerCase();

    const matches = sortedCameras.filter((camera) => {
      const label =
        camera.display_name ||
        camera.base_model ||
        camera.model ||
        camera.part_number ||
        '';

      return label.toLowerCase().includes(filter);
    });

    matches.slice(0, 250).forEach((camera) => {
      const label =
        camera.display_name ||
        camera.base_model ||
        camera.model ||
        camera.part_number ||
        'Unknown Camera';

      const div = document.createElement('div');
      div.className = 'camera-combo-result';
      div.textContent = label;

      div.addEventListener('click', () => {
        cameraModelSelect.value = label;
        cameraModelResults.style.display = 'none';

        cameraModelSelect.dispatchEvent(new Event('change'));
      });

      cameraModelResults.appendChild(div);
    });

    cameraModelResults.style.display =
      matches.length > 0 ? 'block' : 'none';
  }

  cameraModelSelect.addEventListener('input', () => {
    renderResults(cameraModelSelect.value);
  });

  cameraModelSelect.addEventListener('focus', () => {
    cameraModelSelect.select();
    renderResults('');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.camera-combo')) {
      cameraModelResults.style.display = 'none';
    }
  });
}

function renderSceneTree() {
  sceneTree.innerHTML = '';

  Object.entries(sceneTreeGroups).forEach(([type, group]) => {
    const groupItems = sceneObjects.filter(item => item.type === type);

    const header = document.createElement('div');
    header.className = 'section-title scene-tree-section-title';
    header.textContent = `${group.collapsed ? '▶' : '▼'} ${group.label}`;

    header.addEventListener('click', () => {
      group.collapsed = !group.collapsed;
      renderSceneTree();
    });

    sceneTree.appendChild(header);

    if (!group.collapsed) {
      if (groupItems.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'tree-item';
        empty.style.color = '#777';
        empty.style.cursor = 'default';
        empty.textContent = 'No items';
        sceneTree.appendChild(empty);
      }

      groupItems.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.style.marginLeft = '14px';

        if (item.id === selectedId) div.classList.add('selected');

        div.textContent = `${iconForType(item.type)} ${item.name}`;

        div.addEventListener('click', () => {
          if (selectedId === item.id) {
            clearSelection();
          } else {
            selectObject(item.id);
          }
        });

        sceneTree.appendChild(div);
      });
    }
  });
}

function setProjectionPalette(colorHex, opacity = preferences.coneOpacity) {
  sceneObjects
    .filter(item => item.type === 'camera')
    .forEach(item => {
      const cone = item.object.userData.projectionCone;
      if (!cone || !cone.material) return;

      cone.material.color.setHex(colorHex);
      cone.material.opacity = opacity;
      cone.material.transparent = true;
      cone.material.needsUpdate = true;
    });
}

function updateSelectedToolbar() {
  if (!selectedId) {
    selectedToolbar.classList.add('hidden');
    selectedToolbarLabel.textContent = 'No object selected';
    return;
  }

  const item = sceneObjects.find(o => o.id === selectedId);

  if (!item) {
    selectedToolbar.classList.add('hidden');
    selectedToolbarLabel.textContent = 'No object selected';
    return;
  }

  selectedToolbar.classList.remove('hidden');
  selectedToolbarLabel.textContent = `${iconForType(item.type)} ${item.name}`;

  const isCamera = item.type === 'camera';
  const isModelOrObject = item.type === 'model' || item.type === 'object';

  // Camera-specific toolbar behavior
  if (toolbarAlign) {
    toolbarAlign.style.display = isModelOrObject ? 'inline-block' : 'none';
    toolbarAlign.classList.toggle('disabled', !isModelOrObject);
  }

  if (toolbarLayFace) {
    toolbarLayFace.style.display = isModelOrObject ? 'inline-block' : 'none';
    toolbarLayFace.classList.toggle('disabled', !isModelOrObject);
  }

  if (toolbarCameraView) {
    toolbarCameraView.style.display = isCamera ? 'inline-block' : 'none';
    toolbarCameraView.classList.toggle('disabled', !isCamera);
  }
}

function updateObjectInfoPanel() {
  if (!selectedId) {
    objectInfoPanel.classList.add('hidden');
    document.body.classList.remove('object-inspector-visible');
    return;
  }

  const item = sceneObjects.find(o => o.id === selectedId);

  if (!item) {
    objectInfoPanel.classList.add('hidden');
    document.body.classList.remove('object-inspector-visible');
    return;
  }

  const pos = item.object.position;

  objectInfoPanel.classList.remove('hidden');
  document.body.classList.add('object-inspector-visible');

  if (document.activeElement !== infoName) {
    infoName.value = item.name;
  }
  infoType.textContent = item.type;

  if (document.activeElement !== infoX) {
    infoX.value = formatMetric(pos.x);
  }

  if (document.activeElement !== infoY) {
    infoY.value = formatMetric(pos.y);
  }

  if (document.activeElement !== infoZ) {
    infoZ.value = formatMetric(pos.z);
  }

  const rot = item.object.rotation;

  if (document.activeElement !== infoRotX) {
    infoRotX.value = formatMetric(THREE.MathUtils.radToDeg(rot.x));
  }

  if (document.activeElement !== infoRotY) {
    infoRotY.value = formatMetric(THREE.MathUtils.radToDeg(rot.y));
  }

  if (document.activeElement !== infoRotZ) {
    infoRotZ.value = formatMetric(THREE.MathUtils.radToDeg(rot.z));
  }

  const scale = item.object.scale;

  if (document.activeElement !== infoScaleUniform) {
    infoScaleUniform.value = formatMetric(scale.x);
  }

  if (document.activeElement !== infoScaleX) {
    infoScaleX.value = formatMetric(scale.x);
  }

  if (document.activeElement !== infoScaleY) {
    infoScaleY.value = formatMetric(scale.y);
  }

  if (document.activeElement !== infoScaleZ) {
    infoScaleZ.value = formatMetric(scale.z);
  }

  if (item.type === 'camera') {

    cameraInfoSection.style.display = 'block';

    if (scaleInfoSection) {
      scaleInfoSection.style.display = 'none';
    }

    infoMake.textContent = item.data?.make || 'Unknown';

    if (
      cameraModelSelect &&
      document.activeElement !== cameraModelSelect
    ) {
      cameraModelSelect.value = item.data?.model || '';
    }

    const focalMin = item.data?.focalLengthMinMm;
    const focalMax = item.data?.focalLengthMaxMm;
    const apertureMin = item.data?.apertureMinF;
    const apertureMax = item.data?.apertureMaxF;

    let lensText = 'Unknown';

    if (focalMin && focalMax && focalMin !== focalMax) {
      lensText = `${focalMin}–${focalMax} mm`;
    } else if (focalMin) {
      lensText = `${focalMin} mm`;
    }

    if (apertureMin && apertureMax && apertureMin !== apertureMax) {
      lensText += `, F${apertureMin}–${apertureMax}`;
    } else if (apertureMin) {
      lensText += `, F${apertureMin}`;
    }

    infoLens.textContent = lensText;

    infoPan.textContent = `${item.data?.pan ?? 0}°`;
    infoTilt.textContent = `${item.data?.tilt ?? 0}°`;
    infoZoom.textContent = `${formatMetric(item.data?.zoom ?? 1)}x`;

    const cone = item.object.userData.projectionCone;
    const distance = item.object.userData.projectionDistance || 20;

    if (cone && cone.material) {
      const hex = `#${cone.material.color.getHexString()}`;
      projectionColorInput.value = hex;
    }

    projectionDistanceSlider.value = distance;
    projectionDistanceInput.value = formatMetric(distance);
    projectionDistanceValue.textContent = formatMetric(distance);

    const distanceMeters =
      item.data?.projectionDistance ||
      item.object.userData.projectionDistance ||
      20;

    const hfov = Number.parseFloat(item.data?.hfov) || 90;

    // Scene width at distance (from your PDF)
    const sceneWidth = 2 * distanceMeters * Math.tan((hfov / 2) * Math.PI / 180);

    // Axis thermal resolution (Q2101-TE)
    const sensorPixels = item.data?.resolutionWidth || 384;

    // Pixel density (pixels per meter)
    const pixelDensity = sensorPixels / sceneWidth;

    // Update UI
    if (projectionHfovValue && projectionSceneWidthValue && projectionPixelDensityValue) {
        projectionHfovValue.textContent = `${formatMetric(hfov)}°`;
        projectionSceneWidthValue.textContent = `${formatMetric(sceneWidth)} m`;
        projectionPixelDensityValue.textContent = `${formatMetric(pixelDensity)} px/m`;
    }

    const supportsPan = item.data?.supportsPan;
    const supportsTilt = item.data?.supportsTilt;
    const supportsZoom = item.data?.supportsZoom;

    document.getElementById('ptzPanLeft').classList.toggle('disabled', !supportsPan);
    document.getElementById('ptzPanRight').classList.toggle('disabled', !supportsPan);

    document.getElementById('ptzTiltUp').classList.toggle('disabled', !supportsTilt);
    document.getElementById('ptzTiltDown').classList.toggle('disabled', !supportsTilt);

    document.getElementById('ptzZoomIn').classList.toggle('disabled', !supportsZoom);
    document.getElementById('ptzZoomOut').classList.toggle('disabled', !supportsZoom);

      } else {

        cameraInfoSection.style.display = 'none';

        if (scaleInfoSection) {
          scaleInfoSection.style.display = 'block';
        }
      }
    }

function iconForType(type) {
  if (type === 'camera') return '📹';
  if (type === 'model') return '🏗️';
  return '🔹';
}

function captureObjectState(item) {
  return {
    id: item.id,
    position: {
      x: item.object.position.x,
      y: item.object.position.y,
      z: item.object.position.z
    },
    rotation: {
      x: item.object.rotation.x,
      y: item.object.rotation.y,
      z: item.object.rotation.z
    },
    scale: {
      x: item.object.scale.x,
      y: item.object.scale.y,
      z: item.object.scale.z
    }
  };
}

function restoreObjectState(state) {
  const item = sceneObjects.find(o => o.id === state.id);
  if (!item) return;

  item.object.position.set(
    state.position.x,
    state.position.y,
    state.position.z
  );

  item.object.rotation.set(
    state.rotation.x,
    state.rotation.y,
    state.rotation.z
  );

  item.object.scale.set(
    state.scale.x,
    state.scale.y,
    state.scale.z
  );

  updateObjectInfoPanel();
}

function pushUndoState(item) {
  if (!item) return;

  undoStack.push(captureObjectState(item));

  // Once a new action happens, redo history is no longer valid
  redoStack.length = 0;
}

function selectObject(id) {
  const item = sceneObjects.find(o => o.id === id);
  if (!item || !item.selectable) return;

  selectedId = id;
  if (item.data?.locked) {
    transformControls.detach();
    transformControls.visible = false;
    transformControls.enabled = false;
  } else {
    transformControls.attach(item.object);
    transformControls.visible = true;
    transformControls.enabled = true;
  }
  renderSceneTree();
  updateSelectedToolbar();
  updateObjectInfoPanel();

  if (item.type === 'camera') {
    const viewportRecord = openCameraViewports.find(record => record.cameraId === item.id);
    if (viewportRecord) focusCameraViewport(viewportRecord.element);
  }
}
function clearSelection() {
  selectedId = null;
  transformControls.detach();
  transformControls.visible = false;
  transformControls.enabled = false;
  renderSceneTree();
  updateSelectedToolbar();
  updateObjectInfoPanel();

}

function alignObjectToGround(object) {
  const box = new THREE.Box3().setFromObject(object);
  const minY = box.min.y;

  // Shift object so bottom sits at Y = 0
  object.position.y -= minY;
}

function updateCameraProjection(cameraItem) {
  if (!cameraItem || cameraItem.type !== 'camera') return;

  const projectionCone = cameraItem.object.userData.projectionCone;
  const projectionDistance =
    cameraItem.data?.projectionDistance ||
    cameraItem.object.userData.projectionDistance ||
    20;

  if (!projectionCone) return;

  const currentHfov = Number.parseFloat(cameraItem.data?.hfov) || 90;
  const radius = Math.tan((currentHfov / 2) * Math.PI / 180) * projectionDistance;

  projectionCone.geometry.dispose();
  projectionCone.geometry = new THREE.ConeGeometry(radius, projectionDistance, 32, 1, true);
  projectionCone.rotation.x = Math.PI / 2;
  projectionCone.position.set(0, 0, -projectionDistance / 2);

  cameraItem.object.userData.projectionDistance = projectionDistance;
  cameraItem.object.userData.baseHfov = currentHfov;

  const renderCamera = cameraItem.object.userData.renderCamera;
  if (renderCamera) {
    renderCamera.fov = currentHfov;
    renderCamera.far = Math.max(renderCamera.near + 0.01, projectionDistance);
    renderCamera.updateProjectionMatrix();
  }
}

function applyCameraPtzRig(cameraItem) {
  if (!cameraItem || cameraItem.type !== 'camera') return;

  const panPivot = cameraItem.object.userData.panPivot;
  const tiltPivot = cameraItem.object.userData.tiltPivot;
  const rollPivot = cameraItem.object.userData.rollPivot;

  if (!panPivot || !tiltPivot || !rollPivot) return;

  const pan = Number.parseFloat(cameraItem.data?.pan) || 0;
  const tilt = Number.parseFloat(cameraItem.data?.tilt) || 0;
  const roll = Number.parseFloat(cameraItem.data?.roll) || 0;

  panPivot.rotation.y = THREE.MathUtils.degToRad(pan);
  tiltPivot.rotation.x = THREE.MathUtils.degToRad(tilt);
  rollPivot.rotation.z = THREE.MathUtils.degToRad(roll);
}

function updateProjectionDistance(cameraItem, newDistance) {
  if (!cameraItem || cameraItem.type !== 'camera') return;

  cameraItem.data.projectionDistance = newDistance;
  cameraItem.object.userData.projectionDistance = newDistance;

  updateCameraProjection(cameraItem);
  if (!activePtzPresetAnimations.has(cameraItem.id)) refreshCameraPresetDerivedData(cameraItem);
}

window.toggleInspectorSection = function(header) {
  const section = header.nextElementSibling;
  const indicator = header.querySelector('.collapse-indicator');

  if (!section) return;

  const collapsed = section.style.display !== 'none';

  section.style.display = collapsed ? 'none' : 'block';

  if (indicator) {
    indicator.textContent = collapsed ? '▶' : '▼';
  }
};

window.toggleObjectInspectorBody = function(header) {
  const body = document.getElementById('objectInspectorBody');
  const indicator = header.querySelector('.collapse-indicator');

  if (!body) return;

  const isVisible = body.style.display !== 'none';

  body.style.display = isVisible ? 'none' : 'block';

  if (indicator) {
    indicator.textContent = isVisible ? '▶' : '▼';
  }
};

// ============================================================
// CAMERA VIEWPORT SENSOR PALETTES
// ============================================================
// These CSS filters provide a lightweight simulated sensor view
// for demonstrations. They do not alter the 3D scene or camera
// optics; they only affect the camera viewport canvas display.

const CAMERA_VIEW_PALETTES = {
  visible: {
    label: 'Visible',
    filter: 'none'
  },
  whiteHot: {
    label: 'Thermal - White Hot',
    filter: 'grayscale(100%) contrast(1.25) brightness(1.1)'
  },
  blackHot: {
    label: 'Thermal - Black Hot',
    filter: 'grayscale(100%) invert(100%) contrast(1.25) brightness(1.05)'
  },
  ironbow: {
    label: 'Thermal - Ironbow',
    filter: 'sepia(100%) saturate(350%) hue-rotate(-35deg) contrast(1.25) brightness(1.05)'
  },
  rainbow: {
    label: 'Thermal - Rainbow',
    filter: 'saturate(350%) hue-rotate(135deg) contrast(1.25)'
  },
  uvPurple: {
    label: 'UV - Purple',
    filter: 'hue-rotate(235deg) saturate(220%) contrast(1.15) brightness(0.95)'
  }
};

function getDefaultViewportPalette(cameraItem) {
  const cameraData = cameraItem?.data || {};
  const rawRecord = cameraData.rawRecord || {};

  const searchableText = [
    cameraData.model,
    cameraData.baseModel,
    cameraData.make,
    rawRecord.category,
    rawRecord.series,
    rawRecord.base_model,
    rawRecord.display_name,
    rawRecord.special_features_raw
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (cameraData.thermal || searchableText.includes('thermal') || searchableText.includes('thermo')) {
    return 'ironbow';
  }

  if (
    searchableText.includes('uv') ||
    searchableText.includes('corona') ||
    searchableText.includes('daycor') ||
    searchableText.includes('eye hd') ||
    searchableText.includes('eyelite')
  ) {
    return 'uvPurple';
  }

  return 'visible';
}

function applyViewportPalette(viewportRenderer, paletteKey) {
  if (!viewportRenderer || !viewportRenderer.domElement) return;

  const palette =
    CAMERA_VIEW_PALETTES[paletteKey] ||
    CAMERA_VIEW_PALETTES.visible;

  viewportRenderer.domElement.style.filter = palette.filter;
}

const MAX_CAMERA_VIEWPORTS = 16;
let viewportZCounter = 30;

function focusCameraViewport(viewport) {
  if (!viewport) return;
  viewportZCounter += 1;
  openCameraViewports.forEach(record => record.element.classList.toggle('active-viewport', record.element === viewport));
  viewport.style.zIndex = String(viewportZCounter);
}

function getAvailableVideoWallSources() {
  const cameras = sceneObjects.filter(item => item.type === 'camera').slice(0, MAX_CAMERA_VIEWPORTS);
  const available = new Map([['scene', { key: 'scene', label: 'Planning Scene', item: null }]]);
  cameras.forEach(item => available.set(item.id, { key: item.id, label: item.name, item }));
  return available;
}

function getVideoWallSources() {
  const available = getAvailableVideoWallSources();
  videoWallOrder = videoWallOrder.filter(key => available.has(key));
  available.forEach((value, key) => { if (!videoWallOrder.includes(key)) videoWallOrder.push(key); });
  return videoWallOrder.map(key => available.get(key));
}

function disposeVideoWallRecords(records) {
  const disposedRenderers = new Set();
  records.forEach(record => {
    const wallRenderer = record.renderer;
    if (!wallRenderer || disposedRenderers.has(wallRenderer)) return;
    disposedRenderers.add(wallRenderer);
    wallRenderer.dispose();
    wallRenderer.forceContextLoss?.();
    wallRenderer.domElement?.remove();
  });
  records.length = 0;
}

function getWallColumns(count, selection) {
  if (selection !== 'auto') return Number(selection) || 1;
  return Math.max(1, Math.min(5, Math.ceil(Math.sqrt(Math.max(1, count)))));
}

function getVideoWallLayout(count, selection) {
  if (selection === '1x2') return { columns: 2, rows: 1, capacity: 2 };
  const columns = getWallColumns(count, selection);
  if (selection === 'auto') {
    return {
      columns,
      rows: Math.max(1, Math.ceil(Math.max(1, count) / columns)),
      capacity: Math.max(1, count)
    };
  }
  return { columns, rows: columns, capacity: columns * columns };
}

function applyVideoWallGridLayout(grid, count, selection) {
  const layout = getVideoWallLayout(count, selection);
  grid.style.setProperty('--wall-columns', String(layout.columns));
  grid.style.setProperty('--wall-rows', String(layout.rows));
  return layout;
}

function appendVideoWallEmptySlots(doc, grid, count) {
  for (let index = 0; index < count; index += 1) {
    const empty = doc.createElement('div');
    empty.className = 'video-wall-empty-slot';
    empty.setAttribute('aria-label', 'Empty video wall slot');
    grid.appendChild(empty);
  }
}

function populateVideoWallSourceSelect(select, selectedIndex) {
  if (!select) return;
  const available = [...getAvailableVideoWallSources().values()];
  select.replaceChildren(...available.map(source => {
    const option = select.ownerDocument.createElement('option');
    option.value = source.key;
    option.textContent = source.label;
    return option;
  }));
  const sourceKey = videoWallOrder[selectedIndex];
  if (available.some(source => source.key === sourceKey)) select.value = sourceKey;
}

function assignVideoWallSource(tileIndex, sourceKey) {
  if (!getAvailableVideoWallSources().has(sourceKey)) return;
  while (videoWallOrder.length <= tileIndex) videoWallOrder.push('scene');
  videoWallOrder[tileIndex] = sourceKey;
  buildIntegratedVideoWall();
  if (popupVideoWallWindow && !popupVideoWallWindow.closed) buildPopupVideoWall();
}

function selectVideoWallTile(records, tileIndex, sourceSelect) {
  records.forEach(record => record.hostTile?.classList.toggle('selected', record.tileIndex === tileIndex));
  populateVideoWallSourceSelect(sourceSelect, tileIndex);
}

function videoWallSupportsPresetDock(layout) {
  return layout.rows === 1 && layout.capacity <= 2;
}

function syncWallCamera(target, sourceItem) {
  const source = sourceItem?.object?.userData?.renderCamera;
  if (!source) return false;
  target.position.copy(source.getWorldPosition(new THREE.Vector3()));
  target.quaternion.copy(source.getWorldQuaternion(new THREE.Quaternion()));
  target.fov = source.fov;
  target.near = source.near;
  target.far = source.far;
  target.zoom = source.zoom;
  target.updateProjectionMatrix();
  return true;
}

function reorderVideoWall(draggedKey, targetKey) {
  const from = videoWallOrder.indexOf(draggedKey);
  const to = videoWallOrder.indexOf(targetKey);
  if (from < 0 || to < 0 || from === to) return;
  videoWallOrder.splice(to, 0, videoWallOrder.splice(from, 1)[0]);
  buildIntegratedVideoWall();
  if (popupVideoWallWindow && !popupVideoWallWindow.closed) buildPopupVideoWall();
}

function downloadRendererCapture(targetRenderer, sourceName) {
  const safeName = String(sourceName || 'camera')
    .replace(/[^a-z0-9_-]/gi, '_')
    .toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const link = document.createElement('a');
  link.href = targetRenderer.domElement.toDataURL('image/png');
  link.download = `${safeName}_${timestamp}.png`;
  link.click();
}

function adjustCameraPtzFromView(cameraItem, deltaX, deltaY) {
  if (!cameraItem?.data) return;
  cancelCameraPresetAnimation(cameraItem, 'Preset recall cancelled by manual PTZ input.');
  const panDirection = preferences.reversePan ? -1 : 1;
  const tiltDirection = preferences.reverseTilt ? -1 : 1;
  cameraItem.data.pan = (Number.parseFloat(cameraItem.data.pan) || 0) + deltaX * 0.25 * panDirection;
  cameraItem.data.tilt = THREE.MathUtils.clamp(
    (Number.parseFloat(cameraItem.data.tilt) || 0) + deltaY * 0.25 * tiltDirection,
    -90,
    90
  );
  applyCameraPtzRig(cameraItem);
  ptzPresetPanel?.refreshLive?.();
  if (selectedId === cameraItem.id) updateObjectInfoPanel();
}

const activePtzPresetAnimations = new Map();
let activePresetCamera = null;
let ptzPresetPanel = null;
let pendingPresetDepthCamera = null;
let pendingPresetDepthPresetId = null;
let pendingPresetDepthDock = null;
let presetDepthPickBanner = null;
let pendingPresetDepthStage = null;
let pendingPresetRoiDrawing = null;
let pendingPresetRoiDraft = null;
let editingPresetRoiId = null;
const presetRoiOverlayContexts = [];

function getNextPtzPresetName(cameraItem) {
  const usedNumbers = ensureCameraPtzPresets(cameraItem)
    .map(preset => /^Preset\s+(\d+)$/i.exec(String(preset.name || '').trim()))
    .filter(Boolean)
    .map(match => Number(match[1]))
    .filter(Number.isFinite);
  const nextNumber = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;
  return `Preset ${String(nextNumber).padStart(3, '0')}`;
}

function normalizePresetRoi(roi,index=0){const safe=roi&&typeof roi==='object'?roi:{};let nodes=Array.isArray(safe.nodes)?safe.nodes.slice(0,15).map(n=>({x:THREE.MathUtils.clamp(Number(n?.x)||0,0,1),y:THREE.MathUtils.clamp(Number(n?.y)||0,0,1)})):[];if(nodes.length<3&&safe.normalized){const x=Number(safe.normalized.x)||0,y=Number(safe.normalized.y)||0,w=Number(safe.normalized.width)||0,h=Number(safe.normalized.height)||0;nodes=[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}]}return{id:String(safe.id||`ptz-roi-${Date.now()}-${index}`),name:String(safe.name||`ROI ${String(index+1).padStart(3,'0')}`),notes:String(safe.notes||''),color:String(safe.color||'#00e5ff'),visible:safe.visible!==false,nodes,depthTarget:safe.depthTarget?{...safe.depthTarget}:null,projectionDistance:Math.max(.02,Number(safe.projectionDistance)||20),metrics:safe.metrics?{...safe.metrics}:{},createdAt:safe.createdAt||new Date().toISOString(),updatedAt:safe.updatedAt||new Date().toISOString()}}
const normalizedPtzPresetObjects = new WeakSet();
function normalizePtzPreset(preset, index = 0) {
  const safe = preset && typeof preset === 'object' ? preset : {};
  const legacy=safe.roi?.normalized?[normalizePresetRoi({...safe.roi,name:'ROI 001',depthTarget:safe.depthTarget,projectionDistance:safe.projectionDistance})]:[];const rois=(Array.isArray(safe.rois)?safe.rois:legacy).map(normalizePresetRoi);
  const normalized = {
    id: String(safe.id || `ptz-preset-${Date.now()}-${index}`),
    name: String(safe.name || `Preset ${String(index + 1).padStart(3, '0')}`),
    notes: String(safe.notes || ''),
    pan: Number.parseFloat(safe.pan) || 0,
    tilt: THREE.MathUtils.clamp(Number.parseFloat(safe.tilt) || 0, -90, 90),
    roll: Number.parseFloat(safe.roll) || 0,
    zoom: Math.max(0.01, Number.parseFloat(safe.zoom) || 1),
    currentFocalLengthMm: Number.parseFloat(safe.currentFocalLengthMm) || null,
    hfov: Number.parseFloat(safe.hfov) || 90,
    projectionDistance: Math.max(0.02, Number.parseFloat(safe.projectionDistance) || 20),
    viewportPalette: String(safe.viewportPalette || 'visible'),
    cameraPosition: { x: Number(safe.cameraPosition?.x) || 0, y: Number(safe.cameraPosition?.y) || 0, z: Number(safe.cameraPosition?.z) || 0 },
    cameraRotation: { x: Number(safe.cameraRotation?.x) || 0, y: Number(safe.cameraRotation?.y) || 0, z: Number(safe.cameraRotation?.z) || 0 },
    cameraIdentity: safe.cameraIdentity && typeof safe.cameraIdentity === 'object' ? { ...safe.cameraIdentity } : {},
    capturedCameraIdentity: safe.capturedCameraIdentity && typeof safe.capturedCameraIdentity === 'object'
      ? { ...safe.capturedCameraIdentity }
      : (safe.cameraIdentity && typeof safe.cameraIdentity === 'object' ? { ...safe.cameraIdentity } : {}),
    limitIssues: Array.isArray(safe.limitIssues) ? safe.limitIssues.map(String) : [],
    roi: {
      width: Number(safe.roi?.width) || null,
      height: Number(safe.roi?.height) || null,
      pixelWidth: Number(safe.roi?.pixelWidth) || null,
      pixelHeight: Number(safe.roi?.pixelHeight) || null,
      normalized: safe.roi?.normalized && typeof safe.roi.normalized === 'object' ? { ...safe.roi.normalized } : null
    },
    depthTarget: safe.depthTarget && typeof safe.depthTarget === 'object' ? { ...safe.depthTarget } : null,
    analysis: safe.analysis && typeof safe.analysis === 'object' ? { ...safe.analysis } : {},
    rois, activeRoiId: rois.some(roi => roi.id === safe.activeRoiId) ? String(safe.activeRoiId) : (rois[0]?.id || null),
    createdAt: safe.createdAt || new Date().toISOString(),
    updatedAt: safe.updatedAt || new Date().toISOString()
  };
  normalizedPtzPresetObjects.add(normalized);
  return normalized;
}

function ensureCameraPtzPresets(cameraItem) {
  if (!cameraItem?.data) return [];
  const source = Array.isArray(cameraItem.data.ptzPresets) ? cameraItem.data.ptzPresets : [];
  cameraItem.data.ptzPresets = source.map((preset,index) => normalizedPtzPresetObjects.has(preset) ? preset : normalizePtzPreset(preset,index));
  return cameraItem.data.ptzPresets;
}

function getNextPresetRoiName(preset){const nums=(preset?.rois||[]).map(r=>/^ROI\s+(\d+)$/i.exec(r.name||'')) .filter(Boolean).map(m=>+m[1]);return `ROI ${String(nums.length?Math.max(...nums)+1:1).padStart(3,'0')}`}
function calculatePolygonRoiMetrics(cameraItem,roi,state={}){const n=roi.nodes||[],a=calculatePresetAnalysis(cameraItem,{},state);if(n.length<3)return{...a,nodeCount:n.length};const xs=n.map(p=>p.x),ys=n.map(p=>p.y),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);let area=0;n.forEach((p,i)=>{const q=n[(i+1)%n.length];area+=p.x*q.y-q.x*p.y});area=Math.abs(area)/2;const pixelWidth=Math.max(1,Math.round(a.resolutionWidth*w)),pixelHeight=Math.max(1,Math.round(a.resolutionHeight*h)),minimumSpan=Math.min(pixelWidth,pixelHeight);return{...a,nodeCount:n.length,width:a.footprintWidth*w,height:a.footprintHeight*h,area:area*a.footprintWidth*a.footprintHeight,pixelWidth,pixelHeight,pixelArea:area*a.resolutionWidth*a.resolutionHeight,minimumSpan,thermographyClass:minimumSpan>=9?'Preferred/enhanced 9 x 9 or greater':minimumSpan>=3?'Minimum detection 3 x 3':'Below minimum 3 x 3'}}
function formatPresetRoiAnalysis(roi){if(!roi)return 'Selected ROI: none';const m=roi.metrics||{};return[`Selected ROI: ${roi.name} (${m.nodeCount||roi.nodes?.length||0} nodes)`,`Depth: ${formatMetric(roi.projectionDistance||0)} m - ${roi.depthTarget?.objectName||'selected surface'}`,`Bounds: ${m.pixelWidth||0} x ${m.pixelHeight||0} pixels`,`Polygon area: ${formatMetric(m.pixelArea||0)} px^2 / ${formatMetric(m.area||0)} m^2`,`Minimum effective span: ${m.minimumSpan||0} pixels`,`Thermography: ${m.thermographyClass||'Not calculated'}`].join('\n')}
function calculatePresetAnalysis(cameraItem, roi = {}, state = {}) {
  const depth = Math.max(0.02, Number(state.projectionDistance ?? cameraItem.data?.projectionDistance) || 20);
  const hfov = Number(state.hfov ?? cameraItem.data?.hfov) || 90;
  const vfov = Number(state.vfov ?? cameraItem.data?.vfov) || hfov * 9 / 16;
  const width = 2 * depth * Math.tan(THREE.MathUtils.degToRad(hfov / 2));
  const height = 2 * depth * Math.tan(THREE.MathUtils.degToRad(vfov / 2));
  const resolutionWidth = Number(cameraItem.data?.resolutionWidth) || 1920;
  const resolutionHeight = Number(cameraItem.data?.resolutionHeight) || 1080;
  const horizontalPixelDensity = width > 0 ? resolutionWidth / width : 0;
  const verticalPixelDensity = height > 0 ? resolutionHeight / height : 0;
  const roiWidth = Number(roi.width) || null;
  const roiHeight = Number(roi.height) || null;
  const roiPixelsX = roiWidth ? roiWidth * horizontalPixelDensity : null;
  const roiPixelsY = roiHeight ? roiHeight * verticalPixelDensity : null;
  let thermographyClass = 'ROI not configured';
  if (roiPixelsX !== null && roiPixelsY !== null) {
    if (roiPixelsX < 3 || roiPixelsY < 3) thermographyClass = 'Below minimum 3 x 3';
    else if (roiPixelsX < 9 || roiPixelsY < 9) thermographyClass = 'Minimum detection 3 x 3';
    else if (roiPixelsX >= 9 && roiPixelsY >= 9) thermographyClass = 'Preferred/enhanced 9 x 9 or greater';
  }
  return {
    depth,
    hfov,
    vfov,
    footprintWidth: width,
    footprintHeight: height,
    horizontalPixelDensity,
    verticalPixelDensity,
    resolutionWidth,
    resolutionHeight,
    roiWidth,
    roiHeight,
    roiPixelsX,
    roiPixelsY,
    thermographyClass,
    calculatedAt: new Date().toISOString()
  };
}

function captureCameraPreset(cameraItem, existing = {}) {
  const now = new Date().toISOString();
  return normalizePtzPreset({
    ...existing,
    id: existing.id || (crypto.randomUUID?.() ? `ptz-${crypto.randomUUID()}` : `ptz-${Date.now()}`),
    name: existing.name || getNextPtzPresetName(cameraItem),
    notes: existing.notes || '',
    pan: cameraItem.data?.pan,
    tilt: cameraItem.data?.tilt,
    roll: cameraItem.data?.roll,
    zoom: cameraItem.data?.zoom,
    currentFocalLengthMm: cameraItem.data?.currentFocalLengthMm,
    hfov: cameraItem.data?.hfov,
    projectionDistance: cameraItem.data?.projectionDistance,
    viewportPalette: cameraItem.data?.viewportPalette || getDefaultViewportPalette(cameraItem),
    cameraPosition: { x: cameraItem.object.position.x, y: cameraItem.object.position.y, z: cameraItem.object.position.z },
    cameraRotation: { x: cameraItem.object.rotation.x, y: cameraItem.object.rotation.y, z: cameraItem.object.rotation.z },
    cameraIdentity: getCameraIdentity(cameraItem),
    capturedCameraIdentity: existing.capturedCameraIdentity || getCameraIdentity(cameraItem),
    roi: existing.roi || { width: cameraItem.data?.roiWidth || null, height: cameraItem.data?.roiHeight || null },
    rois: existing.rois || [], activeRoiId: existing.activeRoiId || null,
    depthTarget: cameraItem.data?.depthTarget || null,
    analysis: calculatePresetAnalysis(cameraItem, existing.roi || { width: cameraItem.data?.roiWidth, height: cameraItem.data?.roiHeight }),
    createdAt: existing.createdAt || now,
    updatedAt: now
  });
}

function formatPtzPresetDetails(preset) {
  if (!preset) return 'No preset selected.';
  const a = preset.analysis || {};
  const identity = preset.cameraIdentity || {};
  const captured = preset.capturedCameraIdentity || {};
  const warnings = Array.isArray(preset.limitIssues) ? preset.limitIssues : [];
  return [
    `ID: ${preset.id}`,
    `Current camera: ${identity.make || '-'} ${identity.model || '-'} | ${identity.lens || '-'}`,
    `Captured camera: ${captured.make || '-'} ${captured.model || '-'} | ${captured.lens || '-'}`,
    `PTZ: ${formatMetric(preset.pan)}° / ${formatMetric(preset.tilt)}° / ${formatMetric(preset.roll)}°`,
    `Zoom: ${formatMetric(preset.zoom)}x   Focal: ${preset.currentFocalLengthMm ?? '-'} mm`,
    `HFOV: ${formatMetric(preset.hfov)}°   Depth: ${formatMetric(preset.projectionDistance)} m`,
    `Palette: ${preset.viewportPalette}`,
    `Position: ${formatMetric(preset.cameraPosition.x)}, ${formatMetric(preset.cameraPosition.y)}, ${formatMetric(preset.cameraPosition.z)}`,
    `Footprint: ${formatMetric(a.footprintWidth || 0)} x ${formatMetric(a.footprintHeight || 0)} m`,
    `Density: ${formatMetric(a.horizontalPixelDensity || 0)} x ${formatMetric(a.verticalPixelDensity || 0)} px/m`,
    a.roiPixelsX !== null && a.roiPixelsY !== null ? `ROI pixels: ${formatMetric(a.roiPixelsX)} x ${formatMetric(a.roiPixelsY)} | ${a.thermographyClass}` : `Thermography: ${a.thermographyClass || 'ROI not configured'}`,
    warnings.length ? `LIMIT WARNING: ${warnings.join('; ')}` : 'Limits: compatible',
    preset.notes ? `Notes: ${preset.notes}` : ''
  ].filter(Boolean).join('\n');
}

function formatLiveCameraAnalysis(cameraItem, roi = {}) {
  if (!cameraItem?.data) return 'Live camera analysis is unavailable.';
  const analysis = calculatePresetAnalysis(cameraItem, roi);
  const target = cameraItem.data.depthTarget;
  return [
    `Live PTZ: ${formatMetric(Number(cameraItem.data.pan) || 0)}° / ${formatMetric(Number(cameraItem.data.tilt) || 0)}° / ${formatMetric(Number(cameraItem.data.roll) || 0)}°`,
    `Zoom: ${formatMetric(Number(cameraItem.data.zoom) || 1)}x   HFOV: ${formatMetric(analysis.hfov)}°`,
    `Depth: ${formatMetric(analysis.depth)} m${target ? ` — ${target.objectName || 'selected surface'}` : ' — no surface selected'}`,
    `Footprint: ${formatMetric(analysis.footprintWidth)} x ${formatMetric(analysis.footprintHeight)} m`,
    `Pixel density: ${formatMetric(analysis.horizontalPixelDensity)} x ${formatMetric(analysis.verticalPixelDensity)} px/m`,
    analysis.roiPixelsX !== null && analysis.roiPixelsY !== null
      ? `ROI pixels: ${formatMetric(analysis.roiPixelsX)} x ${formatMetric(analysis.roiPixelsY)} — ${analysis.thermographyClass}`
      : `Thermography: ${analysis.thermographyClass}`
  ].join('\n');
}

function getCameraIdentity(cameraItem) {
  return {
    make: cameraItem.data?.make || '',
    model: cameraItem.data?.model || '',
    lens: cameraItem.data?.lens || '',
    resolutionWidth: Number(cameraItem.data?.resolutionWidth) || 0,
    resolutionHeight: Number(cameraItem.data?.resolutionHeight) || 0
  };
}

function getPresetLimitIssues(cameraItem, preset) {
  const issues = [];
  if (!cameraItem.data?.supportsPan && Math.abs(Number(preset.pan) || 0) > 0.01) issues.push('pan unavailable');
  if (!cameraItem.data?.supportsTilt && Math.abs(Number(preset.tilt) || 0) > 0.01) issues.push('tilt unavailable');
  if (!cameraItem.data?.supportsZoom && Math.abs((Number(preset.zoom) || 1) - 1) > 0.01) issues.push('optical zoom unavailable');
  const focal = Number(preset.currentFocalLengthMm);
  const min = Number(cameraItem.data?.focalLengthMinMm);
  const max = Number(cameraItem.data?.focalLengthMaxMm);
  if (Number.isFinite(focal) && Number.isFinite(min) && focal < min - 0.001) issues.push(`focal length below ${min} mm`);
  if (Number.isFinite(focal) && Number.isFinite(max) && focal > max + 0.001) issues.push(`focal length above ${max} mm`);
  return issues;
}

function refreshCameraPresetDerivedData(cameraItem) {
  if (!cameraItem?.data) return [];
  const identity = getCameraIdentity(cameraItem);
  const presets = ensureCameraPtzPresets(cameraItem);
  presets.forEach(preset => {
    preset.cameraIdentity = { ...identity };
    preset.limitIssues = getPresetLimitIssues(cameraItem, preset);
    preset.analysis = calculatePresetAnalysis(cameraItem, preset.roi, {
      projectionDistance: preset.projectionDistance,
      hfov: preset.hfov
    });
  });
  if (ptzPresetPanel && activePresetCamera?.id === cameraItem.id && !ptzPresetPanel.classList.contains('hidden')) {
    ptzPresetPanel.refreshDerived?.();
  }
  return presets;
}

function invalidateActivePtzPreset(cameraItem, message = 'Manual camera movement: no preset is active.') {
  if (!cameraItem?.data) return;
  cameraItem.data.activePtzPresetId = null;
  editingPresetRoiId = null;
  refreshPresetRoiOverlays(cameraItem);
  if (ptzPresetPanel && activePresetCamera?.id === cameraItem.id) {
    ptzPresetPanel.refreshDerived?.();
    ptzPresetPanel.querySelector('.ptz-preset-status').textContent = message || 'Camera moved; recall a preset to display its ROIs.';
  }
}

function syncCameraPalette(cameraItem, paletteKey) {
  cameraItem.data.viewportPalette = paletteKey;
  [...videoWallRecords, ...popupVideoWallRecords]
    .filter(record => record.item?.id === cameraItem.id)
    .forEach(record => {
      record.palette = paletteKey;
      if (record.paletteSelect) record.paletteSelect.value = paletteKey;
      applyViewportPalette(record.renderer, paletteKey);
    });
  openCameraViewports
    .filter(record => record.cameraId === cameraItem.id)
    .forEach(record => record.setPalette?.(paletteKey));
}

function cancelCameraPresetAnimation(cameraItem, message = '') {
  if (!cameraItem) return;
  activePtzPresetAnimations.delete(cameraItem.id);
  if (message) invalidateActivePtzPreset(cameraItem, message);
}

function shortestAngleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function applyAnimatedOpticalState(cameraItem, focalLength, fallbackZoom, fallbackHfov) {
  const min = Number(cameraItem.data?.focalLengthMinMm);
  const max = Number(cameraItem.data?.focalLengthMaxMm);
  if (Number.isFinite(focalLength) && Number.isFinite(min) && Number.isFinite(max) && max > min) {
    const clamped = THREE.MathUtils.clamp(focalLength, min, max);
    const ratio = (clamped - min) / (max - min);
    cameraItem.data.currentFocalLengthMm = clamped;
    cameraItem.data.zoom = clamped / min;
    cameraItem.data.hfov = cameraItem.data.hfovWide - ratio * (cameraItem.data.hfovWide - cameraItem.data.hfovTele);
  } else {
    cameraItem.data.zoom = fallbackZoom;
    cameraItem.data.hfov = fallbackHfov;
  }
}

function calculatePtzRecallDurationMs(angularTravel, speed, opticalTravel = 0) {
  const safeSpeed = THREE.MathUtils.clamp(Number(speed) || 10, 1, 60);
  return Math.max(100, Number(angularTravel || 0) / safeSpeed * 1000, Number(opticalTravel || 0) * 350);
}

function recallPtzPreset(cameraItem, preset) {
  if (!cameraItem || !preset) return;
  cancelCameraPresetAnimation(cameraItem);
  const startPan = Number(cameraItem.data.pan) || 0;
  const startTilt = Number(cameraItem.data.tilt) || 0;
  const startRoll = Number(cameraItem.data.roll) || 0;
  const angularTravel = Math.max(
    Math.abs(shortestAngleDelta(startPan, preset.pan)),
    Math.abs(preset.tilt - startTilt),
    Math.abs(shortestAngleDelta(startRoll, preset.roll))
  );
  const speed = THREE.MathUtils.clamp(Number(preferences.ptzPresetSpeed) || 10, 1, 60);
  const durationMs = calculatePtzRecallDurationMs(angularTravel, speed, Math.abs((preset.zoom || 1) - (cameraItem.data.zoom || 1)));
  activePtzPresetAnimations.set(cameraItem.id, {
    cameraItem,
    preset,
    startedAt: performance.now(),
    durationMs,
    start: {
      pan: startPan,
      tilt: startTilt,
      roll: startRoll,
      focal: Number(cameraItem.data.currentFocalLengthMm) || null,
      zoom: Number(cameraItem.data.zoom) || 1,
      hfov: Number(cameraItem.data.hfov) || 90,
      depth: Number(cameraItem.data.projectionDistance) || 20
    }
  });
  cameraItem.data.activePtzPresetId = preset.id;
  if (ptzPresetPanel) ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `Recalling ${preset.name} at ${speed.toFixed(0)}°/s (${formatMetric(durationMs / 1000)} s)…`;
}

function updatePtzPresetAnimations(now) {
  activePtzPresetAnimations.forEach((animation, cameraId) => {
    const { cameraItem, preset, start, startedAt, durationMs } = animation;
    const raw = THREE.MathUtils.clamp((now - startedAt) / durationMs, 0, 1);
    const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    cameraItem.data.pan = start.pan + shortestAngleDelta(start.pan, preset.pan) * t;
    cameraItem.data.tilt = THREE.MathUtils.lerp(start.tilt, preset.tilt, t);
    cameraItem.data.roll = start.roll + shortestAngleDelta(start.roll, preset.roll) * t;
    const targetFocal = Number(preset.currentFocalLengthMm);
    const focal = Number.isFinite(start.focal) && Number.isFinite(targetFocal) ? THREE.MathUtils.lerp(start.focal, targetFocal, t) : null;
    applyAnimatedOpticalState(cameraItem, focal, THREE.MathUtils.lerp(start.zoom, preset.zoom, t), THREE.MathUtils.lerp(start.hfov, preset.hfov, t));
    updateProjectionDistance(cameraItem, THREE.MathUtils.lerp(start.depth, preset.projectionDistance, t));
    applyCameraPtzRig(cameraItem);
    if (activePresetCamera?.id === cameraId && !ptzPresetPanel?.classList.contains('hidden')) ptzPresetPanel.refreshLive?.();
    if (raw >= 1) {
      cameraItem.data.pan = preset.pan;
      cameraItem.data.tilt = preset.tilt;
      cameraItem.data.roll = preset.roll;
      applyAnimatedOpticalState(cameraItem, preset.currentFocalLengthMm, preset.zoom, preset.hfov);
      updateProjectionDistance(cameraItem, preset.projectionDistance);
      applyCameraPtzRig(cameraItem);
      syncCameraPalette(cameraItem, preset.viewportPalette);
      cameraItem.data.activePtzPresetId = preset.id;
      refreshCameraPresetDerivedData(cameraItem);
      activePtzPresetAnimations.delete(cameraId);
      if (ptzPresetPanel && activePresetCamera?.id === cameraId) ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `${preset.name} recalled.`;
    }
  });
}

function ensurePtzPresetPanel() {
  if (ptzPresetPanel) return ptzPresetPanel;
  ptzPresetPanel = document.createElement('div');
  ptzPresetPanel.className = 'ptz-preset-panel hidden';
  ptzPresetPanel.innerHTML = `
    <div class="ptz-preset-heading"><h3>PTZ Presets</h3></div>
    <div class="ptz-preset-camera"></div>
    <details class="ptz-preset-section" open><summary>Preset Management</summary>
      <div class="ptz-preset-actions">
        <button type="button" data-action="add">Add Current</button>
        <button type="button" data-action="update">Update Current</button>
        <button type="button" data-action="save">Save Details</button>
      </div>
    </details>
    <details class="ptz-preset-section"><summary>Name</summary>
      <label>Name<input class="ptz-preset-name" type="text" maxlength="80"></label>
    </details>
    <details class="ptz-preset-section"><summary>Target and Movement</summary>
      <div class="ptz-preset-speed"><span>Target ROI (m)</span><input class="ptz-preset-roi-width" type="number" min="0" step="0.001" placeholder="Width"><input class="ptz-preset-roi-height" type="number" min="0" step="0.001" placeholder="Height"></div>
      <label class="ptz-preset-speed">Movement speed<input class="ptz-preset-speed-input" type="range" min="1" max="60" step="1"><output class="ptz-preset-speed-value"></output></label>
      <div class="ptz-preset-actions"><button type="button" data-action="depth">Select Depth Surface</button></div>
    </details>
    <details class="ptz-preset-section"><summary>Presets</summary>
      <label>Existing presets<select class="ptz-preset-list" size="3"></select></label>
      <div class="ptz-preset-actions"><button type="button" data-action="recall">Recall</button><button type="button" data-action="delete">Delete</button></div>
    </details>
    <details class="ptz-preset-section"><summary>ROI Management</summary><label>ROIs<select class="ptz-roi-list" size="3"></select></label><label>Name<input class="ptz-roi-name" maxlength="80"></label><div class="ptz-roi-analysis"></div><label>Notes<textarea class="ptz-roi-notes" maxlength="500"></textarea></label><div class="ptz-preset-actions"><button type="button" data-action="roi-add">Add ROI</button><button type="button" data-action="roi-edit">Edit ROI</button><button type="button" data-action="roi-delete">Delete ROI</button><button type="button" data-action="roi-toggle">Show / Hide</button></div><div class="ptz-roi-help">Drag nodes; click an edge to add; right-click a node to delete (3-15 nodes).</div></details>
    <details class="ptz-preset-section"><summary>Live Pixel Density</summary><div class="ptz-live-analysis"></div><div class="ptz-preset-details"></div></details>
    <details class="ptz-preset-section"><summary>Notes</summary><label>Notes<textarea class="ptz-preset-notes" maxlength="1000"></textarea></label></details>
    <div class="ptz-preset-status"></div>`;
  document.body.appendChild(ptzPresetPanel);
  const list = ptzPresetPanel.querySelector('.ptz-preset-list');
  const speed = ptzPresetPanel.querySelector('.ptz-preset-speed-input');
  const speedValue = ptzPresetPanel.querySelector('.ptz-preset-speed-value');
  const roiList=ptzPresetPanel.querySelector('.ptz-roi-list');
  const selectedPreset = () => ensureCameraPtzPresets(activePresetCamera).find(preset => preset.id === list.value);
  const selectedRoi=()=>selectedPreset()?.rois?.find(roi=>roi.id===roiList.value);
  const currentRoi = () => ({
    width: Number(ptzPresetPanel.querySelector('.ptz-preset-roi-width').value) || null,
    height: Number(ptzPresetPanel.querySelector('.ptz-preset-roi-height').value) || null
  });
  const refreshLive = () => {
    ptzPresetPanel.querySelector('.ptz-live-analysis').textContent = formatLiveCameraAnalysis(activePresetCamera, currentRoi());
    ptzPresetPanel.querySelector('.ptz-roi-analysis').textContent=formatPresetRoiAnalysis(selectedRoi());
    refreshPresetRoiOverlays(activePresetCamera);
  };
  const refresh = (selectedId = list.value, options = {}) => {
    const presets = refreshCameraPresetDerivedData(activePresetCamera);
    list.replaceChildren(...presets.map(preset => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      option.classList.toggle('limit-warning', preset.limitIssues.length > 0);
      if (preset.limitIssues.length) option.style.color = '#ff3b3b';
      option.title = preset.limitIssues.length ? preset.limitIssues.join('; ') : 'Compatible with current camera';
      return option;
    }));
    if (options.clearSelection) list.selectedIndex = -1;
    else if (presets.some(preset => preset.id === selectedId)) list.value = selectedId;
    else if (presets[0]) list.value = presets[0].id;
    const preset = selectedPreset();
    roiList.replaceChildren(...(preset?.rois||[]).map(roi=>{const option=document.createElement('option');option.value=roi.id;option.textContent=roi.name;return option}));if(preset?.activeRoiId)roiList.value=preset.activeRoiId;const roiItem=selectedRoi();ptzPresetPanel.querySelector('.ptz-roi-name').value=roiItem?.name||'';ptzPresetPanel.querySelector('.ptz-roi-notes').value=roiItem?.notes||'';
    ptzPresetPanel.querySelector('.ptz-preset-name').value = preset?.name || '';
    ptzPresetPanel.querySelector('.ptz-preset-notes').value = preset?.notes || '';
    ptzPresetPanel.querySelector('.ptz-preset-roi-width').value = preset?.roi?.width ? formatMetric(preset.roi.width) : '';
    ptzPresetPanel.querySelector('.ptz-preset-roi-height').value = preset?.roi?.height ? formatMetric(preset.roi.height) : '';
    const details = ptzPresetPanel.querySelector('.ptz-preset-details');
    details.textContent = formatPtzPresetDetails(preset);
    details.classList.toggle('ptz-preset-limit-warning', Boolean(preset?.limitIssues?.length));
    refreshLive();
  };
  list.addEventListener('change', () => refresh(list.value));
  roiList.addEventListener('change',()=>{const p=selectedPreset();if(p)p.activeRoiId=roiList.value||null;editingPresetRoiId=null;refreshLive()});
  for(const field of ptzPresetPanel.querySelectorAll('.ptz-roi-name,.ptz-roi-notes'))field.addEventListener('input',()=>{const r=selectedRoi();if(!r)return;r.name=ptzPresetPanel.querySelector('.ptz-roi-name').value.trim()||r.name;r.notes=ptzPresetPanel.querySelector('.ptz-roi-notes').value;r.updatedAt=new Date().toISOString();refreshLive()});
  const updateMetadataPreview = () => {
    const preset = selectedPreset();
    if (!preset) return;
    const roi = {
      width: Number(ptzPresetPanel.querySelector('.ptz-preset-roi-width').value) || null,
      height: Number(ptzPresetPanel.querySelector('.ptz-preset-roi-height').value) || null
    };
    const draft = {
      ...preset,
      name: ptzPresetPanel.querySelector('.ptz-preset-name').value.trim() || preset.name,
      notes: ptzPresetPanel.querySelector('.ptz-preset-notes').value,
      roi,
      analysis: calculatePresetAnalysis(activePresetCamera, roi, {
        projectionDistance: preset.projectionDistance,
        hfov: preset.hfov
      })
    };
    const details = ptzPresetPanel.querySelector('.ptz-preset-details');
    details.textContent = formatPtzPresetDetails(draft);
    details.classList.toggle('ptz-preset-limit-warning', Boolean(draft.limitIssues?.length));
    refreshLive();
  };
  for (const field of ptzPresetPanel.querySelectorAll('.ptz-preset-name, .ptz-preset-notes, .ptz-preset-roi-width, .ptz-preset-roi-height')) {
    field.addEventListener('input', updateMetadataPreview);
  }
  speed.addEventListener('input', () => {
    preferences.ptzPresetSpeed = THREE.MathUtils.clamp(Number(speed.value) || 10, 1, 60);
    speedValue.textContent = `${preferences.ptzPresetSpeed.toFixed(0)}°/s`;
    savePreferences();
    const animation = activePtzPresetAnimations.get(activePresetCamera?.id);
    if (animation) recallPtzPreset(activePresetCamera, animation.preset);
  });
  ptzPresetPanel.addEventListener('click', event => {
    const action = event.target.dataset.action;
    if (!action || !activePresetCamera) return;
    const preset = selectedPreset();
    if (action === 'recall') {
      if (preset) recallPtzPreset(activePresetCamera, preset);
      return;
    }
    const nameField = ptzPresetPanel.querySelector('.ptz-preset-name');
    const notesField = ptzPresetPanel.querySelector('.ptz-preset-notes');
    const roi = { width: Number(ptzPresetPanel.querySelector('.ptz-preset-roi-width').value) || null, height: Number(ptzPresetPanel.querySelector('.ptz-preset-roi-height').value) || null };
    if (action === 'add') {
      const enteredName = nameField.value.trim();
      const explicitNewName = enteredName && (!preset || enteredName !== preset.name) ? enteredName : undefined;
      const created = captureCameraPreset(activePresetCamera, { name: explicitNewName || getNextPtzPresetName(activePresetCamera), notes: notesField.value.trim(), roi });
      ensureCameraPtzPresets(activePresetCamera).push(created);
      refresh(created.id);
      ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `${created.name} added from the current camera view.`;
    }
    if (action === 'update' && preset) {
      const updated = captureCameraPreset(activePresetCamera, { ...preset, name: nameField.value.trim() || getNextPtzPresetName(activePresetCamera), notes: notesField.value.trim(), roi });
      const index = activePresetCamera.data.ptzPresets.findIndex(entry => entry.id === preset.id);
      activePresetCamera.data.ptzPresets[index] = updated;
      refresh(updated.id);
      ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `${updated.name} updated from the current camera view.`;
    }
    if (action === 'save' && preset) {
      preset.name = nameField.value.trim() || getNextPtzPresetName(activePresetCamera);
      preset.notes = notesField.value.trim();
      preset.roi = roi;
      preset.analysis = calculatePresetAnalysis(activePresetCamera, roi);
      preset.updatedAt = new Date().toISOString();
      refresh(preset.id);
      ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `${preset.name} details saved without changing its PTZ position.`;
    }
    if (action === 'depth') {
      if (!preset) {
        ptzPresetPanel.querySelector('.ptz-preset-status').textContent = 'Select a preset before choosing its depth surface.';
        return;
      }
      if (!nameField.value.trim()) {
        preset.name = getNextPtzPresetName(activePresetCamera);
        preset.updatedAt = new Date().toISOString();
        nameField.value = preset.name;
      }
      beginPresetDepthSelection(activePresetCamera, preset, ptzPresetPanel.parentElement);
    }
    if(action==='roi-add'){if(!preset?.depthTarget){ptzPresetPanel.querySelector('.ptz-preset-status').textContent='Select a depth surface first.'}else beginPresetRoiCreation(activePresetCamera,preset,ptzPresetPanel.parentElement)}
    if(action==='roi-edit'){const roi=selectedRoi();editingPresetRoiId=editingPresetRoiId===roi?.id?null:(roi?.id||null);refreshLive();const button=ptzPresetPanel.querySelector('[data-action=\"roi-edit\"]');if(button)button.textContent=editingPresetRoiId?'Finish Editing':'Edit ROI'}
    if(action==='roi-toggle'&&selectedRoi()){selectedRoi().visible=!selectedRoi().visible;refreshLive()}
    if(action==='roi-delete'&&preset&&selectedRoi()&&confirm(`Delete ROI "${selectedRoi().name}"?`)){const id=selectedRoi().id;preset.rois=preset.rois.filter(r=>r.id!==id);preset.activeRoiId=preset.rois[0]?.id||null;editingPresetRoiId=null;refresh(preset.id)}
    if (action === 'delete' && preset && confirm(`Delete PTZ preset "${preset.name}"?`)) {
      activePresetCamera.data.ptzPresets = activePresetCamera.data.ptzPresets.filter(entry => entry.id !== preset.id);
      refresh();
      ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `${preset.name} deleted.`;
    }
  });
  ptzPresetPanel.refresh = refresh;
  ptzPresetPanel.refreshLive = refreshLive;
  ptzPresetPanel.refreshDerived = () => {
    const preset = selectedPreset();
    [...list.options].forEach(option => {
      const current = ensureCameraPtzPresets(activePresetCamera).find(entry => entry.id === option.value);
      option.classList.toggle('limit-warning', Boolean(current?.limitIssues?.length));
      option.style.color = current?.limitIssues?.length ? '#ff3b3b' : '';
    });
    const details = ptzPresetPanel.querySelector('.ptz-preset-details');
    details.textContent = formatPtzPresetDetails(preset);
    details.classList.toggle('ptz-preset-limit-warning', Boolean(preset?.limitIssues?.length));
    ptzPresetPanel.querySelector('.ptz-preset-camera').textContent = `${activePresetCamera.name} — ${activePresetCamera.data?.make || ''} ${activePresetCamera.data?.model || ''}`.trim();
    refreshLive();
  };
  return ptzPresetPanel;
}

function closePtzPresetPanel() {
  if (!ptzPresetPanel) return;
  ptzPresetPanel.classList.add('hidden');
  const owner = ptzPresetPanel.parentElement;
  owner?.setPresetDockOpen?.(false);
}

function togglePtzPresetPanel(cameraItem, viewportElement = null) {
  if (!cameraItem || cameraItem.type !== 'camera') return false;
  const requestedOwner = viewportElement?.closest?.('.video-wall-tile') || viewportElement;
  const isSameOpenPanel = ptzPresetPanel &&
    !ptzPresetPanel.classList.contains('hidden') &&
    activePresetCamera?.id === cameraItem.id &&
    (!requestedOwner || ptzPresetPanel.parentElement === requestedOwner);
  if (isSameOpenPanel) {
    closePtzPresetPanel();
    return false;
  }
  openPtzPresetPanel(cameraItem, viewportElement);
  return true;
}

function openPtzPresetPanel(cameraItem, viewportElement = null) {
  if (!cameraItem || cameraItem.type !== 'camera') return;
  const wallTile = viewportElement?.closest?.('.video-wall-tile');
  let ownerViewport = wallTile;
  if (!ownerViewport) {
    let viewportRecord = openCameraViewports.find(record => record.cameraId === cameraItem.id);
    if (!viewportRecord) viewportRecord = openCameraViewport(cameraItem);
    if (!viewportRecord) return;
    viewportRecord.maximize?.();
    ownerViewport = viewportElement || viewportRecord.element;
  }
  activePresetCamera = cameraItem;
  const panel = ensurePtzPresetPanel();
  const previousViewport = panel.parentElement;
  if (previousViewport && previousViewport !== ownerViewport) previousViewport.setPresetDockOpen?.(false);
  ownerViewport.appendChild(panel);
  ownerViewport.setPresetDockOpen?.(true);
  panel.querySelector('.ptz-preset-camera').textContent = `${cameraItem.name} — ${cameraItem.data?.make || ''} ${cameraItem.data?.model || ''}`.trim();
  const speed = panel.querySelector('.ptz-preset-speed-input');
  speed.value = String(preferences.ptzPresetSpeed);
  panel.querySelector('.ptz-preset-speed-value').textContent = `${Number(preferences.ptzPresetSpeed).toFixed(0)}°/s`;
  panel.querySelector('.ptz-preset-status').textContent = '';
  panel.refresh(cameraItem.data?.activePtzPresetId || undefined, { clearSelection: !cameraItem.data?.activePtzPresetId });
  panel.classList.remove('hidden');
}

function ensurePresetDepthPickBanner() {
  if (presetDepthPickBanner) return presetDepthPickBanner;
  presetDepthPickBanner = document.createElement('div');
  presetDepthPickBanner.className = 'preset-depth-pick-banner';
  document.body.appendChild(presetDepthPickBanner);
  return presetDepthPickBanner;
}

function endPresetDepthSelection() {
  pendingPresetDepthCamera = null;
  pendingPresetDepthPresetId = null;
  pendingPresetDepthDock = null;
  pendingPresetDepthStage = null;
  pendingPresetRoiDrawing?.overlay?.remove();
  pendingPresetRoiDrawing = null;
  pendingPresetRoiDraft = null;
  presetDepthPickBanner?.remove();
  presetDepthPickBanner = null;
  document.body.classList.remove('preset-depth-pick-active');
}

function beginPresetRoiCreation(cameraItem,preset,dock){pendingPresetDepthCamera=cameraItem;pendingPresetDepthPresetId=preset.id;pendingPresetDepthDock=dock?.closest?.('.camera-viewport, .video-wall-tile')||dock;pendingPresetDepthStage='roi';pendingPresetRoiDraft={depthTarget:{...preset.depthTarget},projectionDistance:preset.projectionDistance};const banner=ensurePresetDepthPickBanner();banner.textContent=`Add ROI for ${preset.name}: drag a rectangle in ${cameraItem.name} Camera View; Esc cancels.`;document.body.classList.add('preset-depth-pick-active');setPresetWorkflowStatus(banner.textContent)}

function beginPresetDepthSelection(cameraItem, preset, dock) {
  pendingPresetDepthCamera = cameraItem;
  pendingPresetDepthPresetId = preset.id;
  pendingPresetDepthDock = dock?.closest?.('.camera-viewport, .video-wall-tile') || dock;
  pendingPresetDepthStage = 'depth';
  const banner = ensurePresetDepthPickBanner();
  banner.textContent = `Depth selection armed for ${preset.name}. Click a visible model/reference surface inside ${cameraItem.name} Camera View; Esc cancels.`;
  document.body.classList.add('preset-depth-pick-active');
  setPresetWorkflowStatus(banner.textContent);
}

function pickCameraViewportSurface(event, viewportCamera, canvas) {
  const rect = canvas.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  viewportCamera.updateMatrixWorld(true);
  raycaster.setFromCamera(pointer, viewportCamera);
  const intersection = raycaster.intersectObjects(getMeasurementTargets(), true)[0];
  return intersection ? { point: intersection.point.clone(), intersection } : null;
}

function completePresetDepthSelection(cameraItem, pick) {
  cameraItem.object.updateMatrixWorld(true);
  const cameraPosition = cameraItem.object.userData.renderCamera?.getWorldPosition(new THREE.Vector3()) || cameraItem.object.getWorldPosition(new THREE.Vector3());
  const distance = cameraPosition.distanceTo(pick.point);
  const hitMesh = pick.intersection.object;
  const targetItem = sceneObjects.find(item => {
    let contains = false;
    item.object?.traverse?.(child => { if (child === hitMesh) contains = true; });
    return contains;
  });
  const depthTarget = {
    objectId: targetItem?.id || null,
    objectName: targetItem?.name || hitMesh.name || 'Surface',
    point: { x: pick.point.x, y: pick.point.y, z: pick.point.z },
    distance,
    selectedAt: new Date().toISOString()
  };
  cameraItem.data.depthTarget = depthTarget;
  updateProjectionDistance(cameraItem, distance);
  const preset = ensureCameraPtzPresets(cameraItem).find(entry => entry.id === pendingPresetDepthPresetId);
  if (preset) {
    preset.depthTarget = { ...depthTarget };
    preset.projectionDistance = distance;
    preset.analysis = calculatePresetAnalysis(cameraItem, preset.roi, { projectionDistance: distance, hfov: preset.hfov });
    preset.updatedAt = new Date().toISOString();
    pendingPresetRoiDraft={depthTarget:{...depthTarget},projectionDistance:distance};
  }
  const dock=pendingPresetDepthDock; cameraItem.data.activePtzPresetId=preset?.id||cameraItem.data.activePtzPresetId; const message=`Depth set to ${formatMetric(distance)} m. Use Add ROI to draw one or more regions on this surface.`; endPresetDepthSelection(); openPtzPresetPanel(cameraItem,dock); const status=ptzPresetPanel?.querySelector('.ptz-preset-status'); if(status)status.textContent=message;
}

function refreshPresetRoiOverlays(cameraItem=null){for(let i=presetRoiOverlayContexts.length-1;i>=0;i--){const c=presetRoiOverlayContexts[i];if(!c.host.isConnected){presetRoiOverlayContexts.splice(i,1);continue}if(cameraItem&&c.cameraItem.id!==cameraItem.id)continue;c.svg?.remove();const activePresetId=c.cameraItem.data?.activePtzPresetId;const preset=activePresetId?ensureCameraPtzPresets(c.cameraItem).find(p=>p.id===activePresetId):null;if(!preset?.rois?.length)continue;const rect=c.canvas.getBoundingClientRect(),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('preset-roi-svg');svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);const hostRect=c.host.getBoundingClientRect();svg.style.inset='auto';svg.style.left=`${rect.left-hostRect.left}px`;svg.style.top=`${rect.top-hostRect.top}px`;svg.style.width=`${rect.width}px`;svg.style.height=`${rect.height}px`;c.host.appendChild(svg);c.svg=svg;for(const roi of preset.rois.filter(r=>r.visible!==false&&r.nodes?.length>=3)){const poly=document.createElementNS(svg.namespaceURI,'polygon');poly.setAttribute('points',roi.nodes.map(n=>`${n.x*rect.width},${n.y*rect.height}`).join(' '));poly.setAttribute('stroke',roi.color);poly.setAttribute('fill',roi.color+'22');svg.appendChild(poly);const label=document.createElementNS(svg.namespaceURI,'text');label.textContent=roi.name;label.setAttribute('x',roi.nodes[0].x*rect.width+5);label.setAttribute('y',roi.nodes[0].y*rect.height-5);svg.appendChild(label);if(editingPresetRoiId!==roi.id)continue;svg.classList.add('editing');roi.nodes.forEach((node,index)=>{const next=roi.nodes[(index+1)%roi.nodes.length],edge=document.createElementNS(svg.namespaceURI,'line');edge.setAttribute('x1',node.x*rect.width);edge.setAttribute('y1',node.y*rect.height);edge.setAttribute('x2',next.x*rect.width);edge.setAttribute('y2',next.y*rect.height);edge.classList.add('preset-roi-edge');edge.onclick=e=>{if(roi.nodes.length>=15)return;const r=c.canvas.getBoundingClientRect();roi.nodes.splice(index+1,0,{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height});updateEditableRoiMetrics(c.cameraItem,preset,roi)};svg.appendChild(edge);const h=document.createElementNS(svg.namespaceURI,'circle');h.setAttribute('cx',node.x*rect.width);h.setAttribute('cy',node.y*rect.height);h.setAttribute('r',6);h.classList.add('preset-roi-node');h.oncontextmenu=e=>{e.preventDefault();if(roi.nodes.length>3){roi.nodes.splice(index,1);updateEditableRoiMetrics(c.cameraItem,preset,roi)}};h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const move=v=>{const r=c.canvas.getBoundingClientRect();node.x=THREE.MathUtils.clamp((v.clientX-r.left)/r.width,0,1);node.y=THREE.MathUtils.clamp((v.clientY-r.top)/r.height,0,1);roi.metrics=calculatePolygonRoiMetrics(c.cameraItem,roi,{projectionDistance:roi.projectionDistance,hfov:preset.hfov});const analysisBox=ptzPresetPanel?.querySelector('.ptz-roi-analysis');if(analysisBox)analysisBox.textContent=formatPresetRoiAnalysis(roi);h.setAttribute('cx',node.x*r.width);h.setAttribute('cy',node.y*r.height);poly.setAttribute('points',roi.nodes.map(n=>`${n.x*r.width},${n.y*r.height}`).join(' '));if(index===0){label.setAttribute('x',node.x*r.width+5);label.setAttribute('y',node.y*r.height-5)}};const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);updateEditableRoiMetrics(c.cameraItem,preset,roi)};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up)};svg.appendChild(h)})}}}
function updateEditableRoiMetrics(cameraItem,preset,roi){roi.metrics=calculatePolygonRoiMetrics(cameraItem,roi,{projectionDistance:roi.projectionDistance,hfov:preset.hfov});roi.updatedAt=new Date().toISOString();preset.updatedAt=roi.updatedAt;ptzPresetPanel?.refreshLive?.()}

function attachPresetRoiDrawing(host, canvas, cameraItem) {
  if(!presetRoiOverlayContexts.some(context=>context.host===host))presetRoiOverlayContexts.push({host,canvas,cameraItem,svg:null});
  host.addEventListener('pointerdown', event => {
    if (pendingPresetDepthStage !== 'roi' || pendingPresetDepthCamera?.id !== cameraItem.id) return;
    const rect = canvas.getBoundingClientRect();
    const startX = THREE.MathUtils.clamp(event.clientX - rect.left, 0, rect.width);
    const startY = THREE.MathUtils.clamp(event.clientY - rect.top, 0, rect.height);
    const overlay = document.createElement('div');
    overlay.className = 'preset-roi-overlay';
    host.appendChild(overlay);
    const hostRect = host.getBoundingClientRect();
    const offsetX = rect.left - hostRect.left;
    const offsetY = rect.top - hostRect.top;
    pendingPresetRoiDrawing = { host, canvas, cameraItem, startX, startY, currentX: startX, currentY: startY, overlay, offsetX, offsetY };
    overlay.style.left = `${offsetX + startX}px`;
    overlay.style.top = `${offsetY + startY}px`;
    overlay.style.width = '1px';
    overlay.style.height = '1px';
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  host.addEventListener('pointermove', event => {
    const drawing = pendingPresetRoiDrawing;
    if (!drawing || drawing.host !== host) return;
    const rect = canvas.getBoundingClientRect();
    drawing.currentX = THREE.MathUtils.clamp(event.clientX - rect.left, 0, rect.width);
    drawing.currentY = THREE.MathUtils.clamp(event.clientY - rect.top, 0, rect.height);
    const left = Math.min(drawing.startX, drawing.currentX);
    const top = Math.min(drawing.startY, drawing.currentY);
    drawing.overlay.style.left = `${drawing.offsetX + left}px`;
    drawing.overlay.style.top = `${drawing.offsetY + top}px`;
    drawing.overlay.style.width = `${Math.abs(drawing.currentX - drawing.startX)}px`;
    drawing.overlay.style.height = `${Math.abs(drawing.currentY - drawing.startY)}px`;
    event.preventDefault();
  }, true);
  host.addEventListener('pointerup', event => {
    const drawing = pendingPresetRoiDrawing;
    if (!drawing || drawing.host !== host) return;
    const rect = canvas.getBoundingClientRect();
    const pixelWidthOnCanvas = Math.abs(drawing.currentX - drawing.startX);
    const pixelHeightOnCanvas = Math.abs(drawing.currentY - drawing.startY);
    if (pixelWidthOnCanvas < 4 || pixelHeightOnCanvas < 4) {
      drawing.overlay.remove();
      pendingPresetRoiDrawing = null;
      setPresetWorkflowStatus('ROI is too small. Drag a rectangle at least 4 screen pixels wide and high.');
      return;
    }
    const preset = ensureCameraPtzPresets(cameraItem).find(entry => entry.id === pendingPresetDepthPresetId);
    if (!preset) return endPresetDepthSelection();
    const analysis = calculatePresetAnalysis(cameraItem, {}, { projectionDistance: preset.projectionDistance, hfov: preset.hfov });
    const normalizedWidth = pixelWidthOnCanvas / Math.max(1, rect.width);
    const normalizedHeight = pixelHeightOnCanvas / Math.max(1, rect.height);
    const legacyRoi = {
      width: analysis.footprintWidth * normalizedWidth,
      height: analysis.footprintHeight * normalizedHeight,
      pixelWidth: Math.max(1, Math.round(analysis.resolutionWidth * normalizedWidth)),
      pixelHeight: Math.max(1, Math.round(analysis.resolutionHeight * normalizedHeight)),
      normalized: {
        x: Math.min(drawing.startX, drawing.currentX) / Math.max(1, rect.width),
        y: Math.min(drawing.startY, drawing.currentY) / Math.max(1, rect.height),
        width: normalizedWidth,
        height: normalizedHeight
      }
    };
    const roi=normalizePresetRoi({name:getNextPresetRoiName(preset),nodes:[{x:legacyRoi.normalized.x,y:legacyRoi.normalized.y},{x:legacyRoi.normalized.x+legacyRoi.normalized.width,y:legacyRoi.normalized.y},{x:legacyRoi.normalized.x+legacyRoi.normalized.width,y:legacyRoi.normalized.y+legacyRoi.normalized.height},{x:legacyRoi.normalized.x,y:legacyRoi.normalized.y+legacyRoi.normalized.height}],depthTarget:pendingPresetRoiDraft?.depthTarget||preset.depthTarget,projectionDistance:pendingPresetRoiDraft?.projectionDistance||preset.projectionDistance},preset.rois?.length||0);roi.metrics=calculatePolygonRoiMetrics(cameraItem,roi,{projectionDistance:roi.projectionDistance,hfov:preset.hfov});preset.rois=[...(preset.rois||[]),roi];preset.activeRoiId=roi.id;cameraItem.data.activePtzPresetId=preset.id;preset.roi=legacyRoi;preset.analysis={...roi.metrics,roiPixelsX:roi.metrics.pixelWidth,roiPixelsY:roi.metrics.pixelHeight};preset.updatedAt=new Date().toISOString();const dock=pendingPresetDepthDock;const result=`${preset.name} / ${roi.name}: ${roi.metrics.pixelWidth} x ${roi.metrics.pixelHeight} pixels - ${roi.metrics.thermographyClass}.`;endPresetDepthSelection();openPtzPresetPanel(cameraItem,dock);const status=ptzPresetPanel?.querySelector('.ptz-preset-status');if(status)status.textContent=result;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}

renderer.domElement.addEventListener('click', event => {
  if (!pendingPresetDepthCamera || pendingPresetDepthStage !== 'depth') return;
  const cameraItem = pendingPresetDepthCamera;
  const pick = pickMeasurementPoint(event);
  if (!pick) {
    setPresetWorkflowStatus('No model/reference surface was hit. Select a visible surface for preset depth.');
    event.stopImmediatePropagation();
    return;
  }
  completePresetDepthSelection(cameraItem, pick);

  event.preventDefault();
  event.stopImmediatePropagation();
}, true);
function createWallTile(doc, host, source, records, onDrop, options = {}) {
  const tile = doc.createElement('div');
  tile.className = 'video-wall-tile';
  tile.dataset.sourceKey = source.key;
  tile.dataset.tileIndex = String(options.tileIndex ?? records.length);
  const renderPane = doc.createElement('div');
  renderPane.className = 'video-wall-render-pane';
  renderPane.style.display = 'grid';
  renderPane.style.placeItems = 'center';
  tile.appendChild(renderPane);
  tile.style.setProperty('--preset-panel-percent',`${videoWallPresetPanelPercent}%`);
  const presetResizer=doc.createElement('div');presetResizer.className='video-wall-preset-resizer';presetResizer.title='Drag to resize PTZ Presets';tile.appendChild(presetResizer);presetResizer.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();presetResizer.classList.add('dragging');presetResizer.setPointerCapture?.(event.pointerId);const move=moveEvent=>{const rect=tile.getBoundingClientRect();videoWallPresetPanelPercent=THREE.MathUtils.clamp((rect.right-moveEvent.clientX)/Math.max(1,rect.width)*100,15,50);tile.style.setProperty('--preset-panel-percent',`${videoWallPresetPanelPercent}%`);window.dispatchEvent(new Event('resize'))};const up=()=>{presetResizer.classList.remove('dragging');presetResizer.removeEventListener('pointermove',move)};presetResizer.addEventListener('pointermove',move);presetResizer.addEventListener('pointerup',up,{once:true})});
  const label = doc.createElement('div');
  label.className = 'video-wall-label';
  label.textContent = source.label;
  label.draggable = true;
  label.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', source.key));
  tile.addEventListener('dragover', event => { event.preventDefault(); tile.classList.add('drag-over'); });
  tile.addEventListener('dragleave', () => tile.classList.remove('drag-over'));
  tile.addEventListener('drop', event => {
    event.preventDefault();
    tile.classList.remove('drag-over');
    onDrop(event.dataTransfer.getData('text/plain'), source.key);
  });
  tile.addEventListener('click', () => options.onSelect?.(Number(tile.dataset.tileIndex)));
  renderPane.appendChild(label);
  host.appendChild(tile);

  const wallRenderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderPane.appendChild(wallRenderer.domElement);
  configureRendererQuality(wallRenderer);
  const wallCamera = new THREE.PerspectiveCamera(60, 1, 0.01, 10000);
  const record = {
    sourceKey: source.key,
    item: source.item,
    renderer: wallRenderer,
    camera: wallCamera,
    host: renderPane,
    hostTile: tile,
    tileIndex: Number(tile.dataset.tileIndex),
    palette: source.item?.data?.viewportPalette || (source.item ? getDefaultViewportPalette(source.item) : 'visible'),
    ptzEnabled: Boolean(videoWallPtzEnabledBySource.get(source.key)),
    ptzDragging: false,
    lastX: 0,
    lastY: 0
  };
  let presetToggleButton = null;
  tile.setPresetDockOpen = open => {
    tile.classList.toggle('has-preset-dock', Boolean(open));
    tile.classList.toggle('preset-dock-vertical', Boolean(open && options.presetDockVertical));
    presetToggleButton?.classList.toggle('active', Boolean(open));
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  };
  records.push(record);
  applyViewportPalette(wallRenderer, record.palette);

  const controls = doc.createElement('div');
  controls.className = 'video-wall-tile-controls';
  const capture = doc.createElement('button');
  capture.type = 'button';
  capture.textContent = 'Capture';
  capture.addEventListener('click', event => {
    event.stopPropagation();
    renderCameraView(wallRenderer, wallCamera);
    downloadRendererCapture(wallRenderer, source.label);
  });
  controls.appendChild(capture);

  if (source.item) {
    const palette = doc.createElement('select');
    palette.title = 'Sensor visualization palette';
    for (const [value, text] of [['visible','Visible'],['whiteHot','White Hot'],['blackHot','Black Hot'],['ironbow','Ironbow'],['rainbow','Rainbow'],['uvPurple','UV Purple']]) {
      const option = doc.createElement('option');
      option.value = value;
      option.textContent = text;
      palette.appendChild(option);
    }
    palette.value = record.palette;
    palette.addEventListener('change', event => {
      record.palette = event.target.value;
      source.item.data.viewportPalette = record.palette;
      applyViewportPalette(wallRenderer, record.palette);
    });
    controls.prepend(palette);
    record.paletteSelect = palette;

    const ptz = doc.createElement('button');
    ptz.type = 'button';
    ptz.textContent = 'PTZ';
    ptz.addEventListener('click', event => {
      event.stopPropagation();
      record.ptzEnabled = !record.ptzEnabled;
      videoWallPtzEnabledBySource.set(source.key, record.ptzEnabled);
      ptz.classList.toggle('active', record.ptzEnabled);
      ptz.textContent = record.ptzEnabled ? 'PTZ ON' : 'PTZ';
      tile.classList.toggle('ptz-active', record.ptzEnabled);
    });
    ptz.classList.toggle('active', record.ptzEnabled);
    ptz.textContent = record.ptzEnabled ? 'PTZ ON' : 'PTZ';
    tile.classList.toggle('ptz-active', record.ptzEnabled);
    controls.appendChild(ptz);

    const presets = doc.createElement('button');
    presets.type = 'button';
    presets.textContent = 'Presets';
    presets.title = 'Manage and recall PTZ presets';
    presets.disabled = !options.allowPresetDock;
    presetToggleButton = presets;
    presets.addEventListener('click', event => {
      event.stopPropagation();
      if (options.allowPresetDock) togglePtzPresetPanel(source.item, tile);
    });
    controls.appendChild(presets);

    const canvas = wallRenderer.domElement;
    canvas.addEventListener('click', event => {
      if (pendingPresetDepthStage !== 'depth' || pendingPresetDepthCamera?.id !== source.item.id) return;
      const pick = pickCameraViewportSurface(event, wallCamera, canvas);
      if (!pick) return;
      completePresetDepthSelection(source.item, pick);
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    attachPresetRoiDrawing(renderPane, canvas, source.item);
    canvas.addEventListener('pointerdown', event => {
      if (!record.ptzEnabled) return;
      record.ptzDragging = true;
      record.lastX = event.clientX;
      record.lastY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    canvas.addEventListener('pointermove', event => {
      if (!record.ptzDragging || !record.ptzEnabled) return;
      adjustCameraPtzFromView(source.item, event.clientX - record.lastX, event.clientY - record.lastY);
      record.lastX = event.clientX;
      record.lastY = event.clientY;
      event.preventDefault();
    });
    const stopPtz = () => { record.ptzDragging = false; };
    canvas.addEventListener('pointerup', stopPtz);
    canvas.addEventListener('pointercancel', stopPtz);
    canvas.addEventListener('wheel', event => {
      if (!record.ptzEnabled) return;
      const wheelDirection = event.deltaY < 0 ? 1 : -1;
      zoomCameraItem(source.item, preferences.invertZoom ? -wheelDirection : wheelDirection);
      event.preventDefault();
    }, { passive: false });
  }
  renderPane.appendChild(controls);
  tile.classList.toggle('selected', Boolean(options.selected));
}
function buildIntegratedVideoWall() {
  const dockCameraId = ptzPresetPanel &&
    !ptzPresetPanel.classList.contains('hidden') &&
    videoWallGrid.contains(ptzPresetPanel)
      ? activePresetCamera?.id
      : null;
  if (dockCameraId) closePtzPresetPanel();
  disposeVideoWallRecords(videoWallRecords);
  videoWallGrid.replaceChildren();
  const sources = getVideoWallSources();
  const layout = applyVideoWallGridLayout(videoWallGrid, sources.length, videoWallLayout.value);
  const visibleSources = sources.slice(0, layout.capacity);
  selectedVideoWallTileIndex = THREE.MathUtils.clamp(selectedVideoWallTileIndex, 0, Math.max(0, visibleSources.length - 1));
  visibleSources.forEach((source, tileIndex) => createWallTile(document, videoWallGrid, source, videoWallRecords, reorderVideoWall, {
    tileIndex,
    selected: tileIndex === selectedVideoWallTileIndex,
    allowPresetDock: videoWallSupportsPresetDock(layout),
    presetDockVertical: layout.columns === 1 && layout.rows === 1,
    onSelect: index => {
      selectedVideoWallTileIndex = index;
      selectVideoWallTile(videoWallRecords, index, videoWallSource);
    }
  }));
  appendVideoWallEmptySlots(document, videoWallGrid, layout.capacity - visibleSources.length);
  populateVideoWallSourceSelect(videoWallSource, selectedVideoWallTileIndex);
  if (dockCameraId && videoWallSupportsPresetDock(layout)) {
    const owner = videoWallRecords.find(record => record.item?.id === dockCameraId);
    if (owner) openPtzPresetPanel(owner.item, owner.hostTile);
  }
}

function showVideoWall() {
  buildIntegratedVideoWall();
  videoWallOverlay.classList.remove('hidden');
  videoWallOverlay.setAttribute('aria-hidden', 'false');
}

function hideVideoWall() {
  videoWallOverlay.classList.add('hidden');
  videoWallOverlay.setAttribute('aria-hidden', 'true');
  disposeVideoWallRecords(videoWallRecords);
}

function ensurePopupVideoWall() {
  if (popupVideoWallWindow && !popupVideoWallWindow.closed) return popupVideoWallWindow;
  popupVideoWallWindow = window.open('', 'nomadVideoWall', 'width=1400,height=900,resizable=yes');
  if (!popupVideoWallWindow) {
    alert('The browser blocked the Video Wall window. Allow pop-ups for this simulator and try again.');
    return null;
  }
  const doc = popupVideoWallWindow.document;
  doc.open();
  doc.write(`<!doctype html><html><head><title>N.O.M.A.D. Video Wall ${APP_VERSION}</title><style>
    html,body{height:100%;margin:0;background:#080c11;color:#eef3f7;font-family:Arial,sans-serif;overflow:hidden}
    .bar{height:48px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:7px 12px;background:#111a24;border-bottom:1px solid #34465a}.bar strong{margin-right:auto}
    button,select{padding:7px 10px;border:1px solid #52677d;border-radius:4px;background:#233244;color:#fff}
    #grid{height:calc(100% - 48px);box-sizing:border-box;display:grid;grid-template-columns:repeat(var(--wall-columns,2),minmax(0,1fr));grid-template-rows:repeat(var(--wall-rows,1),minmax(0,1fr));gap:6px;padding:6px}
    .video-wall-empty-slot{min-width:0;min-height:0;border:1px dashed #33465a;border-radius:4px;background:#0b1118}.video-wall-tile{min-width:0;min-height:0;display:flex;overflow:hidden;background:#000;border:2px solid #40536a;border-radius:6px}.video-wall-tile.selected{border-color:#23b7ff;box-shadow:0 0 0 2px rgba(35,183,255,.28)}.video-wall-tile.drag-over{outline:3px solid #00aaff}.video-wall-render-pane{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden}.video-wall-tile canvas{width:100%;height:100%;display:block}.video-wall-label{position:absolute;left:6px;top:6px;z-index:2;padding:4px 7px;border-radius:3px;background:rgba(0,0,0,.7);font-size:12px;cursor:grab;user-select:none}.video-wall-tile-controls{position:absolute;top:5px;right:5px;z-index:3;display:flex;gap:4px;padding:3px;border-radius:4px;background:rgba(0,0,0,.72)}.video-wall-tile-controls button,.video-wall-tile-controls select{height:25px;padding:2px 6px;border:1px solid #5d7187;border-radius:3px;background:#1d2a38;color:#fff;font-size:11px}.video-wall-tile-controls button.active{background:#006db3}.video-wall-tile-controls button:disabled{opacity:.55}.video-wall-tile.ptz-active canvas{cursor:crosshair}
  </style></head><body><div class="bar"><strong>N.O.M.A.D. Video Wall</strong><label>Layout <select id="layout"><option value="auto">Auto</option><option value="1">1 x 1</option><option value="1x2">1 x 2</option><option value="2">2 x 2</option><option value="3">3 x 3</option><option value="4">4 x 4</option><option value="5">5 x 5</option></select></label><label>Source <select id="source"></select></label><button id="refresh">Refresh Sources</button></div><div id="grid"></div></body></html>`);
  doc.close();
  doc.querySelector('#layout').value = videoWallLayout.value;
  doc.querySelector('#layout').addEventListener('change', buildPopupVideoWall);
  doc.querySelector('#refresh').addEventListener('click', buildPopupVideoWall);
  doc.querySelector('#source').addEventListener('change', event => assignVideoWallSource(selectedPopupVideoWallTileIndex, event.target.value));
  popupVideoWallWindow.addEventListener('beforeunload', () => { disposeVideoWallRecords(popupVideoWallRecords); popupVideoWallWindow = null; });
  return popupVideoWallWindow;
}

function buildPopupVideoWall() {
  const popup = ensurePopupVideoWall();
  if (!popup) return;
  disposeVideoWallRecords(popupVideoWallRecords);
  const doc = popup.document;
  const grid = doc.querySelector('#grid');
  if (!grid) return;
  grid.replaceChildren();
  const sources = getVideoWallSources();
  const selection = doc.querySelector('#layout').value;
  const layout = applyVideoWallGridLayout(grid, sources.length, selection);
  const visibleSources = sources.slice(0, layout.capacity);
  selectedPopupVideoWallTileIndex = THREE.MathUtils.clamp(selectedPopupVideoWallTileIndex, 0, Math.max(0, visibleSources.length - 1));
  const sourceSelect = doc.querySelector('#source');
  visibleSources.forEach((source, tileIndex) => createWallTile(doc, grid, source, popupVideoWallRecords, reorderVideoWall, {
    tileIndex,
    selected: tileIndex === selectedPopupVideoWallTileIndex,
    onSelect: index => {
      selectedPopupVideoWallTileIndex = index;
      selectVideoWallTile(popupVideoWallRecords, index, sourceSelect);
    }
  }));
  appendVideoWallEmptySlots(doc, grid, layout.capacity - visibleSources.length);
  populateVideoWallSourceSelect(sourceSelect, selectedPopupVideoWallTileIndex);
}

function popOutVideoWall() {
  buildPopupVideoWall();
  popupVideoWallWindow?.focus();
}

openVideoWallButton.addEventListener('click', showVideoWall);
popOutVideoWallButton.addEventListener('click', popOutVideoWall);
popOutVideoWallOverlayButton.addEventListener('click', popOutVideoWall);
closeVideoWallButton.addEventListener('click', hideVideoWall);
refreshVideoWallButton.addEventListener('click', buildIntegratedVideoWall);
videoWallLayout.addEventListener('change', buildIntegratedVideoWall);
videoWallSource.addEventListener('change', () => {
  assignVideoWallSource(selectedVideoWallTileIndex, videoWallSource.value);
});
function openCameraViewport(cameraItem) {
  if (!cameraItem || cameraItem.type !== 'camera') return;

  if (openCameraViewports.length >= MAX_CAMERA_VIEWPORTS) {
    alert(`Maximum of ${MAX_CAMERA_VIEWPORTS} Camera Viewports can be open at the same time.`);
    return;
  }

  const viewport = document.createElement('div');
  viewport.className = 'camera-viewport';

  const offset = openCameraViewports.length * 30;
  viewport.style.left = `${20 + offset}px`;
  viewport.style.top = `${20 + offset}px`;
  viewport.style.right = 'auto';
  viewport.style.bottom = 'auto';

  viewport.innerHTML = `
    <div class="camera-viewport-header">
      <span>${cameraItem.name}</span>
      <div class="camera-viewport-controls">
        <label class="viewport-palette-label" title="Sensor Visualization Palette">
          Palette
          <select class="viewport-palette-select">
            <option value="visible">Visible</option>
            <option value="whiteHot">Thermal - White Hot</option>
            <option value="blackHot">Thermal - Black Hot</option>
            <option value="ironbow">Thermal - Ironbow</option>
            <option value="rainbow">Thermal - Rainbow</option>
            <option value="uvPurple">UV - Purple</option>
          </select>
        </label>
        <button class="viewport-capture viewport-text-button" title="Capture">Capture</button>
        <button class="viewport-ptz-toggle viewport-text-button" title="PTZ Controls">PTZ</button>
        <button class="viewport-presets viewport-text-button" title="Manage PTZ Presets">Presets</button>
        <button class="viewport-minimize" title="Minimize">—</button>
        <button class="viewport-maximize" title="Maximize">□</button>
        <button class="viewport-close" title="Close">X</button>
      </div>
    </div>
    <div class="camera-viewport-body">
      <button class="viewport-roll-control viewport-roll-left" title="Roll Counterclockwise">↺</button>

      <button class="viewport-roll-control viewport-roll-right" title="Roll Clockwise">↻</button>

      <div class="viewport-ptz-hint hidden">
        PTZ enabled: drag to pan/tilt, wheel to zoom
      </div>
    </div>
  `;

  cameraViewportsContainer.appendChild(viewport);
  focusCameraViewport(viewport);
  viewport.addEventListener('mousedown', () => focusCameraViewport(viewport), true);
  viewport.querySelector('.viewport-close').addEventListener('click', () => {
    viewport.remove();
    const index = openCameraViewports.findIndex(v => v.element === viewport);
    if (index !== -1) {
      openCameraViewports[index].renderer.dispose();
      openCameraViewports[index].renderer.forceContextLoss?.();
      openCameraViewports.splice(index, 1);
    }
  });

  const header = viewport.querySelector('.camera-viewport-header');

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.camera-viewport-controls')) {
      e.stopPropagation();
      return;
    }
  });

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.camera-viewport-controls')) return;

    isDragging = true;

    const rect = viewport.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    viewport.style.left = (rect.left - containerRect.left) + 'px';
    viewport.style.top = (rect.top - containerRect.top) + 'px';
    viewport.style.right = 'auto';
    viewport.style.bottom = 'auto';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();

    viewport.style.left = (e.clientX - containerRect.left - offsetX) + 'px';
    viewport.style.top = (e.clientY - containerRect.top - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  const body = viewport.querySelector('.camera-viewport-body');
  const maximizeBtn = viewport.querySelector('.viewport-maximize');
  const minimizeBtn = viewport.querySelector('.viewport-minimize');
  const captureBtn = viewport.querySelector('.viewport-capture');
  const ptzToggleBtn = viewport.querySelector('.viewport-ptz-toggle');
  const presetsBtn = viewport.querySelector('.viewport-presets');
  const rollLeftBtn = viewport.querySelector('.viewport-roll-left');
  const rollRightBtn = viewport.querySelector('.viewport-roll-right');
  const ptzHint = viewport.querySelector('.viewport-ptz-hint');
  const paletteSelect = viewport.querySelector('.viewport-palette-select');
  const paletteLabel = viewport.querySelector('.viewport-palette-label');

  let viewportPtzEnabled = false;

  ptzToggleBtn.style.display = 'none';
  presetsBtn.style.display = 'none';

  const viewportRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  body.appendChild(viewportRenderer.domElement);
  configureRendererQuality(viewportRenderer);

  viewportRenderer.domElement.style.width = '100%';
  viewportRenderer.domElement.style.height = '100%';
  viewportRenderer.domElement.style.display = 'block';

  // Default sensor visualization palette.
  // This is stored per viewport so the selected palette survives minimize,
  // restore, maximize, and normal/maximized transitions.
  let selectedViewportPalette = cameraItem.data?.viewportPalette || getDefaultViewportPalette(cameraItem);
  cameraItem.data.viewportPalette = selectedViewportPalette;

  if (paletteSelect) {
    paletteSelect.value = selectedViewportPalette;

    paletteSelect.addEventListener('change', () => {
      selectedViewportPalette = paletteSelect.value;
      cameraItem.data.viewportPalette = selectedViewportPalette;
      applyViewportPalette(viewportRenderer, selectedViewportPalette);
    });
  }

  // Apply the default palette immediately.
  // The selector itself will remain hidden until the viewport is maximized.
  applyViewportPalette(viewportRenderer, selectedViewportPalette);

  if (paletteLabel) {
    paletteLabel.style.display = 'none';
  }

  const sourceRenderCamera = cameraItem.object.userData.renderCamera;
  const viewportCamera = sourceRenderCamera
    ? sourceRenderCamera.clone()
    : new THREE.PerspectiveCamera(90, 16 / 9, 0.1, 1000);

  body.addEventListener('click', event => {
    if (pendingPresetDepthStage !== 'depth' || pendingPresetDepthCamera?.id !== cameraItem.id) return;
    const pick = pickCameraViewportSurface(event, viewportCamera, viewportRenderer.domElement);
    if (!pick) {
      const message = `No visible model/reference surface was hit in ${cameraItem.name} Camera View. Try another point or press Esc to cancel.`;
      setMeasurementStatus(message);
      if (presetDepthPickBanner) presetDepthPickBanner.textContent = message;
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    completePresetDepthSelection(cameraItem, pick);
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  attachPresetRoiDrawing(body, viewportRenderer.domElement, cameraItem);

  function resizeCameraViewportRenderer() {
    const sensorAspect = (Number(cameraItem.data?.resolutionWidth) || 1920) / (Number(cameraItem.data?.resolutionHeight) || 1080);
    const fitted = fitRendererToHost(viewportRenderer, body, sensorAspect);
    viewportRenderer.setViewport(0, 0, fitted.width, fitted.height);
    if (viewportCamera) {
      viewportCamera.aspect = sensorAspect;
      viewportCamera.updateProjectionMatrix();
    }
    refreshPresetRoiOverlays(cameraItem);
  }

  resizeCameraViewportRenderer();

    function setViewportPtzEnabled(enabled) {
      viewportPtzEnabled = enabled;

      ptzToggleBtn.classList.toggle('active', viewportPtzEnabled);
      ptzToggleBtn.textContent = viewportPtzEnabled ? 'PTZ ON' : 'PTZ';

      if (ptzHint) {
        ptzHint.classList.toggle('hidden', !viewportPtzEnabled);
      }

      if (rollLeftBtn) {
        rollLeftBtn.style.display = viewportPtzEnabled ? 'block' : 'none';
      }

      if (rollRightBtn) {
        rollRightBtn.style.display = viewportPtzEnabled ? 'block' : 'none';
      }
    }

      function rotateCameraFromViewport(deltaX, deltaY) {
        if (!viewportPtzEnabled) return;
        cancelCameraPresetAnimation(cameraItem, 'Preset recall cancelled by manual PTZ input.');

        const panSpeed = 0.25;
        const tiltSpeed = 0.25;

        const currentPan = Number.parseFloat(cameraItem.data?.pan) || 0;
        const currentTilt = Number.parseFloat(cameraItem.data?.tilt) || 0;

        const panDirection = preferences.reversePan ? -1 : 1;
        const tiltDirection = preferences.reverseTilt ? -1 : 1;

        cameraItem.data.pan = currentPan + deltaX * panSpeed * panDirection;
        cameraItem.data.tilt = currentTilt + deltaY * tiltSpeed * tiltDirection;

        cameraItem.data.tilt = Math.max(
          -90,
          Math.min(90, cameraItem.data.tilt)
        );

        applyCameraPtzRig(cameraItem);
        ptzPresetPanel?.refreshLive?.();

        updateObjectInfoPanel();
      }

      function rollCameraFromViewport(direction) {
        if (!viewportPtzEnabled) return;
        cancelCameraPresetAnimation(cameraItem, 'Preset recall cancelled by manual roll input.');

        const rollStep = 5;
        const currentRoll = Number.parseFloat(cameraItem.data?.roll) || 0;

        cameraItem.data.roll = currentRoll + direction * rollStep;

        applyCameraPtzRig(cameraItem);

        updateObjectInfoPanel();
      }

    let isViewportPtzDragging = false;
    let lastPtzMouseX = 0;
    let lastPtzMouseY = 0;

    body.addEventListener('mousedown', (event) => {
      if (!viewportPtzEnabled) return;
      if (!isMaximized) return;
      if (event.target.closest('button')) return;

      isViewportPtzDragging = true;

      lastPtzMouseX = event.clientX;
      lastPtzMouseY = event.clientY;

      event.preventDefault();
      event.stopPropagation();
    });

    body.addEventListener('mousemove', (event) => {
      if (!isViewportPtzDragging) return;

      const deltaX = event.clientX - lastPtzMouseX;
      const deltaY = event.clientY - lastPtzMouseY;

      rotateCameraFromViewport(deltaX, deltaY);

      lastPtzMouseX = event.clientX;
      lastPtzMouseY = event.clientY;

      event.preventDefault();
      event.stopPropagation();
    });

    document.addEventListener('mouseup', () => {
      isViewportPtzDragging = false;
    });

    body.addEventListener('wheel', (event) => {
      if (!viewportPtzEnabled) return;
      if (!isMaximized) return;

      const wheelDirection = event.deltaY < 0 ? 1 : -1;
      const direction = preferences.invertZoom ? -wheelDirection : wheelDirection;

      zoomCameraItem(cameraItem, direction);

      event.preventDefault();
      event.stopPropagation();

    }, { passive: false });

    rollLeftBtn.addEventListener('click', (event) => {
      rollCameraFromViewport(-1);

      event.preventDefault();
      event.stopPropagation();
    });

    rollRightBtn.addEventListener('click', (event) => {
      rollCameraFromViewport(1);

      event.preventDefault();
      event.stopPropagation();
    });

    setViewportPtzEnabled(false);

  let isMinimized = false;
  let isMaximized = false;

  const normalViewportState = {
    width: '320px',
    height: '240px',
    left: viewport.style.left,
    top: viewport.style.top
  };

  viewport.setPresetDockOpen = open => {
    presetsBtn.classList.toggle('active', Boolean(open));
    if (open) {
      if (!viewport.dataset.prePresetDockWidth) viewport.dataset.prePresetDockWidth = viewport.style.width;
      const baseWidth = Number.parseFloat(viewport.dataset.prePresetDockWidth) || viewport.getBoundingClientRect().width;
      const availableWidth = Math.max(320, container.getBoundingClientRect().width - 48);
      viewport.style.width = `${Math.min(availableWidth, baseWidth + 360)}px`;
      viewport.classList.add('has-preset-dock');
    } else {
      viewport.classList.remove('has-preset-dock');
      if (viewport.dataset.prePresetDockWidth) {
        viewport.style.width = viewport.dataset.prePresetDockWidth;
        delete viewport.dataset.prePresetDockWidth;
      }
    }
    requestAnimationFrame(resizeCameraViewportRenderer);
  };

  minimizeBtn.addEventListener('click', () => {
    focusCameraViewport(viewport);
    isMinimized = !isMinimized;

    if (isMinimized) {

      viewport.userDataBeforeMinimize = {
        width: viewport.style.width,
        height: viewport.style.height,
        isMaximized
      };

      body.style.display = 'none';
      viewport.style.height = 'auto';

      minimizeBtn.textContent = '▢';
      maximizeBtn.style.display = 'none';
      captureBtn.style.display = 'none';

      if (paletteLabel) {
        paletteLabel.style.display = 'none';
      }

    } else {

      body.style.display = 'block';

      if (viewport.userDataBeforeMinimize) {

        viewport.style.width =
          viewport.userDataBeforeMinimize.width;

        viewport.style.height =
          viewport.userDataBeforeMinimize.height;

      } else if (isMaximized) {

        const containerRect = container.getBoundingClientRect();

        viewport.style.width =
          `${Math.floor(containerRect.width * 0.68)}px`;

        viewport.style.height =
          `${Math.floor(containerRect.height * 0.68)}px`;

      } else {

        viewport.style.width = normalViewportState.width;
        viewport.style.height = normalViewportState.height;
      }

      minimizeBtn.textContent = '—';
      maximizeBtn.style.display = 'inline-block';
      captureBtn.style.display = 'inline-block';

      if (paletteLabel) {
        paletteLabel.style.display = isMaximized ? 'inline-flex' : 'none';
      }

      if (paletteSelect) {
        paletteSelect.value = selectedViewportPalette;
      }

      applyViewportPalette(viewportRenderer, selectedViewportPalette);

      requestAnimationFrame(resizeCameraViewportRenderer);
    }
  });

  captureBtn.addEventListener('click', () => {
    resizeCameraViewportRenderer();

    const sourceRenderCamera = cameraItem.object.userData.renderCamera;

    if (sourceRenderCamera) {
      viewportCamera.position.copy(
        sourceRenderCamera.getWorldPosition(new THREE.Vector3())
      );

      viewportCamera.quaternion.copy(
        sourceRenderCamera.getWorldQuaternion(new THREE.Quaternion())
      );

      viewportCamera.fov = sourceRenderCamera.fov;
      viewportCamera.near = sourceRenderCamera.near;
      viewportCamera.far = sourceRenderCamera.far;
      viewportCamera.zoom = sourceRenderCamera.zoom;
      viewportCamera.updateProjectionMatrix();
    }

    const helper =
      transformControls.getHelper
        ? transformControls.getHelper()
        : transformControls;

    const previousVisible = helper.visible;
    helper.visible = false;

    renderCameraView(viewportRenderer, viewportCamera);

    helper.visible = previousVisible;

    const safeCameraName = cameraItem.name
      .replace(/[^a-z0-9_-]/gi, '_')
      .toLowerCase();

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-');

    const link = document.createElement('a');
    link.href = viewportRenderer.domElement.toDataURL('image/png');
    link.download = `${safeCameraName}_${timestamp}.png`;
    link.click();
  });

    presetsBtn.addEventListener('click', () => togglePtzPresetPanel(cameraItem, viewport));

    ptzToggleBtn.addEventListener('click', () => {
      if (!isMaximized) return;

      setViewportPtzEnabled(!viewportPtzEnabled);
    });

  maximizeBtn.addEventListener('click', () => {
    focusCameraViewport(viewport);
    isMaximized = !isMaximized;

    minimizeBtn.style.display = isMaximized ? 'none' : 'inline-block';

    if (isMaximized) {
      body.style.display = 'block';
//      isMinimized = false;
//      minimizeBtn.textContent = '—';

      normalViewportState.left = viewport.style.left;
      normalViewportState.top = viewport.style.top;

      const containerRect = container.getBoundingClientRect();

// Temporary debug line
      console.log('Maximize clicked. Container size:', containerRect.width, containerRect.height);
// Temporary debut line

      viewport.style.left = '24px';
      viewport.style.top = '24px';
      viewport.style.width = `${Math.floor(containerRect.width * 0.68)}px`;
      viewport.style.height = `${Math.floor(containerRect.height * 0.68)}px`;

      requestAnimationFrame(resizeCameraViewportRenderer);

      maximizeBtn.textContent = '❐';

      // In maximized mode, expose advanced camera-view controls.
      ptzToggleBtn.style.display = 'inline-block';
      presetsBtn.style.display = 'inline-block';

      if (paletteLabel) {
        paletteLabel.style.display = 'inline-flex';
      }

      if (paletteSelect) {
        paletteSelect.value = selectedViewportPalette;
      }

      // Do not reset the selected palette.
      // Only reset PTZ interaction mode when entering maximized view.
      setViewportPtzEnabled(false);
      applyViewportPalette(viewportRenderer, selectedViewportPalette);

    } else {
      if (ptzPresetPanel?.closest('.camera-viewport') === viewport) closePtzPresetPanel();
      viewport.style.left = normalViewportState.left;
      viewport.style.top = normalViewportState.top;
      viewport.style.width = normalViewportState.width;
      viewport.style.height = normalViewportState.height;

      requestAnimationFrame(() => {

        // Force browser layout recalculation
        void viewport.offsetWidth;

        resizeCameraViewportRenderer();

        requestAnimationFrame(() => {
          resizeCameraViewportRenderer();
        });
      });

      maximizeBtn.textContent = '□';

      // In normal/restored mode, hide advanced controls to keep the header clean.
      // The selected palette is preserved and still applied to the viewport.
      ptzToggleBtn.style.display = 'none';
      presetsBtn.style.display = 'none';

      if (paletteLabel) {
        paletteLabel.style.display = 'none';
      }

      setViewportPtzEnabled(false);
      applyViewportPalette(viewportRenderer, selectedViewportPalette);

    }
  });

  const viewportRecord = {
    cameraId: cameraItem.id,
    element: viewport,
    renderer: viewportRenderer,
    body: body,
    camera: viewportCamera,
    paletteSelect,
    setPalette: paletteKey => {
      selectedViewportPalette = paletteKey;
      cameraItem.data.viewportPalette = paletteKey;
      if (paletteSelect) paletteSelect.value = paletteKey;
      applyViewportPalette(viewportRenderer, paletteKey);
    },
    isRenderable: () => !isMinimized,
    isMaximized: () => isMaximized,
    maximize: () => { if (!isMaximized) maximizeBtn.click(); }
  };
  openCameraViewports.push(viewportRecord);
  focusCameraViewport(viewport);
  return viewportRecord;
}

function frameObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  orbitControls.target.copy(center);
  viewerCamera.position.set(center.x + maxDim, center.y + maxDim * 0.75, center.z + maxDim);
  viewerCamera.near = Math.max(maxDim / 1000, 0.01);
  viewerCamera.far = maxDim * 20;
  viewerCamera.updateProjectionMatrix();
  orbitControls.update();
}

// ============================================================
// CAMERA DATA HELPERS
// ============================================================

function toNumberOrDefault(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDefaultCameraRecord() {
  return null;
}

function buildGenericCameraData() {
  return {
    make: 'ACME',
    model: 'ACME Camera',
    baseModel: 'Generic Camera T1000',
    partNumber: '',
    lens: 'ACME adjustable lens',
    resolutionWidth: 3840,
    resolutionHeight: 2160,
    sensorSize: '',
    focalLengthMinMm: 1,
    focalLengthMaxMm: 100,
    currentFocalLengthMm: 1,
    apertureMinF: null,
    apertureMaxF: null,
    hfovWide: 120,
    hfovTele: 2,
    hfov: 120,
    vfov: 67.5,
    pan: 0,
    tilt: 0,
    zoom: 1,
    projectionDistance: 20,
    ptzPresets: [],
    units: 'metric',
    supportsPan: true,
    supportsTilt: true,
    supportsZoom: true,
    thermal: false,
    radiometric: false,
    msrp: '',
    rawRecord: null,
    isGeneric: true
  };
}

function buildCameraDataFromRecord(record) {
  if (!record) {
    return buildGenericCameraData();
  }
  const lensVariant = toNumberOrDefault(record?.lens_variant_mm, null);

  let hfovWide = toNumberOrDefault(record?.hfov_max_deg, 90);
  let hfovTele = toNumberOrDefault(record?.hfov_min_deg, hfovWide);

  let focalMin = toNumberOrDefault(record?.focal_length_min_mm, 4);
  let focalMax = toNumberOrDefault(record?.focal_length_max_mm, focalMin);

  const hasLensVariant = Number.isFinite(lensVariant);


  const isThermalVariant = record?.thermal_flag === 'yes' && hasLensVariant;

  if ((hasLensVariant && focalMax === focalMin) || isThermalVariant) {
    focalMin = lensVariant;
    focalMax = lensVariant;

    if (record?.variant_label && record?.variant_label.includes(String(lensVariant))) {
      const raw = record?.sensor_lens_hfov_raw || '';
      const escapedLens = String(lensVariant).replace('.', '\\.');
      const lensPattern = new RegExp(`${escapedLens}\\s*mm[^\\n]*?(\\d+(?:\\.\\d+)?)°`, 'i');
      const match = raw.match(lensPattern);

      if (match) {
        hfovWide = Number.parseFloat(match[1]);
        hfovTele = hfovWide;
      }
    }
  }

  const currentFocal = focalMin;
  const supportsZoom = Number.isFinite(focalMin) && Number.isFinite(focalMax) && focalMax > focalMin;

  return {
    make: record?.manufacturer || 'Unknown',
    model: record?.display_name || record?.base_model || 'Generic Camera',
    baseModel: record?.base_model || '',
    partNumber: record?.part_number || '',
    lens: record?.sensor_lens_hfov_raw || record?.lens_variant_mm || '',
    resolutionWidth: toNumberOrDefault(record?.resolution_width, 1920),
    resolutionHeight: toNumberOrDefault(record?.resolution_height, 1080),
    sensorSize: record?.sensor_size_normalized || '',
    focalLengthMinMm: focalMin,
    focalLengthMaxMm: focalMax,
    currentFocalLengthMm: currentFocal,
    apertureMinF: toNumberOrDefault(record?.aperture_min_f, null),
    apertureMaxF: toNumberOrDefault(record?.aperture_max_f, null),
    hfovWide,
    hfovTele,
    hfov: hfovWide,
    vfov: 50,
    pan: 0,
    tilt: 0,
    zoom: 1,
    projectionDistance: 20,
    ptzPresets: [],
    units: 'metric',
    supportsPan: Boolean(record?.pan_tilt_raw),
    supportsTilt: Boolean(record?.pan_tilt_raw),
    supportsZoom,
    thermal: record?.thermal_flag === 'yes',
    radiometric: record?.radiometric_or_temperature_flag === 'yes',
    msrp: record?.msrp_usd_raw || '',
    rawRecord: record || null
  };
}

// Add default camera
// createCameraObject('Camera 001', new THREE.Vector3(0, 2, 0));

function createCameraObject(name, position = new THREE.Vector3(0, 2, 0)) {
  const cameraRoot = new THREE.Group();
  cameraRoot.position.copy(position);

  const panPivot = new THREE.Group();
  const tiltPivot = new THREE.Group();
  const rollPivot = new THREE.Group();

  cameraRoot.add(panPivot);
  panPivot.add(tiltPivot);
  tiltPivot.add(rollPivot);

  const camGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
  const camMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cameraBody = new THREE.Mesh(camGeometry, camMaterial);

  cameraBody.rotation.x = Math.PI / 2;
  rollPivot.add(cameraBody);

  scene.add(cameraRoot);

  // Create projection cone using selected/default camera database values
  const cameraRecord = getDefaultCameraRecord();
  const cameraData = buildCameraDataFromRecord(cameraRecord);

  const projectionDistance = cameraData.projectionDistance;
  const hfov = cameraData.hfov;

  const radius = Math.tan((hfov / 2) * Math.PI / 180) * projectionDistance;

  const coneGeometry = new THREE.ConeGeometry(radius, projectionDistance, 32, 1, true);
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: preferences.coneOpacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const projectionCone = new THREE.Mesh(coneGeometry, coneMaterial);

  // Position cone so tip starts at camera and points forward along -Z
  projectionCone.rotation.x = Math.PI / 2;
  projectionCone.position.set(0, 0, -projectionDistance / 2);
  rollPivot.add(projectionCone);

  const renderCamera = new THREE.PerspectiveCamera(
    hfov,
    16 / 9,
    0.01,
    Math.max(0.02, projectionDistance)
  );

  renderCamera.position.set(0, 0, 0);
  renderCamera.rotation.set(0, 0, 0);
  rollPivot.add(renderCamera);

  cameraRoot.userData.cameraBody = cameraBody;
  cameraRoot.userData.panPivot = panPivot;
  cameraRoot.userData.tiltPivot = tiltPivot;
  cameraRoot.userData.rollPivot = rollPivot;
  cameraRoot.userData.projectionCone = projectionCone;
  cameraRoot.userData.projectionDistance = projectionDistance;
  cameraRoot.userData.baseHfov = hfov;
  cameraRoot.userData.renderCamera = renderCamera;

  cameraRoot.userData.layFlatIndex = 0;
  cameraRoot.userData.layFlatRotations = [
    { x: 0, y: 0, z: 0 },
    { x: Math.PI / 2, y: 0, z: 0 },
    { x: -Math.PI / 2, y: 0, z: 0 },
    { x: 0, y: 0, z: Math.PI / 2 },
    { x: 0, y: 0, z: -Math.PI / 2 },
    { x: 0, y: Math.PI / 2, z: 0 },
    { x: 0, y: -Math.PI / 2, z: 0 }
  ];

  cameraData.pan = 0;
  cameraData.tilt = 0;
  cameraData.roll = 0;

  const id = `camera-${String(cameraCounter).padStart(3, '0')}`;

  addSceneObject({
    id,
    name,
    type: 'camera',
    object: cameraRoot,
    data: cameraData
  });

  applyCameraPtzRig(sceneObjects[sceneObjects.length - 1]);

  cameraCounter += 1;

  selectObject(id);

  return cameraRoot;
}

// Load model
// Load model
const loader = new GLTFLoader();
const loadedModelFile = 'test_power_transformer.glb';
const loadedModelPath = `/models/${loadedModelFile}`;

loader.load(loadedModelPath, (gltf) => {
//loader.load('/models/converted_simplified.glb', (gltf) => {
  const model = gltf.scene;

  model.userData.layFlatIndex = 0;
  model.userData.layFlatRotations = [
    { x: 0, y: 0, z: 0 },
    { x: Math.PI / 2, y: 0, z: 0 },
    { x: -Math.PI / 2, y: 0, z: 0 },
    { x: 0, y: 0, z: Math.PI / 2 },
    { x: 0, y: 0, z: -Math.PI / 2 },
    { x: 0, y: Math.PI / 2, z: 0 },
    { x: 0, y: -Math.PI / 2, z: 0 }
  ];

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  // model.position.sub(center);

  scene.add(model);

  addSceneObject({
    id: 'model-001',
    name: 'Power Transformer',
    type: 'model',
    object: model
  });

  frameObject(model);

  // Default selected object
  selectObject('camera-001');
});

toolbarMove.addEventListener('click', () => {
  transformControls.setMode('translate');
});

toolbarRotate.addEventListener('click', () => {
  transformControls.setMode('rotate');
});

toolbarAlign.addEventListener('click', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;

  if (item.type === 'model' || item.type === 'object') {
    alignObjectToGround(item.object);
  }
});

function zoomCameraItem(cameraItem, direction) {
  if (!cameraItem || cameraItem.type !== 'camera') return;
  cancelCameraPresetAnimation(cameraItem, 'Preset recall cancelled by manual zoom input.');
  if (!cameraItem.data?.supportsZoom) return;

  const minFocal = Number.parseFloat(cameraItem.data.focalLengthMinMm);
  const maxFocal = Number.parseFloat(cameraItem.data.focalLengthMaxMm);
  const currentFocal = Number.parseFloat(
    cameraItem.data.currentFocalLengthMm || minFocal
  );

  if (
    !Number.isFinite(minFocal) ||
    !Number.isFinite(maxFocal) ||
    maxFocal <= minFocal
  ) {
    return;
  }

  const step = (maxFocal - minFocal) / 20;

  const nextFocal =
    direction > 0
      ? Math.min(currentFocal + step, maxFocal)
      : Math.max(currentFocal - step, minFocal);

  cameraItem.data.currentFocalLengthMm = nextFocal;
  cameraItem.data.zoom = nextFocal / minFocal;

  const zoomRatio =
    (nextFocal - minFocal) / (maxFocal - minFocal);

  cameraItem.data.hfov =
    cameraItem.data.hfovWide -
    zoomRatio *
      (cameraItem.data.hfovWide - cameraItem.data.hfovTele);

  updateCameraProjection(cameraItem);
  refreshCameraPresetDerivedData(cameraItem);
  ptzPresetPanel?.refreshLive?.();
  updateObjectInfoPanel();
}

function zoomSelectedCamera(direction) {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  zoomCameraItem(item, direction);
}

function stepSelectedCameraPtz(panDelta, tiltDelta) {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;
  cancelCameraPresetAnimation(item, 'Preset recall cancelled by manual PTZ input.');

  const currentPan = Number.parseFloat(item.data?.pan) || 0;
  const currentTilt = Number.parseFloat(item.data?.tilt) || 0;

  item.data.pan = currentPan + panDelta;
  item.data.tilt = currentTilt + tiltDelta;

  item.data.tilt = Math.max(
    -90,
    Math.min(90, item.data.tilt)
  );

  applyCameraPtzRig(item);
  updateObjectInfoPanel();
}

ptzPanLeft.addEventListener('click', () => {
  stepSelectedCameraPtz(-5, 0);
});

ptzPanRight.addEventListener('click', () => {
  stepSelectedCameraPtz(5, 0);
});

ptzTiltUp.addEventListener('click', () => {
  stepSelectedCameraPtz(0, -5);
});

ptzTiltDown.addEventListener('click', () => {
  stepSelectedCameraPtz(0, 5);
});

ptzZoomIn.addEventListener('click', () => {
  zoomSelectedCamera(1);
});

ptzZoomOut.addEventListener('click', () => {
  zoomSelectedCamera(-1);
});

ptzPresetsInspectorButton.addEventListener('click', () => {
  const item = sceneObjects.find(entry => entry.id === selectedId && entry.type === 'camera');
  if (item) togglePtzPresetPanel(item);
});

toolbarCameraView.addEventListener('click', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  openCameraViewport(item);
});

toolbarDelete.addEventListener('click', () => {
  if (!selectedId) return;

  const index = sceneObjects.findIndex(o => o.id === selectedId);
  if (index === -1) return;

  const item = sceneObjects[index];

  if (item.type === 'model') {
    if (!confirm('Delete model? This will remove the entire scene model.')) return;
  }

  // Remove from Three.js scene
  scene.remove(item.object);

  // Clean up projection cone if camera
  if (item.type === 'camera' && item.object.userData.projectionCone) {
    item.object.userData.projectionCone.geometry.dispose();
    item.object.userData.projectionCone.material.dispose();
  }

  // Remove from internal array
  sceneObjects.splice(index, 1);

  // Clear selection
  clearSelection();

  // Refresh UI
  renderSceneTree();
  updateObjectInfoPanel();
});

let sceneClipboard = null;
function deepCloneData(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
function addBoxObject() {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x4daeff, roughness: 0.65 })
  );
  mesh.position.set(0, 0.5, 0);
  const id = `object-${Date.now()}`;
  scene.add(mesh);
  addSceneObject({ id, name: `Object ${sceneObjects.filter(item => item.type === 'object').length + 1}`, type: 'object', object: mesh, data: { primitive: 'box', locked: false } });
  selectObject(id);
}
function copySelectedObject() {
  const item = sceneObjects.find(entry => entry.id === selectedId);
  if (!item) return false;
  sceneClipboard = {
    type: item.type,
    name: item.name,
    data: deepCloneData(item.data),
    object: item.type === 'camera' ? null : item.object.clone(true),
    position: { x: item.object.position.x, y: item.object.position.y, z: item.object.position.z },
    rotation: { x: item.object.rotation.x, y: item.object.rotation.y, z: item.object.rotation.z }
  };
  return true;
}
function pasteSceneObject() {
  if (!sceneClipboard) return;
  if (sceneClipboard.type === 'camera') {
    createCameraObject(`${sceneClipboard.name} Copy`, new THREE.Vector3(sceneClipboard.position.x + 1, sceneClipboard.position.y, sceneClipboard.position.z + 1));
    const item = sceneObjects.find(entry => entry.id === selectedId);
    item.object.rotation.set(sceneClipboard.rotation.x, sceneClipboard.rotation.y, sceneClipboard.rotation.z);
    item.data = deepCloneData(sceneClipboard.data);
    applyCameraPtzRig(item);
    updateCameraProjection(item);
    return;
  }
  const object = sceneClipboard.object.clone(true);
  object.position.x += 1;
  object.position.z += 1;
  const id = `${sceneClipboard.type}-${Date.now()}`;
  scene.add(object);
  addSceneObject({ id, name: `${sceneClipboard.name} Copy`, type: sceneClipboard.type, object, data: deepCloneData(sceneClipboard.data) });
  selectObject(id);
}
document.getElementById('closeProject')?.addEventListener('click', () => {
  if (confirm('Close the current project and clear unsaved changes?')) window.location.reload();
});
document.getElementById('saveAsProject')?.addEventListener('click', () => saveProjectButton.click());
document.getElementById('exportProject')?.addEventListener('click', () => { projectDownloadExtension = 'json'; saveProjectButton.click(); });
document.getElementById('uploadProject')?.addEventListener('click', () => loadProjectFile.click());
function openReportConfiguration(){document.querySelector('.report-config-backdrop')?.remove();const backdrop=document.createElement('div');backdrop.className='report-config-backdrop';backdrop.innerHTML=`<div class="report-config-dialog"><div class="report-config-title"><strong>Report Configuration</strong><button data-close aria-label="Close">x</button></div><div class="report-config-body"><details open><summary>Project Identity</summary><div class="report-config-grid"><label>Company<input data-key="companyName"></label><label>Website<input data-key="website"></label><label>Project title<input data-key="projectTitle"></label><label>Client<input data-key="client"></label><label>Location<input data-key="location"></label><label>Subject<input data-key="subject"></label><label>Prepared by<input data-key="preparedBy"></label><label>Version<input data-key="versionNumber"></label></div></details><details><summary>Report Contents</summary><div class="report-config-checks"><label><input type="checkbox" data-key="includeTitlePage">Title page</label><label><input type="checkbox" data-key="includeDescription">Project description</label><label><input type="checkbox" data-key="includeSceneOverview">Scene overview</label><label><input type="checkbox" data-key="includeOppositeView">Opposite-side context view</label><label><input type="checkbox" data-key="includeCameraContext">Camera location/context views</label><label><input type="checkbox" data-key="includeBom">Camera BOM</label><label><input type="checkbox" data-key="includePresets">PTZ preset pages</label><label><input type="checkbox" data-key="includeRois">ROI and pixel-density analysis</label><label><input type="checkbox" data-key="showCameraModels">Show camera models in context</label></div></details><details><summary>Page and Image Output</summary><div class="report-config-grid"><label>Page size<select data-key="pageSize"><option value="letter">Letter</option><option value="a4">A4</option></select></label><label>Orientation<select data-key="orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label><label>Watermark<input data-key="watermark"></label><label>Image quality <output class="quality-value"></output><input type="range" min="40" max="100" data-key="imageQuality"></label></div></details><details><summary>Description and Notes</summary><textarea data-key="description" rows="8"></textarea></details></div><div class="report-config-actions"><button data-close>Cancel</button><button data-save>Save Settings</button><button data-generate>Generate Report</button></div></div>`;document.body.appendChild(backdrop);const style=document.createElement('style');style.textContent=`.report-config-backdrop{position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.64);display:grid;place-items:center}.report-config-dialog{width:min(760px,92vw);max-height:90vh;display:flex;flex-direction:column;background:var(--panel-bg);color:var(--text);border:1px solid var(--border);border-radius:8px;box-shadow:0 18px 50px rgba(0,0,0,.65);font:13px Arial,sans-serif}.report-config-title{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;background:var(--panel-title-bg);font-size:16px}.report-config-body{padding:10px;overflow:auto}.report-config-body details{margin-bottom:8px}.report-config-body summary{padding:8px;background:var(--section-bg);font-weight:bold;cursor:pointer}.report-config-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:9px}.report-config-grid label,.report-config-body textarea{display:flex;flex-direction:column;gap:4px}.report-config-checks{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px}.report-config-dialog input,.report-config-dialog select,.report-config-dialog textarea{background:var(--control-bg);color:var(--text);border:1px solid var(--border);padding:6px;box-sizing:border-box}.report-config-body textarea{width:100%;resize:vertical}.report-config-actions{display:flex;justify-content:flex-end;gap:8px;padding:10px;border-top:1px solid var(--border)}.report-config-actions button,.report-config-title button{background:var(--control-bg);color:var(--text);border:1px solid var(--border);padding:6px 12px;border-radius:4px}@media(max-width:650px){.report-config-grid,.report-config-checks{grid-template-columns:1fr}}`;backdrop.appendChild(style);backdrop.querySelectorAll('[data-key]').forEach(field=>{const key=field.dataset.key;if(field.type==='checkbox')field.checked=Boolean(reportSettingsState[key]);else field.value=reportSettingsState[key]??''});const quality=backdrop.querySelector('[data-key="imageQuality"]'),qualityValue=backdrop.querySelector('.quality-value');const syncQuality=()=>qualityValue.textContent=`${quality.value}%`;quality.addEventListener('input',syncQuality);syncQuality();const save=()=>{backdrop.querySelectorAll('[data-key]').forEach(field=>{reportSettingsState[field.dataset.key]=field.type==='checkbox'?field.checked:(field.type==='range'?Number(field.value):field.value)})};backdrop.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>backdrop.remove()));backdrop.querySelector('[data-save]').addEventListener('click',()=>{save();backdrop.remove()});backdrop.querySelector('[data-generate]').addEventListener('click',()=>{save();backdrop.remove();generateNomadReport()})}
function editReportSettings(){openReportConfiguration()}
function captureReportSceneViews(){const savedPosition=viewerCamera.position.clone(),savedQuaternion=viewerCamera.quaternion.clone(),target=orbitControls.target.clone();const capture=()=>{renderer.render(scene,viewerCamera);try{return renderer.domElement.toDataURL('image/jpeg',Math.min(1,Math.max(.4,Number(reportSettingsState.imageQuality||85)/100)))}catch{return''}};const primary=capture();const offset=savedPosition.clone().sub(target);viewerCamera.position.copy(target.clone().sub(offset));viewerCamera.lookAt(target);viewerCamera.updateMatrixWorld(true);const opposite=capture();viewerCamera.position.copy(savedPosition);viewerCamera.quaternion.copy(savedQuaternion);viewerCamera.updateMatrixWorld(true);renderer.render(scene,viewerCamera);return{primary,opposite}}
function captureReportCameraContexts(cameras){const images=new Map(),savedPosition=viewerCamera.position.clone(),savedQuaternion=viewerCamera.quaternion.clone(),savedTarget=orbitControls.target.clone();for(const cameraItem of cameras){const cameraPosition=cameraItem.object.getWorldPosition(new THREE.Vector3()),preset=ensureCameraPtzPresets(cameraItem)[0],point=preset?.depthTarget?.point;let target=point?new THREE.Vector3(Number(point.x)||0,Number(point.y)||0,Number(point.z)||0):cameraPosition.clone().add(new THREE.Vector3(0,0,-Math.max(2,Number(cameraItem.data?.projectionDistance)||10)));const midpoint=cameraPosition.clone().lerp(target,.5),span=Math.max(2,cameraPosition.distanceTo(target));let side=new THREE.Vector3().subVectors(target,cameraPosition).cross(new THREE.Vector3(0,1,0));if(side.lengthSq()<.001)side.set(1,0,0);side.normalize();viewerCamera.position.copy(midpoint).addScaledVector(side,span*.85).add(new THREE.Vector3(0,span*.35,0));viewerCamera.lookAt(midpoint);viewerCamera.updateMatrixWorld(true);renderer.render(scene,viewerCamera);try{images.set(cameraItem.id,renderer.domElement.toDataURL('image/jpeg',Math.min(1,Math.max(.4,Number(reportSettingsState.imageQuality||85)/100))))}catch{images.set(cameraItem.id,'')}}viewerCamera.position.copy(savedPosition);viewerCamera.quaternion.copy(savedQuaternion);orbitControls.target.copy(savedTarget);viewerCamera.updateMatrixWorld(true);renderer.render(scene,viewerCamera);return images}
function captureReportPresetViews(cameras){const images=new Map(),reportRenderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});reportRenderer.setSize(960,540,false);configureRendererQuality(reportRenderer);for(const cameraItem of cameras){const source=cameraItem.object.userData.renderCamera;if(!source)continue;const saved={pan:cameraItem.data.pan,tilt:cameraItem.data.tilt,roll:cameraItem.data.roll,zoom:cameraItem.data.zoom,hfov:cameraItem.data.hfov,projectionDistance:cameraItem.data.projectionDistance};for(const preset of ensureCameraPtzPresets(cameraItem)){cameraItem.data.pan=preset.pan;cameraItem.data.tilt=preset.tilt;cameraItem.data.roll=preset.roll;cameraItem.data.zoom=preset.zoom;cameraItem.data.hfov=preset.hfov;cameraItem.data.projectionDistance=preset.projectionDistance;applyCameraPtzRig(cameraItem);updateCameraProjection(cameraItem);cameraItem.object.updateMatrixWorld(true);const reportCamera=new THREE.PerspectiveCamera(source.fov,16/9,source.near,source.far);reportCamera.position.copy(source.getWorldPosition(new THREE.Vector3()));reportCamera.quaternion.copy(source.getWorldQuaternion(new THREE.Quaternion()));reportCamera.zoom=source.zoom;reportCamera.updateProjectionMatrix();renderCameraView(reportRenderer,reportCamera);try{images.set(`${cameraItem.id}:${preset.id}`,reportRenderer.domElement.toDataURL('image/jpeg',Math.min(1,Math.max(.4,Number(reportSettingsState.imageQuality||85)/100))))}catch{images.set(`${cameraItem.id}:${preset.id}`,'')}}Object.assign(cameraItem.data,saved);applyCameraPtzRig(cameraItem);updateCameraProjection(cameraItem);cameraItem.object.updateMatrixWorld(true)}reportRenderer.dispose();return images}
function generateNomadReport(){const sceneViews=captureReportSceneViews(),cameras=sceneObjects.filter(item=>item.type==='camera'),presetViews=captureReportPresetViews(cameras),cameraContexts=reportSettingsState.includeCameraContext?captureReportCameraContexts(cameras):new Map(),escape=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));const rows=cameras.map(camera=>`<tr><td>${escape(camera.name)}</td><td>${escape(camera.data?.make)}</td><td>${escape(camera.data?.model)}</td><td>${escape(camera.data?.lens)}</td><td>${camera.object.position.toArray().map(v=>formatMetric(v)).join(', ')}</td><td>${ensureCameraPtzPresets(camera).length}</td><td>${ensureCameraPtzPresets(camera).reduce((n,p)=>n+(p.rois?.length||0),0)}</td></tr>`).join('');const details=cameras.flatMap(camera=>ensureCameraPtzPresets(camera).map((preset,presetIndex)=>`<section>${presetIndex===0&&cameraContexts.get(camera.id)?`<h3>${escape(camera.name)} - Scene Context</h3><img style="width:100%" src="${cameraContexts.get(camera.id)}">`:``}<h3>${escape(camera.name)} - ${escape(preset.name)}</h3>${presetViews.get(`${camera.id}:${preset.id}`)?`<img style="width:100%" src="${presetViews.get(`${camera.id}:${preset.id}`)}">`:``}<p>PTZ: ${formatMetric(preset.pan)} deg / ${formatMetric(preset.tilt)} deg / ${formatMetric(preset.roll)} deg; depth ${formatMetric(preset.projectionDistance)} m</p>${(reportSettingsState.includeRois?(preset.rois||[]):[]).map(roi=>`<p><b>${escape(roi.name)}</b>: ${formatPresetRoiAnalysis(roi).replaceAll('\n','<br>')}</p>`).join('')}</section>`)).join('');const win=window.open('','nomad-report');if(!win)return alert('Allow pop-ups to generate the report.');win.document.write(`<!doctype html><title>${escape(reportSettingsState.projectTitle)}</title><style>@page{size:${reportSettingsState.pageSize||'letter'} ${reportSettingsState.orientation||'portrait'};margin:.65in}body{font:11pt Arial;color:#17202a}h1{color:#17324d}table{border-collapse:collapse;width:100%}th,td{border:1px solid #789;padding:5px;text-align:left}section{break-inside:avoid}footer{margin-top:24px;color:#667}@media print{button{display:none}}</style><button onclick="print()">Print / Save PDF</button><h1>${escape(reportSettingsState.projectTitle)}</h1><p>${escape(reportSettingsState.companyName)}${reportSettingsState.website?` - ${escape(reportSettingsState.website)}`:''}<br>Subject: ${escape(reportSettingsState.subject)}<br>Version: ${escape(reportSettingsState.versionNumber)}</p>${reportSettingsState.includeDescription&&reportSettingsState.description?`<h2>Project Description</h2><p>${escape(reportSettingsState.description).replaceAll('\n','<br>')}</p>`:''}${reportSettingsState.includeSceneOverview&&sceneViews.primary?`<h2>Scene Context</h2><img style="width:100%" src="${sceneViews.primary}">`:''}${reportSettingsState.includeOppositeView&&sceneViews.opposite?`<img style="width:100%;margin-top:10px" src="${sceneViews.opposite}">`:''}<p>Client: ${escape(reportSettingsState.client)}<br>Location: ${escape(reportSettingsState.location)}<br>Prepared by: ${escape(reportSettingsState.preparedBy)}<br>Generated: ${new Date().toLocaleString()}</p>${reportSettingsState.includeBom?`<h2>Camera BOM</h2><table><tr><th>Camera</th><th>Make</th><th>Model</th><th>Lens</th><th>Position XYZ</th><th>Presets</th><th>ROIs</th></tr>${rows}</table>`:''}${reportSettingsState.includePresets?`<h2>Preset Analysis</h2>${details}`:''}<footer>${reportSettingsState.watermark?`${escape(reportSettingsState.watermark)} - `:''}N.O.M.A.D. CCTV Digital Twin Simulator - All rights reserved.</footer>`);win.document.close()}
document.getElementById('generateReport')?.addEventListener('click',generateNomadReport);document.getElementById('reportSettings')?.addEventListener('click',editReportSettings);document.getElementById('openReportOptions')?.addEventListener('click',openReportConfiguration);
document.getElementById('editCopy')?.addEventListener('click', copySelectedObject);
document.getElementById('editCut')?.addEventListener('click', () => { if (copySelectedObject()) toolbarDelete.click(); });
document.getElementById('editPaste')?.addEventListener('click', pasteSceneObject);
document.getElementById('editDelete')?.addEventListener('click', () => toolbarDelete.click());
document.getElementById('editClone')?.addEventListener('click', () => { if (copySelectedObject()) pasteSceneObject(); });
document.getElementById('editAdd')?.addEventListener('click', addBoxObject);
document.getElementById('viewZoomOut')?.addEventListener('click', () => {
  viewerCamera.position.copy(orbitControls.target.clone().add(viewerCamera.position.clone().sub(orbitControls.target).multiplyScalar(1.25)));
  orbitControls.update();
});
document.getElementById('viewFitGrid')?.addEventListener('click', () => {
  orbitControls.target.set(0, 0, 0);
  viewerCamera.position.set(18, 18, 18);
  viewerCamera.lookAt(0, 0, 0);
  orbitControls.update();
});
document.getElementById('viewToggleGrid')?.addEventListener('click', () => {
  preferences.showGrid = !preferences.showGrid;
  applyPreferences({ persist: true });
});
document.getElementById('viewToggleAxes')?.addEventListener('click', () => {
  preferences.showAxes = !preferences.showAxes;
  applyPreferences({ persist: true });
});
document.getElementById('objectAdd')?.addEventListener('click', addBoxObject);
document.getElementById('objectDefine')?.addEventListener('click', () => {
  const item = sceneObjects.find(entry => entry.id === selectedId);
  if (!item) return alert('Select an object first.');
  const name = prompt('Object name:', item.name);
  if (name?.trim()) { item.name = name.trim(); renderSceneTree(); updateObjectInfoPanel(); }
});
document.getElementById('objectProperties')?.addEventListener('click', () => {
  if (!selectedId) return alert('Select an object first.');
  document.body.classList.remove('object-inspector-collapsed');
  updateObjectInfoPanel();
});
document.getElementById('objectLock')?.addEventListener('click', () => {
  const item = sceneObjects.find(entry => entry.id === selectedId);
  if (!item) return alert('Select an object first.');
  item.data = item.data || {};
  item.data.locked = !item.data.locked;
  if (item.data.locked) { transformControls.detach(); transformControls.visible = false; transformControls.enabled = false; }
  else selectObject(item.id);
  setMeasurementStatus(`${item.name} is now ${item.data.locked ? 'locked' : 'unlocked'}.`);
});

function setMeasurementStatus(message) {
  measurementStatus.textContent = message;
}
function setPresetWorkflowStatus(message) {
  if (presetDepthPickBanner) presetDepthPickBanner.textContent = message;
  const status = ptzPresetPanel?.querySelector('.ptz-preset-status');
  if (status) status.textContent = message;
}

function disposeMeasurementVisuals() {
  measurementVisuals.traverse(child => {
    child.geometry?.dispose?.();
    child.material?.map?.dispose?.();
    child.material?.dispose?.();
  });
  measurementVisuals.clear();
  measurementPreviewLine = null;
  measurementPreviewMarker = null;
  measurementHoverMarker = null;
}

function nextMeasurementDisplayId() {
  const used = new Set(measurements.map(record => record.displayId));
  let number = 1;
  while (used.has(`M-${String(number).padStart(3, '0')}`)) number += 1;
  return `M-${String(number).padStart(3, '0')}`;
}

function createMeasurementLabel(record, start, end) {
  const text = `${record.displayId}  ${formatMetric(record.distance)} ${record.unit}`;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(8, 20, 30, 0.88)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = record.kind === 'calibration' ? '#ffb020' : '#00e5ff';
  context.lineWidth = 5;
  context.strokeRect(2.5, 2.5, canvas.width - 5, canvas.height - 5);
  context.fillStyle = '#ffffff';
  context.font = 'bold 44px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const labelHeight = THREE.MathUtils.clamp(start.distanceTo(end) * 0.045, 0.16, 0.55);
  const geometry = new THREE.PlaneGeometry(labelHeight * (canvas.width / canvas.height), labelHeight);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    side: THREE.DoubleSide
  });
  const label = new THREE.Mesh(geometry, material);
  label.renderOrder = 1002;
  label.userData.measurementId = record.id;
  label.userData.measurementDisplayId = record.displayId;
  label.userData.measurementLabel = true;
  label.userData.start = start.clone();
  label.userData.end = end.clone();
  measurementVisuals.add(label);
  return label;
}

function orientMeasurementLabels(camera) {
  measurementVisuals.children.forEach(label => {
    if (!label.userData.measurementLabel) return;
    const start = label.userData.start;
    const end = label.userData.end;
    camera.updateMatrixWorld();
    const firstScreenX = start.clone().project(camera).x;
    const secondScreenX = end.clone().project(camera).x;
    const reverseForPointSequence = firstScreenX > secondScreenX;
    const xAxis = reverseForPointSequence
      ? start.clone().sub(end).normalize()
      : end.clone().sub(start).normalize();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
    const zAxis = cameraPosition.sub(midpoint);
    zAxis.addScaledVector(xAxis, -zAxis.dot(xAxis));
    if (zAxis.lengthSq() < 1e-8) zAxis.set(0, 1, 0).addScaledVector(xAxis, -xAxis.y);
    zAxis.normalize();
    const yAxis = zAxis.clone().cross(xAxis).normalize();
    label.position.copy(midpoint).addScaledVector(yAxis, 0.1);
    label.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis));
  });
}

function addMeasurementVisual(record) {
  const start = new THREE.Vector3(record.start.x, record.start.y, record.start.z);
  const end = new THREE.Vector3(record.end.x, record.end.y, record.end.z);
  const material = new THREE.LineBasicMaterial({
    color: record.kind === 'calibration' ? 0xffb020 : 0x00e5ff,
    depthTest: false
  });
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 1000;
  line.userData.measurementId = record.id;
  line.userData.measurementDisplayId = record.displayId;
  measurementVisuals.add(line);
  const markerGeometry = new THREE.SphereGeometry(0.07, 12, 8);
  [start, end].forEach(point => {
    const marker = new THREE.Mesh(
      markerGeometry.clone(),
      new THREE.MeshBasicMaterial({ color: material.color, depthTest: false })
    );
    marker.renderOrder = 1001;
    marker.position.copy(point);
    marker.userData.measurementId = record.id;
    marker.userData.measurementDisplayId = record.displayId;
    measurementVisuals.add(marker);
  });
  createMeasurementLabel(record, start, end);
}

function restoreMeasurements(records) {
  measurements.length = 0;
  disposeMeasurementVisuals();
  if (!Array.isArray(records)) return;
  records.forEach(record => {
    if (!record?.start || !record?.end) return;
    const safe = {
      id: record.id || `measurement-${Date.now()}-${measurements.length}`,
      displayId: record.displayId || nextMeasurementDisplayId(),
      kind: record.kind === 'calibration' ? 'calibration' : 'distance',
      label: record.label || 'Measurement',
      start: { ...record.start },
      end: { ...record.end },
      distance: Number(record.distance) || 0,
      unit: record.unit || 'm',
      targetId: record.targetId || null,
      createdAt: record.createdAt || new Date().toISOString()
    };
    measurements.push(safe);
    addMeasurementVisual(safe);
  });
}

function cancelMeasurementTool(message = 'Measurement tool cancelled.') {
  measurementMode = null;
  measurementPoints = [];
  clearMeasurementPreview();
  orbitControls.enabled = true;
  renderer.domElement.style.cursor = '';
  setMeasurementStatus(message);
}

function beginMeasurementTool(mode) {
  if (mode === 'calibration') {
    const selected = sceneObjects.find(item => item.id === selectedId);
    if (!selected || selected.type !== 'model') {
      alert('Select the model to calibrate, then start Calibrate Scale.');
      return;
    }
  }
  measurementMode = mode;
  measurementPoints = [];
  clearMeasurementPreview();
  orbitControls.enabled = true;
  renderer.domElement.style.cursor = 'crosshair';
  setMeasurementStatus(mode === 'calibration'
    ? 'Calibration active: click two points. Wheel to zoom; drag to orbit/pan; hold Shift for live magnifier.'
    : 'Distance active: click two points. Wheel to zoom; drag to orbit/pan; hold Shift for live magnifier.');
}

function getMeasurementTargets() {
  const selectedCalibrationTarget = measurementMode === 'calibration'
    ? sceneObjects.find(item => item.id === selectedId && item.type === 'model')
    : null;
  return selectedCalibrationTarget
    ? [selectedCalibrationTarget.object]
    : sceneObjects
      .filter(item => item.type === 'model' || item.data?.referenceImage)
      .map(item => item.object);
}

function closestPointOnTriangleEdge(intersection) {
  const mesh = intersection?.object;
  const geometry = mesh?.geometry;
  const position = geometry?.attributes?.position;
  if (!mesh?.isMesh || !position || !Number.isInteger(intersection.faceIndex)) {
    return { point: intersection.point.clone(), snapped: false };
  }
  const triangleIndex = intersection.faceIndex * 3;
  const index = geometry.index;
  const indices = [0, 1, 2].map(offset => index ? index.getX(triangleIndex + offset) : triangleIndex + offset);
  const vertices = indices.map(vertexIndex => new THREE.Vector3().fromBufferAttribute(position, vertexIndex).applyMatrix4(mesh.matrixWorld));
  let bestPoint = intersection.point.clone();
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
    const candidate = new THREE.Line3(vertices[a], vertices[b]).closestPointToPoint(intersection.point, true, new THREE.Vector3());
    const distance = candidate.distanceTo(intersection.point);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPoint = candidate;
    }
  }
  const cameraDistance = viewerCamera.position.distanceTo(intersection.point);
  const threshold = THREE.MathUtils.clamp(cameraDistance * 0.012, 0.02, 0.5);
  return bestDistance <= threshold
    ? { point: bestPoint, snapped: true }
    : { point: intersection.point.clone(), snapped: false };
}

function pickMeasurementPoint(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, viewerCamera);
  const intersection = raycaster.intersectObjects(getMeasurementTargets(), true)[0];
  if (!intersection) return null;
  return { ...closestPointOnTriangleEdge(intersection), intersection };
}

function clearMeasurementHoverOutline() {
  if (measurementEdgeOutline) {
    scene.remove(measurementEdgeOutline);
    measurementEdgeOutline.geometry.dispose();
    measurementEdgeOutline.material.dispose();
  }
  measurementEdgeOutline = null;
  measurementOutlinedFaceKey = null;
}

function showMeasurementEdgeOutline(intersection) {
  const mesh = intersection?.object;
  const sourceGeometry = mesh?.geometry;
  const position = sourceGeometry?.attributes?.position;
  const faceIndex = intersection?.faceIndex;
  if (!mesh?.isMesh || !position || !Number.isInteger(faceIndex)) return;
  const faceKey = `${mesh.uuid}:${faceIndex}`;
  if (faceKey === measurementOutlinedFaceKey) return;
  clearMeasurementHoverOutline();
  const index = sourceGeometry.index;
  const offset = faceIndex * 3;
  const vertexIndex = slot => index ? index.getX(offset + slot) : offset + slot;
  const vertices = [0, 1, 2].map(slot => (
    new THREE.Vector3().fromBufferAttribute(position, vertexIndex(slot)).applyMatrix4(mesh.matrixWorld)
  ));
  const geometry = new THREE.BufferGeometry().setFromPoints([
    vertices[0], vertices[1],
    vertices[1], vertices[2],
    vertices[2], vertices[0]
  ]);
  const material = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85, depthTest: false });
  measurementEdgeOutline = new THREE.LineSegments(geometry, material);
  measurementEdgeOutline.renderOrder = 999;
  measurementOutlinedFaceKey = faceKey;
  scene.add(measurementEdgeOutline);
}

function ensureMeasurementPreview() {
  if (!measurementHoverMarker) {
    measurementHoverMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })
    );
    measurementHoverMarker.renderOrder = 1001;
    measurementVisuals.add(measurementHoverMarker);
  }
  if (!measurementPreviewMarker) {
    measurementPreviewMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xffb020, depthTest: false })
    );
    measurementPreviewMarker.renderOrder = 1002;
    measurementVisuals.add(measurementPreviewMarker);
  }
  if (!measurementPreviewLine) {
    measurementPreviewLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: 0xffb020, depthTest: false })
    );
    measurementPreviewLine.renderOrder = 1000;
    measurementVisuals.add(measurementPreviewLine);
  }
}

function updateMeasurementPreview(pick) {
  ensureMeasurementPreview();
  measurementHover = pick;
  measurementHoverMarker.visible = Boolean(pick);
  if (!pick) return;
  measurementHoverMarker.position.copy(pick.point);
  measurementHoverMarker.material.color.setHex(pick.snapped ? 0x00ff88 : 0xffffff);
  showMeasurementEdgeOutline(pick.intersection);
  const start = measurementPoints[0];
  measurementPreviewMarker.visible = Boolean(start);
  measurementPreviewLine.visible = Boolean(start);
  if (start) {
    measurementPreviewMarker.position.copy(start);
    measurementPreviewLine.geometry.setFromPoints([start, pick.point]);
    const distance = start.distanceTo(pick.point);
    setMeasurementStatus(`${pick.snapped ? 'Edge snap' : 'Surface'}: ${formatMetric(distance)} m. Click to set the second point; hold Shift for magnifier.`);
  } else {
    setMeasurementStatus(`${pick.snapped ? 'Edge snap ready' : 'Surface ready'}. Click the first point; hold Shift for magnifier.`);
  }
}

function clearMeasurementPreview() {
  measurementHover = null;
  for (const object of [measurementHoverMarker, measurementPreviewMarker, measurementPreviewLine]) {
    if (object) object.visible = false;
  }
  clearMeasurementHoverOutline();
  measurementMagnifier.classList.remove('active');
  measurementMagnifierTarget = null;
  measurementMagnifierView = null;
}

function positionMeasurementMagnifier(event) {
  measurementMagnifier.style.left = `${Math.min(window.innerWidth - 195, event.clientX + 22)}px`;
  measurementMagnifier.style.top = `${Math.max(8, Math.min(window.innerHeight - 195, event.clientY - 90))}px`;
}

function renderMeasurementMagnifier() {
  if (!measurementMagnifier.classList.contains('active') || !measurementMagnifierView) return;
  const { width, height, x, y } = measurementMagnifierView;
  const magnification = preferences.loupeMagnification;
  const cropSize = Math.max(1, Math.min(width, height) / magnification);
  const offsetX = THREE.MathUtils.clamp(x - cropSize / 2, 0, Math.max(0, width - cropSize));
  const offsetY = THREE.MathUtils.clamp(y - cropSize / 2, 0, Math.max(0, height - cropSize));

  measurementMagnifierCamera.position.copy(viewerCamera.position);
  measurementMagnifierCamera.quaternion.copy(viewerCamera.quaternion);
  measurementMagnifierCamera.up.copy(viewerCamera.up);
  measurementMagnifierCamera.fov = viewerCamera.fov;
  measurementMagnifierCamera.zoom = viewerCamera.zoom;
  measurementMagnifierCamera.near = viewerCamera.near;
  measurementMagnifierCamera.far = viewerCamera.far;
  measurementMagnifierCamera.aspect = width / height;
  measurementMagnifierCamera.setViewOffset(width, height, offsetX, offsetY, cropSize, cropSize);
  measurementMagnifierCamera.updateProjectionMatrix();
  const hiddenReticleObjects = [measurementHoverMarker, measurementPreviewMarker].filter(Boolean);
  const priorVisibility = hiddenReticleObjects.map(object => object.visible);
  hiddenReticleObjects.forEach(object => { object.visible = false; });
  try {
    renderCameraView(measurementMagnifierRenderer, measurementMagnifierCamera);
  } finally {
    hiddenReticleObjects.forEach((object, index) => { object.visible = priorVisibility[index]; });
  }
}

function updateMeasurementMagnifier(event, pick) {
  if (!measurementMode || !event.shiftKey || !pick) {
    measurementMagnifier.classList.remove('active');
    measurementMagnifierTarget = null;
    measurementMagnifierView = null;
    return;
  }
  measurementMagnifierTarget = pick.point.clone();
  const rect = renderer.domElement.getBoundingClientRect();
  measurementMagnifierView = {
    width: Math.max(1, rect.width),
    height: Math.max(1, rect.height),
    x: THREE.MathUtils.clamp(event.clientX - rect.left, 0, rect.width),
    y: THREE.MathUtils.clamp(event.clientY - rect.top, 0, rect.height)
  };
  positionMeasurementMagnifier(event);
  measurementMagnifier.classList.add('active');
  renderMeasurementMagnifier();
}
function completeMeasurement() {
  const [start, end] = measurementPoints;
  const measuredDistance = start.distanceTo(end);
  if (!(measuredDistance > 0)) {
    cancelMeasurementTool('The two points must be different. Start the tool and try again.');
    return;
  }
  if (measurementMode === 'calibration') {
    const item = sceneObjects.find(entry => entry.id === selectedId && entry.type === 'model');
    if (!item) return cancelMeasurementTool('The calibration target is no longer selected.');
    const response = window.prompt(`Measured model distance: ${formatMetric(measuredDistance)} project units.\nEnter the real-world distance in metres:`, formatMetric(measuredDistance));
    if (response === null) return cancelMeasurementTool();
    const realDistance = Number(response);
    if (!(realDistance > 0)) {
      alert('Enter a positive real-world distance.');
      return cancelMeasurementTool('Calibration was not applied.');
    }
    const localStart = item.object.worldToLocal(start.clone());
    const localEnd = item.object.worldToLocal(end.clone());
    const factor = realDistance / measuredDistance;
    item.object.scale.multiplyScalar(factor);
    item.object.updateMatrixWorld(true);
    const calibratedStart = item.object.localToWorld(localStart);
    const calibratedEnd = item.object.localToWorld(localEnd);
    item.data = {
      ...item.data,
      calibration: {
        method: 'two-point',
        measuredDistance,
        realDistance,
        unit: 'm',
        scaleFactor: factor,
        calibratedAt: new Date().toISOString()
      }
    };
    const record = {
      id: `calibration-${Date.now()}`,
      displayId: nextMeasurementDisplayId(),
      kind: 'calibration',
      label: `${item.name}: ${formatMetric(realDistance)} m calibration`,
      start: { x: calibratedStart.x, y: calibratedStart.y, z: calibratedStart.z },
      end: { x: calibratedEnd.x, y: calibratedEnd.y, z: calibratedEnd.z },
      distance: realDistance,
      unit: 'm',
      targetId: item.id,
      createdAt: new Date().toISOString()
    };
    measurements.push(record);
    addMeasurementVisual(record);
    updateObjectInfoPanel();
    cancelMeasurementTool(`Scale calibrated: ${formatMetric(measuredDistance)} project units = ${formatMetric(realDistance)} m.`);
    return;
  }
  const record = {
    id: `measurement-${Date.now()}`,
    displayId: nextMeasurementDisplayId(),
    kind: 'distance',
    label: `${formatMetric(measuredDistance)} m`,
    start: { x: start.x, y: start.y, z: start.z },
    end: { x: end.x, y: end.y, z: end.z },
    distance: measuredDistance,
    unit: 'm',
    targetId: null,
    createdAt: new Date().toISOString()
  };
  measurements.push(record);
  addMeasurementVisual(record);
  cancelMeasurementTool(`Distance: ${formatMetric(measuredDistance)} m. Saved with the project.`);
}

renderer.domElement.addEventListener('pointerdown', event => {
  if (!measurementMode || !videoWallOverlay.classList.contains('hidden')) return;
  measurementPointerStart = { x: event.clientX, y: event.clientY };
  measurementPointerMoved = false;
}, true);
renderer.domElement.addEventListener('pointermove', event => {
  if (!measurementMode || !videoWallOverlay.classList.contains('hidden')) return;
  if (measurementPointerStart && Math.hypot(event.clientX - measurementPointerStart.x, event.clientY - measurementPointerStart.y) > 4) {
    measurementPointerMoved = true;
  }
  const pick = pickMeasurementPoint(event);
  updateMeasurementPreview(pick);
  updateMeasurementMagnifier(event, pick);
}, true);
renderer.domElement.addEventListener('pointerleave', () => {
  if (measurementMode) {
    updateMeasurementPreview(null);
    measurementMagnifier.classList.remove('active');
    measurementMagnifierTarget = null;
    measurementMagnifierView = null;
    measurementPointerStart = null;
    measurementPointerMoved = false;
  }
});
window.addEventListener('keyup', event => {
  if (event.key === 'Shift') {
    measurementMagnifier.classList.remove('active');
    measurementMagnifierTarget = null;
    measurementMagnifierView = null;
  }
});
renderer.domElement.addEventListener('click', event => {
  if (!measurementMode || !videoWallOverlay.classList.contains('hidden')) return;
  measurementPointerStart = null;
  if (measurementPointerMoved) {
    measurementPointerMoved = false;
    setMeasurementStatus('View adjusted. Continue navigating or click to place a measurement point.');
    return;
  }
  const pick = pickMeasurementPoint(event);
  if (!pick) {
    setMeasurementStatus('No model/reference surface was hit. Click directly on a visible surface.');
    return;
  }
  measurementPoints.push(pick.point.clone());
  if (measurementPoints.length === 1) {
    ensureMeasurementPreview();
    measurementPreviewMarker.position.copy(measurementPoints[0]);
    measurementPreviewMarker.visible = true;
    measurementPreviewLine.geometry.setFromPoints([measurementPoints[0], measurementPoints[0]]);
    measurementPreviewLine.visible = true;
    setMeasurementStatus('First point captured and shown. Move to preview the line; hold Shift for magnifier.');
  } else {
    completeMeasurement();
  }
}, true);

calibrateScaleToolButton.addEventListener('click', () => beginMeasurementTool('calibration'));
measureDistanceToolButton.addEventListener('click', () => beginMeasurementTool('distance'));
cancelMeasurementToolButton.addEventListener('click', () => cancelMeasurementTool());
clearMeasurementsButton.addEventListener('click', () => {
  if (measurements.length && !confirm('Clear all saved measurement and calibration lines? Model scale will not be reverted.')) return;
  measurements.length = 0;
  disposeMeasurementVisuals();
  cancelMeasurementTool('All measurement lines were cleared.');
});
fitSelectedViewButton.addEventListener('click', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;

  frameObject(item.object);
});

addCameraButton.addEventListener('click', () => {
  const nextNumber = cameraCounter;
  const name = `Camera ${String(nextNumber).padStart(3, '0')}`;

  createCameraObject(
    name,
    new THREE.Vector3(nextNumber * 2, 2, 0)
  );
});

infoName.addEventListener('change', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;

  const requestedName = infoName.value.trim();

  if (!requestedName) {
    infoName.value = item.name;
    return;
  }

  const duplicate = sceneObjects.find(o =>
    o.id !== item.id &&
    o.name.toLowerCase() === requestedName.toLowerCase()
  );

  if (duplicate) {
    alert(`An object named "${requestedName}" already exists.`);
    infoName.value = item.name;
    return;
  }

  item.name = requestedName;

  renderSceneTree();
  updateSelectedToolbar();
});

function updateSelectedPositionFromInspector() {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;

  const x = Number.parseFloat(infoX.value);
  const y = Number.parseFloat(infoY.value);
  const z = Number.parseFloat(infoZ.value);

  if (Number.isFinite(x)) item.object.position.x = x;
  if (Number.isFinite(y)) item.object.position.y = y;
  if (Number.isFinite(z)) item.object.position.z = z;
  if (item.type === 'camera') invalidateActivePtzPreset(item, 'Manual camera movement: no preset is active.');

  updateObjectInfoPanel();
}

infoX.addEventListener('change', updateSelectedPositionFromInspector);
infoY.addEventListener('change', updateSelectedPositionFromInspector);
infoZ.addEventListener('change', updateSelectedPositionFromInspector);

function updateSelectedScaleFromInspector(event) {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;
  if (item.type !== 'model' && item.type !== 'object') return;

  const value = Number.parseFloat(event.target.value);
  if (!Number.isFinite(value) || value <= 0) return;

  if (event.target === infoScaleUniform) {
    item.object.scale.set(value, value, value);
  }

  if (event.target === infoScaleX) {
    item.object.scale.x = value;
  }

  if (event.target === infoScaleY) {
    item.object.scale.y = value;
  }

  if (event.target === infoScaleZ) {
    item.object.scale.z = value;
  }

  updateObjectInfoPanel();
}

function applyRealWorldWidthScale() {

  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);

  if (!item) return;

  const desiredWidth = Number.parseFloat(realWorldWidth.value);

  if (!Number.isFinite(desiredWidth) || desiredWidth <= 0) {
    alert('Please enter a valid real-world width.');
    return;
  }

  const box = new THREE.Box3().setFromObject(item.object);

  const currentWidth = box.max.x - box.min.x;

  if (currentWidth <= 0) {
    alert('Unable to determine current object width.');
    return;
  }

  const scaleFactor = desiredWidth / currentWidth;

  item.object.scale.multiplyScalar(scaleFactor);

  updateObjectInfoPanel();

  frameObject(item.object);

  console.log('Applied real-world width scale:', {
    desiredWidth,
    currentWidth,
    scaleFactor
  });
}

function updateSelectedRotationFromInspector() {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;

  const rotX = Number.parseFloat(infoRotX.value);
  const rotY = Number.parseFloat(infoRotY.value);
  const rotZ = Number.parseFloat(infoRotZ.value);

  if (Number.isFinite(rotX)) {
    item.object.rotation.x = THREE.MathUtils.degToRad(rotX);
  }

  if (Number.isFinite(rotY)) {
    item.object.rotation.y = THREE.MathUtils.degToRad(rotY);
  }

  if (Number.isFinite(rotZ)) {
    item.object.rotation.z = THREE.MathUtils.degToRad(rotZ);
  }
  if (item.type === 'camera') invalidateActivePtzPreset(item, 'Manual camera movement: no preset is active.');

  updateObjectInfoPanel();
}

infoRotX.addEventListener('change', updateSelectedRotationFromInspector);
infoRotY.addEventListener('change', updateSelectedRotationFromInspector);
infoRotZ.addEventListener('change', updateSelectedRotationFromInspector);

infoScaleUniform.addEventListener('input', updateSelectedScaleFromInspector);
infoScaleX.addEventListener('input', updateSelectedScaleFromInspector);
infoScaleY.addEventListener('input', updateSelectedScaleFromInspector);
infoScaleZ.addEventListener('input', updateSelectedScaleFromInspector);

applyRealWorldWidth.addEventListener('click', applyRealWorldWidthScale);

projectionColorInput.addEventListener('input', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  const cone = item.object.userData.projectionCone;
  if (!cone || !cone.material) return;

  cone.material.color.set(projectionColorInput.value);
  cone.material.needsUpdate = true;
});

projectionDistanceSlider.addEventListener('input', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  const distance = Number(projectionDistanceSlider.value);
  cancelCameraPresetAnimation(item, 'Depth changed; recall a preset to display its ROIs.');

  projectionDistanceInput.value = formatMetric(distance);
  projectionDistanceValue.textContent = formatMetric(distance);

  updateProjectionDistance(item, distance);
});

function cameraHasDependentConfiguration(cameraItem) {
  const data = cameraItem?.data || {};
  return ensureCameraPtzPresets(cameraItem).length > 0
    || Boolean(data.depthTarget)
    || Math.abs(Number(data.pan) || 0) > 0.001
    || Math.abs(Number(data.tilt) || 0) > 0.001
    || Math.abs(Number(data.roll) || 0) > 0.001
    || Math.abs((Number(data.zoom) || 1) - 1) > 0.001
    || Math.abs((Number(data.projectionDistance) || 20) - 20) > 0.001;
}

function requestConfiguredCameraChange(cameraItem, nextModel) {
  return new Promise(resolve => {
    document.querySelector('.camera-change-backdrop')?.remove();
    const presetCount = ensureCameraPtzPresets(cameraItem).length;
    const roiCount = ensureCameraPtzPresets(cameraItem).reduce((total, preset) => total + (preset.rois?.length || 0), 0);
    const backdrop = document.createElement('div');
    backdrop.className = 'camera-change-backdrop';
    backdrop.innerHTML = `<div class="camera-change-dialog"><h3>Change configured camera?</h3><p><strong>${cameraItem.name}</strong> contains ${presetCount} PTZ preset(s) and ${roiCount} ROI(s), or other camera-specific analysis.</p><p>Changing from <strong>${cameraItem.data?.model || 'current model'}</strong> to <strong>${nextModel}</strong> can invalidate optical limits and pixel-density results. Clone the camera to compare models without altering this configured instance.</p><div class="camera-change-actions"><button data-choice="cancel">Cancel</button><button data-choice="replace">Replace and Clear Configuration</button><button data-choice="clone">Clone and Apply New Model</button></div></div>`;
    document.body.appendChild(backdrop);
    const finish = choice => { backdrop.remove(); resolve(choice); };
    backdrop.addEventListener('click', event => {
      const choice = event.target.dataset.choice;
      if (choice) finish(choice);
      else if (event.target === backdrop) finish('cancel');
    });
  });
}
cameraModelSelect.addEventListener('focus', () => {
  cameraModelSelect.select();
});

cameraModelSelect.addEventListener('change', async () => {
  if (!selectedId) return;

  let item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  const selectedModel = cameraModelSelect.value;
  const record = cameraDatabaseByModel[selectedModel];

  if (!record) return;

  let clearConfiguration = false;
  if (cameraHasDependentConfiguration(item)) {
    const decision = await requestConfiguredCameraChange(item, selectedModel);
    if (decision === 'cancel') {
      cameraModelSelect.value = item.data?.model || '';
      return;
    }
    clearConfiguration = true;
    if (decision === 'clone') {
      const original = item;
      createCameraObject(`${original.name} - ${selectedModel}`, original.object.position.clone());
      item = sceneObjects.find(entry => entry.id === selectedId);
      if (!item) return;
      item.object.rotation.copy(original.object.rotation);
      item.object.updateMatrixWorld(true);
      closePtzPresetPanel();
    }
  }

  const oldData = item.data || {};
  const oldMin = Number.parseFloat(oldData.focalLengthMinMm);
  const oldMax = Number.parseFloat(oldData.focalLengthMaxMm);
  const oldCurrent = Number.parseFloat(oldData.currentFocalLengthMm);

  let zoomRatio = 0;

  if (
    !clearConfiguration &&
    Number.isFinite(oldMin) &&
    Number.isFinite(oldMax) &&
    Number.isFinite(oldCurrent) &&
    oldMax > oldMin
  ) {
    zoomRatio = (oldCurrent - oldMin) / (oldMax - oldMin);
    zoomRatio = Math.max(0, Math.min(1, zoomRatio));
  }

  const newData = buildCameraDataFromRecord(record);

  const newMin = Number.parseFloat(newData.focalLengthMinMm);
  const newMax = Number.parseFloat(newData.focalLengthMaxMm);

  if (
    Number.isFinite(newMin) &&
    Number.isFinite(newMax) &&
    newMax > newMin
  ) {
    newData.currentFocalLengthMm = newMin + zoomRatio * (newMax - newMin);
    newData.currentFocalLengthMm = Math.max(
      newMin,
      Math.min(newMax, newData.currentFocalLengthMm)
    );

    newData.zoom = newData.currentFocalLengthMm / newMin;

    newData.hfov =
      newData.hfovWide -
      zoomRatio * (newData.hfovWide - newData.hfovTele);

    newData.hfov = Math.max(
      Math.min(newData.hfovWide, newData.hfovTele),
      Math.min(Math.max(newData.hfovWide, newData.hfovTele), newData.hfov)
    );

    newData.supportsZoom = true;
  } else {
    newData.currentFocalLengthMm = newMin || newMax || 0;
    newData.zoom = 1;
    newData.hfov = newData.hfovWide || newData.hfov || 90;
    newData.supportsZoom = false;
  }

  item.data = {
    ...newData,
    ptzPresets: [],
    depthTarget: null,
    activePtzPresetId: null
  };
  refreshCameraPresetDerivedData(item);

  updateCameraProjection(item);

  const renderCamera = item.object.userData.renderCamera;
  if (renderCamera) {
    renderCamera.fov = item.data.hfov;
    renderCamera.far = item.data.projectionDistance;
    renderCamera.updateProjectionMatrix();
  }

  updateObjectInfoPanel();
  if (ptzPresetPanel && activePresetCamera?.id === item.id) {
    ptzPresetPanel.refresh?.(item.data.activePtzPresetId || undefined, { clearSelection: !item.data.activePtzPresetId });
    ptzPresetPanel.querySelector('.ptz-preset-status').textContent = `Camera model changed. Dependent PTZ presets, depth targets, and ROIs were cleared.`;
  }
});

projectionDistanceInput.addEventListener('change', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  const distance = Math.max(1, Number(projectionDistanceInput.value || 20));
  cancelCameraPresetAnimation(item, 'Depth changed; recall a preset to display its ROIs.');

  projectionDistanceInput.value = formatMetric(distance);
  projectionDistanceSlider.value = Math.min(distance, 120);
  projectionDistanceValue.textContent = formatMetric(distance);

  updateProjectionDistance(item, distance);
});

loadProjectButton.addEventListener('click', () => {
  loadProjectFile.click();
});

importModelButton.addEventListener('click', () => {
  importModelFile.click();
});

importReferenceImageButton.addEventListener('click', () => {
  importReferenceImageFile.click();
});

importReferenceImageFile.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(imageUrl, (texture) => {

    const image = texture.image;

    const aspectRatio = image.width / image.height;

    const planeHeight = 10;
    const planeWidth = planeHeight * aspectRatio;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0.02, 0);

    scene.add(plane);

    addSceneObject({
      id: `reference-${Date.now()}`,
      name: file.name,
      type: 'object',
      object: plane,
      selectable: true,
      data: {
        referenceImage: true,
        fileName: file.name
      }
    });

    selectObject(
      sceneObjects[sceneObjects.length - 1].id
    );

    frameObject(plane);

  }, undefined, (error) => {
    console.error('Failed to load reference image:', error);
    alert('Failed to load reference image.');
  });
});

function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function countModelTriangles(object) {
  let triangles = 0;

  object.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;

    const geometry = child.geometry;

    if (geometry.index) {
      triangles += geometry.index.count / 3;
    } else if (geometry.attributes.position) {
      triangles += geometry.attributes.position.count / 3;
    }
  });

  return Math.round(triangles);
}

function registerImportedModel(model, fileName, sourceFormat) {
  const modelId = `model-${Date.now()}`;

  model.userData.sourceFormat = sourceFormat;
  model.userData.fileName = fileName;
  model.userData.layFlatIndex = 0;
  model.userData.layFlatRotations = [
    { x: 0, y: 0, z: 0 },
    { x: Math.PI / 2, y: 0, z: 0 },
    { x: -Math.PI / 2, y: 0, z: 0 },
    { x: 0, y: 0, z: Math.PI / 2 },
    { x: 0, y: 0, z: -Math.PI / 2 },
    { x: 0, y: Math.PI / 2, z: 0 },
    { x: 0, y: -Math.PI / 2, z: 0 }
  ];

const boxBeforeScale = new THREE.Box3().setFromObject(model);
const sizeBeforeScale = boxBeforeScale.getSize(new THREE.Vector3());
const maxDimensionBeforeScale = Math.max(
  sizeBeforeScale.x,
  sizeBeforeScale.y,
  sizeBeforeScale.z
);

let importScale = 1;
let scaleNote = 'Imported as exported; no preset transform was applied.';
let rotationNote = 'No preset rotation applied.';

if (preferences.modelImportPreset === 'hvdcMm') {
  importScale = 0.01;
  model.rotation.x = -Math.PI / 2;
  scaleNote = 'HVDC / mm workflow preset applied: scale 0.01.';
  rotationNote = 'HVDC / mm workflow preset applied: -90 degrees on X axis.';
} else if (preferences.fbxAutoScale && sourceFormat === 'fbx' && maxDimensionBeforeScale > 100) {
  importScale = 0.01;
  scaleNote = 'Large FBX fallback applied: scale 0.01.';
}
model.userData.importRotationNote = rotationNote;

model.scale.multiplyScalar(importScale);
model.userData.importScale = importScale;
model.userData.scaleNote = scaleNote;

console.log(scaleNote);

if (sourceFormat === 'fbx') {
  alignObjectToGround(model);
  console.log('Auto-dropped FBX model to ground after import.');
}

console.log(`Model max dimension before scale: ${formatMetric(maxDimensionBeforeScale)}`);

scene.add(model);

addSceneObject({
  id: modelId,
  name: fileName,
  type: 'model',
  object: model,
  data: {
    sourceFormat,
    importScale,
    maxDimensionBeforeScale,
    importPreset: preferences.modelImportPreset,
    importRotationX: model.rotation.x
  }
});

  const triangleCount = countModelTriangles(model);
  console.log(`Imported ${sourceFormat.toUpperCase()} model: ${fileName}`);
  console.log(`Approximate triangle count: ${triangleCount}`);

  if (triangleCount > 1500000) {
    alert(
      `Model loaded, but it has approximately ${triangleCount.toLocaleString()} triangles.\n\n` +
      'This is above the recommended direct-browser limit. Consider converting/optimizing to GLB.'
    );
  } else if (triangleCount > 750000) {
    alert(
      `Model loaded with approximately ${triangleCount.toLocaleString()} triangles.\n\n` +
      'Performance may be slow. Optimized GLB is recommended for production work.'
    );
  }

  frameObject(model);
  selectObject(modelId);
}

function loadGltfModel(file) {
  const url = URL.createObjectURL(file);
  const loader = new GLTFLoader();

  loader.load(
    url,
    (gltf) => {
      registerImportedModel(gltf.scene, file.name, 'gltf');
      URL.revokeObjectURL(url);
    },
    undefined,
    (error) => {
      console.error('Error loading GLB/glTF model:', error);
      alert('Failed to load GLB/glTF model.');
      URL.revokeObjectURL(url);
    }
  );
}

function loadFbxModel(file) {
  const sizeMb = file.size / (1024 * 1024);

  if (sizeMb > 150) {
    alert(
      'This FBX file is too large for direct browser loading.\n\n' +
      'Please convert it to optimized GLB using NOMAD 3D Converter.'
    );
    return;
  }

  if (sizeMb > 75) {
    const proceed = confirm(
      `This FBX file is ${formatMetric(sizeMb)} MB. Direct browser loading may freeze or crash the viewer.\n\n` +
      'Recommended action: convert it to optimized GLB using NOMAD 3D Converter.\n\n' +
      'Load anyway?'
    );

    if (!proceed) return;
  } else if (sizeMb > 25) {
    const proceed = confirm(
      `This FBX file is ${formatMetric(sizeMb)} MB. It may take time to load.\n\n` +
      'Load anyway?'
    );

    if (!proceed) return;
  }

  const url = URL.createObjectURL(file);
  const loader = new FBXLoader();

  loader.load(
    url,
    (model) => {
      registerImportedModel(model, file.name, 'fbx');
      URL.revokeObjectURL(url);
    },
    undefined,
    (error) => {
      console.error('Error loading FBX model:', error);
      alert('Failed to load FBX model.');
      URL.revokeObjectURL(url);
    }
  );
}

importModelFile.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const extension = getFileExtension(file.name);

  if (extension === 'fbx') {
    loadFbxModel(file);
  } else if (extension === 'glb' || extension === 'gltf') {
    loadGltfModel(file);
  } else {
    alert('Unsupported model format. Please select a .glb, .gltf, or .fbx file.');
  }

  importModelFile.value = '';
});

function analyzeModelPlanes(object) {
  const planes = [];

  object.updateMatrixWorld(true);

  object.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;

    const geometry = child.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;

    if (!position) return;

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld);

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();

    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();
    const normal = new THREE.Vector3();

    const readVertex = (vertexIndex, target) => {
      target.fromBufferAttribute(position, vertexIndex);
      child.localToWorld(target);
    };

    const totalTriangleCount = index ? index.count / 3 : position.count / 3;
    const maxTrianglesToAnalyze = 50000;
    const step = Math.max(1, Math.floor(totalTriangleCount / maxTrianglesToAnalyze));

    for (let i = 0; i < totalTriangleCount; i += step) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      readVertex(ia, a);
      readVertex(ib, b);
      readVertex(ic, c);

      ab.subVectors(b, a);
      ac.subVectors(c, a);

      normal.crossVectors(ab, ac).normalize();

      const area = ab.cross(ac).length() / 2;

      if (!Number.isFinite(area) || area <= 0.000001) continue;

      planes.push({
        normal: normal.clone(),
        area
      });
    }
  });

  planes.sort((p1, p2) => p2.area - p1.area);

  console.log('Top plane candidates:', planes.slice(0, 20));

  return planes;
}

toolbarLayFace.addEventListener('click', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item) return;

  if (item.type !== 'model' && item.type !== 'object') return;

  const planes = analyzeModelPlanes(item.object);

  alert(`Detected ${planes.length} triangle planes. Check browser console for top candidates.`);
});

function buildProjectAssetManifest() {
  const modelAssets = sceneObjects
    .filter(item => item.type === 'model')
    .map(item => {
      const browserLocal = Boolean(item.data?.sourceFormat);
      const sourceFormat =
        item.data?.sourceFormat ||
        item.object.userData.sourceFormat ||
        'glb';

      return {
        id: item.id,
        name: item.name,
        fileName: item.object.userData.fileName || item.name,
        sourceFormat,
        storage: browserLocal ? 'browser-session' : 'server',
        restorable: !browserLocal
      };
    });

  const referenceImageAssets = sceneObjects
    .filter(item => item.data?.referenceImage)
    .map(item => ({
      id: item.id,
      name: item.name,
      fileName: item.data?.fileName || item.name,
      sourceFormat: 'image',
      storage: 'browser-session',
      restorable: false
    }));

  const warnings = [
    ...modelAssets
      .filter(asset => !asset.restorable)
      .map(asset => ({
        code: 'LOCAL_MODEL_NOT_EMBEDDED',
        severity: 'warning',
        assetId: asset.id,
        assetName: asset.name,
        message: `${asset.name} is a browser-local ${asset.sourceFormat.toUpperCase()} model and is not embedded in the project JSON. Re-import the source file before loading this project.`
      })),
    ...referenceImageAssets.map(asset => ({
      code: 'REFERENCE_IMAGE_NOT_EMBEDDED',
      severity: 'warning',
      assetId: asset.id,
      assetName: asset.name,
      message: `${asset.name} is a browser-local reference image and is not embedded in the project JSON. Re-import the image before loading this project.`
    }))
  ];

  return {
    generatedAt: new Date().toISOString(),
    models: modelAssets,
    referenceImages: referenceImageAssets,
    warnings
  };
}

function formatAssetWarningMessage(warnings) {
  return warnings
    .map((warning, index) => `${index + 1}. ${warning.message}`)
    .join('\n');
}

function validateProjectSchema(project) {
  const rawSchemaVersion =
    project?.schemaVersion ?? LEGACY_PROJECT_SCHEMA_VERSION;
  const schemaVersion = Number(rawSchemaVersion);

  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    alert('Project file has an invalid schemaVersion and cannot be loaded.');
    return false;
  }

  if (schemaVersion > PROJECT_SCHEMA_VERSION) {
    alert(
      `This project uses schema version ${schemaVersion}, but this simulator supports up to version ${PROJECT_SCHEMA_VERSION}.\n\n` +
      'Open it with a newer simulator version.'
    );
    return false;
  }

  if (schemaVersion < PROJECT_SCHEMA_VERSION) {
    alert(
      `Legacy project schema ${schemaVersion} detected. It will load in compatibility mode.\n\n` +
      'Legacy files do not identify whether imported models or reference images were embedded. Confirm required assets are already loaded or re-import them.'
    );
  }

  return true;
}

function showProjectAssetWarnings(project) {
  const warnings = project?.assetManifest?.warnings;
  if (!Array.isArray(warnings) || warnings.length === 0) return true;

  return confirm(
    'Project asset warning:\n\n' +
    formatAssetWarningMessage(warnings) +
    '\n\nCamera records and transforms can still load, but missing browser-local assets must be re-imported. Continue loading?'
  );
}
function applyLoadedProject(project) {
  if (!project || !Array.isArray(project.cameras)) {
    alert('Project file does not contain a valid cameras array.');
    return;
  }

  if (project.reportSettings && typeof project.reportSettings === 'object') reportSettingsState={...reportSettingsState,...project.reportSettings};
  if (project.preferences && typeof project.preferences === 'object') {
    preferences = sanitizePreferences({ ...preferences, ...project.preferences });
    applyPreferences({ persist: true });
  }
  if (project.workspace?.videoWall) {
    const savedOrder = project.workspace.videoWall.order;
    if (Array.isArray(savedOrder)) videoWallOrder = [...savedOrder];
    const savedLayout = String(project.workspace.videoWall.layout || 'auto');
    if ([...videoWallLayout.options].some(option => option.value === savedLayout)) videoWallLayout.value = savedLayout;
    selectedVideoWallTileIndex = Math.max(0, Number(project.workspace.videoWall.selectedTileIndex) || 0);
    videoWallPresetPanelPercent=THREE.MathUtils.clamp(Number(project.workspace.videoWall.presetPanelPercent)||20,15,50);
    videoWallPtzEnabledBySource.clear();
    const savedPtzSources = project.workspace.videoWall.ptzEnabledSources;
    if (savedPtzSources && typeof savedPtzSources === 'object') {
      Object.entries(savedPtzSources).forEach(([sourceKey, enabled]) => videoWallPtzEnabledBySource.set(sourceKey, Boolean(enabled)));
    }
  }
  if (project.workspace?.panels) {
    document.body.classList.toggle('scene-tree-collapsed', Boolean(project.workspace.panels.sceneTreeCollapsed));
    document.body.classList.toggle('object-inspector-collapsed', Boolean(project.workspace.panels.objectInspectorCollapsed));
    const savedGroups = project.workspace.panels.sceneTreeGroups;
    if (savedGroups && typeof savedGroups === 'object') {
      Object.entries(savedGroups).forEach(([type, collapsed]) => {
        if (sceneTreeGroups[type]) sceneTreeGroups[type].collapsed = Boolean(collapsed);
      });
    }
    const sceneToggle = document.getElementById('sceneTreeToggle');
    const inspectorToggle = document.getElementById('objectInspectorToggle');
    if (sceneToggle) {
      const collapsed = document.body.classList.contains('scene-tree-collapsed');
      sceneToggle.textContent = collapsed ? '\u25B6' : '\u25C0';
      sceneToggle.setAttribute('aria-expanded', String(!collapsed));
    }
    if (inspectorToggle) {
      const collapsed = document.body.classList.contains('object-inspector-collapsed');
      inspectorToggle.textContent = collapsed ? '\u25C0' : '\u25B6';
      inspectorToggle.setAttribute('aria-expanded', String(!collapsed));
    }
  }

  if (Array.isArray(project.models)) {
    project.models.forEach((modelData) => {
      const item = sceneObjects.find(o =>
        o.type === 'model' &&
        (o.id === modelData.id || o.name === modelData.name)
      );

      if (!item) return;

      item.name = modelData.name || item.name;
      if (modelData.data && typeof modelData.data === 'object') {
        item.data = { ...item.data, ...modelData.data };
      }

      item.object.position.set(
        modelData.position?.x ?? item.object.position.x,
        modelData.position?.y ?? item.object.position.y,
        modelData.position?.z ?? item.object.position.z
      );

      item.object.rotation.set(
        modelData.rotation?.x ?? item.object.rotation.x,
        modelData.rotation?.y ?? item.object.rotation.y,
        modelData.rotation?.z ?? item.object.rotation.z
      );

      item.object.scale.set(
        modelData.scale?.x ?? item.object.scale.x,
        modelData.scale?.y ?? item.object.scale.y,
        modelData.scale?.z ?? item.object.scale.z
      );
    });
  }

  if (Array.isArray(project.referenceImages)) {
    project.referenceImages.forEach(imageData => {
      const item = sceneObjects.find(entry => entry.data?.referenceImage && (entry.id === imageData.id || entry.name === imageData.name));
      if (!item) return;
      item.name = imageData.name || item.name;
      item.object.position.set(imageData.position?.x ?? item.object.position.x, imageData.position?.y ?? item.object.position.y, imageData.position?.z ?? item.object.position.z);
      item.object.rotation.set(imageData.rotation?.x ?? item.object.rotation.x, imageData.rotation?.y ?? item.object.rotation.y, imageData.rotation?.z ?? item.object.rotation.z);
      item.object.scale.set(imageData.scale?.x ?? item.object.scale.x, imageData.scale?.y ?? item.object.scale.y, imageData.scale?.z ?? item.object.scale.z);
    });
  }

  restoreMeasurements(project.measurements);

  project.cameras.forEach((cameraData, index) => {
    let item = sceneObjects.find(o => o.id === cameraData.id);

    if (!item) {
      createCameraObject(
        cameraData.name || `Camera ${String(index + 1).padStart(3, '0')}`,
        new THREE.Vector3(0, 2, 0)
      );

      item = sceneObjects.find(o => o.id === cameraData.id) ||
             sceneObjects.find(o => o.name === cameraData.name);
    }

    if (!item || item.type !== 'camera') return;

    item.object.position.set(
      cameraData.position?.x ?? 0,
      cameraData.position?.y ?? 2,
      cameraData.position?.z ?? 0
    );

    item.object.rotation.set(
      cameraData.rotation?.x ?? Math.PI / 2,
      cameraData.rotation?.y ?? 0,
      cameraData.rotation?.z ?? 0
    );

    if (cameraData.data) {
      item.data = {
        ...item.data,
        ...cameraData.data
      };
    }

    // Restore current nested data and support legacy top-level PTZ fields.
    item.data.pan = cameraData.data?.pan ?? cameraData.pan ?? item.data.pan ?? 0;
    item.data.tilt = cameraData.data?.tilt ?? cameraData.tilt ?? item.data.tilt ?? 0;
    item.data.roll = cameraData.data?.roll ?? cameraData.roll ?? item.data.roll ?? 0;
    item.data.zoom = cameraData.data?.zoom ?? cameraData.zoom ?? item.data.zoom ?? 1;
    item.data.ptzPresets = (cameraData.data?.ptzPresets || cameraData.ptzPresets || []).map(normalizePtzPreset);

    item.data.projectionDistance =
      cameraData.data?.projectionDistance ??
      cameraData.projectionDistance ??
      20;

    item.object.userData.projectionDistance = item.data.projectionDistance;

    applyCameraPtzRig(item);
    updateCameraProjection(item);

    const cone = item.object.userData.projectionCone;
    if (cone && cone.material && cameraData.color !== undefined) {
      cone.material.color.setHex(cameraData.color);
      cone.material.needsUpdate = true;
    }
  });

  renderSceneTree();
  const savedSelectedId = String(project.workspace?.selectedObjectId || '');
  if (savedSelectedId && sceneObjects.some(item => item.id === savedSelectedId)) selectObject(savedSelectedId);
  else {
    updateSelectedToolbar();
    updateObjectInfoPanel();
  }
  if (project.workspace?.mode === 'videoWall') showVideoWall();
  else hideVideoWall();

}

loadProjectFile.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const project = JSON.parse(e.target.result);
      console.log('Loaded project:', project);

      if (!validateProjectSchema(project)) return;

      if (!showProjectAssetWarnings(project)) return;

      applyLoadedProject(project);
    } catch (err) {
      alert('Invalid project file');
      console.error(err);
    }
  };

  reader.readAsText(file);
});

saveProjectButton.addEventListener('click', () => {
  const assetManifest = buildProjectAssetManifest();

  if (assetManifest.warnings.length > 0) {
    const shouldSave = confirm(
      'This project contains browser-local assets that are not embedded in the JSON:\n\n' +
      formatAssetWarningMessage(assetManifest.warnings) +
      '\n\nSave the project anyway?'
    );

    if (!shouldSave) {
      projectDownloadExtension = 'nmd';
      return;
    }
  }

  const project = {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    assetManifest,
    preferences: { ...preferences },
    reportSettings: { ...reportSettingsState },
    workspace: {
      mode: videoWallOverlay.classList.contains('hidden') ? 'planning' : 'videoWall',
      selectedObjectId: selectedId,
      panels: {
        sceneTreeCollapsed: document.body.classList.contains('scene-tree-collapsed'),
        objectInspectorCollapsed: document.body.classList.contains('object-inspector-collapsed'),
        sceneTreeGroups: Object.fromEntries(Object.entries(sceneTreeGroups).map(([type, group]) => [type, Boolean(group.collapsed)]))
      },
      videoWall: {
        layout: videoWallLayout.value,
        order: [...videoWallOrder],
        selectedTileIndex: selectedVideoWallTileIndex,
        presetPanelPercent: videoWallPresetPanelPercent,
        ptzEnabledSources: Object.fromEntries(videoWallPtzEnabledBySource)
      }
    },

    model: {
      file: loadedModelFile,
      path: loadedModelPath
    },

    models: sceneObjects
      .filter(item => item.type === 'model')
      .map(item => ({
        id: item.id,
        name: item.name,
        position: {
          x: item.object.position.x,
          y: item.object.position.y,
          z: item.object.position.z
        },
        rotation: {
          x: item.object.rotation.x,
          y: item.object.rotation.y,
          z: item.object.rotation.z
        },
        scale: {
          x: item.object.scale.x,
          y: item.object.scale.y,
          z: item.object.scale.z
        },
        data: { ...item.data }
      })),

    referenceImages: sceneObjects
      .filter(item => item.data?.referenceImage)
      .map(item => ({
        id: item.id,
        name: item.name,
        fileName: item.data?.fileName || item.name,
        position: { x: item.object.position.x, y: item.object.position.y, z: item.object.position.z },
        rotation: { x: item.object.rotation.x, y: item.object.rotation.y, z: item.object.rotation.z },
        scale: { x: item.object.scale.x, y: item.object.scale.y, z: item.object.scale.z }
      })),
    measurements: measurements.map(record => ({
      ...record,
      start: { ...record.start },
      end: { ...record.end }
    })),

    cameras: sceneObjects
      .filter(item => item.type === 'camera')
      .map(item => ({
        id: item.id,
        name: item.name,
        position: {
          x: item.object.position.x,
          y: item.object.position.y,
          z: item.object.position.z
        },
        rotation: {
          x: item.object.rotation.x,
          y: item.object.rotation.y,
          z: item.object.rotation.z
        },
        data: {
          ...item.data
        },
        projectionDistance: item.data?.projectionDistance || item.object.userData.projectionDistance,
        color: item.object.userData.projectionCone.material.color.getHex()
      }))
  };

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `nomad_project_${new Date().toISOString().replace(/[:.]/g, '-')}.${projectDownloadExtension}`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Firefox and managed Chromium need the object URL to survive the click task.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  projectDownloadExtension = 'nmd';
});

window.addEventListener('keydown', (event) => {
  if(event.key==='Escape'&&editingPresetRoiId){editingPresetRoiId=null;ptzPresetPanel?.refreshLive?.();const button=ptzPresetPanel?.querySelector('[data-action=\"roi-edit\"]');if(button)button.textContent='Edit ROI';return}
  if (event.key === 'Escape' && pendingPresetDepthCamera) {
    const cameraItem = pendingPresetDepthCamera;
    const dock = pendingPresetDepthDock;
    endPresetDepthSelection();
    setPresetWorkflowStatus('Preset depth selection cancelled.');
    openPtzPresetPanel(cameraItem, dock);
    return;
  }
  const isUndo = event.ctrlKey && event.key.toLowerCase() === 'z';
  const isRedo = event.ctrlKey && event.key.toLowerCase() === 'y';

  if (!isUndo && !isRedo) return;

  event.preventDefault();

  if (isUndo) {
    const previousState = undoStack.pop();
    if (!previousState) return;

    const item = sceneObjects.find(o => o.id === previousState.id);
    if (!item) return;

    redoStack.push(captureObjectState(item));
    restoreObjectState(previousState);
  }

  if (isRedo) {
    const nextState = redoStack.pop();
    if (!nextState) return;

    const item = sceneObjects.find(o => o.id === nextState.id);
    if (!item) return;

    undoStack.push(captureObjectState(item));
    restoreObjectState(nextState);
  }
});

function fitRendererToHost(targetRenderer, host, aspect) {
  const availableWidth = Math.max(1, host.clientWidth);
  const availableHeight = Math.max(1, host.clientHeight);
  const safeAspect = Math.max(0.01, Number(aspect) || availableWidth / availableHeight);
  let width = availableWidth, height = availableHeight;
  if (availableWidth / availableHeight > safeAspect) width = Math.max(1, Math.round(availableHeight * safeAspect));
  else height = Math.max(1, Math.round(availableWidth / safeAspect));
  const resized = Number.parseFloat(targetRenderer.domElement.style.width) !== width || Number.parseFloat(targetRenderer.domElement.style.height) !== height;
  if (resized) targetRenderer.setSize(width, height, false);
  targetRenderer.domElement.style.width = `${width}px`;
  targetRenderer.domElement.style.height = `${height}px`;
  targetRenderer.domElement.style.position = 'relative';
  return { width, height, resized };
}
function renderCameraView(targetRenderer, targetCamera) {
  const helper = transformControls.getHelper ? transformControls.getHelper() : transformControls;
  const hidden = [helper];
  sceneObjects
    .filter(item => item.type === 'camera')
    .forEach(item => {
      hidden.push(item.object.userData.cameraBody, item.object.userData.projectionCone);
    });
  const visibility = hidden.map(object => object ? object.visible : null);
  hidden.forEach(object => { if (object) object.visible = false; });
  try {
    orientMeasurementLabels(targetCamera);
    targetRenderer.render(scene, targetCamera);
  } finally {
    hidden.forEach((object, index) => { if (object) object.visible = visibility[index]; });
  }
}
function renderVideoWallRecords(records) {
  const helper = transformControls.getHelper ? transformControls.getHelper() : transformControls;
  const previousVisible = helper.visible;
  helper.visible = false;
  records.forEach(record => {
    if (!record.host?.isConnected) return;
    const hostWidth = Math.max(1, record.host.clientWidth);
    const hostHeight = Math.max(1, record.host.clientHeight);
    const sourceAspect = record.sourceKey === 'scene'
      ? hostWidth / hostHeight
      : (Number(record.item?.data?.resolutionWidth) || 1920) / (Number(record.item?.data?.resolutionHeight) || 1080);
    const fitted = fitRendererToHost(record.renderer, record.host, sourceAspect);
    if (fitted.resized && record.item) refreshPresetRoiOverlays(record.item);
    if (record.sourceKey === 'scene') {
      record.camera.position.copy(viewerCamera.position);
      record.camera.quaternion.copy(viewerCamera.quaternion);
      record.camera.fov = viewerCamera.fov;
      record.camera.near = viewerCamera.near;
      record.camera.far = viewerCamera.far;
      record.camera.zoom = viewerCamera.zoom;
    } else if (!syncWallCamera(record.camera, record.item)) {
      return;
    }
    record.camera.aspect = sourceAspect;
    record.camera.updateProjectionMatrix();
    renderCameraView(record.renderer, record.camera);
  });
  helper.visible = previousVisible;
}
function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();
  updateSceneNavigationOverlays();
  updatePtzPresetAnimations(performance.now());

  if (selectedId) {
    updateObjectInfoPanel();
  }

  orientMeasurementLabels(viewerCamera);
  renderer.render(scene, viewerCamera);
  renderVideoWallRecords(videoWallRecords);
  renderVideoWallRecords(popupVideoWallRecords);
  renderMeasurementMagnifier();
  openCameraViewports.forEach((viewportRecord) => {
    if (viewportRecord.isRenderable && !viewportRecord.isRenderable()) return;

    const cameraItem = sceneObjects.find(o => o.id === viewportRecord.cameraId);
    if (!cameraItem || cameraItem.type !== 'camera') return;

    const renderCamera = viewportRecord.camera;
    if (!renderCamera) return;

    const sourceRenderCamera = cameraItem.object.userData.renderCamera;

    if (sourceRenderCamera) {

      renderCamera.position.copy(
        sourceRenderCamera.getWorldPosition(new THREE.Vector3())
      );

      renderCamera.quaternion.copy(
        sourceRenderCamera.getWorldQuaternion(new THREE.Quaternion())
      );

      renderCamera.fov = sourceRenderCamera.fov;
      renderCamera.near = sourceRenderCamera.near;
      renderCamera.far = sourceRenderCamera.far;
      renderCamera.zoom = sourceRenderCamera.zoom;

      renderCamera.updateProjectionMatrix();
    }

    const helper = transformControls.getHelper ? transformControls.getHelper() : transformControls;

    const previousVisible = helper.visible;
    helper.visible = false;

    renderCameraView(viewportRecord.renderer, renderCamera);

    helper.visible = previousVisible;
  });
}

loadCameraDatabase().then(() => {
  createCameraObject('Camera 001', new THREE.Vector3(0, 2, 0));
  animate();
});

window.nomadDebug = {
  sceneObjects,
  updateCameraProjection
};

window.addEventListener('resize', () => {
  viewerCamera.aspect = container.clientWidth / container.clientHeight;
  viewerCamera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
