export type AssistantMode = 'web' | 'mobile' | 'desktop' | 'car';
export type Expression =
  'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'warning' | 'error' | 'sleeping';
export type RiskLevel = 'public' | 'private' | 'sensitive' | 'critical';

export interface VoiceConfiguration {
  readonly lang: string;
  readonly name: string | null;
  readonly pitch: number;
  readonly rate: number;
  readonly volume: number;
}

export interface Personality {
  readonly allowedCommandCategories: readonly string[];
  readonly defaultExpression: Expression;
  readonly errorResponses: readonly string[];
  readonly greetings: readonly string[];
  readonly id: string;
  readonly name: string;
  readonly responseStyle: string;
  readonly successResponses: readonly string[];
  readonly systemPrompt: string;
  readonly voice: VoiceConfiguration;
}

export interface CommandDefinition {
  readonly availableInCar: boolean;
  readonly category: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly id: string;
  readonly intent: string;
  readonly name: string;
  readonly phrases: readonly string[];
  readonly requiresDesktop: boolean;
  readonly risk: RiskLevel;
}

export type CommandArguments = { readonly personalityId?: string };

export type AssistantAction =
  | { readonly type: 'client.repeat_last' }
  | { readonly type: 'client.clear_session' }
  | { readonly personalityId: string; readonly type: 'client.set_personality' }
  | { readonly enabled: boolean; readonly type: 'client.set_car_mode' }
  | {
      readonly appId: 'vscode' | 'spotify' | 'browser';
      readonly type: 'desktop.open_app';
    }
  | { readonly type: 'desktop.open_project' }
  | { readonly type: 'desktop.git_status' };

export interface AssistantResponse {
  readonly action: AssistantAction | null;
  readonly command: {
    readonly args?: CommandArguments;
    readonly id: string;
    readonly risk: RiskLevel;
  } | null;
  readonly expression: Expression;
  readonly provider: string;
  readonly reply: string;
  readonly requiresConfirmation: boolean;
  readonly source: 'command' | 'model';
}

export interface PublicAppConfig {
  readonly capabilities: {
    readonly conversationHistory: false;
    readonly desktopBridge: boolean;
    readonly pinConfirmation: boolean;
    readonly speakerVerification: false;
    readonly voiceInput: string;
    readonly voiceOutput: string;
  };
  readonly defaultPersonalityId: string;
  readonly expressions: ReadonlyArray<{ readonly id: Expression; readonly label: string }>;
  readonly maxMessageLength: number;
  readonly provider: string;
  readonly version: string;
}
