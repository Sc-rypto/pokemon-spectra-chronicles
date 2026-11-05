import * as THREE from 'three';
import { PokemonData } from '../types/game';
import { pokemonModelManager } from './PokemonModelManager';
import { applyPrismaticShaderToMesh } from './shaders/prismaticShaders';

export class ProceduralPokemonMesh {
  public group: THREE.Group;
  public pokemon: PokemonData;
  public materials: THREE.Material[] = [];
  public auraParticles?: THREE.Points;
  public footstepParticles?: THREE.Points;
  private mixer?: THREE.AnimationMixer;
  private isLoaded: boolean = false;
  private placeholderMesh?: THREE.Group;

  constructor(pokemon: PokemonData) {
    this.pokemon = pokemon;
    this.group = new THREE.Group();
    
    // 1. Build an instant aesthetic placeholder while the textured GLB streams in
    this.buildInstantPlaceholder();

    // 2. Fetch official textured 3D model with DRACO compression and apply custom shaders
    this.loadTexturedModel();

    // 3. Attach Tier Particle Auras
    if (this.pokemon.prismaticTier !== 'Standard') {
      this.attachPrismaticParticles();
    }
  }

  private buildInstantPlaceholder() {
    this.placeholderMesh = new THREE.Group();
    const geo = new THREE.SphereGeometry(0.8, 12, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.pokemon.primaryColor),
      roughness: 0.4,
      metalness: 0.1,
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.y = 0.8;
    this.placeholderMesh.add(sphere);
    this.group.add(this.placeholderMesh);
  }

  private async loadTexturedModel() {
    try {
      const isShiny = this.pokemon.prismaticTier === 'Shiny';
      const gltf = await pokemonModelManager.loadPokemonModel(this.pokemon.dexNumber, isShiny);

      // Clone scene for multiple instances on field
      const clonedScene = gltf.scene.clone(true);

      // Extract bounding box to normalize scale so all Pokémon look balanced in the 3D scene
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetHeight = 1.8 * (this.pokemon.scale || 1.0);
      const scaleFactor = maxDim > 0 ? targetHeight / maxDim : 1.0;

      clonedScene.scale.setScalar(scaleFactor);

      // Center model pivot at feet on the ground plane
      const updatedBox = new THREE.Box3().setFromObject(clonedScene);
      clonedScene.position.y = -updatedBox.min.y;

      // Enable shadows and apply Custom Shaders to textures
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Preserve the original diffuse texture map
          let originalMap: THREE.Texture | null = null;
          if (Array.isArray(mesh.material)) {
            originalMap = (mesh.material[0] as THREE.MeshStandardMaterial).map;
          } else if (mesh.material) {
            originalMap = (mesh.material as THREE.MeshStandardMaterial).map;
          }

          // Apply shader variant (Standard, Shiny, Radiant, Ethereal, Supernova)
          const newMat = applyPrismaticShaderToMesh(mesh, this.pokemon.prismaticTier, originalMap);
          mesh.material = newMat;
          this.materials.push(newMat);
        }
      });

      // Handle GLTF animations if present
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(clonedScene);
        const action = this.mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      // Remove the instant placeholder and add the real textured 3D model
      if (this.placeholderMesh) {
        this.group.remove(this.placeholderMesh);
        this.placeholderMesh = undefined;
      }

      this.group.add(clonedScene);
      this.isLoaded = true;
    } catch (_err) {
      // Model fallback if offline or failed: placeholder remains cleanly styled
      console.warn(`Could not load GLB for ${this.pokemon.speciesName}, using fallback representation.`);
    }
  }

  private attachPrismaticParticles() {
    const tier = this.pokemon.prismaticTier;
    const count = tier === 'Supernova' ? 220 : tier === 'Ethereal' ? 140 : tier === 'Radiant' ? 90 : 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor =
      tier === 'Supernova' ? new THREE.Color(0xffb703) :
      tier === 'Ethereal' ? new THREE.Color(0x00d2ff) :
      tier === 'Radiant' ? new THREE.Color(0x00ffcc) :
      new THREE.Color(0xfff380);

    for (let i = 0; i < count; i++) {
      const r = 1.0 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 1.0 + r * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: tier === 'Supernova' ? 0.22 : 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    this.auraParticles = new THREE.Points(particleGeo, particleMat);
    this.group.add(this.auraParticles);

    // Supernova custom ground flame trail
    if (tier === 'Supernova') {
      const trailCount = 30;
      const trailGeo = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(trailCount * 3);
      for (let i = 0; i < trailCount; i++) {
        trailPositions[i * 3] = (Math.random() - 0.5) * 1.5;
        trailPositions[i * 3 + 1] = Math.random() * 0.4;
        trailPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      }
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.PointsMaterial({
        size: 0.25,
        color: new THREE.Color(0xff4500),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      this.footstepParticles = new THREE.Points(trailGeo, trailMat);
      this.group.add(this.footstepParticles);
    }
  }

  public update(time: number, delta: number = 0.016, isWalking: boolean = false, isAttacking: boolean = false) {
    // 1. Update GLTF bone animation mixer if present
    if (this.mixer) {
      this.mixer.update(delta);
    } else {
      // Procedural idle breathing bob
      const bob = Math.sin(time * 3) * 0.06;
      this.group.position.y += bob * 0.04;
    }

    // 2. Update custom shader uniforms (uTime)
    this.materials.forEach(mat => {
      if (mat instanceof THREE.ShaderMaterial && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
    });

    // 3. Walking stride animation
    if (isWalking) {
      this.group.position.y = Math.abs(Math.sin(time * 6)) * 0.12;
    }

    // 4. Attack surge scale
    if (isAttacking) {
      this.group.scale.setScalar(1.18);
    } else {
      this.group.scale.setScalar(1.0);
    }

    // 5. Rotate Prismatic orbital auras
    if (this.auraParticles) {
      this.auraParticles.rotation.y = time * 0.75;
      this.auraParticles.rotation.x = Math.sin(time * 0.4) * 0.2;
    }

    if (this.footstepParticles) {
      this.footstepParticles.rotation.y = -time * 1.2;
    }
  }

  public dispose() {
    this.materials.forEach(mat => mat.dispose());
    if (this.auraParticles) {
      this.auraParticles.geometry.dispose();
      (this.auraParticles.material as THREE.Material).dispose();
    }
    if (this.footstepParticles) {
      this.footstepParticles.geometry.dispose();
      (this.footstepParticles.material as THREE.Material).dispose();
    }
    this.group.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).geometry.dispose();
      }
    });
  }
}
