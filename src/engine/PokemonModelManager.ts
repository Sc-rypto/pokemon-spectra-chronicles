import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class ModelManager {
  private static instance: ModelManager;
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private modelCache: Map<string, GLTF> = new Map();
  private pendingPromises: Map<string, Promise<GLTF>> = new Map();

  private constructor() {
    this.dracoLoader = new DRACOLoader();
    // Use the public draco decoder path or cdn fallback
    const basePath = import.meta.env.BASE_URL || '/';
    this.dracoLoader.setDecoderPath(`${basePath}draco/gltf/`);
    this.dracoLoader.setDecoderConfig({ type: 'wasm' });

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Load official textured 3D Pokémon GLB by Dex Number
   */
  public async loadPokemonModel(dexNumber: number, isShiny: boolean = false): Promise<GLTF> {
    const cacheKey = `${dexNumber}_${isShiny ? 'shiny' : 'reg'}`;

    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)!;
    }

    if (this.pendingPromises.has(cacheKey)) {
      return this.pendingPromises.get(cacheKey)!;
    }

    const loadPromise = new Promise<GLTF>((resolve, reject) => {
      const form = isShiny ? 'shiny' : 'regular';
      const primaryUrl = `https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/${form}/${dexNumber}.glb`;
      const fallbackUrl = `https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/${dexNumber}.glb`;

      this.gltfLoader.load(
        primaryUrl,
        (gltf) => {
          this.modelCache.set(cacheKey, gltf);
          this.pendingPromises.delete(cacheKey);
          resolve(gltf);
        },
        undefined,
        (_err) => {
          // If shiny is not available or 404, fallback to regular form
          if (isShiny) {
            this.gltfLoader.load(
              fallbackUrl,
              (fallbackGltf) => {
                this.modelCache.set(cacheKey, fallbackGltf);
                this.pendingPromises.delete(cacheKey);
                resolve(fallbackGltf);
              },
              undefined,
              (fallbackErr) => {
                this.pendingPromises.delete(cacheKey);
                reject(fallbackErr);
              }
            );
          } else {
            this.pendingPromises.delete(cacheKey);
            reject(_err);
          }
        }
      );
    });

    this.pendingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }
}

export const pokemonModelManager = ModelManager.getInstance();
