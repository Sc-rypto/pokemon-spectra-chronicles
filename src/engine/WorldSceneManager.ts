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

  // Mesh registries for combatants
  public playerMeshes: Map<string, ProceduralPokemonMesh> = new Map();
  public enemyMeshes: Map<string, ProceduralPokemonMesh> = new Map();
  public buddyMesh: ProceduralPokemonMesh | null = null;
  public trainerMesh: THREE.Group | null = null;

  // Visual effects
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
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.setupLighting();
    this.setupEnvironment();
    this.buildTrainerMesh();

    window.addEventListener('resize', this.onResize);
    this.startLoop();
  }

  private setupCamera() {
    // Third-person elevated isometric battle angle
    this.camera.position.set(0, 11, 20);
    this.camera.lookAt(0, 1.2, 0);
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    this.hemiLight.position.set(0, 20, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.dirLight.position.set(12, 22, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 60;
    this.dirLight.shadow.camera.left = -15;
    this.dirLight.shadow.camera.right = 15;
    this.dirLight.shadow.camera.top = 15;
    this.dirLight.shadow.camera.bottom = -15;
    this.scene.add(this.dirLight);
  }

  private setupEnvironment() {
    // Stylized terrain ground plane
    const groundGeo = new THREE.PlaneGeometry(80, 80, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x388e3c,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Subtle battle grid
    this.gridHelper = new THREE.GridHelper(50, 50, 0xffffff, 0x2e7d32);
    this.gridHelper.position.y = 0.02;
    this.scene.add(this.gridHelper);

    // Biome props container
    this.scene.add(this.biomeDecos);
    this.generateBiomeDecorations(REGIONS_DATA[0]);

    this.scene.fog = new THREE.FogExp2(0xb2dfdb, 0.015);
    this.scene.background = new THREE.Color(REGIONS_DATA[0].skyColor);
  }

  private buildTrainerMesh() {
    // Stylized low-poly trainer standing behind the squad
    const trainerGroup = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1a4 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 6), coatMat);
    torso.position.y = 1.35;
    trainerGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), skinMat);
    head.position.y = 2.05;
    trainerGroup.add(head);

    // Trainer Red Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 8), capMat);
    cap.position.y = 2.25;
    trainerGroup.add(cap);

    // Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.25), capMat);
    visor.position.set(0, 2.2, -0.25);
    trainerGroup.add(visor);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.9, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.2, 0.5, 0);
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.2, 0.5, 0);
    trainerGroup.add(legL, legR);

    trainerGroup.position.set(0, 0, 9.5);
    trainerGroup.rotation.y = Math.PI; // Look towards combat
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
    // Clear old props
    while (this.biomeDecos.children.length > 0) {
      const obj = this.biomeDecos.children[0];
      this.biomeDecos.remove(obj);
    }

    // Generate trees, rocks, crystals according to biome
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 22 + Math.random() * 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (region.biomeTheme === 'paldea_crater' || region.biomeTheme === 'sinnoh_snow') {
        // Giant luminous crystals
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
        // Low-poly stylized trees
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

  // SQUAD & ENEMY PLACEMENT LOGIC
  public syncSquad(squad: PokemonData[], buddy?: PokemonData) {
    const activeIds = new Set(squad.map(p => p.id));

    // Remove meshes no longer in squad
    this.playerMeshes.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh.group);
        mesh.dispose();
        this.playerMeshes.delete(id);
      }
    });

    // Positions for 5 squad members in a battle front arc (facing -Z toward enemies)
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
      mesh.group.rotation.y = 0; // Face forward towards enemies (-Z)
    });

    // Update Buddy Pokemon (walks next to Trainer)
    if (buddy) {
      if (!this.buddyMesh || this.buddyMesh.pokemon.id !== buddy.id) {
        if (this.buddyMesh) {
          this.scene.remove(this.buddyMesh.group);
          this.buddyMesh.dispose();
        }
        this.buddyMesh = new ProceduralPokemonMesh(buddy);
        this.scene.add(this.buddyMesh.group);
      }
      this.buddyMesh.group.position.set(1.5, 0, 9.5);
      this.buddyMesh.group.rotation.y = -0.3;
    }
  }

  public syncEnemies(enemies: ActiveCombatant[]) {
    const activeIds = new Set(enemies.map(e => e.visual3dId));

    // Remove old enemy meshes
    this.enemyMeshes.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh.group);
        mesh.dispose();
        this.enemyMeshes.delete(id);
      }
    });

    // Enemy placement slots across the battlefield
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
      mesh.group.rotation.y = Math.PI; // Face towards player squad (+Z)
    });
  }

  // Visual attack effect projectile / beam
  public triggerAttackFx(fromPos: THREE.Vector3, toPos: THREE.Vector3, type: string) {
    const distance = fromPos.distanceTo(toPos);
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, distance, 6);
    let colorHex = 0xff5533; // Fire/default
    if (type === 'Water') colorHex = 0x3b82f6;
    if (type === 'Grass') colorHex = 0x22c55e;
    if (type === 'Electric') colorHex = 0xfacc15;
    if (type === 'Psychic' || type === 'Fairy') colorHex = 0xd946ef;
    if (type === 'Ghost' || type === 'Dark') colorHex = 0x8b5cf6;

    const beamMat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: false });
    const beam = new THREE.Mesh(beamGeo, beamMat);

    // Position midpoint
    const mid = fromPos.clone().add(toPos).multiplyScalar(0.5);
    beam.position.copy(mid);
    beam.position.y += 0.8;
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toPos.clone().sub(fromPos).normalize());

    this.scene.add(beam);

    // Fade out and remove beam quickly
    setTimeout(() => {
      this.scene.remove(beam);
      beamGeo.dispose();
      beamMat.dispose();
    }, 220);
  }

  // Floating Combat Text numbers
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
      const delta = this.clock.getDelta();

      // Update player pokemon animations
      this.playerMeshes.forEach(mesh => mesh.update(elapsed, delta, false, false));
      // Update enemy pokemon animations
      this.enemyMeshes.forEach(mesh => mesh.update(elapsed, delta, false, false));
      // Update buddy walking animation
      if (this.buddyMesh) {
        this.buddyMesh.update(elapsed, delta, true, false);
      }

      // Camera gentle sway for cinematic dynamism
      this.camera.position.x = Math.sin(elapsed * 0.4) * 0.8;

      // Update floating combat numbers
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.worldPos.y += 0.04;
        ft.opacity -= 0.022;
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
