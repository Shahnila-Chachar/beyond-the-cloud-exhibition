import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, ArrowRight, Eye, Layers } from 'lucide-react';

type SceneChapter = 'studio' | 'datacenter' | 'street' | 'comparison';

interface CameraPose {
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMERA_POSES: Record<SceneChapter, CameraPose> = {
  studio: { pos: [-26, 7.5, 14], target: [-20, 2.2, 0] },
  datacenter: { pos: [-7, 9.2, 21], target: [0, 3.2, -2] },
  street: { pos: [26, 7.2, 16], target: [22, 2.4, 0] },
  comparison: { pos: [2, 23, 38], target: [1, 2.2, -1] },
};

interface InspectionInfo {
  title: string;
  subtitle: string;
  detail: string;
}

const INSPECTABLES: Record<string, InspectionInfo> = {
  laptop: {
    title: 'Client Workstation',
    subtitle: 'Application Layer Origin',
    detail: 'Generates an encrypted HTTPS request packet and hands it to the local network interface.',
  },
  router: {
    title: 'Local Gateway & Optical ONT',
    subtitle: 'Last-Mile Access',
    detail: 'Translates local Wi-Fi frames into optical light pulses entering the regional fiber backbone.',
  },
  spineSwitch: {
    title: 'Spine-Leaf Switching Fabric',
    subtitle: 'Data Center East-West & North-South Routing',
    detail: 'Non-blocking high-throughput optical switches route incoming requests to available compute blades.',
  },
  computeRack: {
    title: 'High-Density Compute Racks',
    subtitle: 'Centralized Virtualized Execution',
    detail: 'Multi-socket server blades execute application logic, container workloads, and API orchestration.',
  },
  storageArray: {
    title: 'Distributed NVMe Storage Pool',
    subtitle: 'Persistent State & Replication',
    detail: 'Sub-millisecond flash arrays read and replicate structured records across redundant availability zones.',
  },
  trafficCamera: {
    title: 'Optical & LiDAR Mast Sensor',
    subtitle: 'High-Bitrate Edge Data Source',
    detail: 'Captures 60fps raw video and acoustic telemetry—too bandwidth-heavy to stream raw to a distant cloud.',
  },
  edgeGateway: {
    title: 'Curbside Edge Compute Node',
    subtitle: 'Local Inference & Real-Time Control',
    detail: 'Runs a local vision model directly at the intersection, detecting emergency sirens without WAN round-trips.',
  },
  trafficSignal: {
    title: 'Signal Controller Actuation',
    subtitle: 'Deterministic Local Response',
    detail: 'Receives the local override command from the edge gateway and clears the intersection lane immediately.',
  },
};

export default function BeyondTheCloud() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [chapter, setChapter] = useState<SceneChapter>('studio');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [statusLine, setStatusLine] = useState<string>('Ready — Interact with the workstation or launch a trace');
  const [inspected, setInspected] = useState<InspectionInfo | null>(null);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const stateRef = useRef({
    chapter: 'studio' as SceneChapter,
    isPlaying: false,
    progress: 0,
    cloudSyncEnabled: true,
    reducedMotion: false,
    hoveredKey: null as string | null,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    stateRef.current.reducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      stateRef.current.reducedMotion = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    stateRef.current.chapter = chapter;
    stateRef.current.progress = 0;
    stateRef.current.isPlaying = false;
    setSimProgress(0);
    setIsPlaying(false);
    setInspected(null);

    if (chapter === 'studio') {
      setStatusLine('Studio Origin — Click the laptop or transmit a request toward the remote cloud');
    } else if (chapter === 'datacenter') {
      setStatusLine('Hyperscale Data Hall — Click any rack or trace an internal request through switching, compute, and storage');
    } else if (chapter === 'street') {
      setStatusLine('Urban Edge Intersection — Trigger emergency vehicle detection at the curbside edge node');
    } else {
      setStatusLine('Dual Architecture — Simultaneous race comparing remote cloud round-trip vs. local edge actuation');
    }
  }, [chapter]);

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stateRef.current.cloudSyncEnabled = cloudSyncEnabled;
  }, [cloudSyncEnabled]);

  const triggerSimulation = () => {
    if (stateRef.current.progress >= 0.99) {
      stateRef.current.progress = 0;
      setSimProgress(0);
    }
    stateRef.current.isPlaying = true;
    setIsPlaying(true);
  };

  const resetSimulation = () => {
    stateRef.current.isPlaying = false;
    stateRef.current.progress = 0;
    setIsPlaying(false);
    setSimProgress(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d14');
    scene.fog = new THREE.FogExp2('#090d14', 0.012);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(...CAMERA_POSES.studio.pos);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight('#c8dcff', '#111722', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#f4f7ff', 1.8);
    keyLight.position.set(18, 32, 22);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 95;
    const d = 38;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.7);
    rimLight.position.set(-28, 14, -20);
    scene.add(rimLight);

    const groundGeo = new THREE.PlaneGeometry(160, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#0d131d',
      roughness: 0.82,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(120, 60, '#1e293b', '#131c2b');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    const brushedAluminum = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.78,
      roughness: 0.28,
    });
    const darkAnodized = new THREE.MeshStandardMaterial({
      color: '#1e2634',
      metalness: 0.65,
      roughness: 0.35,
    });
    const warmTimber = new THREE.MeshStandardMaterial({
      color: '#4a3728',
      roughness: 0.68,
      metalness: 0.05,
    });
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: '#161b24',
      roughness: 0.9,
      metalness: 0.05,
    });
    const screenGlowMat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      emissive: '#0284c7',
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });

    const interactiveMeshes: THREE.Object3D[] = [];
    const registerInteractive = (obj: THREE.Object3D, key: string) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData.inspectKey = key;
          interactiveMeshes.push(child);
        }
      });
    };

    // ZONE 1: STUDIO WORKSTATION & LOCAL ROUTER
    const studioGroup = new THREE.Group();
    studioGroup.position.set(-22, 0, 0);
    scene.add(studioGroup);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.22, 3.6), warmTimber);
    deskTop.position.set(0, 1.8, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    studioGroup.add(deskTop);

    [
      [-3.2, -1.5],
      [3.2, -1.5],
      [-3.2, 1.5],
      [3.2, 1.5],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.8, 0.16), darkAnodized);
      leg.position.set(lx, 0.9, lz);
      leg.castShadow = true;
      studioGroup.add(leg);
    });

    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-0.6, 1.92, 0.2);
    laptopGroup.rotation.y = 0.22;
    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 1.15), brushedAluminum);
    laptopBase.castShadow = true;
    laptopGroup.add(laptopBase);

    const laptopLid = new THREE.Group();
    laptopLid.position.set(0, 0.04, -0.55);
    laptopLid.rotation.x = -0.28;
    const lidShell = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.06), brushedAluminum);
    lidShell.position.set(0, 0.55, 0);
    lidShell.castShadow = true;
    laptopLid.add(lidShell);

    const lidScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.96), screenGlowMat);
    lidScreen.position.set(0, 0.55, 0.035);
    laptopLid.add(lidScreen);
    laptopGroup.add(laptopLid);
    studioGroup.add(laptopGroup);
    registerInteractive(laptopGroup, 'laptop');

    const routerGroup = new THREE.Group();
    routerGroup.position.set(2.1, 1.91, -0.5);
    const routerBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 0.65), darkAnodized);
    routerBody.castShadow = true;
    routerGroup.add(routerBody);

    const routerLedMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#38bdf8',
      emissiveIntensity: 1.5,
    });
    const routerLed = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.04), routerLedMat);
    routerLed.position.set(0, 0.04, 0.33);
    routerGroup.add(routerLed);
    studioGroup.add(routerGroup);
    registerInteractive(routerGroup, 'router');

    // ZONE 2: HYPERSCALE DATA CENTER HALL
    const dcGroup = new THREE.Group();
    dcGroup.position.set(0, 0, -2);
    scene.add(dcGroup);

    const dcPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.3, 14),
      new THREE.MeshStandardMaterial({ color: '#141c28', roughness: 0.4, metalness: 0.5 })
    );
    dcPlinth.position.y = 0.15;
    dcPlinth.receiveShadow = true;
    dcGroup.add(dcPlinth);

    const spineGroup = new THREE.Group();
    spineGroup.position.set(-4.2, 0.3, 2.5);
    const spineChassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.4, 1.6), darkAnodized);
    spineChassis.position.y = 2.2;
    spineChassis.castShadow = true;
    spineGroup.add(spineChassis);

    const spineLedMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 1.1,
    });
    for (let i = 0; i < 6; i++) {
      const portStrip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.06), spineLedMat);
      portStrip.position.set(0, 1.1 + i * 0.55, 0.81);
      spineGroup.add(portStrip);
    }
    dcGroup.add(spineGroup);
    registerInteractive(spineGroup, 'spineSwitch');

    const computeGroup = new THREE.Group();
    computeGroup.position.set(0, 0.3, -0.5);
    const computeLedMat = new THREE.MeshStandardMaterial({
      color: '#60a5fa',
      emissive: '#2563eb',
      emissiveIntensity: 1.0,
    });

    [-1.4, 1.4].forEach((rx) => {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2.1, 5.2, 1.9), darkAnodized);
      rack.position.set(rx, 2.6, 0);
      rack.castShadow = true;
      rack.receiveShadow = true;
      computeGroup.add(rack);

      for (let u = 0; u < 10; u++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.05), computeLedMat);
        blade.position.set(rx, 0.75 + u * 0.44, 0.96);
        computeGroup.add(blade);
      }
    });
    dcGroup.add(computeGroup);
    registerInteractive(computeGroup, 'computeRack');

    const storageGroup = new THREE.Group();
    storageGroup.position.set(4.5, 0.3, -3.2);
    const storageChassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.6, 1.8), darkAnodized);
    storageChassis.position.y = 2.3;
    storageChassis.castShadow = true;
    storageGroup.add(storageChassis);

    const storageLedMat = new THREE.MeshStandardMaterial({
      color: '#a78bfa',
      emissive: '#7c3aed',
      emissiveIntensity: 1.0,
    });
    for (let s = 0; s < 8; s++) {
      const bay = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 0.06), storageLedMat);
      bay.position.set(0, 0.8 + s * 0.45, 0.91);
      storageGroup.add(bay);
    }
    dcGroup.add(storageGroup);
    registerInteractive(storageGroup, 'storageArray');

    const trayMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7, roughness: 0.3 });
    const overheadTray = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.14, 0.7), trayMat);
    overheadTray.position.set(0.2, 5.8, -0.5);
    dcGroup.add(overheadTray);

    // ZONE 3: SMART CITY INTERSECTION & EDGE NODE
    const cityGroup = new THREE.Group();
    cityGroup.position.set(22, 0, 0);
    scene.add(cityGroup);

    const roadMain = new THREE.Mesh(new THREE.BoxGeometry(14, 0.12, 7.5), asphaltMat);
    roadMain.position.set(0, 0.06, 1.5);
    roadMain.receiveShadow = true;
    cityGroup.add(roadMain);

    const stripeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.6 });
    for (let cx = -5; cx <= 5; cx += 2.2) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.13, 0.16), stripeMat);
      dash.position.set(cx, 0.065, 1.5);
      cityGroup.add(dash);
    }

    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.24, 3.2),
      new THREE.MeshStandardMaterial({ color: '#27303f', roughness: 0.75 })
    );
    curb.position.set(0, 0.12, -3.8);
    curb.receiveShadow = true;
    cityGroup.add(curb);

    const cameraMastGroup = new THREE.Group();
    cameraMastGroup.position.set(-2.6, 0.24, -3.2);
    const camPole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 4.6, 16), brushedAluminum);
    camPole.position.y = 2.3;
    camPole.castShadow = true;
    cameraMastGroup.add(camPole);

    const camHousing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 0.75), darkAnodized);
    camHousing.position.set(0.2, 4.4, 0.35);
    camHousing.rotation.x = 0.35;
    camHousing.rotation.y = -0.3;
    cameraMastGroup.add(camHousing);

    const camLensMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 1.4,
    });
    const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 16), camLensMat);
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0.2, 4.35, 0.72);
    cameraMastGroup.add(camLens);
    cityGroup.add(cameraMastGroup);
    registerInteractive(cameraMastGroup, 'trafficCamera');

    const edgeNodeGroup = new THREE.Group();
    edgeNodeGroup.position.set(0.4, 0.24, -3.2);
    const edgePedestal = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.55, 0.75), brushedAluminum);
    edgePedestal.position.y = 0.775;
    edgePedestal.castShadow = true;
    edgeNodeGroup.add(edgePedestal);

    const edgeStatusMat = new THREE.MeshStandardMaterial({
      color: '#2dd4bf',
      emissive: '#0d9488',
      emissiveIntensity: 1.4,
    });
    const edgeStatusBar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.05), edgeStatusMat);
    edgeStatusBar.position.set(0, 1.25, 0.39);
    edgeNodeGroup.add(edgeStatusBar);
    cityGroup.add(edgeNodeGroup);
    registerInteractive(edgeNodeGroup, 'edgeGateway');

    const signalGroup = new THREE.Group();
    signalGroup.position.set(3.8, 0.24, -3.2);
    const sigPole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 5.2, 16), darkAnodized);
    sigPole.position.y = 2.6;
    sigPole.castShadow = true;
    signalGroup.add(sigPole);

    const sigArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 4.4), darkAnodized);
    sigArm.position.set(0, 5.0, 2.1);
    signalGroup.add(sigArm);

    const sigBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.36), darkAnodized);
    sigBox.position.set(0, 4.55, 4.1);
    signalGroup.add(sigBox);

    const redLampMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#dc2626',
      emissiveIntensity: 2.0,
    });
    const greenLampMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      emissive: '#10b981',
      emissiveIntensity: 0.05,
    });

    const redLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), redLampMat);
    redLamp.position.set(-0.18, 4.82, 4.1);
    signalGroup.add(redLamp);

    const greenLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), greenLampMat);
    greenLamp.position.set(-0.18, 4.28, 4.1);
    signalGroup.add(greenLamp);
    cityGroup.add(signalGroup);
    registerInteractive(signalGroup, 'trafficSignal');

    const ambulanceGroup = new THREE.Group();
    ambulanceGroup.position.set(-5.8, 0.12, 2.3);
    const ambBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.15, 1.15),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.2 })
    );
    ambBody.position.y = 0.72;
    ambBody.castShadow = true;
    ambulanceGroup.add(ambBody);

    const ambStripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.64, 0.22, 1.18),
      new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 })
    );
    ambStripe.position.y = 0.65;
    ambulanceGroup.add(ambStripe);

    const sirenMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#ef4444',
      emissiveIntensity: 2.2,
    });
    const sirenBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.75), sirenMat);
    sirenBar.position.set(0.3, 1.36, 0);
    ambulanceGroup.add(sirenBar);
    cityGroup.add(ambulanceGroup);

    // FIBER BACKBONE CONDUITS & PACKETS
    const createConduit = (points: THREE.Vector3[], color: string) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 64, 0.045, 8, false);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.72,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return curve;
    };

    const studioToCloudCurve = createConduit(
      [
        new THREE.Vector3(-22.6, 2.0, 0.2),
        new THREE.Vector3(-19.9, 2.0, -0.5),
        new THREE.Vector3(-14.5, 0.35, -0.5),
        new THREE.Vector3(-8.5, 0.35, 0.5),
        new THREE.Vector3(-4.2, 2.2, 0.5),
      ],
      '#38bdf8'
    );

    const dcInternalCurve = createConduit(
      [
        new THREE.Vector3(-4.2, 2.4, 0.5),
        new THREE.Vector3(-1.4, 2.8, -2.5),
        new THREE.Vector3(1.4, 2.8, -2.5),
        new THREE.Vector3(4.5, 2.6, -5.2),
      ],
      '#818cf8'
    );

    const edgeLocalCurve = createConduit(
      [
        new THREE.Vector3(19.6, 4.4, -2.8),
        new THREE.Vector3(21.2, 2.2, -3.2),
        new THREE.Vector3(22.4, 1.3, -3.2),
        new THREE.Vector3(24.2, 2.8, -3.2),
        new THREE.Vector3(25.8, 4.6, 0.9),
      ],
      '#2dd4bf'
    );

    const edgeToCloudCurve = createConduit(
      [
        new THREE.Vector3(22.4, 1.2, -3.2),
        new THREE.Vector3(16.0, 0.35, -3.8),
        new THREE.Vector3(8.5, 0.35, -3.8),
        new THREE.Vector3(1.4, 2.6, -2.5),
      ],
      '#64748b'
    );

    const makePacket = (color: string, radius = 0.18) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 20, 20),
        new THREE.MeshStandardMaterial({
          color: '#ffffff',
          emissive: color,
          emissiveIntensity: 2.6,
        })
      );
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    };

    const cloudPacket = makePacket('#38bdf8', 0.2);
    const dcPacket = makePacket('#a78bfa', 0.2);
    const edgePacket = makePacket('#2dd4bf', 0.18);
    const syncPacket = makePacket('#94a3b8', 0.14);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const key = hits[0].object.userData.inspectKey as string;
        stateRef.current.hoveredKey = key;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        stateRef.current.hoveredKey = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const key = hits[0].object.userData.inspectKey as string;
        if (INSPECTABLES[key]) {
          setInspected(INSPECTABLES[key]);
        }
        if (key === 'laptop' && stateRef.current.chapter === 'studio') {
          triggerSimulation();
        } else if ((key === 'trafficCamera' || key === 'edgeGateway') && stateRef.current.chapter === 'street') {
          triggerSimulation();
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const currentCamPos = new THREE.Vector3(...CAMERA_POSES.studio.pos);
    const currentLookAt = new THREE.Vector3(...CAMERA_POSES.studio.target);
    const desiredCamPos = new THREE.Vector3();
    const desiredLookAt = new THREE.Vector3();

    let lastTime = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const st = stateRef.current;

      if (st.isPlaying) {
        const speed = st.chapter === 'comparison' ? 0.14 : 0.18;
        st.progress = Math.min(1, st.progress + dt * speed);
        setSimProgress(st.progress);
        if (st.progress >= 1) {
          st.isPlaying = false;
          setIsPlaying(false);
        }
      }

      const p = st.progress;

      cloudPacket.visible = false;
      dcPacket.visible = false;
      edgePacket.visible = false;
      syncPacket.visible = false;

      spineLedMat.emissiveIntensity = 0.8;
      computeLedMat.emissiveIntensity = 0.8;
      storageLedMat.emissiveIntensity = 0.8;
      edgeStatusMat.emissiveIntensity = 0.9;

      redLampMat.emissiveIntensity = 2.0;
      greenLampMat.emissiveIntensity = 0.05;
      ambulanceGroup.position.x = -5.8;

      if (st.chapter === 'studio') {
        const basePose = CAMERA_POSES.studio;
        desiredCamPos.set(...basePose.pos);
        desiredLookAt.set(...basePose.target);

        if (p > 0) {
          cloudPacket.visible = true;
          if (p < 0.45) {
            const t = p / 0.45;
            studioToCloudCurve.getPointAt(t, cloudPacket.position);
            setStatusLine(
              t < 0.25
                ? '1/4  Workstation encrypts request and transmits via local optical gateway'
                : '2/4  Packet traverses regional fiber backbone toward remote cloud facility'
            );
          } else if (p < 0.65) {
            const t = (p - 0.45) / 0.2;
            dcInternalCurve.getPointAt(Math.sin(t * Math.PI) * 0.85, cloudPacket.position);
            computeLedMat.emissiveIntensity = 2.5;
            storageLedMat.emissiveIntensity = 2.2;
            setStatusLine('3/4  Remote cloud compute cluster executes logic and queries NVMe storage');
          } else {
            const t = 1 - (p - 0.65) / 0.35;
            studioToCloudCurve.getPointAt(Math.max(0, t), cloudPacket.position);
            setStatusLine(
              p >= 0.99
                ? '4/4  Response delivered to workstation — Round-trip complete'
                : '4/4  Serialized response travels back across the WAN to the workstation'
            );
          }

          if (!st.reducedMotion && p > 0.15 && p < 0.85) {
            desiredCamPos.x = THREE.MathUtils.lerp(basePose.pos[0], -12, Math.sin(((p - 0.15) / 0.7) * Math.PI));
            desiredLookAt.x = THREE.MathUtils.lerp(basePose.target[0], -8, Math.sin(((p - 0.15) / 0.7) * Math.PI));
          }
        }
      } else if (st.chapter === 'datacenter') {
        desiredCamPos.set(...CAMERA_POSES.datacenter.pos);
        desiredLookAt.set(...CAMERA_POSES.datacenter.target);

        if (p > 0) {
          dcPacket.visible = true;
          if (p < 0.33) {
            const t = p / 0.33;
            dcInternalCurve.getPointAt(t * 0.33, dcPacket.position);
            spineLedMat.emissiveIntensity = 2.6;
            setStatusLine('1/3  Ingress border router & spine-leaf fabric inspect and route packet');
          } else if (p < 0.68) {
            const t = (p - 0.33) / 0.35;
            dcInternalCurve.getPointAt(0.33 + t * 0.37, dcPacket.position);
            computeLedMat.emissiveIntensity = 2.8;
            setStatusLine('2/3  Compute blades execute containerized service logic');
          } else {
            const t = (p - 0.68) / 0.32;
            dcInternalCurve.getPointAt(0.7 + t * 0.3, dcPacket.position);
            storageLedMat.emissiveIntensity = 2.8;
            setStatusLine(
              p >= 0.99
                ? '3/3  Distributed NVMe storage commits state & returns response via leaf switch'
                : '3/3  Querying distributed NVMe storage pool for persistent state'
            );
          }
        }
      } else if (st.chapter === 'street') {
        desiredCamPos.set(...CAMERA_POSES.street.pos);
        desiredLookAt.set(...CAMERA_POSES.street.target);

        ambulanceGroup.position.x = -5.8 + p * 11.5;
        sirenMat.emissive.setHex(Math.floor(now / 180) % 2 === 0 ? 0xef4444 : 0x38bdf8);

        if (p > 0) {
          if (p < 0.3) {
            edgePacket.visible = true;
            const t = p / 0.3;
            edgeLocalCurve.getPointAt(t * 0.5, edgePacket.position);
            setStatusLine('1/3  Optical mast sensor detects approaching emergency vehicle locally');
          } else if (p < 0.6) {
            edgePacket.visible = true;
            const t = (p - 0.3) / 0.3;
            edgeLocalCurve.getPointAt(0.5 + t * 0.5, edgePacket.position);
            edgeStatusMat.emissiveIntensity = 2.8;
            setStatusLine('2/3  Curbside edge gateway runs inference locally—zero cloud round-trip needed');
          } else {
            redLampMat.emissiveIntensity = 0.05;
            greenLampMat.emissiveIntensity = 2.4;
            setStatusLine(
              st.cloudSyncEnabled
                ? '3/3  Intersection cleared locally; anonymized event summary syncs to cloud'
                : '3/3  Intersection cleared autonomously at the edge without WAN dependency'
            );

            if (st.cloudSyncEnabled) {
              syncPacket.visible = true;
              const t = Math.min(1, (p - 0.6) / 0.4);
              edgeToCloudCurve.getPointAt(t, syncPacket.position);
            }
          }
        }
      } else if (st.chapter === 'comparison') {
        desiredCamPos.set(...CAMERA_POSES.comparison.pos);
        desiredLookAt.set(...CAMERA_POSES.comparison.target);

        ambulanceGroup.position.x = -5.8 + p * 11.5;

        if (p > 0) {
          if (p <= 0.26) {
            edgePacket.visible = true;
            edgeLocalCurve.getPointAt(Math.min(1, p / 0.26), edgePacket.position);
            edgeStatusMat.emissiveIntensity = 2.6;
          }
          if (p >= 0.24) {
            redLampMat.emissiveIntensity = 0.05;
            greenLampMat.emissiveIntensity = 2.4;
          }

          cloudPacket.visible = true;
          if (p < 0.45) {
            studioToCloudCurve.getPointAt(p / 0.45, cloudPacket.position);
          } else if (p < 0.65) {
            dcInternalCurve.getPointAt(((p - 0.45) / 0.2) * 0.85, cloudPacket.position);
            computeLedMat.emissiveIntensity = 2.6;
          } else {
            studioToCloudCurve.getPointAt(Math.max(0, 1 - (p - 0.65) / 0.35), cloudPacket.position);
          }

          if (p < 0.26) {
            setStatusLine('Simultaneous Trigger — Edge packet reaches curbside node while Cloud packet enters WAN');
          } else if (p < 0.99) {
            setStatusLine('Edge actuation already complete (Signal Green) — Cloud workload still traversing WAN');
          } else {
            setStatusLine('Comparison Complete — Edge handles immediate local control; Cloud handles centralized scale');
          }
        }
      }

      const lerpAlpha = st.reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt);
      currentCamPos.lerp(desiredCamPos, lerpAlpha);
      currentLookAt.lerp(desiredLookAt, lerpAlpha);
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const primaryActionLabel =
    chapter === 'studio'
      ? 'Transmit Request'
      : chapter === 'datacenter'
      ? 'Trace Internal Flow'
      : chapter === 'street'
      ? 'Trigger Emergency Vehicle'
      : 'Run Dual Race';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090d14] text-slate-100 select-none font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      <header className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-8 pt-7">
        <div className="max-w-md">
          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400 font-medium">
            Interactive Spatial Exhibition
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-light tracking-tight text-white">
            Beyond the Cloud
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-400 font-light leading-relaxed">
            Follow data as it moves from a local workstation, through a hyperscale data center, to an autonomous urban edge.
          </p>
        </div>

        <nav className="pointer-events-auto flex items-center gap-1 border-b border-slate-800/90 pb-2 bg-[#090d14]/70 backdrop-blur-md px-3 pt-1.5">
          {[
            { id: 'studio', label: 'Workstation Origin' },
            { id: 'datacenter', label: 'Data Center Hall' },
            { id: 'street', label: 'Edge Intersection' },
            { id: 'comparison', label: 'Cloud & Edge Together' },
          ].map((item) => {
            const active = chapter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setChapter(item.id as SceneChapter)}
                className={`px-3.5 py-1.5 text-xs tracking-wide transition-colors ${
                  active
                    ? 'text-white border-b-2 border-sky-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-1.5" />

          <button
            onClick={toggleFullscreen}
            title="Toggle Presentation Fullscreen"
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </nav>
      </header>

      {inspected && (
        <aside className="absolute top-28 right-8 z-20 w-80 border-l-2 border-sky-400 bg-[#0c121d]/85 backdrop-blur-md p-5 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-400">
                {inspected.subtitle}
              </p>
              <h2 className="mt-1 text-base font-medium text-white">{inspected.title}</h2>
            </div>
            <button
              onClick={() => setInspected(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Close
            </button>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-300 font-light">
            {inspected.detail}
          </p>
        </aside>
      )}

      {chapter === 'comparison' && (
        <div className="pointer-events-none absolute top-28 left-8 z-20 flex flex-col gap-3 border-l border-slate-700/80 pl-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-xs font-medium tracking-wide text-slate-200">
                Cloud Architecture (Left & Center)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Centralized scale & persistent storage across the wide-area network.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span className="text-xs font-medium tracking-wide text-slate-200">
                Edge Architecture (Right Foreground)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Immediate local processing adjacent to sensors and physical actuators.
            </p>
          </div>
        </div>
      )}

      <footer className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 px-8 pb-7">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-t border-slate-800/80 pt-4">
          <div className="pointer-events-auto flex-1 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-light tracking-wide">{statusLine}</span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={simProgress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  stateRef.current.isPlaying = false;
                  stateRef.current.progress = val;
                  setIsPlaying(false);
                  setSimProgress(val);
                }}
                aria-label="Simulation timeline"
                className="w-full h-1 bg-slate-800 appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                {Math.round(simProgress * 100)}%
              </span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            {chapter === 'street' && (
              <button
                onClick={() => setCloudSyncEnabled((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 text-xs border transition-colors ${
                  cloudSyncEnabled
                    ? 'border-slate-600 text-slate-200 bg-slate-900/70'
                    : 'border-slate-800 text-slate-500 bg-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cloud Sync: {cloudSyncEnabled ? 'Active' : 'Offline'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  triggerSimulation();
                }
              }}
              className="flex items-center gap-2 bg-slate-100 text-slate-950 hover:bg-white px-5 py-2 text-xs font-medium tracking-wide transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{simProgress > 0 && simProgress < 0.99 ? 'Resume' : primaryActionLabel}</span>
                </>
              )}
            </button>

            <button
              onClick={resetSimulation}
              title="Reset Simulation"
              className="p-2 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {chapter !== 'comparison' && (
              <button
                onClick={() => {
                  const order: SceneChapter[] = ['studio', 'datacenter', 'street', 'comparison'];
                  const next = order[(order.indexOf(chapter) + 1) % order.length];
                  setChapter(next);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-800 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
              >
                <span>Next Environment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
