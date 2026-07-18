const PREFERENCES_KEY = 'sofiie.preferences.v1';
const DEVICE_ID_KEY = 'sofiie.device-id.v1';

export interface DevicePreferences {
  readonly carMode: boolean;
  readonly personalityId: string;
  readonly speechEnabled: boolean;
}

const DEFAULT_PREFERENCES: DevicePreferences = {
  carMode: false,
  personalityId: 'focused',
  speechEnabled: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function loadPreferences(): DevicePreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw === null) {
      return DEFAULT_PREFERENCES;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return DEFAULT_PREFERENCES;
    }
    return {
      carMode: typeof parsed.carMode === 'boolean' ? parsed.carMode : false,
      personalityId: typeof parsed.personalityId === 'string' ? parsed.personalityId : 'focused',
      speechEnabled: typeof parsed.speechEnabled === 'boolean' ? parsed.speechEnabled : true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: DevicePreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing !== null && /^[a-zA-Z0-9_-]{8,80}$/.test(existing)) {
    return existing;
  }
  const deviceId = `web_${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}
