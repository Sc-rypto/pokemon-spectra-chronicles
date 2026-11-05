import * as THREE from 'three';
import { PokemonData, RegionInfo, ActiveCombatant } from '../types/game';
import { ProceduralPokemonMesh } from './ProceduralPokemonMesh';
import { REGIONS_DATA } from '../data/pokemonCatalog';

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  worldPos: THREE.Vector3;
  screenPos: { x: number; y: number };
  opacity: number;
  scale: number;
}

interface ParticleProjectile {
  mesh: THREE.Mesh;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number;
  speed: number;
  color: number;
}

export class WorldSceneManager {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;

  // Environment elements
  private groundMesh!: THREE.Mesh;
  private gridHelper!: THREE.GridHelper;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private biomeDecos: THREE.Group = new THREE.Group();
  private arenaRing!: THREE.Mesh;

  // Combatant meshes
  public playerMeshes: Map<string, ProceduralPokemonMesh> = new Map();
  public enemyMeshes: Map<string, ProceduralPokemonMesh> = new Map();
  public buddyMesh: ProceduralPokemonMesh | null = null;
  public trainerMesh: THREE.Group | null = null;

  // Dynamic particle projectiles and burst FX
  private projectiles: ParticleProjectile[] = [];
  private burstParticles: { group: THREE.Points; life: number; maxLife: number; velocities: Float32Array }[] = [];

  // Floating combat numbers
  public floatingTexts: FloatingText[] = [];
  private clock = new THREE.Clock();
  public onFloatingTextsUpdate?: (texts: FloatingText[]) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    container.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.setupLighting();
    this.setupEnvironment();
    this.buildTrainerMesh();

    window.addEventListener('resize', this.onResize);
    this.startLoop();
  }

  private setupCamera() {
    this.camera.position.set(0, 10, 18);
    this.camera.lookAt(0, 1.0, 0);
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.4);
    this.hemiLight.position.set(0, 25, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.dirLight.position.set(10, 24, 12);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 70;
    this.dirLight.shadow.camera.left = -16;
    this.dirLight.shadow.camera.right = 16;
    this.dirLight.shadow.camera.top = 16;
    this.dirLight.shadow.camera.bottom = -16;
    this.scene.add(this.dirLight);
  }

  private setupEnvironment() {
    // Stylized terrain ground plane
    const groundGeo = new THREE.PlaneGeometry(90, 90, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Dynamic glowing Battle Arena circle
    const ringGeo = new THREE.RingGeometry(8.5, 9.0, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    this.arenaRing = new THREE.Mesh(ringGeo, ringMat);
    this.arenaRing.rotation.x = -Math.PI / 2;
    this.arenaRing.position.y = 0.03;
    this.scene.add(this.arenaRing);

    // Battlefield grid lines
    this.gridHelper = new THREE.GridHelper(40, 20, 0x818cf8, 0x1e293b);
    this.gridHelper.position.y = 0.02;
    this.scene.add(this.gridHelper);

    this.scene.add(this.biomeDecos);
    this.generateBiomeDecorations(REGIONS_DATA[0]);

    this.scene.fog = new THREE.FogExp2(0xb2dfdb, 0.018);
    this.scene.background = new THREE.Color(REGIONS_DATA[0].skyColor);
  }

  private buildTrainerMesh() {
    const trainerGroup = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1a4, roughness: 0.6 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 8), coatMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    trainerGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), skinMat);
    head.position.y = 2.05;
    head.castShadow = true;
    trainerGroup.add(head);

    // Trainer Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 8), capMat);
    cap.position.y = 2.25;
    trainerGroup.add(cap);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.25), capMat);
    visor.position.set(0, 2.2, -0.25);
    trainerGroup.add(visor);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.9, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.2, 0.5, 0);
    legL.castShadow = true;
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.2, 0.5, 0);
    legR.castShadow = true;
    trainerGroup.add(legL, legR);

    trainerGroup.position.set(0, 0, 9.5);
    trainerGroup.rotation.y = Math.PI;
    this.scene.add(trainerGroup);
    this.trainerMesh = trainerGroup;
  }

  public setBiome(region: RegionInfo) {
    this.scene.background = new THREE.Color(region.skyColor);
    (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(region.groundColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.set(region.fogColor);
    }
    this.hemiLight.color.set(region.ambientColor);
    this.generateBiomeDecorations(region);
  }

  private generateBiomeDecorations(region: RegionInfo) {
    while (this.biomeDecos.children.length > 0) {
      const obj = this.biomeDecos.children[0];
      this.biomeDecos.remove(obj);
    }

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 20 + Math.random() * 14;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (region.biomeTheme === 'paldea_crater' || region.biomeTheme === 'sinnoh_snow') {
        const crystalGeo = new THREE.OctahedronGeometry(1.2 + Math.random() * 1.5, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
          color: region.biomeTheme === 'paldea_crater' ? 0xd946ef : 0x38bdf8,
          roughness: 0.15,
          metalness: 0.8,
          emissive: region.biomeTheme === 'paldea_crater' ? 0x701a75 : 0x0369a1,
          emissiveIntensity: 0.4,
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(x, 1.2, z);
        crystal.rotation.set(Math.random(), Math.random(), Math.random());
        this.biomeDecos.add(crystal);
      } else {
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 2, 5);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 1, z);

        const crownGeo = new THREE.ConeGeometry(1.5, 3, 5);
        const crownMat = new THREE.MeshStandardMaterial({
          color: region.biomeTheme === 'johto_autumn' ? 0xea580c : region.biomeTheme === 'hoenn_volcano' ? 0x7f1d1d : 0x16a34a,
        });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(x, 3.2, z);

        this.biomeDecos.add(trunk, crown);
      }
    }
  }

  public syncSquad(squad: PokemonData[], buddy?: PokemonData) {
    const activeIds = new Set(squad.map(p => p.id));

    this.playerMeshes.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh.group);
        mesh.dispose();
        this.playerMeshes.delete(id);
      }
    });

    const squadSlots = [
      { x: -5.0, z: 4.5 },
      { x: -2.5, z: 3.5 },
      { x: 0.0, z: 3.0 },
      { x: 2.5, z: 3.5 },
      { x: 5.0, z: 4.5 },
    ];

    squad.forEach((pkmn, idx) => {
      let mesh = this.playerMeshes.get(pkmn.id);
      if (!mesh) {
        mesh = new ProceduralPokemonMesh(pkmn);
        this.playerMeshes.set(pkmn.id, mesh);
        this.scene.add(mesh.group);
      }
      const slot = squadSlots[idx] || squadSlots[0];
      mesh.group.position.set(slot.x, 0, slot.z);
      mesh.group.rotation.y = 0;
    });

    if (buddy) {
      if (!this.buddyMesh || this.buddyMesh.pokemon.id !== buddy.id) {
        if (this.buddyMesh) {
          this.scene.remove(this.buddyMesh.group);
          this.buddyMesh.dispose();
        }
        this.buddyMesh = new ProceduralPokemonMesh(buddy);
        this.scene.add(this.buddyMesh.group);
      }
      this.buddyMesh.group.position.set(1.6, 0, 9.5);
      this.buddyMesh.group.rotation.y = -0.3;
    }
  }

  public syncEnemies(enemies: ActiveCombatant[]) {
    const activeIds = new Set(enemies.map(e => e.visual3dId));

    this.enemyMeshes.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh.group);
        mesh.dispose();
        this.enemyMeshes.delete(id);
      }
    });

    const enemySlots = [
      { x: -4.0, z: -5.0 },
      { x: -1.5, z: -6.5 },
      { x: 1.5, z: -6.5 },
      { x: 4.0, z: -5.0 },
    ];

    enemies.forEach((enemy, idx) => {
      let mesh = this.enemyMeshes.get(enemy.visual3dId);
      if (!mesh) {
        mesh = new ProceduralPokemonMesh(enemy.pokemon);
        this.enemyMeshes.set(enemy.visual3dId, mesh);
        this.scene.add(mesh.group);
      }
      const slot = enemySlots[idx] || enemySlots[0];
      mesh.group.position.set(slot.x, 0, slot.z);
      mesh.group.rotation.y = Math.PI;
    });
  }

  // 3D Animated Projectiles and Impact Bursts
  public triggerAttackFx(fromPos: THREE.Vector3, toPos: THREE.Vector3, type: string) {
    let colorHex = 0xff5533;
    if (type === 'Water') colorHex = 0x3b82f6;
    if (type === 'Grass') colorHex = 0x22c55e;
    if (type === 'Electric') colorHex = 0xfacc15;
    if (type === 'Psychic' || type === 'Fairy') colorHex = 0xd946ef;
    if (type === 'Ghost' || type === 'Dark') colorHex = 0x8b5cf6;
    if (type === 'Ice') colorHex = 0x67e8f9;
    if (type === 'Dragon') colorHex = 0x6366f1;

    // Glowing energy sphere projectile
    const projGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const projMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const projectileMesh = new THREE.Mesh(projGeo, projMat);
    projectileMesh.position.copy(fromPos).add(new THREE.Vector3(0, 1.0, 0));
    this.scene.add(projectileMesh);

    this.projectiles.push({
      mesh: projectileMesh,
      startPos: projectileMesh.position.clone(),
      targetPos: toPos.clone().add(new THREE.Vector3(0, 1.0, 0)),
      progress: 0,
      speed: 3.5, // completes in ~0.28s
      color: colorHex,
    });
  }

  private createImpactBurst(pos: THREE.Vector3, colorHex: number) {
    const count = 35;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 4.0;
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.2) * speed;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.28,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.burstParticles.push({ group: points, life: 0, maxLife: 0.35, velocities });
  }

  public addFloatingText(text: string, color: string, worldPos: THREE.Vector3) {
    const id = `ft_${Date.now()}_${Math.random()}`;
    const screenPos = this.projectToScreen(worldPos);
    this.floatingTexts.push({
      id,
      text,
      color,
      worldPos: worldPos.clone(),
      screenPos,
      opacity: 1.0,
      scale: 1.0,
    });
  }

  public projectToScreen(pos: THREE.Vector3): { x: number; y: number } {
    const clone = pos.clone();
    clone.project(this.camera);
    const x = (clone.x * 0.5 + 0.5) * this.container.clientWidth;
    const y = (-(clone.y * 0.5) + 0.5) * this.container.clientHeight;
    return { x, y };
  }

  private onResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private startLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const elapsed = this.clock.getElapsedTime();
      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Pulse arena ring
      if (this.arenaRing) {
        (this.arenaRing.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(elapsed * 2.5) * 0.15;
      }

      // Update 3D Pokémon models & skeletal animations
      this.playerMeshes.forEach(mesh => mesh.update(elapsed, delta, false, false));
      this.enemyMeshes.forEach(mesh => mesh.update(elapsed, delta, false, false));
      if (this.buddyMesh) {
        this.buddyMesh.update(elapsed, delta, true, false);
      }

      // Dynamic cinematic camera sway
      this.camera.position.x = Math.sin(elapsed * 0.35) * 0.9;
      this.camera.lookAt(0, 1.0, 0);

      // Animate active attack projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.progress += delta * p.speed;
        p.mesh.position.lerpVectors(p.startPos, p.targetPos, p.progress);
        // Arch trajectory upward
        p.mesh.position.y += Math.sin(p.progress * Math.PI) * 0.6;

        if (p.progress >= 1.0) {
          this.createImpactBurst(p.targetPos, p.color);
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          this.projectiles.splice(i, 1);
        }
      }

      // Animate impact bursts
      for (let i = this.burstParticles.length - 1; i >= 0; i--) {
        const b = this.burstParticles[i];
        b.life += delta;
        const positions = b.group.geometry.attributes.position.array as Float32Array;
        for (let j = 0; j < positions.length / 3; j++) {
          positions[j * 3] += b.velocities[j * 3] * delta;
          positions[j * 3 + 1] += b.velocities[j * 3 + 1] * delta;
          positions[j * 3 + 2] += b.velocities[j * 3 + 2] * delta;
        }
        b.group.geometry.attributes.position.needsUpdate = true;
        (b.group.material as THREE.PointsMaterial).opacity = 1.0 - (b.life / b.maxLife);

        if (b.life >= b.maxLife) {
          this.scene.remove(b.group);
          b.group.geometry.dispose();
          (b.group.material as THREE.Material).dispose();
          this.burstParticles.splice(i, 1);
        }
      }

      // Update floating combat numbers
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.worldPos.y += 0.04;
        ft.opacity -= 0.024;
        ft.screenPos = this.projectToScreen(ft.worldPos);
        if (ft.opacity <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }

      if (this.onFloatingTextsUpdate) {
        this.onFloatingTextsUpdate([...this.floatingTexts]);
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.playerMeshes.forEach(m => m.dispose());
    this.enemyMeshes.forEach(m => m.dispose());
    if (this.buddyMesh) this.buddyMesh.dispose();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
