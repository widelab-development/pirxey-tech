import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Pixel-faithful port of pirxey.com's #canvas.webgl background.
 *
 * Direct translation of the Um(canvas, sizeFn) function in
 * @widelab-development/pirxey-webflow-dev@0.0.22/dist/prx-site.js:
 *   - 7000 Points spread in a 25-unit cube around the origin
 *   - PerspectiveCamera fov=18, near=1, far=2000, position.z=-10
 *   - Custom shaders: gl_PointSize = 40/distance, alpha = (1 - smoothstep(0.3,0.5,r))
 *                     * randomOpacity * (distance / 15)
 *   - AdditiveBlending, transparent
 *   - Each frame: group.rotation.z += 0.00025, group.rotation.y += 0.000125,
 *                 group.position.y = sin(t * 0.05) * 0.05
 *
 * Honors prefers-reduced-motion (renders one static frame, no RAF loop).
 * Bails out cleanly when WebGL is unavailable.
 */
export default function SpaceCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

    const canvas = document.createElement("canvas");
    canvas.className = "space-canvas__canvas";
    mount.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const group = new THREE.Group();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(18);
    camera.near = 1;
    camera.far = 2000;
    camera.position.z = -10;
    scene.add(group);

    const STAR_COUNT = 7000;
    const SPREAD = 25;
    const half = SPREAD / 2;

    const positions = new Float32Array(STAR_COUNT * 3);
    const opacities = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3 + 0] = Math.random() * SPREAD - half;
      positions[i * 3 + 1] = Math.random() * SPREAD - half;
      positions[i * 3 + 2] = Math.random() * SPREAD - half;
      opacities[i] = Math.random() * 0.9 + 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        varying float distanceToCamera;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vOpacity = opacity;
          distanceToCamera = length(mvPosition.xyz);
          gl_PointSize = 40.0 / distanceToCamera;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying float distanceToCamera;
        void main() {
          float distance = length(gl_PointCoord - vec2(0.5, 0.5));
          if (distance > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
          float opacityFactor = distanceToCamera / 15.0;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vOpacity * opacityFactor);
        }
      `,
    });
    material.needsUpdate = true;
    group.add(new THREE.Points(geometry, material));

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    window.addEventListener("resize", resize, false);
    renderer.compile(scene, camera);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      const t = Date.now() * 0.003;
      group.rotation.z += 0.001 / 4;
      group.rotation.y += 5e-4 / 4;
      group.position.y = Math.sin(t * 0.05) * 0.05;
      camera.lookAt(scene.position);
      camera.updateMatrixWorld();
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    };

    if (reduced) {
      camera.lookAt(scene.position);
      camera.updateMatrixWorld();
      renderer.render(scene, camera);
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize, false);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentElement === mount) {
        mount.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="space-canvas" />;
}
