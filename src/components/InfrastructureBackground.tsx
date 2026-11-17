import { useEffect, useRef } from "react";
import * as THREE from "three";

type Palette = {
  background: string;
  far: string;
  line: string;
  lineAlt: string;
  node: string;
  nodeAlt: string;
  packet: string;
  glow: string;
};

const getPalette = (isDark: boolean): Palette =>
  isDark
    ? {
        background: "#07111d",
        far: "#8ecbff",
        line: "#5bc9ff",
        lineAlt: "#7d7bff",
        node: "#7fe3ff",
        nodeAlt: "#76b7ff",
        packet: "#dff9ff",
        glow: "#6fe7ff",
      }
    : {
        background: "#eef6ff",
        far: "#6aa7d9",
        line: "#6cc7f3",
        lineAlt: "#8d93ff",
        node: "#1a6bc7",
        nodeAlt: "#2cb6aa",
        packet: "#0b223d",
        glow: "#85d6ff",
      };

export function InfrastructureBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const updatePalette = (isDark: boolean) => {
      const palette = getPalette(isDark);
      document.documentElement.style.setProperty("--infra-bg", palette.background);
      document.documentElement.style.setProperty("--infra-glow", palette.glow);
    };

    updatePalette(document.documentElement.classList.contains("dark"));

    let renderer: THREE.WebGLRenderer | null = null;
    let rafId = 0;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let world: THREE.Group | null = null;
    let packets: Array<{
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      speed: number;
      offset: number;
    }> = [];
    let nodeMeshes: THREE.Mesh[] = [];
    let farPoints: THREE.Points | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.style.display = "none";
      return;
    }

    const applyThemeColors = (isDark: boolean) => {
      if (!scene || !world) {
        return;
      }

      const palette = getPalette(isDark);
      scene.fog = new THREE.FogExp2(new THREE.Color(palette.background), 0.06);

      if (farPoints) {
        const farMaterial = farPoints.material as THREE.PointsMaterial;
        farMaterial.color = new THREE.Color(palette.far);
        farMaterial.opacity = isDark ? 0.8 : 0.55;
      }

      nodeMeshes.forEach((mesh, index) => {
        const material = mesh.material as THREE.MeshPhysicalMaterial;
        material.color = new THREE.Color(index % 2 === 0 ? palette.node : palette.nodeAlt);
        material.emissive = new THREE.Color(index % 2 === 0 ? palette.node : palette.nodeAlt);
        material.emissiveIntensity = isDark ? 0.8 : 0.35;
      });
    };

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(new THREE.Color(getPalette(document.documentElement.classList.contains("dark")).background), 0.06);

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 22);

    world = new THREE.Group();
    scene.add(world);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x7ce3ff, 8, 60, 2);
    keyLight.position.set(4, 3, 12);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x7d7bff, 6, 50, 2);
    fillLight.position.set(-8, -2, 10);
    scene.add(fillLight);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(30, 32, 32),
      new THREE.MeshBasicMaterial({
        color: getPalette(document.documentElement.classList.contains("dark")).background,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
      }),
    );
    scene.add(halo);

    const farGeometry = new THREE.BufferGeometry();
    const farCount = 600;
    const farPositions = new Float32Array(farCount * 3);

    for (let i = 0; i < farCount; i += 1) {
      const radius = 18 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      farPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      farPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      farPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    farGeometry.setAttribute("position", new THREE.BufferAttribute(farPositions, 3));
    const farMaterial = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: document.documentElement.classList.contains("dark") ? 0.8 : 0.5,
      color: getPalette(document.documentElement.classList.contains("dark")).far,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    farPoints = new THREE.Points(farGeometry, farMaterial);
    farPoints.rotation.x = 0.3;
    farPoints.rotation.y = 0.2;
    world.add(farPoints);

    const nodePositions = [
      new THREE.Vector3(-7, 1.8, -5),
      new THREE.Vector3(-4, 0.4, -3),
      new THREE.Vector3(-1.5, 2.2, -5.5),
      new THREE.Vector3(1.5, 1.1, -2.8),
      new THREE.Vector3(4.8, 2.3, -4.8),
      new THREE.Vector3(7.2, 0.3, -2.3),
      new THREE.Vector3(-6.5, -2.1, 1.8),
      new THREE.Vector3(-2.1, -1.6, 2.5),
      new THREE.Vector3(2.1, -2.4, 1.6),
      new THREE.Vector3(6.2, -1.2, 2.4),
      new THREE.Vector3(-2.2, 3.8, 1.2),
      new THREE.Vector3(3.1, 4.1, 2.8),
    ];

    const nodeGeometry = new THREE.IcosahedronGeometry(0.45, 1);

    nodePositions.forEach((position, index) => {
      const core = new THREE.Mesh(
        nodeGeometry,
        new THREE.MeshPhysicalMaterial({
          color: index % 2 === 0 ? getPalette(document.documentElement.classList.contains("dark")).node : getPalette(document.documentElement.classList.contains("dark")).nodeAlt,
          emissive: index % 2 === 0 ? getPalette(document.documentElement.classList.contains("dark")).node : getPalette(document.documentElement.classList.contains("dark")).nodeAlt,
          emissiveIntensity: document.documentElement.classList.contains("dark") ? 0.85 : 0.45,
          transparent: true,
          opacity: 0.9,
          roughness: 0.15,
          metalness: 0.45,
          transmission: 0.15,
          thickness: 0.8,
        }),
      );

      core.position.copy(position);
      core.scale.setScalar(0.8 + (index % 4) * 0.18);
      world.add(core);
      nodeMeshes.push(core);

      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(0.9 + (index % 3) * 0.22, 0.024, 16, 80),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? getPalette(document.documentElement.classList.contains("dark")).line : getPalette(document.documentElement.classList.contains("dark")).lineAlt,
          transparent: true,
          opacity: 0.35,
        }),
      );
      orbit.position.copy(position);
      orbit.rotation.x = Math.PI / 2.8;
      orbit.rotation.y = index * 0.7;
      world.add(orbit);
    });

    const connectionPairs: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [6, 7], [7, 8], [8, 9], [1, 7], [2, 8], [3, 10], [10, 11], [11, 4], [11, 9], [6, 10], [7, 11], [8, 10], [0, 3], [5, 9],
    ];

    connectionPairs.forEach(([fromIndex, toIndex], index) => {
      const start = nodePositions[fromIndex];
      const end = nodePositions[toIndex];
      const midpoint = start.clone().add(end).multiplyScalar(0.5);
      midpoint.y += (index % 2 === 0 ? 1.3 : -1.4) + (Math.random() - 0.5) * 1.5;

      const curve = new THREE.CatmullRomCurve3([
        start,
        midpoint,
        end,
      ]);

      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, 0.035 + (index % 3) * 0.01, 10, false),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? getPalette(document.documentElement.classList.contains("dark")).line : getPalette(document.documentElement.classList.contains("dark")).lineAlt,
          transparent: true,
          opacity: 0.32,
        }),
      );
      world.add(tube);
    });

    const packetGeometry = new THREE.SphereGeometry(0.09, 12, 12);
    const packetMaterial = new THREE.MeshBasicMaterial({
      color: getPalette(document.documentElement.classList.contains("dark")).packet,
      transparent: true,
      opacity: 0.95,
    });

    const packetRoutes: Array<{ points: THREE.Vector3[]; speed: number; offset: number }> = [
      { points: [nodePositions[0], nodePositions[1], nodePositions[2], nodePositions[3], nodePositions[4]], speed: 0.11, offset: 0.14 },
      { points: [nodePositions[5], nodePositions[4], nodePositions[3], nodePositions[10], nodePositions[11]], speed: 0.09, offset: 0.4 },
      { points: [nodePositions[6], nodePositions[7], nodePositions[8], nodePositions[9]], speed: 0.12, offset: 0.72 },
      { points: [nodePositions[0], nodePositions[7], nodePositions[8], nodePositions[11], nodePositions[9]], speed: 0.1, offset: 0.9 },
      { points: [nodePositions[2], nodePositions[1], nodePositions[7], nodePositions[6]], speed: 0.08, offset: 0.28 },
      { points: [nodePositions[10], nodePositions[3], nodePositions[11], nodePositions[5]], speed: 0.13, offset: 0.55 },
      { points: [nodePositions[9], nodePositions[8], nodePositions[7], nodePositions[2]], speed: 0.085, offset: 0.66 },
      { points: [nodePositions[0], nodePositions[6], nodePositions[10], nodePositions[11]], speed: 0.11, offset: 0.12 },
    ];

    packets = packetRoutes.map((route) => {
      const mesh = new THREE.Mesh(packetGeometry, packetMaterial.clone());
      mesh.userData = { pulse: Math.random() };
      scene.add(mesh);

      return {
        mesh,
        curve: new THREE.CatmullRomCurve3(route.points),
        speed: route.speed,
        offset: route.offset,
      };
    });

    const themeObserver = new MutationObserver(() => {
      applyThemeColors(document.documentElement.classList.contains("dark"));
    });

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resize = () => {
      if (!renderer || !camera) {
        return;
      }

      const container = canvas.parentElement;
      if (!container) {
        return;
      }

      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, prefersReducedMotion ? 1.25 : 1.8);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();

    const animate = () => {
      if (!renderer || !scene || !camera || !world) {
        return;
      }

      const elapsed = clock.getElapsedTime();

      world.rotation.y = elapsed * 0.08;
      world.rotation.x = Math.sin(elapsed * 0.27) * 0.1;
      camera.position.x = Math.sin(elapsed * 0.25) * 1.9;
      camera.position.y = Math.cos(elapsed * 0.22) * 1.2;
      camera.position.z = prefersReducedMotion ? 21 : 22 + Math.sin(elapsed * 0.12) * 1.5;
      camera.lookAt(0, 0, 0);

      if (farPoints) {
        farPoints.rotation.y += 0.0007;
      }

      nodeMeshes.forEach((mesh, index) => {
        const material = mesh.material as THREE.MeshPhysicalMaterial;
        const pulse = 0.8 + Math.sin(elapsed * (prefersReducedMotion ? 0.8 : 1.8) + index) * 0.5;
        material.emissiveIntensity = prefersReducedMotion ? 0.45 : pulse * 0.7;
        mesh.rotation.x += 0.003 + index * 0.0006;
        mesh.rotation.y += 0.004 + index * 0.0007;
      });

      packets.forEach((packet, index) => {
        const t = (elapsed * packet.speed + packet.offset) % 1;
        const point = packet.curve.getPointAt(t);
        packet.mesh.position.copy(point);
        const scale = prefersReducedMotion ? 1 : 0.8 + Math.sin(elapsed * 3.2 + index) * 0.2;
        packet.mesh.scale.setScalar(scale);

        const material = packet.mesh.material as THREE.MeshBasicMaterial;
        material.color = new THREE.Color(document.documentElement.classList.contains("dark") ? getPalette(true).packet : getPalette(false).packet);
      });

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
      cancelAnimationFrame(rafId);

      if (renderer) {
        renderer.dispose();
      }

      if (scene) {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(110,180,255,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(94,185,255,0.12),_transparent_40%)] opacity-100 dark:opacity-100" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80 dark:opacity-100" aria-hidden="true" />
    </div>
  );
}
