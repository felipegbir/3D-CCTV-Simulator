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
let videoWallOrder = ['scene'];
const APP_VERSION = '8e.7';
const PROJECT_SCHEMA_VERSION = 3;
const LEGACY_PROJECT_SCHEMA_VERSION = 1;
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
const closeVideoWallButton = document.getElementById('closeVideoWall');
const refreshVideoWallButton = document.getElementById('refreshVideoWall');
const popOutVideoWallOverlayButton = document.getElementById('popOutVideoWallOverlay');
const calibrateScaleToolButton = document.getElementById('calibrateScaleTool');
const measureDistanceToolButton = document.getElementById('measureDistanceTool');
const cancelMeasurementToolButton = document.getElementById('cancelMeasurementTool');
const clearMeasurementsButton = document.getElementById('clearMeasurements');
const measurementStatus = document.getElementById('measurementStatus');

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
let selectedId = null;
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
  modelImportPreset: 'hvdcMm'
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

  for (const key of ['reversePan', 'reverseTilt', 'invertZoom', 'showGrid', 'showAxes', 'fbxAutoScale']) {
    if (typeof candidate[key] === 'boolean') safe[key] = candidate[key];
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
    modelImportPreset: preferenceControls.modelImportPreset.value
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
  preferenceControls.fbxAutoScale,
  preferenceControls.modelImportPreset
]) {
  control.addEventListener('change', updatePreferencesFromControls);
}

preferenceControls.coneOpacity.addEventListener('input', updatePreferencesFromControls);
preferenceControls.reset.addEventListener('click', () => {
  preferences = { ...DEFAULT_PREFERENCES };
  applyPreferences({ persist: true });
});

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
    header.className = 'section-title';
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
    return;
  }

  const item = sceneObjects.find(o => o.id === selectedId);

  if (!item) {
    objectInfoPanel.classList.add('hidden');
    return;
  }

  const pos = item.object.position;

  objectInfoPanel.classList.remove('hidden');

  if (document.activeElement !== infoName) {
    infoName.value = item.name;
  }
  infoType.textContent = item.type;

  if (document.activeElement !== infoX) {
    infoX.value = pos.x.toFixed(2);
  }

  if (document.activeElement !== infoY) {
    infoY.value = pos.y.toFixed(2);
  }

  if (document.activeElement !== infoZ) {
    infoZ.value = pos.z.toFixed(2);
  }

  const rot = item.object.rotation;

  if (document.activeElement !== infoRotX) {
    infoRotX.value = THREE.MathUtils.radToDeg(rot.x).toFixed(1);
  }

  if (document.activeElement !== infoRotY) {
    infoRotY.value = THREE.MathUtils.radToDeg(rot.y).toFixed(1);
  }

  if (document.activeElement !== infoRotZ) {
    infoRotZ.value = THREE.MathUtils.radToDeg(rot.z).toFixed(1);
  }

  const scale = item.object.scale;

  if (document.activeElement !== infoScaleUniform) {
    infoScaleUniform.value = scale.x.toFixed(3);
  }

  if (document.activeElement !== infoScaleX) {
    infoScaleX.value = scale.x.toFixed(3);
  }

  if (document.activeElement !== infoScaleY) {
    infoScaleY.value = scale.y.toFixed(3);
  }

  if (document.activeElement !== infoScaleZ) {
    infoScaleZ.value = scale.z.toFixed(3);
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
    infoZoom.textContent = `${(item.data?.zoom ?? 1).toFixed(1)}x`;

    const cone = item.object.userData.projectionCone;
    const distance = item.object.userData.projectionDistance || 20;

    if (cone && cone.material) {
      const hex = `#${cone.material.color.getHexString()}`;
      projectionColorInput.value = hex;
    }

    projectionDistanceSlider.value = distance;
    projectionDistanceInput.value = distance;
    projectionDistanceValue.textContent = distance;

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
        projectionHfovValue.textContent = `${hfov.toFixed(1)}°`;
        projectionSceneWidthValue.textContent = `${sceneWidth.toFixed(2)} m`;
        projectionPixelDensityValue.textContent = `${pixelDensity.toFixed(2)} px/m`;
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
  transformControls.attach(item.object);
  transformControls.visible = true;
  transformControls.enabled = true;
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
    renderCamera.far = projectionDistance;
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

function getVideoWallSources() {
  const cameras = sceneObjects.filter(item => item.type === 'camera').slice(0, MAX_CAMERA_VIEWPORTS);
  const available = new Map([['scene', { key: 'scene', label: 'Planning Scene', item: null }]]);
  cameras.forEach(item => available.set(item.id, { key: item.id, label: item.name, item }));
  videoWallOrder = videoWallOrder.filter(key => available.has(key));
  available.forEach((value, key) => { if (!videoWallOrder.includes(key)) videoWallOrder.push(key); });
  return videoWallOrder.map(key => available.get(key));
}

function disposeVideoWallRecords(records) {
  records.forEach(record => record.renderer.dispose());
  records.length = 0;
}

function getWallColumns(count, selection) {
  if (selection !== 'auto') return Number(selection) || 1;
  return Math.max(1, Math.min(5, Math.ceil(Math.sqrt(Math.max(1, count)))));
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

function createWallTile(doc, host, source, records, onDrop) {
  const tile = doc.createElement('div');
  tile.className = 'video-wall-tile';
  tile.dataset.sourceKey = source.key;
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
  tile.appendChild(label);
  host.appendChild(tile);
  const wallRenderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  configureRendererQuality(wallRenderer);
  tile.appendChild(wallRenderer.domElement);
  const wallCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 10000);
  records.push({ sourceKey: source.key, item: source.item, renderer: wallRenderer, camera: wallCamera, host: tile });
}

function buildIntegratedVideoWall() {
  disposeVideoWallRecords(videoWallRecords);
  videoWallGrid.replaceChildren();
  const sources = getVideoWallSources();
  videoWallGrid.style.setProperty('--wall-columns', String(getWallColumns(sources.length, videoWallLayout.value)));
  sources.forEach(source => createWallTile(document, videoWallGrid, source, videoWallRecords, reorderVideoWall));
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
    #grid{height:calc(100% - 48px);box-sizing:border-box;display:grid;grid-template-columns:repeat(var(--wall-columns,2),minmax(0,1fr));gap:6px;padding:6px}
    .video-wall-tile{min-width:0;min-height:0;position:relative;overflow:hidden;background:#000;border:1px solid #40536a;border-radius:4px}.video-wall-tile.drag-over{outline:3px solid #00aaff}.video-wall-tile canvas{width:100%;height:100%;display:block}.video-wall-label{position:absolute;left:6px;top:6px;z-index:2;padding:4px 7px;border-radius:3px;background:rgba(0,0,0,.7);font-size:12px;cursor:grab;user-select:none}
  </style></head><body><div class="bar"><strong>N.O.M.A.D. Video Wall</strong><label>Layout <select id="layout"><option value="auto">Auto</option><option value="1">1 x 1</option><option value="2">2 x 2</option><option value="3">3 x 3</option><option value="4">4 x 4</option><option value="5">5 x 5</option></select></label><button id="refresh">Refresh Sources</button></div><div id="grid"></div></body></html>`);
  doc.close();
  doc.querySelector('#layout').value = videoWallLayout.value;
  doc.querySelector('#layout').addEventListener('change', buildPopupVideoWall);
  doc.querySelector('#refresh').addEventListener('click', buildPopupVideoWall);
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
  const layout = doc.querySelector('#layout').value;
  grid.style.setProperty('--wall-columns', String(getWallColumns(sources.length, layout)));
  sources.forEach(source => createWallTile(doc, grid, source, popupVideoWallRecords, reorderVideoWall));
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
  const rollLeftBtn = viewport.querySelector('.viewport-roll-left');
  const rollRightBtn = viewport.querySelector('.viewport-roll-right');
  const ptzHint = viewport.querySelector('.viewport-ptz-hint');
  const paletteSelect = viewport.querySelector('.viewport-palette-select');
  const paletteLabel = viewport.querySelector('.viewport-palette-label');

  let viewportPtzEnabled = false;

  ptzToggleBtn.style.display = 'none';

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
  let selectedViewportPalette = getDefaultViewportPalette(cameraItem);

  if (paletteSelect) {
    paletteSelect.value = selectedViewportPalette;

    paletteSelect.addEventListener('change', () => {
      selectedViewportPalette = paletteSelect.value;
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

  function resizeCameraViewportRenderer() {
    const width = Math.max(1, body.clientWidth);
    const height = Math.max(1, body.clientHeight);

    viewportRenderer.setSize(width, height, false);

    viewportRenderer.setViewport(
      0,
      0,
      width,
      height
    );

    if (viewportCamera && height > 0) {
      viewportCamera.aspect = width / height;
      viewportCamera.updateProjectionMatrix();
    }
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

        updateObjectInfoPanel();
      }

      function rollCameraFromViewport(direction) {
        if (!viewportPtzEnabled) return;

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

    viewportRenderer.render(scene, viewportCamera);

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

      if (paletteLabel) {
        paletteLabel.style.display = 'none';
      }

      setViewportPtzEnabled(false);
      applyViewportPalette(viewportRenderer, selectedViewportPalette);

    }
  });

  openCameraViewports.push({
    cameraId: cameraItem.id,
    element: viewport,
    renderer: viewportRenderer,
    body: body,
    camera: viewportCamera,
    isRenderable: () => !isMinimized
  });
  focusCameraViewport(viewport);
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
    0.1,
    projectionDistance
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




function setMeasurementStatus(message) {
  measurementStatus.textContent = message;
}

function disposeMeasurementVisuals() {
  measurementVisuals.traverse(child => {
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  });
  measurementVisuals.clear();
}

function addMeasurementVisual(record) {
  const start = new THREE.Vector3(record.start.x, record.start.y, record.start.z);
  const end = new THREE.Vector3(record.end.x, record.end.y, record.end.z);
  const material = new THREE.LineBasicMaterial({ color: record.kind === 'calibration' ? 0xffb020 : 0x00e5ff });
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const line = new THREE.Line(geometry, material);
  line.userData.measurementId = record.id;
  measurementVisuals.add(line);
  const markerGeometry = new THREE.SphereGeometry(0.07, 12, 8);
  [start, end].forEach(point => {
    const marker = new THREE.Mesh(markerGeometry.clone(), new THREE.MeshBasicMaterial({ color: material.color }));
    marker.position.copy(point);
    marker.userData.measurementId = record.id;
    measurementVisuals.add(marker);
  });
}

function restoreMeasurements(records) {
  measurements.length = 0;
  disposeMeasurementVisuals();
  if (!Array.isArray(records)) return;
  records.forEach(record => {
    if (!record?.start || !record?.end) return;
    const safe = {
      id: record.id || `measurement-${Date.now()}-${measurements.length}`,
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
  orbitControls.enabled = false;
  renderer.domElement.style.cursor = 'crosshair';
  setMeasurementStatus(mode === 'calibration'
    ? 'Calibration active: click two points on the selected model.'
    : 'Distance tool active: click two surface points.');
}

function pickMeasurementPoint(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, viewerCamera);
  const selectedCalibrationTarget = measurementMode === 'calibration'
    ? sceneObjects.find(item => item.id === selectedId && item.type === 'model')
    : null;
  const targets = selectedCalibrationTarget
    ? [selectedCalibrationTarget.object]
    : sceneObjects
      .filter(item => item.type === 'model' || item.data?.referenceImage)
      .map(item => item.object);
  return raycaster.intersectObjects(targets, true)[0]?.point?.clone() || null;
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
    const response = window.prompt(`Measured model distance: ${measuredDistance.toFixed(4)} project units.\nEnter the real-world distance in metres:`, measuredDistance.toFixed(3));
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
      kind: 'calibration',
      label: `${item.name}: ${realDistance.toFixed(3)} m calibration`,
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
    cancelMeasurementTool(`Scale calibrated: ${measuredDistance.toFixed(4)} project units = ${realDistance.toFixed(3)} m.`);
    return;
  }
  const record = {
    id: `measurement-${Date.now()}`,
    kind: 'distance',
    label: `${measuredDistance.toFixed(3)} m`,
    start: { x: start.x, y: start.y, z: start.z },
    end: { x: end.x, y: end.y, z: end.z },
    distance: measuredDistance,
    unit: 'm',
    targetId: null,
    createdAt: new Date().toISOString()
  };
  measurements.push(record);
  addMeasurementVisual(record);
  cancelMeasurementTool(`Distance: ${measuredDistance.toFixed(3)} m. Saved with the project.`);
}

renderer.domElement.addEventListener('click', event => {
  if (!measurementMode || !videoWallOverlay.classList.contains('hidden')) return;
  const point = pickMeasurementPoint(event);
  if (!point) {
    setMeasurementStatus('No model/reference surface was hit. Click directly on a visible surface.');
    return;
  }
  measurementPoints.push(point);
  if (measurementPoints.length === 1) {
    setMeasurementStatus('First point captured. Click the second point.');
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

  projectionDistanceInput.value = distance;
  projectionDistanceValue.textContent = distance;

  updateProjectionDistance(item, distance);
});

cameraModelSelect.addEventListener('focus', () => {
  cameraModelSelect.select();
});

cameraModelSelect.addEventListener('change', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  const selectedModel = cameraModelSelect.value;
  const record = cameraDatabaseByModel[selectedModel];

  if (!record) return;

  const oldData = item.data || {};
  const oldMin = Number.parseFloat(oldData.focalLengthMinMm);
  const oldMax = Number.parseFloat(oldData.focalLengthMaxMm);
  const oldCurrent = Number.parseFloat(oldData.currentFocalLengthMm);

  let zoomRatio = 0;

  if (
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

  item.data = newData;

  updateCameraProjection(item);

  const renderCamera = item.object.userData.renderCamera;
  if (renderCamera) {
    renderCamera.fov = item.data.hfov;
    renderCamera.far = item.data.projectionDistance;
    renderCamera.updateProjectionMatrix();
  }

  updateObjectInfoPanel();
});

projectionDistanceInput.addEventListener('change', () => {
  if (!selectedId) return;

  const item = sceneObjects.find(o => o.id === selectedId);
  if (!item || item.type !== 'camera') return;

  const distance = Math.max(1, Number(projectionDistanceInput.value || 20));

  projectionDistanceInput.value = distance;
  projectionDistanceSlider.value = Math.min(distance, 120);
  projectionDistanceValue.textContent = distance;

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

console.log(`Model max dimension before scale: ${maxDimensionBeforeScale.toFixed(2)}`);

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
      `This FBX file is ${sizeMb.toFixed(1)} MB. Direct browser loading may freeze or crash the viewer.\n\n` +
      'Recommended action: convert it to optimized GLB using NOMAD 3D Converter.\n\n' +
      'Load anyway?'
    );

    if (!proceed) return;
  } else if (sizeMb > 25) {
    const proceed = confirm(
      `This FBX file is ${sizeMb.toFixed(1)} MB. It may take time to load.\n\n` +
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

  if (project.preferences && typeof project.preferences === 'object') {
    preferences = sanitizePreferences({ ...preferences, ...project.preferences });
    applyPreferences({ persist: true });
  }
  if (project.workspace?.videoWall) {
    const savedOrder = project.workspace.videoWall.order;
    if (Array.isArray(savedOrder)) videoWallOrder = [...savedOrder];
    const savedLayout = String(project.workspace.videoWall.layout || 'auto');
    if ([...videoWallLayout.options].some(option => option.value === savedLayout)) videoWallLayout.value = savedLayout;
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
  updateSelectedToolbar();
  updateObjectInfoPanel();

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

    if (!shouldSave) return;
  }

  const project = {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    assetManifest,
    preferences: { ...preferences },
    workspace: {
      mode: videoWallOverlay.classList.contains('hidden') ? 'planning' : 'videoWall',
      videoWall: { layout: videoWallLayout.value, order: [...videoWallOrder] }
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
  a.download = 'nomad_project.json';
  a.click();

  URL.revokeObjectURL(url);
});

window.addEventListener('keydown', (event) => {
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

function renderVideoWallRecords(records) {
  const helper = transformControls.getHelper ? transformControls.getHelper() : transformControls;
  const previousVisible = helper.visible;
  helper.visible = false;
  records.forEach(record => {
    if (!record.host?.isConnected) return;
    const width = Math.max(1, record.host.clientWidth);
    const height = Math.max(1, record.host.clientHeight);
    if (record.renderer.domElement.width !== width || record.renderer.domElement.height !== height) {
      record.renderer.setSize(width, height, false);
    }
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
    record.camera.aspect = width / height;
    record.camera.updateProjectionMatrix();
    record.renderer.render(scene, record.camera);
  });
  helper.visible = previousVisible;
}
function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();

  if (selectedId) {
    updateObjectInfoPanel();
  }

  renderer.render(scene, viewerCamera);
  renderVideoWallRecords(videoWallRecords);
  renderVideoWallRecords(popupVideoWallRecords);
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

    viewportRecord.renderer.render(scene, renderCamera);

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
