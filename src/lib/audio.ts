// Audio alert system for critical news
const ALERT_SOUNDS = {
  critical: '/sounds/alert-critical.mp3',
  high: '/sounds/alert-high.mp3',
  ping: '/sounds/ping.mp3',
};

let audioContext: AudioContext | null = null;

export function initAudio() {
  if (typeof window !== 'undefined' && !audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}

export async function playAlert(type: 'critical' | 'high' | 'ping' = 'ping') {
  // Use Web Audio API for a simple beep since we don't have actual sound files
  if (typeof window === 'undefined') return;
  
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different alert types
    if (type === 'critical') {
      oscillator.frequency.value = 880; // A5 - higher pitch for critical
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;
      
      // Beep pattern for critical
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } else if (type === 'high') {
      oscillator.frequency.value = 660; // E5
      oscillator.type = 'sine';
      gainNode.gain.value = 0.08;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 100);
    } else {
      oscillator.frequency.value = 440; // A4 - standard ping
      oscillator.type = 'sine';
      gainNode.gain.value = 0.05;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 50);
    }
  } catch (error) {
    console.error('Failed to play alert:', error);
  }
}

// Track seen news items to avoid duplicate alerts
const seenItems = new Set<string>();

export function shouldAlert(itemId: string, severity: string): boolean {
  if (seenItems.has(itemId)) return false;
  seenItems.add(itemId);
  
  // Only alert for critical and high severity
  return severity === 'critical' || severity === 'high';
}
