import { Assets, Texture, Rectangle, Spritesheet } from 'pixi.js';
import { AudioManager } from '../audio/AudioManager';

export interface LoadedAssets {
  uiSheet: Spritesheet | null;
  shipTextures: Map<string, Texture>;
  tileTextures: Map<string, Texture>;
}

export class AssetLoader {
  private static instance: AssetLoader | null = null;
  private textures: Map<string, Texture> = new Map();
  private isLoaded: boolean = false;
  private loadProgress: number = 0;

  private constructor() {}

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  public getProgress(): number {
    return this.loadProgress;
  }

  public getTexture(name: string): Texture {
    const tex = this.textures.get(name);
    if (!tex) {
      // Fallback empty texture if missing to avoid hard crashes
      return Texture.WHITE;
    }
    return tex;
  }

  public async loadAll(onProgress?: (ratio: number) => void): Promise<void> {
    if (this.isLoaded) {
      onProgress?.(1);
      return;
    }

    try {
      // 1. Audio Preload (non-blocking)
      AudioManager.getInstance().preloadAll().catch((e) => console.warn('Audio preload warning', e));
      this.loadProgress = 0.15;
      onProgress?.(this.loadProgress);

      // 2. Load UI Spritesheet
      let uiSheetData: any = null;
      try {
        const uiRes = await fetch('/assets/spritesheet/ui_sheet.json');
        uiSheetData = await uiRes.json();
      } catch (e) {
        console.warn('Could not fetch ui_sheet.json directly', e);
      }

      if (uiSheetData) {
        const uiBaseTex = await Assets.load('/assets/spritesheet/ui_sheet.png');
        const sheet = new Spritesheet(uiBaseTex, uiSheetData);
        await sheet.parse();
        for (const [frameKey, frameTex] of Object.entries(sheet.textures)) {
          this.textures.set(frameKey, frameTex);
        }
      }
      this.loadProgress = 0.45;
      onProgress?.(this.loadProgress);

      // 3. Load Ships Spritesheet (XML + PNG)
      try {
        const xmlRes = await fetch('/assets/spritesheet/ships_miscellaneous_sheet.xml');
        const xmlText = await xmlRes.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const subTextures = xmlDoc.getElementsByTagName('SubTexture');

        const shipsBaseTex = await Assets.load('/assets/spritesheet/ships_miscellaneous_sheet.png');

        for (let i = 0; i < subTextures.length; i++) {
          const el = subTextures[i];
          if (!el) continue;
          const name = el.getAttribute('name');
          const x = parseFloat(el.getAttribute('x') || '0');
          const y = parseFloat(el.getAttribute('y') || '0');
          const w = parseFloat(el.getAttribute('width') || '0');
          const h = parseFloat(el.getAttribute('height') || '0');

          if (name && w > 0 && h > 0) {
            const frame = new Rectangle(x, y, w, h);
            const subTex = new Texture({
              source: shipsBaseTex.source,
              frame,
            });
            this.textures.set(name, subTex);
            // Also register without .png extension for convenience
            if (name.endsWith('.png')) {
              this.textures.set(name.replace('.png', ''), subTex);
            }
          }
        }
      } catch (err) {
        console.warn('Error loading ships_miscellaneous_sheet:', err);
      }

      this.loadProgress = 0.75;
      onProgress?.(this.loadProgress);

      // 4. Load common tiles, backgrounds, and HUD assets
      const additionalAssets = [
        { name: 'ui_scene_background', url: '/assets/ui_scene_background.png' },
        { name: 'logo_jungle_gaming', url: '/assets/logo_jungle_gaming.svg' },
        { name: 'health_frame', url: '/assets/png/retina/ui/hud/health_frame.png' },
        { name: 'health_fill_green', url: '/assets/png/retina/ui/hud/health_fill_green.png' },
        { name: 'health_fill_amber', url: '/assets/png/retina/ui/hud/health_fill_amber.png' },
        { name: 'health_fill_red', url: '/assets/png/retina/ui/hud/health_fill_red.png' },
        { name: 'enemy_health_frame', url: '/assets/png/retina/ui/hud/enemy_health_frame.png' },
        { name: 'enemy_health_fill_green', url: '/assets/png/retina/ui/hud/enemy_health_fill_green.png' },
        { name: 'enemy_health_fill_red', url: '/assets/png/retina/ui/hud/enemy_health_fill_red.png' },
        { name: 'counter_panel', url: '/assets/png/retina/ui/hud/counter_panel.png' },
        { name: 'icon_heart', url: '/assets/png/retina/ui/hud/icon_heart.png' },
        { name: 'icon_score', url: '/assets/png/retina/ui/hud/icon_score.png' },
        { name: 'icon_time', url: '/assets/png/retina/ui/hud/icon_time.png' },
        { name: 'water_tile_73', url: '/assets/png/retina/tiles/tile_73.png' },
        { name: 'crew_1', url: '/assets/png/retina/ship_parts/crew_1.png' },
        { name: 'crew_2', url: '/assets/png/retina/ship_parts/crew_2.png' },
        { name: 'crew_3', url: '/assets/png/retina/ship_parts/crew_3.png' },
        { name: 'crew_4', url: '/assets/png/retina/ship_parts/crew_4.png' },
        { name: 'crew_5', url: '/assets/png/retina/ship_parts/crew_5.png' },
        { name: 'crew_6', url: '/assets/png/retina/ship_parts/crew_6.png' },
      ];

      for (const asset of additionalAssets) {
        try {
          const loadedTex = await Assets.load(asset.url);
          this.textures.set(asset.name, loadedTex);
        } catch {}
      }

      // 5. Preload retina tilesheet (16 columns x 6 rows of 128x128 retina tiles = 96 tiles)
      try {
        let tilesBaseTex: Texture | null = null;
        let tileSize = 128;
        try {
          tilesBaseTex = await Assets.load('/assets/tilesheet/tiles_sheet_retina.png');
        } catch {
          tilesBaseTex = await Assets.load('/assets/tilesheet/tiles_sheet.png');
          tileSize = 64;
        }

        if (tilesBaseTex) {
          const cols = 16;
          const rows = 6;
          let tileIndex = 1;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const frame = new Rectangle(c * tileSize, r * tileSize, tileSize, tileSize);
              const tileTex = new Texture({
                source: tilesBaseTex.source,
                frame,
              });
              this.textures.set(`tile_${tileIndex}`, tileTex);
              tileIndex++;
            }
          }
        }
      } catch (err) {
        console.warn('Error slicing tilesheet:', err);
      }

      this.loadProgress = 1.0;
      onProgress?.(1.0);
      this.isLoaded = true;
    } catch (criticalErr) {
      console.error('Critical failure in AssetLoader:', criticalErr);
      throw criticalErr;
    }
  }
}
