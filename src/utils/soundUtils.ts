// Web Audio API-based sound utilities
export class SoundUtils {
  private audioContext: AudioContext | null = null;
  
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }
  
  // Play a celebration sound using Web Audio API
  public playCelebrationSound(): void {
    try {
      
      // Create a more complex celebration sound
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const duration = 0.2;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, duration, 0.1);
        }, index * 100);
      });
      
      // Add some sparkle sounds
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.playTone(2000 + Math.random() * 1000, 0.1, 0.05);
          }, i * 150);
        }
      }, 500);
      
    } catch (error) {
      console.warn('Could not play celebration sound:', error);
    }
  }
  
  // Play timer warning sound
  public playTimerWarningSound(): void {
    try {
      this.playTone(800, 0.15, 0.1);
      setTimeout(() => this.playTone(800, 0.15, 0.1), 200);
    } catch (error) {
      console.warn('Could not play timer warning sound:', error);
    }
  }
  
  // Play timer urgent sound
  public playTimerUrgentSound(): void {
    try {
      this.playTone(1000, 0.1, 0.15);
    } catch (error) {
      console.warn('Could not play timer urgent sound:', error);
    }
  }
  
  private playTone(frequency: number, duration: number, volume: number = 0.1): void {
    const ctx = this.getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }
}

export const soundUtils = new SoundUtils();