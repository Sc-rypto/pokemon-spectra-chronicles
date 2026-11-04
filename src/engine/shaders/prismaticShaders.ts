import * as THREE from 'three';
import { PrismaticTier } from '../../types/game';

// Custom shaders for Prismatic Tiers
export function createPrismaticMaterial(
  tier: PrismaticTier,
  baseColorHex: string,
  _secondaryColorHex: string
): THREE.Material {
  const baseColor = new THREE.Color(baseColorHex);

  switch (tier) {
    case 'Standard':
      return new THREE.MeshToonMaterial({
        color: baseColor,
      });

    case 'Shiny':
      // Golden/sparkling tinted cel-shaded material
      return new THREE.MeshStandardMaterial({
        color: baseColor.clone().offsetHSL(0.35, 0.2, 0.1),
        metalness: 0.65,
        roughness: 0.25,
        emissive: new THREE.Color(0xffaa22),
        emissiveIntensity: 0.25,
      });

    case 'Radiant':
      // Inverted / Neon Color-Shift Palette Shader
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBaseColor: { value: baseColor },
          uShiftColor: { value: new THREE.Color(0x00ffcc) },
          uAccentColor: { value: new THREE.Color(0xff007f) },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec2 vUv;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uBaseColor;
          uniform vec3 uShiftColor;
          uniform vec3 uAccentColor;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec2 vUv;

          void main() {
            float wave = sin(vPosition.y * 5.0 + uTime * 4.0) * 0.5 + 0.5;
            vec3 neonMix = mix(uShiftColor, uAccentColor, wave);
            
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
            rim = pow(rim, 2.5);

            vec3 finalColor = mix(uBaseColor, neonMix, 0.65) + rim * vec3(0.3, 1.0, 0.9);
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
      });

    case 'Ethereal':
      // Translucent / Crystal procedural shader (Galaxy / Crystal Refraction)
      return new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(0x7000ff) },
          uColor2: { value: new THREE.Color(0x00d2ff) },
          uColor3: { value: new THREE.Color(0xff00ea) },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          varying vec2 vUv;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          varying vec2 vUv;

          void main() {
            float grid = sin(vWorldPosition.x * 10.0 + uTime * 2.0) * sin(vWorldPosition.y * 10.0 - uTime * 1.5) * sin(vWorldPosition.z * 10.0);
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            
            vec3 cosmos = mix(uColor1, uColor2, sin(uTime + vWorldPosition.y * 2.0) * 0.5 + 0.5);
            cosmos = mix(cosmos, uColor3, grid * 0.5 + 0.5);

            gl_FragColor = vec4(cosmos + fresnel * 0.8, 0.78);
          }
        `,
      });

    case 'Supernova':
    default:
      // Obsidian & Gold Flame body shader with dynamic plasma corona
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uObsidian: { value: new THREE.Color(0x0d0d11) },
          uGoldFlame: { value: new THREE.Color(0xffb703) },
          uWhiteHot: { value: new THREE.Color(0xffffff) },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec3 pos = position;
            float flare = sin(pos.y * 8.0 + uTime * 6.0) * cos(pos.x * 8.0 + uTime * 5.0) * 0.05;
            pos += normal * flare;

            vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uObsidian;
          uniform vec3 uGoldFlame;
          uniform vec3 uWhiteHot;
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          varying vec2 vUv;

          void main() {
            float flame = sin(vWorldPosition.y * 8.0 - uTime * 7.0) * cos(vWorldPosition.x * 8.0 + uTime * 4.0);
            flame = clamp((flame + 1.0) * 0.5, 0.0, 1.0);

            float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
            rim = pow(rim, 2.0);

            vec3 flameColor = mix(uGoldFlame, uWhiteHot, flame);
            vec3 finalColor = mix(uObsidian, flameColor, flame * 0.8 + rim * 0.7);

            finalColor += uGoldFlame * (sin(uTime * 5.0) * 0.2 + 0.3);

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
      });
  }
}
