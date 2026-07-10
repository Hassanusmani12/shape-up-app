import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';

/* ── FITNESS COLOR PALETTE ── */
const GREEN = '#00e676';
const BLUE = '#2979ff';
const CYAN = '#00e5ff';
const SILVER = '#b0bec5';
const WHITE = '#ffffff';

/* ── 8D FITNESS PARALLAX ── */
function MouseFollower({ children, factor = 0.02, depth = 1 }) {
  const groupRef = useRef();
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouse = (e) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (target.current.y * factor * depth - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.y += (target.current.x * factor * depth - groupRef.current.rotation.y) * 0.04;
      groupRef.current.position.x += (target.current.x * 0.08 * depth - groupRef.current.position.x) * 0.02;
      groupRef.current.position.y += (target.current.y * 0.08 * depth - groupRef.current.position.y) * 0.02;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

/* ── DUMBBELL ── */
function Dumbbell({ position, color = GREEN, scale = 1 }) {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });
  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Left weight */}
        <mesh position={[-0.9, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.35, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        {/* Right weight */}
        <mesh position={[0.9, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.35, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
          <meshStandardMaterial color={SILVER} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Chrome caps */}
        <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
          <meshStandardMaterial color={WHITE} metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
          <meshStandardMaterial color={WHITE} metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── KETTLEBELL ── */
function Kettlebell({ position, color = CYAN, scale = 1 }) {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.4;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    }
  });
  return (
    <Float speed={0.6} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Bell */}
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive={color} emissiveIntensity={0.08} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0.15, 0]}>
          <torusGeometry args={[0.2, 0.05, 12, 20]} />
          <meshStandardMaterial color={SILVER} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── FITNESS PROGRESS RINGS (Apple Fitness+ style) ── */
function FitnessRings({ position }) {
  const groupRef = useRef();
  const ringRefs = [useRef(), useRef(), useRef()];
  const colors = [GREEN, BLUE, CYAN];

  useFrame((state) => {
    ringRefs.forEach((ref, i) => {
      if (ref.current) {
        const sweep = Math.PI * 2 * (0.3 + Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.15);
        ref.current.children[0].geometry = new THREE.RingGeometry(0.55 + i * 0.12, 0.6 + i * 0.12, 64, 1, 0, sweep);
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {ringRefs.map((ref, i) => (
        <group key={i} ref={ref}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <ringGeometry args={[0.55 + i * 0.12, 0.6 + i * 0.12, 64]} />
            <meshBasicMaterial color={colors[i]} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── ECG / HEARTBEAT LINE ── */
function ECGLine({ position }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      const t = state.clock.elapsedTime;
      const positions = lineRef.current.geometry.attributes.position;
      for (let i = 0; i < 120; i++) {
        const x = i * 0.08 - 5;
        const phase = i / 120 + t * 0.3;
        let y = Math.sin(phase * 10) * 0.08;
        /* ECG spike */
        if (i > 55 && i < 65) {
          const spike = Math.sin((i - 55) / 10 * Math.PI) * 0.5;
          y += spike;
        }
        positions.setXYZ(i, x, y, 0);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <line ref={lineRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={120}
          array={new Float32Array(120 * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={GREEN} transparent opacity={0.6} />
    </line>
  );
}

/* ── PULSE RING (expanding health ring) ── */
function PulseRing({ position }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const scale = 1 + Math.sin(t * 1.5) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.material.opacity = 0.15 + Math.sin(t * 1.5) * 0.1;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 1.5, 64]} />
      <meshBasicMaterial color={GREEN} transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── ENERGY PARTICLES (streaming upward) ── */
function EnergyParticles() {
  const count = 300;
  const meshRef = useRef();
  const speeds = useRef(new Float32Array(count));

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const s = speeds.current;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      s[i] = 0.2 + Math.random() * 0.5;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array;
      const s = speeds.current;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += s[i] * 0.02;
        if (pos[i * 3 + 1] > 15) pos[i * 3 + 1] = -15;
        pos[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color={GREEN} transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ── HEXAGON GRID ── */
function HexGrid() {
  const groupRef = useRef();
  const hexPositions = useMemo(() => {
    const positions = [];
    const size = 0.4;
    const spacing = size * 2;
    for (let x = -8; x <= 8; x += spacing) {
      for (let z = -6; z <= 6; z += spacing * 0.9) {
        /* stagger every other row */
        const stagger = (Math.round(z / (spacing * 0.9)) % 2 === 0) ? 0 : spacing / 2;
        positions.push([x + stagger, 0, z]);
      }
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 0.05) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {hexPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 6]} />
          <meshBasicMaterial color={GREEN} transparent opacity={0.04 + Math.sin(i * 0.5) * 0.02} />
        </mesh>
      ))}
    </group>
  );
}

/* ── POST-PROCESSING ── */
function PostFX() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();

  useEffect(() => {
    const comp = new EffectComposer(gl);
    comp.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.25, 0.4, 0.05);
    comp.addPass(bloom);
    composer.current = comp;
    return () => comp.dispose();
  }, [gl, scene, camera, size]);

  useFrame((state, delta) => {
    if (composer.current) composer.current.render(delta);
  }, 1);

  return null;
}

/* ── SECOND ECG LINE ── */
function ECGLine2({ position }) {
  const lineRef = useRef();
  useFrame((state) => {
    if (lineRef.current) {
      const t = state.clock.elapsedTime;
      const positions = lineRef.current.geometry.attributes.position;
      for (let i = 0; i < 100; i++) {
        const x = i * 0.06 - 3;
        const phase = i / 100 + t * 0.4;
        let y = Math.sin(phase * 8) * 0.1;
        if (i > 45 && i < 55) {
          const spike = Math.sin((i - 45) / 10 * Math.PI) * 0.4;
          y += spike;
        }
        positions.setXYZ(i, x, y, 0);
      }
      positions.needsUpdate = true;
    }
  });
  return (
    <line ref={lineRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={100} array={new Float32Array(100 * 3)} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={CYAN} transparent opacity={0.5} />
    </line>
  );
}

/* ── RUNNING SILHOUETTE (stick figure) ── */
function RunningSilhouette({ position, color = CYAN, scale = 1 }) {
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const bodyRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = 3;
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * speed) * 0.6;
    if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.6;
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.5;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * speed) * 0.5;
    if (bodyRef.current) bodyRef.current.position.y = Math.sin(t * speed * 2) * 0.03;
  });

  return (
    <group ref={bodyRef} position={position} scale={scale}>
      {/* Head */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.6, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.15, 0.8, 0]}>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.35, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[-0.38, 0, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.15, 0.8, 0]}>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.35, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0.38, 0, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.1, 0.25, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.1, 0.25, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Joints */}
      <mesh position={[-0.15, 0.8, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.15, 0.8, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.1, 0.25, 0]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.25, 0]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/* ── HOLOGRAPHIC BODY OUTLINE ── */
function HolographicBody({ position, scale = 1 }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Head wireframe */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.4} />
      </mesh>
      {/* Upper body torus */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.1, 8, 16]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.3} />
      </mesh>
      {/* Lower body torus */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.08, 8, 16]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.25} />
      </mesh>
      {/* Outer glow sphere */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

/* ── DNA / PROTEIN HELIX ── */
function DNAHelix({ position, scale = 1 }) {
  const groupRef = useRef();
  const curves = useMemo(() => {
    const points1 = [];
    const points2 = [];
    const turns = 3;
    const height = 2;
    const radius = 0.3;
    const segments = 60;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = t * height - height / 2;
      points1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      points2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }
    return {
      curve1: new THREE.CatmullRomCurve3(points1),
      curve2: new THREE.CatmullRomCurve3(points2),
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Strand 1 */}
      <mesh>
        <tubeGeometry args={[curves.curve1, 60, 0.02, 6, false]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>
      {/* Strand 2 */}
      <mesh>
        <tubeGeometry args={[curves.curve2, 60, 0.02, 6, false]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>
      {/* Cross-bridges */}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = i / 8;
        const angle = t * Math.PI * 2 * 3;
        const y = t * 2 - 1;
        const p1 = new THREE.Vector3(Math.cos(angle) * 0.3, y, Math.sin(angle) * 0.3);
        const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * 0.3, y, Math.sin(angle + Math.PI) * 0.3);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        return (
          <mesh key={i} position={mid}>
            <sphereGeometry args={[0.015, 4, 4]} />
            <meshBasicMaterial color={WHITE} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── CALORIE-BURNING PARTICLES (red/orange) ── */
function CalorieParticles() {
  const count = 200;
  const meshRef = useRef();
  const speeds = useRef(new Float32Array(count));

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const s = speeds.current;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      s[i] = 0.1 + Math.random() * 0.3;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array;
      const s = speeds.current;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += s[i] * 0.03;
        if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
        pos[i * 3 + 2] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.003;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ff6d00" transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ── BARBELL ── */
function Barbell({ position, color = SILVER, scale = 1 }) {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.6}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Bar */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <meshStandardMaterial color={SILVER} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Left plates */}
        {[-1.2, -1.0].map((x, i) => (
          <mesh key={`l${i}`} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.1, 16]} />
            <meshStandardMaterial color={i === 0 ? GREEN : BLUE} metalness={0.6} roughness={0.3} emissive={i === 0 ? GREEN : BLUE} emissiveIntensity={0.08} />
          </mesh>
        ))}
        {/* Right plates */}
        {[1.0, 1.2].map((x, i) => (
          <mesh key={`r${i}`} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.1, 16]} />
            <meshStandardMaterial color={i === 0 ? BLUE : GREEN} metalness={0.6} roughness={0.3} emissive={i === 0 ? BLUE : GREEN} emissiveIntensity={0.08} />
          </mesh>
        ))}
        {/* Collars */}
        <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial color={WHITE} metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial color={WHITE} metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── PULSING POINT LIGHT ── */
function PulsingLight({ position, color, intensity = 1 }) {
  const lightRef = useRef();
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = intensity + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    }
  });
  return <pointLight ref={lightRef} position={position} intensity={intensity} color={color} />;
}

/* ── MOVING POINT LIGHT ── */
function MovingLight({ color, intensity = 0.8 }) {
  const lightRef = useRef();
  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.elapsedTime;
      lightRef.current.position.x = Math.sin(t * 0.5) * 12;
      lightRef.current.position.z = Math.cos(t * 0.5) * 12;
      lightRef.current.position.y = Math.sin(t * 0.3) * 5;
    }
  });
  return <pointLight ref={lightRef} intensity={intensity} color={color} />;
}

/* ── HUD PERFORMANCE ARC ── */
function HUDArc({ color, yOffset = 0 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      const sweep = Math.PI * 2 * (0.3 + Math.sin(state.clock.elapsedTime * 0.05) * 0.2);
      meshRef.current.geometry = new THREE.RingGeometry(0.4, 0.45, 64, 1, 0, sweep);
    }
  });
  return (
    <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]} position={[0, yOffset, 0]}>
      <ringGeometry args={[0.4, 0.45, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── SMARTWATCH HUD DATA RINGS ── */
function HUDRings({ position }) {
  return (
    <group position={position}>
      {/* Background track */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.3, 0]}>
        <ringGeometry args={[0.4, 0.45, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.3, 0]}>
        <ringGeometry args={[0.4, 0.45, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Active arcs */}
      <HUDArc color="#ff6d00" yOffset={-0.3} />
      <HUDArc color={GREEN} yOffset={0} />
      <HUDArc color={BLUE} yOffset={0.3} />
      {/* Dot indicators */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <mesh key={i} position={[0.4, y, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={[BLUE, GREEN, '#ff6d00'][i]} />
        </mesh>
      ))}
    </group>
  );
}

/* ── CAMERA PRESETS + CONTROLLER ── */
const CAMERA_PRESETS = {
  '/':               { position: [0, 1, 10],   target: [0, 0, 0] },
  '/dashboard':      { position: [3, 2, 8],    target: [0, 0, 0] },
  '/pages/features': { position: [-3, 1, 9],   target: [0, 0, 0] },
  '/pages/workouts': { position: [0, 3, 8],    target: [0, 0, 0] },
  '/pages/nutrition-checker': { position: [2, 0, 9],  target: [0, 0, 0] },
  '/pages/bmr-calculator':    { position: [-2, 2, 9],  target: [0, 0, 0] },
  '/notifications':  { position: [0, -1, 10],  target: [0, 0, 0] },
  '/pages/settings': { position: [1, 1, 11],   target: [0, 0, 0] },
  '/pages/profile':  { position: [-1, 2, 9],   target: [0, 0, 0] },
  '/pages/about':    { position: [0, 0, 12],   target: [0, 0, 0] },
  default:           { position: [0, 1, 10],   target: [0, 0, 0] },
};

function CameraController({ scrollProgress, route }) {
  const { camera } = useThree();
  const preset = useMemo(() => CAMERA_PRESETS[route] || CAMERA_PRESETS.default, [route]);
  const targetPos = useRef(new THREE.Vector3(...preset.position));

  useEffect(() => { targetPos.current.set(...preset.position); }, [preset.position]);

  useFrame(({ mouse }) => {
    camera.position.x += (targetPos.current.x - camera.position.x) * 0.03;
    camera.position.y += (targetPos.current.y - scrollProgress * 3 - camera.position.y) * 0.03 + mouse.y * 0.3;
    camera.position.z += (targetPos.current.z - camera.position.z) * 0.03;
    camera.lookAt(0, 0, 0);
    /* Motion blur feel - subtle camera roll from mouse */
    camera.rotation.z += (mouse.x * 0.03 - camera.rotation.z) * 0.02;
  });

  return null;
}

/* ── SCENE ── */
function SceneContent({ scrollProgress = 0, route = '/' }) {
  return (
    <>
      <CameraController scrollProgress={scrollProgress} route={route} />

      {/* LIGHTING */}
      <ambientLight intensity={0.08} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} color={WHITE} />
      <pointLight position={[-10, 6, -6]}  intensity={1.2} color={GREEN} />
      <pointLight position={[10, -4, 6]}   intensity={0.6} color={BLUE} />
      <pointLight position={[0, 10, -10]}  intensity={0.5} color={CYAN} />

      {/* ADDITIONAL VOLUMETRIC LIGHTS */}
      <PulsingLight position={[-8, 5, -5]} color="#9c27b0" intensity={0.8} />
      <PulsingLight position={[8, -3, -8]} color="#ff6d00" intensity={0.6} />
      <MovingLight color="#ff1744" intensity={0.7} />

      {/* BACKGROUND HEX GRID */}
      <HexGrid />

      {/* FITNESS RINGS */}
      <MouseFollower factor={0.01} depth={0.5}>
        <FitnessRings position={[0, 0, -5]} />
      </MouseFollower>

      {/* ECG HEARTBEAT */}
      <ECGLine position={[-1, -0.5, -3]} />

      {/* SECOND ECG LINE */}
      <ECGLine2 position={[2, -1.5, -6]} />

      {/* PULSE RING */}
      <PulseRing position={[2.5, 0.5, -4]} />

      {/* DUMBBELLS */}
      <MouseFollower factor={0.02} depth={1.2}>
        <Dumbbell position={[-3.5, 1.2, -4]} color={GREEN} scale={1} />
        <Dumbbell position={[4, -1.5, -5]} color={BLUE} scale={0.8} />
      </MouseFollower>

      {/* KETTLEBELL */}
      <MouseFollower factor={0.018} depth={0.8}>
        <Kettlebell position={[-2, -1, -3]} color={CYAN} scale={1} />
        <Kettlebell position={[3.5, 1.8, -6]} color={GREEN} scale={0.7} />
      </MouseFollower>

      {/* RUNNING SILHOUETTE */}
      <MouseFollower factor={0.025} depth={1.5}>
        <RunningSilhouette position={[-4, -0.5, -9]} color={CYAN} scale={1.2} />
      </MouseFollower>

      {/* HOLOGRAPHIC BODY OUTLINE */}
      <MouseFollower factor={0.015} depth={0.6}>
        <HolographicBody position={[0, 0.5, -12]} scale={1} />
      </MouseFollower>

      {/* DNA HELIX */}
      <MouseFollower factor={0.02} depth={1.0}>
        <DNAHelix position={[4.5, 0, -8]} scale={0.8} />
      </MouseFollower>

      {/* BARBELL */}
      <MouseFollower factor={0.018} depth={1.3}>
        <Barbell position={[-3.5, 1.8, -7]} scale={0.7} />
      </MouseFollower>

      {/* HUD PERFORMANCE RINGS */}
      <MouseFollower factor={0.012} depth={0.4}>
        <HUDRings position={[1.8, 1.2, -5]} />
      </MouseFollower>

      {/* ENERGY PARTICLES */}
      <EnergyParticles />

      {/* CALORIE-BURNING PARTICLES */}
      <CalorieParticles />

      {/* POST-PROCESSING */}
      <PostFX />
    </>
  );
}

/* ── EXPORT ── */
export default function HeroScene({ scrollProgress = 0, route = '/' }) {
  const [hasWebGL, setHasWebGL] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      if (!canvas.getContext('webgl') && !canvas.getContext('experimental-webgl')) setHasWebGL(false);
    } catch { setHasWebGL(false); }
  }, []);
  if (!hasWebGL) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1, 10], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
      >
        <Suspense fallback={null}>
          <SceneContent scrollProgress={scrollProgress} route={route} />
        </Suspense>
      </Canvas>
    </div>
  );
}
