import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { PrismaticTier } from '../../types/game';

// Custom shaders applied to textured Pokémon models for Prismatic Variants:
// Radiant: Inverts/shifts hue dynamically with neon aura
// Ethereal: Crystal/galaxy cosmic transparent refraction with star field patterns
// Supernova: Obsidian dark shell with animated molten gold/plasma flare rims

export function applyPrismaticShaderToMesh(
  mesh: THREE.Mesh,
  tier: PrismaticTier,
  originalMap: THREE.Texture | null
): THREE.Material {
  if (tier === 'Standard' || tier === 'Shiny') {
    // Return standard material preserving original diffuse/normal texture map!
    const mat = new THREE.MeshStandardMaterial({
      map: originalMap,
      roughness: 0.5,
      metalness: tier === 'Shiny' ? 0.35 : 0.05,
    });
    if (tier === 'Shiny') {
      mat.color = new THREE.Color(1.15, 1.15, 1.05); // slight shiny brilliance
    }
    return mat;
  }

  if (tier === 'Radiant') {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: originalMap },
        uHasTexture: { value: originalMap ? 1.0 : 0.0 },
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
        uniform sampler2D uTexture;
        uniform float uHasTexture;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // RGB to HSV
        vec3 rgb2hsv(vec3 c) {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        // HSV to RGB
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
          vec4 texColor = uHasTexture > 0.5 ? texture2D(uTexture, vUv) : vec4(0.2, 0.8, 0.6, 1.0);
          
          // Dynamic Hue Shift cycling continuously
          vec3 hsv = rgb2hsv(texColor.rgb);
          hsv.x = fract(hsv.x + 0.45 + sin(uTime * 1.5 + vPosition.y * 3.0) * 0.15);
          hsv.y = clamp(hsv.y * 1.35, 0.0, 1.0); // extra neon saturation
          vec3 neonColor = hsv2rgb(hsv);

          // Celestial rim light (cyan/magenta aura)
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
          rim = pow(rim, 2.2);

          vec3 auraColor = mix(vec3(0.0, 1.0, 0.8), vec3(1.0, 0.1, 0.6), sin(uTime * 3.0) * 0.5 + 0.5);
          vec3 finalColor = neonColor + rim * auraColor * 1.2;

          gl_FragColor = vec4(finalColor, texColor.a);
        }
      `,
    });
  }

  if (tier === 'Ethereal') {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: originalMap },
        uHasTexture: { value: originalMap ? 1.0 : 0.0 },
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
        uniform sampler2D uTexture;
        uniform float uHasTexture;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;

        void main() {
          vec4 texColor = uHasTexture > 0.5 ? texture2D(uTexture, vUv) : vec4(0.5, 0.5, 1.0, 1.0);

          // Moving cosmic galaxy crystal pattern
          float starfield = sin(vWorldPosition.x * 12.0 + uTime * 2.0) * 
                            sin(vWorldPosition.y * 12.0 - uTime * 1.5) * 
                            sin(vWorldPosition.z * 12.0);
          starfield = pow(clamp(starfield, 0.0, 1.0), 4.0);

          vec3 deepCosmos = mix(vec3(0.12, 0.0, 0.35), vec3(0.0, 0.45, 0.85), sin(uTime + vWorldPosition.y * 2.0) * 0.5 + 0.5);
          vec3 galaxyColor = mix(texColor.rgb * 0.4, deepCosmos, 0.65) + vec3(starfield * 1.8);

          // Crystalline glass fresnel
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.5);
          vec3 finalColor = galaxyColor + fresnel * vec3(0.4, 0.9, 1.0);

          gl_FragColor = vec4(finalColor, 0.85);
        }
      `,
    });
  }

  // Supernova Tier (Molten Obsidian & Gold Flame)
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: originalMap },
      uHasTexture: { value: originalMap ? 1.0 : 0.0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        float flare = sin(pos.y * 10.0 + uTime * 7.0) * cos(pos.x * 10.0 + uTime * 6.0) * 0.04;
        pos += normal * flare;

        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform sampler2D uTexture;
      uniform float uHasTexture;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vec4 texColor = uHasTexture > 0.5 ? texture2D(uTexture, vUv) : vec4(0.8, 0.4, 0.1, 1.0);

        // Obsidian body darkening while retaining Pokémon feature details
        vec3 obsidianBody = texColor.rgb * 0.18 + vec3(0.05, 0.04, 0.07);

        // Molten gold / plasma flame noise along vertices
        float flame = sin(vWorldPosition.y * 9.0 - uTime * 8.0) * cos(vWorldPosition.x * 9.0 + uTime * 5.0);
        flame = clamp((flame + 1.0) * 0.5, 0.0, 1.0);

        vec3 goldFlame = mix(vec3(1.0, 0.65, 0.0), vec3(1.0, 0.95, 0.6), flame);

        // Blazing solar corona rim
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
        rim = pow(rim, 1.8);

        vec3 finalColor = mix(obsidianBody, goldFlame, flame * 0.6 + rim * 0.8);
        finalColor += vec3(1.0, 0.5, 0.0) * (sin(uTime * 6.0) * 0.15 + 0.25);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}
