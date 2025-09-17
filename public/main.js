const SETTINGS = { maxFaces: 4 };

// texturas
const textureLoader = new THREE.TextureLoader();
const textureSombrero = textureLoader.load('/Sombreo_Base_color.png');

let THREECAMERA = null;

function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO: face n°', faceIndex, 'DETECTED');
  } else {
    console.log('INFO: face n°', faceIndex, 'LOST');
  }
}

// función recursiva para listar meshes
function listMeshes(obj, prefix = '') {
  obj.children.forEach((child, index) => {
    console.log(prefix + index, child.name, child.type);
    if (child.children.length > 0) {
      listMeshes(child, prefix + index + '.');
    }
  });
}

function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  // luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  threeStuffs.scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
  directionalLight.position.set(1, 2, 3);
  threeStuffs.scene.add(directionalLight);

  // cargar GLB
  const loader = new THREE.GLTFLoader();
  loader.load('/LaLeyendaCabeza2.glb', function (gltf) {
    const originalModel = gltf.scene;
    originalModel.scale.set(0.22, 0.22, 0.22);
    originalModel.position.set(0, -0.9, 0);
    // originalModel.rotation.y = Math.PI; // Rota 180 grados en Y (ajusta el valor según lo que necesites)
    // --- LISTAR TODOS LOS MESHES ---
    console.log('=== LISTADO DE MESHES ===');
    listMeshes(originalModel);

    // asignar texturas según nombre
    originalModel.traverse(function (child) {
      if (child.isMesh) {
        child.frustumCulled = false;
        if (child.name.toLowerCase().includes('mesh_0')) {
          child.material = new THREE.MeshStandardMaterial({
            map: textureSombrero,
            color: 0x666666,
            roughness: 0.7,
          });
        } else if (child.name.toLowerCase().includes('mesh_2')) {
          child.material = new THREE.MeshStandardMaterial({
            roughness: 0.2,
            metalness: 0.7,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 2
          });
        } else if (child.name.toLowerCase().includes('mesh_1')) {
          child.material = new THREE.MeshStandardMaterial({ color: 0x000000 });
        }
      }
    });

    // agregar modelo a cada cara
    threeStuffs.faceObjects.forEach(function (faceObject) {
      const modelClone = originalModel.clone();
      faceObject.add(modelClone);
    });
  });

  THREECAMERA = JeelizThreeHelper.create_camera();
}

function main() {
  JeelizResizer.size_canvas({
    canvasId: 'jeeFaceFilterCanvas',
    isFullScreen: true,
    isApplyCSS: true,
    callback: start,
    onResize: function () {
      JeelizThreeHelper.update_camera(THREECAMERA);
    }
  })
}

// entry point
function start() {
  JEELIZFACEFILTER.init({
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: '/neuralNets/',
    maxFacesDetected: SETTINGS.maxFaces,
    videoSettings: {
      'idealWidth': 1280,
      'idealHeight': 800,
      'maxWidth': 1920,
      'maxHeight': 1920
    },
    followZRot: true,

    callbackReady: function (errCode, spec) {
      if (errCode) { console.log('ERROR =', errCode); return; }
      console.log('JEELIZFACEFILTER IS READY');
      init_threeScene(spec);
    },
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    }
  });
}

window.addEventListener('load', main);
