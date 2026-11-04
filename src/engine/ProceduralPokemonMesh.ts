import * as THREE from 'three';
import { PokemonData } from '../types/game';
import { createPrismaticMaterial } from './shaders/prismaticShaders';

export class ProceduralPokemonMesh {
  public group: THREE.Group;
  public pokemon: PokemonData;
  public materials: THREE.Material[] = [];
  public auraParticles?: THREE.Points;
  public bodyParts: {
    head?: THREE.Mesh;
    torso?: THREE.Mesh;
    wings?: THREE.Mesh[];
    limbs?: THREE.Mesh[];
    tail?: THREE.Mesh;
  } = {};

  constructor(pokemon: PokemonData) {
    this.pokemon = pokemon;
    this.group = new THREE.Group();
    this.buildMesh();
  }

  private buildMesh() {
    const pMat = createPrismaticMaterial(
      this.pokemon.prismaticTier,
      this.pokemon.primaryColor,
      this.pokemon.secondaryColor
    );
    this.materials.push(pMat);

    const sMat = new THREE.MeshToonMaterial({
      color: new THREE.Color(this.pokemon.secondaryColor),
    });
    this.materials.push(sMat);

    const aMat = new THREE.MeshToonMaterial({
      color: new THREE.Color(this.pokemon.accentColor),
    });
    this.materials.push(aMat);

    switch (this.pokemon.modelArchetype) {
      case 'draconic':
        this.buildDraconic(pMat, sMat, aMat);
        break;
      case 'biped':
        this.buildBiped(pMat, sMat, aMat);
        break;
      case 'quadruped':
        this.buildQuadruped(pMat, sMat, aMat);
        break;
      case 'orb':
        this.buildOrb(pMat, sMat, aMat);
        break;
      case 'serpentine':
        this.buildSerpentine(pMat, sMat, aMat);
        break;
      case 'avian':
        this.buildAvian(pMat, sMat, aMat);
        break;
      case 'crystal_golem':
      default:
        this.buildCrystalGolem(pMat, sMat, aMat);
        break;
    }

    // Attach Prismatic Auras
    if (this.pokemon.prismaticTier !== 'Standard') {
      this.attachPrismaticParticles();
    }

    this.group.scale.setScalar(this.pokemon.scale);
  }

  private buildDraconic(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.4, 8);
    const torso = new THREE.Mesh(torsoGeo, pMat);
    torso.position.y = 1.0;
    this.group.add(torso);
    this.bodyParts.torso = torso;

    // Belly plate
    const bellyGeo = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8);
    const belly = new THREE.Mesh(bellyGeo, sMat);
    belly.position.set(0, 1.0, 0.2);
    belly.scale.set(0.9, 0.9, 0.7);
    this.group.add(belly);

    // Head
    const headGeo = new THREE.ConeGeometry(0.45, 0.9, 7);
    const head = new THREE.Mesh(headGeo, pMat);
    head.rotation.x = Math.PI / 2.2;
    head.position.set(0, 1.9, 0.3);
    this.group.add(head);
    this.bodyParts.head = head;

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.12, 0.5, 5);
    const hornL = new THREE.Mesh(hornGeo, aMat);
    hornL.position.set(-0.25, 2.3, -0.1);
    hornL.rotation.z = -0.4;
    const hornR = new THREE.Mesh(hornGeo, aMat);
    hornR.position.set(0.25, 2.3, -0.1);
    hornR.rotation.z = 0.4;
    this.group.add(hornL, hornR);

    // Wings
    this.bodyParts.wings = [];
    const wingGeo = new THREE.BoxGeometry(1.2, 0.05, 0.7);
    const wingL = new THREE.Mesh(wingGeo, aMat);
    wingL.position.set(-0.8, 1.6, -0.3);
    wingL.rotation.y = 0.3;
    wingL.rotation.z = 0.4;
    const wingR = new THREE.Mesh(wingGeo, aMat);
    wingR.position.set(0.8, 1.6, -0.3);
    wingR.rotation.y = -0.3;
    wingR.rotation.z = -0.4;
    this.group.add(wingL, wingR);
    this.bodyParts.wings.push(wingL, wingR);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 6);
    const legL = new THREE.Mesh(legGeo, pMat);
    legL.position.set(-0.4, 0.4, 0);
    const legR = new THREE.Mesh(legGeo, pMat);
    legR.position.set(0.4, 0.4, 0);
    this.group.add(legL, legR);

    // Tail
    const tailGeo = new THREE.CylinderGeometry(0.1, 0.3, 1.5, 6);
    const tail = new THREE.Mesh(tailGeo, pMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.6, -0.9);
    this.group.add(tail);
    this.bodyParts.tail = tail;

    // Tail flame tip
    const flameGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 1.1, -1.6);
    this.group.add(flame);
  }

  private buildBiped(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    // Torso / Shell
    const torsoGeo = new THREE.SphereGeometry(0.75, 8, 8);
    const torso = new THREE.Mesh(torsoGeo, pMat);
    torso.position.y = 1.1;
    this.group.add(torso);
    this.bodyParts.torso = torso;

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const head = new THREE.Mesh(headGeo, pMat);
    head.position.set(0, 1.9, 0);
    this.group.add(head);
    this.bodyParts.head = head;

    // Limbs
    const armGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.8, 6);
    const armL = new THREE.Mesh(armGeo, pMat);
    armL.position.set(-0.85, 1.1, 0.2);
    armL.rotation.z = -Math.PI / 4;
    const armR = new THREE.Mesh(armGeo, pMat);
    armR.position.set(0.85, 1.1, 0.2);
    armR.rotation.z = Math.PI / 4;
    this.group.add(armL, armR);

    const legGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 6);
    const legL = new THREE.Mesh(legGeo, sMat);
    legL.position.set(-0.4, 0.35, 0);
    const legR = new THREE.Mesh(legGeo, sMat);
    legR.position.set(0.4, 0.35, 0);
    this.group.add(legL, legR);

    // Canons / Accents on shoulders
    const canonGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.7, 6);
    const canonL = new THREE.Mesh(canonGeo, aMat);
    canonL.position.set(-0.55, 1.7, -0.3);
    canonL.rotation.x = -Math.PI / 4;
    const canonR = new THREE.Mesh(canonGeo, aMat);
    canonR.position.set(0.55, 1.7, -0.3);
    canonR.rotation.x = -Math.PI / 4;
    this.group.add(canonL, canonR);
  }

  private buildQuadruped(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    // Body
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.8, 1.6);
    const body = new THREE.Mesh(bodyGeo, pMat);
    body.position.y = 0.8;
    this.group.add(body);
    this.bodyParts.torso = body;

    // Head
    const headGeo = new THREE.BoxGeometry(0.7, 0.6, 0.8);
    const head = new THREE.Mesh(headGeo, pMat);
    head.position.set(0, 1.1, 0.9);
    this.group.add(head);
    this.bodyParts.head = head;

    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.6, 6);
    const positions = [
      [-0.45, 0.3, 0.6],
      [0.45, 0.3, 0.6],
      [-0.45, 0.3, -0.6],
      [0.45, 0.3, -0.6],
    ];
    positions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, sMat);
      leg.position.set(x, y, z);
      this.group.add(leg);
    });

    // Back foliage/flower bulb or back accessory
    const bulbGeo = new THREE.DodecahedronGeometry(0.6);
    const bulb = new THREE.Mesh(bulbGeo, aMat);
    bulb.position.set(0, 1.5, 0);
    this.group.add(bulb);
  }

  private buildOrb(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    // Ghostly floating orb body (e.g. Gengar / Mimikyu)
    const orbGeo = new THREE.DodecahedronGeometry(0.9, 1);
    const orb = new THREE.Mesh(orbGeo, pMat);
    orb.position.y = 1.0;
    this.group.add(orb);
    this.bodyParts.torso = orb;

    // Spikes/ears
    const earGeo = new THREE.ConeGeometry(0.25, 0.6, 5);
    const earL = new THREE.Mesh(earGeo, pMat);
    earL.position.set(-0.5, 1.7, 0);
    earL.rotation.z = -0.3;
    const earR = new THREE.Mesh(earGeo, pMat);
    earR.position.set(0.5, 1.7, 0);
    earR.rotation.z = 0.3;
    this.group.add(earL, earR);

    // Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, aMat);
    eyeL.position.set(-0.25, 1.1, 0.75);
    const eyeR = new THREE.Mesh(eyeGeo, aMat);
    eyeR.position.set(0.25, 1.1, 0.75);
    this.group.add(eyeL, eyeR);
  }

  private buildSerpentine(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    // Coil dragon / snake (Rayquaza style)
    const segments = 6;
    for (let i = 0; i < segments; i++) {
      const segGeo = new THREE.TorusGeometry(0.45, 0.22, 8, 12, Math.PI);
      const seg = new THREE.Mesh(segGeo, i % 2 === 0 ? pMat : sMat);
      seg.position.set(Math.sin(i * 0.8) * 0.3, 0.4 + i * 0.4, Math.cos(i * 0.8) * 0.3);
      seg.rotation.x = Math.PI / 2;
      seg.rotation.z = i * 0.5;
      this.group.add(seg);
    }
    // Head crest
    const headGeo = new THREE.OctahedronGeometry(0.5);
    const head = new THREE.Mesh(headGeo, aMat);
    head.position.set(0, 2.6, 0.3);
    this.group.add(head);
    this.bodyParts.head = head;
  }

  private buildAvian(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    const bodyGeo = new THREE.ConeGeometry(0.6, 1.6, 8);
    const body = new THREE.Mesh(bodyGeo, pMat);
    body.position.y = 1.0;
    body.rotation.x = -Math.PI / 4;
    this.group.add(body);
    this.bodyParts.torso = body;

    // Wide Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.05, 0.8);
    const wings = new THREE.Mesh(wingGeo, sMat);
    wings.position.set(0, 1.4, 0);
    this.group.add(wings);

    // Beak / Head
    const headGeo = new THREE.SphereGeometry(0.4, 7, 7);
    const head = new THREE.Mesh(headGeo, pMat);
    head.position.set(0, 1.8, 0.5);
    this.group.add(head);

    const beakGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
    const beak = new THREE.Mesh(beakGeo, aMat);
    beak.position.set(0, 1.8, 0.8);
    beak.rotation.x = Math.PI / 2;
    this.group.add(beak);
  }

  private buildCrystalGolem(pMat: THREE.Material, sMat: THREE.Material, aMat: THREE.Material) {
    // Terapagos / Crystal Core style
    const coreGeo = new THREE.IcosahedronGeometry(0.9, 0);
    const core = new THREE.Mesh(coreGeo, pMat);
    core.position.y = 1.0;
    this.group.add(core);
    this.bodyParts.torso = core;

    // Floating crystal shards orbiting
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const shardGeo = new THREE.OctahedronGeometry(0.25);
      const shard = new THREE.Mesh(shardGeo, aMat);
      shard.position.set(Math.cos(angle) * 1.3, 1.0 + Math.sin(angle * 2) * 0.3, Math.sin(angle) * 1.3);
      this.group.add(shard);
    }
  }

  private attachPrismaticParticles() {
    const tier = this.pokemon.prismaticTier;
    const count = tier === 'Supernova' ? 180 : tier === 'Ethereal' ? 120 : tier === 'Radiant' ? 80 : 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor =
      tier === 'Supernova' ? new THREE.Color(0xffb703) :
      tier === 'Ethereal' ? new THREE.Color(0x00d2ff) :
      tier === 'Radiant' ? new THREE.Color(0x00ffcc) :
      new THREE.Color(0xfff380);

    for (let i = 0; i < count; i++) {
      const r = 0.8 + Math.random() * 1.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 0.8 + r * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: tier === 'Supernova' ? 0.18 : 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.auraParticles = new THREE.Points(particleGeo, particleMat);
    this.group.add(this.auraParticles);
  }

  public update(time: number, isWalking: boolean = false, isAttacking: boolean = false) {
    // Update custom shader uniforms
    this.materials.forEach(mat => {
      if (mat instanceof THREE.ShaderMaterial && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
    });

    // Idle breathing / floating animation
    const bob = Math.sin(time * 3) * 0.08;
    this.group.position.y += bob * 0.05;

    // Wing flap if any
    if (this.bodyParts.wings && this.bodyParts.wings.length === 2) {
      const flap = Math.sin(time * 8) * 0.35;
      this.bodyParts.wings[0].rotation.z = 0.4 + flap;
      this.bodyParts.wings[1].rotation.z = -0.4 - flap;
    }

    // Walking stride
    if (isWalking) {
      this.group.position.y = Math.abs(Math.sin(time * 6)) * 0.15;
    }

    // Attack lunge
    if (isAttacking) {
      this.group.scale.setScalar(this.pokemon.scale * 1.15);
    } else {
      this.group.scale.setScalar(this.pokemon.scale);
    }

    // Rotate particle aura
    if (this.auraParticles) {
      this.auraParticles.rotation.y = time * 0.8;
      this.auraParticles.rotation.x = Math.sin(time * 0.5) * 0.2;
    }
  }

  public dispose() {
    this.materials.forEach(mat => mat.dispose());
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
  }
}
