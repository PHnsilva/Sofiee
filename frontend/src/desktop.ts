import type { AssistantAction } from './types.js';

type DesktopAction = Extract<AssistantAction, { type: `desktop.${string}` }>;

interface DesktopResult {
  readonly message: string;
  readonly output?: string;
  readonly success: boolean;
}

function isDesktopResult(value: unknown): value is DesktopResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'success' in value &&
    typeof value.success === 'boolean'
  );
}

export function isDesktopAction(action: AssistantAction): action is DesktopAction {
  return action.type.startsWith('desktop.');
}

export async function executeDesktopAction(action: DesktopAction): Promise<DesktopResult> {
  if (!('__TAURI_INTERNALS__' in window)) {
    return {
      message: 'A bridge desktop não está disponível neste dispositivo.',
      success: false,
    };
  }

  const { invoke } = await import('@tauri-apps/api/core');
  const bridgeAction =
    action.type === 'desktop.open_app'
      ? { appId: action.appId, type: 'open_app' }
      : action.type === 'desktop.open_project'
        ? { type: 'open_project' }
        : { type: 'git_status' };
  const result: unknown = await invoke('execute_desktop_action', { action: bridgeAction });

  if (!isDesktopResult(result)) {
    throw new Error('A bridge desktop retornou um resultado inválido.');
  }
  return result;
}
