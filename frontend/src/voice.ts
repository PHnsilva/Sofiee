import type { VoiceConfiguration } from './types.js';

interface VoiceControllerCallbacks {
  readonly onError: (message: string) => void;
  readonly onListeningChange: (listening: boolean) => void;
  readonly onSpeechEnd: () => void;
  readonly onSpeechStart: () => void;
  readonly onTranscript: (transcript: string) => void;
}

export class VoiceController {
  readonly #recognition: BrowserSpeechRecognition | undefined;
  #hasMicrophonePermission = false;
  #pushActive = false;
  #speaking = false;

  constructor(private readonly callbacks: VoiceControllerCallbacks) {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (Recognition !== undefined) {
      this.#recognition = new Recognition();
      this.#recognition.continuous = false;
      this.#recognition.interimResults = true;
      this.#recognition.lang = 'pt-BR';
      this.#recognition.onstart = () => this.callbacks.onListeningChange(true);
      this.#recognition.onend = () => this.callbacks.onListeningChange(false);
      this.#recognition.onerror = (event) => {
        this.callbacks.onListeningChange(false);
        const message =
          event.error === 'not-allowed'
            ? 'Permissão de microfone negada.'
            : 'Não foi possível reconhecer a fala.';
        this.callbacks.onError(message);
      };
      this.#recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result?.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        const trimmed = finalTranscript.trim();
        if (trimmed.length > 0) {
          this.callbacks.onTranscript(trimmed);
        }
      };
    }
  }

  get inputSupported(): boolean {
    return this.#recognition !== undefined;
  }

  get outputSupported(): boolean {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  async beginPush(): Promise<void> {
    this.#pushActive = true;
    this.stopSpeaking();

    if (this.#recognition === undefined) {
      this.callbacks.onError('Reconhecimento de voz indisponível neste navegador.');
      return;
    }

    try {
      await this.#ensureMicrophonePermission();
      if (!this.#pushActive) {
        return;
      }
      this.#recognition.start();
    } catch {
      this.#pushActive = false;
      this.callbacks.onError('Permissão de microfone negada.');
    }
  }

  endPush(): void {
    this.#pushActive = false;
    try {
      this.#recognition?.stop();
    } catch {
      this.callbacks.onListeningChange(false);
    }
  }

  speak(text: string, config: VoiceConfiguration): void {
    if (!this.outputSupported || text.trim().length === 0) {
      this.callbacks.onSpeechEnd();
      return;
    }

    this.endPush();
    this.#recognition?.abort();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    utterance.pitch = config.pitch;
    utterance.rate = config.rate;
    utterance.volume = config.volume;
    const matchingVoice = window.speechSynthesis
      .getVoices()
      .find(
        (voice) =>
          (config.name !== null && voice.name === config.name) ||
          voice.lang.toLocaleLowerCase() === config.lang.toLocaleLowerCase(),
      );
    if (matchingVoice !== undefined) {
      utterance.voice = matchingVoice;
    }
    utterance.onstart = () => {
      this.#speaking = true;
      this.callbacks.onSpeechStart();
    };
    utterance.onend = () => {
      this.#speaking = false;
      this.callbacks.onSpeechEnd();
    };
    utterance.onerror = () => {
      this.#speaking = false;
      this.callbacks.onSpeechEnd();
    };
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (!this.outputSupported) {
      return;
    }
    if (this.#speaking || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.#speaking = false;
      this.callbacks.onSpeechEnd();
    }
  }

  async #ensureMicrophonePermission(): Promise<void> {
    if (this.#hasMicrophonePermission || navigator.mediaDevices?.getUserMedia === undefined) {
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) {
      track.stop();
    }
    this.#hasMicrophonePermission = true;
  }
}
