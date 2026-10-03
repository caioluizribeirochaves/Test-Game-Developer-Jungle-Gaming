export type SoundName =
  | 'cannonball_water_hit_1'
  | 'cannonball_water_hit_2'
  | 'cannon_broadside'
  | 'cannon_fire_1'
  | 'cannon_fire_2'
  | 'cannon_fire_3'
  | 'game_complete'
  | 'game_over'
  | 'game_pause'
  | 'game_resume'
  | 'game_start'
  | 'health_low'
  | 'ocean_ambience_loop'
  | 'score_point'
  | 'ship_collision'
  | 'ship_explosion_1'
  | 'ship_explosion_2'
  | 'ship_sailing_loop'
  | 'ship_sinking'
  | 'ship_wood_hit_1'
  | 'ship_wood_hit_2'
  | 'time_warning'
  | 'ui_back'
  | 'ui_click'
  | 'ui_close'
  | 'ui_hover'
  | 'ui_open';

export class AudioManager {
  private static instance: AudioManager | null = null;

  private ctx: AudioContext | null = null;
  private soundBuffers: Map<SoundName, AudioBuffer> = new Map();
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;

  private ambienceSource: AudioBufferSourceNode | null = null;
  private sailingSource: AudioBufferSourceNode | null = null;

  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private ambienceVolume: number = 0.4;
  private initialized: boolean = false;

  private constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initContext(): void {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.value = this.ambienceVolume;
    this.ambienceGain.connect(this.masterGain);

    this.initialized = true;
  }

  public async resume(): Promise<void> {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
      }
    }
  }

  public async loadSound(name: SoundName, url: string): Promise<void> {
    if (this.soundBuffers.has(name)) return;
    try {
      this.initContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (!this.ctx) return;
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.soundBuffers.set(name, audioBuffer);
    } catch (e) {
      console.warn(`Failed to load audio "${name}" from ${url}:`, e);
    }
  }

  public async preloadAll(): Promise<void> {
    const soundList: SoundName[] = [
      'cannonball_water_hit_1',
      'cannonball_water_hit_2',
      'cannon_broadside',
      'cannon_fire_1',
      'cannon_fire_2',
      'cannon_fire_3',
      'game_complete',
      'game_over',
      'game_pause',
      'game_resume',
      'game_start',
      'health_low',
      'ocean_ambience_loop',
      'score_point',
      'ship_collision',
      'ship_explosion_1',
      'ship_explosion_2',
      'ship_sailing_loop',
      'ship_sinking',
      'ship_wood_hit_1',
      'ship_wood_hit_2',
      'time_warning',
      'ui_back',
      'ui_click',
      'ui_close',
      'ui_hover',
      'ui_open',
    ];

    await Promise.allSettled(
      soundList.map((name) => this.loadSound(name, `/assets/sounds/${name}.wav`))
    );
  }

  public playSfx(name: SoundName, rate: number = 1.0, volumeMultiplier: number = 1.0): void {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const buffer = this.soundBuffers.get(name);
    if (!buffer) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;

      const individualGain = this.ctx.createGain();
      individualGain.gain.value = volumeMultiplier;

      source.connect(individualGain);
      individualGain.connect(this.sfxGain);

      source.start(0);
    } catch (e) {
      console.warn(`Error playing sfx "${name}":`, e);
    }
  }

  public playCannonFire(): void {
    const list: SoundName[] = ['cannon_fire_1', 'cannon_fire_2', 'cannon_fire_3'];
    const chosen = list[Math.floor(Math.random() * list.length)] as SoundName;
    const pitch = 0.95 + Math.random() * 0.1;
    this.playSfx(chosen, pitch);
  }

  public playHitWood(): void {
    const list: SoundName[] = ['ship_wood_hit_1', 'ship_wood_hit_2'];
    const chosen = list[Math.floor(Math.random() * list.length)] as SoundName;
    this.playSfx(chosen);
  }

  public playHitWater(): void {
    const list: SoundName[] = ['cannonball_water_hit_1', 'cannonball_water_hit_2'];
    const chosen = list[Math.floor(Math.random() * list.length)] as SoundName;
    this.playSfx(chosen);
  }

  public playExplosion(): void {
    const list: SoundName[] = ['ship_explosion_1', 'ship_explosion_2'];
    const chosen = list[Math.floor(Math.random() * list.length)] as SoundName;
    this.playSfx(chosen);
  }

  public startAmbience(): void {
    if (this.ambienceSource) return;
    this.resume();
    if (!this.ctx || !this.ambienceGain) return;

    const buffer = this.soundBuffers.get('ocean_ambience_loop');
    if (!buffer) return;

    try {
      this.ambienceSource = this.ctx.createBufferSource();
      this.ambienceSource.buffer = buffer;
      this.ambienceSource.loop = true;
      this.ambienceSource.connect(this.ambienceGain);
      this.ambienceSource.start(0);
    } catch (e) {
      console.warn('Failed to start ocean ambience loop:', e);
    }
  }

  public stopAmbience(): void {
    if (this.ambienceSource) {
      try {
        this.ambienceSource.stop();
        this.ambienceSource.disconnect();
      } catch {}
      this.ambienceSource = null;
    }
  }

  public setSailingVolume(volume: number): void {
    if (!this.ctx) return;
    if (volume <= 0.05) {
      if (this.sailingSource) {
        try {
          this.sailingSource.stop();
          this.sailingSource.disconnect();
        } catch {}
        this.sailingSource = null;
      }
      return;
    }

    if (!this.sailingSource && this.ambienceGain) {
      const buffer = this.soundBuffers.get('ship_sailing_loop');
      if (buffer) {
        try {
          this.sailingSource = this.ctx.createBufferSource();
          this.sailingSource.buffer = buffer;
          this.sailingSource.loop = true;
          this.sailingSource.connect(this.ambienceGain);
          this.sailingSource.start(0);
        } catch {}
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}
