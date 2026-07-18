import {
  CarFront,
  Check,
  KeyRound,
  List,
  Mic,
  SendHorizontal,
  ShieldCheck,
  Trash2,
  Volume2,
  VolumeX,
  X,
  createIcons,
} from 'lucide';

import { API_BASE_URL, ApiClient, ApiError } from './api.js';
import { executeDesktopAction, isDesktopAction } from './desktop.js';
import { byId } from './dom.js';
import { EyeController } from './eyes.js';
import {
  getOrCreateDeviceId,
  loadPreferences,
  savePreferences,
  type DevicePreferences,
} from './storage.js';
import './styles.css';
import type {
  AssistantMode,
  AssistantResponse,
  CommandArguments,
  CommandDefinition,
  Expression,
  Personality,
} from './types.js';
import { VoiceController } from './voice.js';

createIcons({
  icons: {
    CarFront,
    Check,
    KeyRound,
    List,
    Mic,
    SendHorizontal,
    ShieldCheck,
    Trash2,
    Volume2,
    VolumeX,
    X,
  },
});

const elements = {
  accessDialog: byId<HTMLDialogElement>('accessDialog'),
  accessForm: byId<HTMLFormElement>('accessForm'),
  accessKeyInput: byId<HTMLInputElement>('accessKeyInput'),
  cancelPinButton: byId<HTMLButtonElement>('cancelPinButton'),
  carModeToggle: byId<HTMLInputElement>('carModeToggle'),
  clearAccessButton: byId<HTMLButtonElement>('clearAccessButton'),
  closeAccessButton: byId<HTMLButtonElement>('closeAccessButton'),
  closeCommandsButton: byId<HTMLButtonElement>('closeCommandsButton'),
  closePinButton: byId<HTMLButtonElement>('closePinButton'),
  commandList: byId<HTMLDivElement>('commandList'),
  commandsButton: byId<HTMLButtonElement>('commandsButton'),
  commandsDialog: byId<HTMLDialogElement>('commandsDialog'),
  composer: byId<HTMLFormElement>('composer'),
  connectionLabel: byId<HTMLSpanElement>('connectionLabel'),
  connectionStatus: byId<HTMLDivElement>('connectionStatus'),
  eyes: byId<HTMLDivElement>('eyes'),
  messageInput: byId<HTMLInputElement>('messageInput'),
  microphoneButton: byId<HTMLButtonElement>('microphoneButton'),
  personalitySelect: byId<HTMLSelectElement>('personalitySelect'),
  pinCommandLabel: byId<HTMLParagraphElement>('pinCommandLabel'),
  pinDialog: byId<HTMLDialogElement>('pinDialog'),
  pinForm: byId<HTMLFormElement>('pinForm'),
  pinInput: byId<HTMLInputElement>('pinInput'),
  responseSource: byId<HTMLSpanElement>('responseSource'),
  responseText: byId<HTMLParagraphElement>('responseText'),
  sendButton: byId<HTMLButtonElement>('sendButton'),
  settingsButton: byId<HTMLButtonElement>('settingsButton'),
  speechToggle: byId<HTMLButtonElement>('speechToggle'),
  stateLabel: byId<HTMLSpanElement>('stateLabel'),
  toast: byId<HTMLDivElement>('toast'),
  volumeOff: byId<HTMLElement>('volumeOffIcon'),
  volumeOn: byId<HTMLElement>('volumeOnIcon'),
};

const eyes = new EyeController(elements.eyes, elements.stateLabel);
const api = new ApiClient(API_BASE_URL, getOrCreateDeviceId());
let preferences = loadPreferences();
let personalities: readonly Personality[] = [];
let commands: readonly CommandDefinition[] = [];
let lastResponse: string | undefined;
let queuedMessage: string | undefined;
let busy = false;
let toastTimer: number | undefined;
let afterSpeechExpression: Expression = 'success';
let pendingConfirmation:
  | {
      readonly args: CommandArguments | undefined;
      readonly commandId: string;
      readonly risk: 'sensitive' | 'critical';
    }
  | undefined;

const voice = new VoiceController({
  onError: (message) => {
    elements.microphoneButton.classList.remove('is-listening');
    showToast(message, 'warning');
    eyes.set('warning');
  },
  onListeningChange: (listening) => {
    elements.microphoneButton.classList.toggle('is-listening', listening);
    elements.microphoneButton.setAttribute('aria-pressed', String(listening));
    if (listening) {
      eyes.set('listening');
    } else if (eyes.expression === 'listening') {
      eyes.set('idle');
    }
  },
  onSpeechEnd: () => eyes.set(afterSpeechExpression),
  onSpeechStart: () => eyes.set('speaking'),
  onTranscript: (transcript) => {
    elements.messageInput.value = transcript;
    void submitMessage(transcript);
  },
});

function updatePreferences(patch: Partial<DevicePreferences>): void {
  preferences = { ...preferences, ...patch };
  savePreferences(preferences);
}

function currentPersonality(): Personality | undefined {
  return personalities.find(({ id }) => id === preferences.personalityId) ?? personalities[0];
}

function currentMode(): AssistantMode {
  if (preferences.carMode) {
    return 'car';
  }
  if ('__TAURI_INTERNALS__' in window) {
    return 'desktop';
  }
  return window.matchMedia('(max-width: 600px)').matches ? 'mobile' : 'web';
}

function setConnection(status: 'waking' | 'online' | 'offline'): void {
  const labels = {
    offline: 'Sem conexão',
    online: 'Online',
    waking: 'Acordando servidor',
  } as const;
  elements.connectionStatus.dataset.status = status;
  elements.connectionLabel.textContent = labels[status];
}

function setBusy(value: boolean): void {
  busy = value;
  elements.messageInput.disabled = value;
  elements.sendButton.disabled = value;
  elements.microphoneButton.disabled = value || !voice.inputSupported;
}

function showToast(message: string, tone: 'info' | 'warning' | 'error' = 'info'): void {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.dataset.tone = tone;
  elements.toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 3_500);
}

function setResponse(text: string, source: string, expression: Expression, remember = true): void {
  const visibleText = text.trim() || 'Não há uma resposta anterior nesta sessão.';
  elements.responseText.textContent = visibleText;
  elements.responseSource.textContent = source;
  afterSpeechExpression = expression;
  eyes.set(expression);
  if (remember) {
    lastResponse = visibleText;
  }

  const personality = currentPersonality();
  if (preferences.speechEnabled && personality !== undefined) {
    voice.speak(visibleText, personality.voice);
  }
}

function applyCarMode(enabled: boolean): void {
  updatePreferences({ carMode: enabled });
  elements.carModeToggle.checked = enabled;
  document.body.classList.toggle('car-mode', enabled);
  renderCommands();
}

function applyPersonality(personalityId: string): void {
  const personality = personalities.find(({ id }) => id === personalityId);
  if (personality === undefined) {
    return;
  }
  updatePreferences({ personalityId: personality.id });
  elements.personalitySelect.value = personality.id;
}

function responseSourceLabel(response: AssistantResponse): string {
  if (response.source === 'command') {
    return 'Comando local';
  }
  return response.provider === 'mock' ? 'Modo mock' : 'Gemini';
}

async function handleAssistantResponse(response: AssistantResponse): Promise<void> {
  if (response.requiresConfirmation && response.command !== null) {
    if (response.command.risk !== 'sensitive' && response.command.risk !== 'critical') {
      throw new Error('O servidor solicitou confirmação para um risco inválido.');
    }
    pendingConfirmation = {
      args: response.command.args,
      commandId: response.command.id,
      risk: response.command.risk,
    };
    const definition = commands.find(({ id }) => id === response.command?.id);
    elements.pinCommandLabel.textContent = definition?.name ?? response.command.id;
    setResponse(response.reply, 'Confirmação necessária', 'warning', false);
    elements.pinDialog.showModal();
    elements.pinInput.focus();
    return;
  }

  const action = response.action;
  if (action?.type === 'client.repeat_last') {
    setResponse(
      lastResponse ?? '',
      'Memória da sessão',
      lastResponse === undefined ? 'warning' : 'speaking',
      false,
    );
    return;
  }

  if (action?.type === 'client.clear_session') {
    voice.stopSpeaking();
    lastResponse = undefined;
    setResponse(response.reply, 'Sessão', 'success', false);
    return;
  }

  if (action?.type === 'client.set_personality') {
    applyPersonality(action.personalityId);
  } else if (action?.type === 'client.set_car_mode') {
    applyCarMode(action.enabled);
  } else if (action !== null && isDesktopAction(action)) {
    eyes.set('processing');
    const result = await executeDesktopAction(action);
    const detail = result.output?.trim();
    const text = [response.reply, result.message, detail].filter(Boolean).join('\n');
    setResponse(text, 'Bridge desktop', result.success ? 'success' : 'warning');
    return;
  }

  setResponse(response.reply, responseSourceLabel(response), response.expression);
}

function handleRequestError(error: unknown, retryMessage?: string): void {
  const apiError = error instanceof ApiError ? error : undefined;
  const message = apiError?.message ?? 'Ocorreu um erro inesperado.';
  if (apiError?.code === 'UNAUTHORIZED' || apiError?.code === 'ACCESS_KEY_REQUIRED') {
    api.setAccessKey(undefined);
    queuedMessage = retryMessage;
    if (!elements.accessDialog.open) {
      elements.accessDialog.showModal();
    }
  }
  if (apiError?.status === 0) {
    setConnection(apiError.code === 'REQUEST_TIMEOUT' ? 'waking' : 'offline');
  }
  setResponse(message, 'Falha segura', 'error');
  showToast(message, 'error');
}

async function submitMessage(rawMessage?: string): Promise<void> {
  const message = (rawMessage ?? elements.messageInput.value).trim();
  if (message.length === 0 || busy) {
    return;
  }
  if (!api.hasAccessKey) {
    queuedMessage = message;
    elements.accessDialog.showModal();
    elements.accessKeyInput.focus();
    return;
  }

  setBusy(true);
  voice.stopSpeaking();
  eyes.set('processing');
  elements.responseSource.textContent = 'Processando';
  elements.messageInput.value = '';

  try {
    const response = await api.chat(message, preferences.personalityId, currentMode());
    setConnection('online');
    await handleAssistantResponse(response);
  } catch (error) {
    handleRequestError(error, message);
  } finally {
    setBusy(false);
    elements.messageInput.focus();
  }
}

function renderPersonalities(): void {
  elements.personalitySelect.replaceChildren();
  for (const personality of personalities) {
    const option = document.createElement('option');
    option.value = personality.id;
    option.textContent = personality.name;
    elements.personalitySelect.append(option);
  }
  const preferredExists = personalities.some(({ id }) => id === preferences.personalityId);
  applyPersonality(preferredExists ? preferences.personalityId : 'focused');
}

function renderCommands(): void {
  elements.commandList.replaceChildren();
  const visibleCommands = commands.filter(
    ({ availableInCar, enabled }) => enabled && (!preferences.carMode || availableInCar),
  );
  for (const command of visibleCommands) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'command-row';

    const name = document.createElement('span');
    name.className = 'command-name';
    name.textContent = command.name;
    const risk = document.createElement('span');
    risk.className = 'risk-label';
    risk.dataset.risk = command.risk;
    risk.textContent = command.risk;
    const phrase = document.createElement('span');
    phrase.className = 'command-phrase';
    phrase.textContent = command.phrases[0] ?? command.description;
    row.append(name, risk, phrase);
    row.addEventListener('click', () => {
      elements.messageInput.value = command.phrases[0] ?? '';
      elements.commandsDialog.close();
      elements.messageInput.focus();
    });
    elements.commandList.append(row);
  }
}

async function initialize(): Promise<void> {
  elements.carModeToggle.checked = preferences.carMode;
  document.body.classList.toggle('car-mode', preferences.carMode);
  elements.volumeOn.classList.toggle('is-hidden', !preferences.speechEnabled);
  elements.volumeOff.classList.toggle('is-hidden', preferences.speechEnabled);
  elements.speechToggle.setAttribute(
    'aria-label',
    preferences.speechEnabled ? 'Desativar voz' : 'Ativar voz',
  );
  elements.speechToggle.title = preferences.speechEnabled ? 'Desativar voz' : 'Ativar voz';

  if (!voice.inputSupported) {
    elements.microphoneButton.disabled = true;
    elements.microphoneButton.title = 'Reconhecimento de voz indisponível';
  }

  try {
    await api.waitForHealth(setConnection);
    const [config, loadedPersonalities, loadedCommands] = await Promise.all([
      api.getConfig(),
      api.getPersonalities(),
      api.getCommands(),
    ]);
    personalities = loadedPersonalities;
    commands = loadedCommands;
    elements.messageInput.maxLength = config.maxMessageLength;
    renderPersonalities();
    renderCommands();
    const personality = currentPersonality();
    if (personality !== undefined) {
      elements.responseText.textContent = personality.greetings[0] ?? 'Pronta para começar.';
    }
    eyes.set('idle');
  } catch (error) {
    handleRequestError(error);
  }

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    void navigator.serviceWorker.register('/service-worker.js');
  }
}

elements.composer.addEventListener('submit', (event) => {
  event.preventDefault();
  void submitMessage();
});

elements.settingsButton.addEventListener('click', () => {
  elements.accessKeyInput.value = '';
  elements.accessDialog.showModal();
  elements.accessKeyInput.focus();
});

elements.closeAccessButton.addEventListener('click', () => {
  elements.accessKeyInput.value = '';
  queuedMessage = undefined;
  elements.accessDialog.close();
});

elements.clearAccessButton.addEventListener('click', () => {
  api.setAccessKey(undefined);
  elements.accessKeyInput.value = '';
  queuedMessage = undefined;
  elements.accessDialog.close();
  showToast('Chave removida da memória desta sessão.');
});

elements.accessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const accessKey = elements.accessKeyInput.value;
  elements.accessKeyInput.value = '';
  api.setAccessKey(accessKey);
  eyes.set('processing');
  void api
    .validateAccess()
    .then(() => {
      elements.accessDialog.close();
      setConnection('online');
      eyes.set('success');
      const message = queuedMessage;
      queuedMessage = undefined;
      if (message !== undefined) {
        void submitMessage(message);
      }
    })
    .catch((error: unknown) => {
      api.setAccessKey(undefined);
      handleRequestError(error);
    });
});

elements.pinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const pending = pendingConfirmation;
  const pin = elements.pinInput.value;
  elements.pinInput.value = '';
  if (pending === undefined) {
    elements.pinDialog.close();
    return;
  }

  eyes.set('processing');
  void api
    .verifyPin(pending.commandId, pin)
    .then(({ token }) =>
      api.executeCommand({
        ...(pending.args === undefined ? {} : { args: pending.args }),
        commandId: pending.commandId,
        confirmationToken: token,
        explicitConfirmation: pending.risk === 'critical',
        mode: currentMode(),
        personalityId: preferences.personalityId,
      }),
    )
    .then(async (response) => {
      pendingConfirmation = undefined;
      elements.pinDialog.close();
      await handleAssistantResponse(response);
    })
    .catch((error: unknown) => {
      handleRequestError(error);
      elements.pinInput.focus();
    });
});

function cancelPinConfirmation(): void {
  elements.pinInput.value = '';
  pendingConfirmation = undefined;
  elements.pinDialog.close();
  eyes.set('idle');
}

elements.cancelPinButton.addEventListener('click', cancelPinConfirmation);
elements.closePinButton.addEventListener('click', cancelPinConfirmation);
elements.pinDialog.addEventListener('cancel', () => {
  elements.pinInput.value = '';
  pendingConfirmation = undefined;
  eyes.set('idle');
});

elements.commandsButton.addEventListener('click', () => elements.commandsDialog.showModal());
elements.closeCommandsButton.addEventListener('click', () => elements.commandsDialog.close());

elements.personalitySelect.addEventListener('change', () => {
  applyPersonality(elements.personalitySelect.value);
  const personality = currentPersonality();
  if (personality !== undefined) {
    setResponse(personality.greetings[0] ?? 'Personalidade alterada.', personality.name, 'success');
  }
});

elements.carModeToggle.addEventListener('change', () => {
  applyCarMode(elements.carModeToggle.checked);
  eyes.set('success');
});

elements.speechToggle.addEventListener('click', () => {
  updatePreferences({ speechEnabled: !preferences.speechEnabled });
  elements.volumeOn.classList.toggle('is-hidden', !preferences.speechEnabled);
  elements.volumeOff.classList.toggle('is-hidden', preferences.speechEnabled);
  const label = preferences.speechEnabled ? 'Desativar voz' : 'Ativar voz';
  elements.speechToggle.setAttribute('aria-label', label);
  elements.speechToggle.title = label;
  if (!preferences.speechEnabled) {
    voice.stopSpeaking();
  }
});

elements.microphoneButton.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || busy) {
    return;
  }
  event.preventDefault();
  elements.microphoneButton.setPointerCapture(event.pointerId);
  void voice.beginPush();
});

for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
  elements.microphoneButton.addEventListener(eventName, () => voice.endPush());
}

elements.microphoneButton.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'Enter') && !event.repeat && !busy) {
    event.preventDefault();
    void voice.beginPush();
  }
});

elements.microphoneButton.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    voice.endPush();
  }
});

for (const eventName of ['pointerdown', 'keydown'] as const) {
  window.addEventListener(eventName, () => eyes.touch(), { passive: true });
}

window.addEventListener('offline', () => setConnection('offline'));
window.addEventListener(
  'online',
  () => void api.waitForHealth(setConnection).catch(() => undefined),
);

void initialize();
