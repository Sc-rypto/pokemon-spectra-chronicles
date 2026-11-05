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
  private placeholderMesh?: THREE.Group;

  // Free-roam & battle motion state
  public basePosition: THREE.Vector3 = new THREE.Vector3();
  public targetPosition: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isPlayer: boolean = false;
  public isFainted: boolean = false;
  
  // Dynamic action state
  public attackLungeTime: number = 0;
  public attackTargetPos: THREE.Vector3 | null = null;
  public hitShakeTime: number = 0;
  public wanderTimer: number = Math.random() * 2;

  constructor(pokemon: PokemonData, isPlayer: boolean = false) {
    this.pokemon = pokemon;
    this.isPlayer = isPlayer;
    this.group = new THREE.Group();

    this.buildInstantPlaceholder();
    this.loadTexturedModel();

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

      const clonedScene = gltf.scene.clone(true);

      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetHeight = 1.9 * (this.pokemon.scale || 1.0);
      const scaleFactor = maxDim > 0 ? targetHeight / maxDim : 1.0;

      clonedScene.scale.setScalar(scaleFactor);

      const updatedBox = new THREE.Box3().setFromObject(clonedScene);
      clonedScene.position.y = -updatedBox.min.y;

      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          let originalMap: THREE.Texture | null = null;
          if (Array.isArray(mesh.material)) {
            originalMap = (mesh.material[0] as THREE.MeshStandardMaterial).map;
          } else if (mesh.material) {
            originalMap = (mesh.material as THREE.MeshStandardMaterial).map;
          }

          const newMat = applyPrismaticShaderToMesh(mesh, this.pokemon.prismaticTier, originalMap);
          mesh.material = newMat;
          this.materials.push(newMat);
        }
      });

      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(clonedScene);
        const action = this.mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      if (this.placeholderMesh) {
        this.group.remove(this.placeholderMesh);
        this.placeholderMesh = undefined;
      }

      this.group.add(clonedScene);
    } catch (_err) {
      // Clean fallback kept
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

  // Trigger real 3D physical attack dash towards enemy
  public triggerPhysicalLunge(targetPos: THREE.Vector3) {
    this.attackLungeTime = 0.45; // seconds
    this.attackTargetPos = targetPos.clone();
  }

  // Trigger hit reaction shake
  public triggerHitShake() {
    this.hitShakeTime = 0.25;
  }

  public update(time: number, delta: number = 0.016) {
    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.materials.forEach(mat => {
      if (mat instanceof THREE.ShaderMaterial && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
    });

    // 1. FREE-ROAMING MOVEMENT ENGINE:
    // Periodically pick smooth random wandering targets around their zone
    this.wanderTimer -= delta;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = 1.5 + Math.random() * 2.5;
      const radius = this.isPlayer ? 2.5 : 3.5;
      const ox = (Math.random() - 0.5) * radius * 2;
      const oz = (Math.random() - 0.5) * radius * 1.5;
      this.targetPosition.set(this.basePosition.x + ox, 0, this.basePosition.z + oz);
    }

    // 2. Physical Attack Dash vs Idle Roaming:
    if (this.attackLungeTime > 0 && this.attackTargetPos) {
      this.attackLungeTime -= delta;
      // Dash directly toward opponent during the strike window!
      const dirToTarget = this.attackTargetPos.clone().sub(this.group.position);
      const dist = dirToTarget.length();
      if (dist > 1.2) {
        dirToTarget.normalize();
        this.group.position.addScaledVector(dirToTarget, delta * 12.0);
        // Face the target
        this.group.rotation.y = Math.atan2(dirToTarget.x, dirToTarget.z);
      }
      this.group.scale.setScalar(1.22);
    } else {
      // Smoothly steer towards wander target
      const toTarget = this.targetPosition.clone().sub(this.group.position);
      toTarget.y = 0;
      const dist = toTarget.length();

      if (dist > 0.1) {
        toTarget.normalize();
        const moveSpeed = this.isPlayer ? 1.6 : 2.2;
        this.group.position.addScaledVector(toTarget, delta * moveSpeed);
        
        // Smoothly rotate to face direction of movement
        const targetAngle = Math.atan2(toTarget.x, toTarget.z);
        this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, delta * 6.0);

        // Walking bob stride
        this.group.position.y = Math.abs(Math.sin(time * 8)) * 0.16;
      } else {
        // Idle gentle breathing bob
        this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, 0, delta * 4);
      }

      this.group.scale.setScalar(1.0);
    }

    // 3. Hit Shake Reaction
    if (this.hitShakeTime > 0) {
      this.hitShakeTime -= delta;
      this.group.position.x += (Math.random() - 0.5) * 0.25;
      this.group.position.z += (Math.random() - 0.5) * 0.25;
    }

    // 4. Rotate Prismatic auras
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
