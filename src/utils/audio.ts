/**
 * Web Audio API Procedural Synthesizer
 * Generates delicate and realistic audio effects without any external MP3 network dependencies.
 * Includes gentle twinkling/rustling for snowflakes and soft whooshes/rubbing pops for balloons,
 * with fully synchronized 5-second session loops and instantaneous release triggers.
 */

class AudioController {
  private ctx: AudioContext | null = null;
  private activeNodes: { osc?: AudioNode; gain?: GainNode; type: 'snowflakes' | 'balloons' | 'ambient' }[] = [];
  private activeIntervals: number[] = [];
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      // Support legacy webkit audio context
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMute() {
    return this.isMuted;
  }

  /**
   * Helper to track active nodes so they can be immediately cut off on Reset/Stop
   */
  private trackNode(node: AudioNode, gain: GainNode, type: 'snowflakes' | 'balloons' | 'ambient') {
    this.activeNodes.push({ osc: node, gain, type });
  }

  /**
   * Generates a single delicate crystal twinkle bell representing a falling snowflake crystal.
   */
  public playSingleSnowflakeTwinkle() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Two oscillator components for a premium shimmering metallic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      // Pick a random pleasant high frequency scale (chime pitches)
      const pitches = [1480, 1661, 1975, 2217, 2637, 2960];
      const freq = pitches[Math.floor(Math.random() * pitches.length)];
      osc1.frequency.setValueAtTime(freq, now);

      // Shimmer frequency harmonic FM overlay
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gainNode.gain.setValueAtTime(0, now);
      // Fast attack
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.02);
      // Shimmer vibrato tremolo modulation effect
      gainNode.gain.linearRampToValueAtTime(0.03, now + 0.08);
      // Exponential beautiful decay curve
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);

      this.trackNode(osc1, gainNode, 'snowflakes');
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  }

  /**
   * Generates a soft rustling wind draft using low-shelf bandpass noise sweep.
   */
  private playSnowflakeRustleWind() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Create a procedural White Noise Source
      const bufferSize = ctx.sampleRate * 4; // 4 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Apply a highly resonant bandpass filter to sound like gentle whistling/rustling wind
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(450, now);
      bandpass.Q.setValueAtTime(4.0, now);

      // Modulate the filter frequency to create sway whooshes
      bandpass.frequency.exponentialRampToValueAtTime(800, now + 1.25);
      bandpass.frequency.exponentialRampToValueAtTime(320, now + 2.8);
      bandpass.frequency.exponentialRampToValueAtTime(650, now + 4.2);
      bandpass.frequency.exponentialRampToValueAtTime(450, now + 5.0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.4); // soft wind intake
      gain.gain.setValueAtTime(0.03, now + 4.2);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 5.0); // clean decay at 5 seconds

      noiseSource.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 5.0);

      this.trackNode(noiseSource, gain, 'ambient');
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * Generates a balloon rising "whoosh" sound.
   * Uses a low-mid frequency pitch oscillator sweeping upwards representing inflation rise and float.
   */
  public playBalloonRiseWhoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Low triangle wave for a rich fat rubber whoosh sound
      osc.type = 'triangle';
      
      // Sweep pitch from low upwards
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.65);
      osc.frequency.linearRampToValueAtTime(200, now + 1.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.6);

      gain.gain.setValueAtTime(0, now);
      // Soft attack whoosh
      gain.gain.linearRampToValueAtTime(0.09, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);

      this.trackNode(osc, gain, 'balloons');
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * Play a cute, rubbery squeak or "pop" sound representing balloon air resistance dynamics.
   */
  public playBalloonPop() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // High pitch rapidly sweeping way down mimics a soft squeak or pop friction
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      this.trackNode(osc, gain, 'balloons');
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * Start a continuous program of scheduled chimes over exactly 5.0 seconds
   * synchronized perfectly with the general falling snowflakes effect.
   */
  public playSnowflakesEffectCycle() {
    this.stop(); // safety first
    if (this.isMuted) return;

    // Start background rustling wind draft
    this.playSnowflakeRustleWind();

    // Spawn automatic randomized twinkles scattered over the 5-second span
    const startOffset = Date.now();
    const sequenceDuration = 4800; // stop scheduling slightly before 5 seconds
    const intervalMs = 280;

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startOffset;
      if (elapsed >= sequenceDuration) {
        window.clearInterval(intervalId);
        return;
      }
      this.playSingleSnowflakeTwinkle();
    }, intervalMs);

    this.activeIntervals.push(intervalId);
  }

  /**
   * Start a continuous buoyancy ascension whooshing and soft rubber popping sequence
   * perfectly synchronized with the balloons ascend over 5.0 seconds.
   */
  public playBalloonsEffectCycle() {
    this.stop();
    if (this.isMuted) return;

    // Trigger initial whoosh
    this.playBalloonRiseWhoosh();

    const startOffset = Date.now();
    const sequenceDuration = 4800;
    
    // Play whooshes and cute rubber bounces/pops staggered
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startOffset;
      if (elapsed >= sequenceDuration) {
        window.clearInterval(intervalId);
        return;
      }
      
      // Randomly choose bounce/pop vs rise sweep
      if (Math.random() > 0.4) {
        this.playBalloonPop();
      } else {
        this.playBalloonRiseWhoosh();
      }
    }, 450);

    this.activeIntervals.push(intervalId);
  }

  /**
   * Immediately stops all active sound generators, oscillators, gains,
   * intervals, and sound effects to support the instant RESET criteria.
   */
  public stop() {
    // Clear all scheduled intervals
    this.activeIntervals.forEach(interval => {
      window.clearInterval(interval);
    });
    this.activeIntervals = [];

    // Immediately fade out and stop all audio nodes
    this.activeNodes.forEach(node => {
      try {
        if (node.gain && this.ctx) {
          const now = this.ctx.currentTime;
          // Apply a fast exponential fade out to avoid clicks/pops when immediately stopped
          node.gain.gain.cancelScheduledValues(now);
          node.gain.gain.setValueAtTime(node.gain.gain.value, now);
          node.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
          
          if (node.osc) {
            // Stop the oscillator after fade completes
            (node.osc as any).stop?.(now + 0.1);
          }
        }
      } catch (err) {
        // Safe bypass
      }
    });

    this.activeNodes = [];
  }
}

export const synth = new AudioController();
