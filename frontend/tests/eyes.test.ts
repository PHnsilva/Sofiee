import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EyeController } from '../src/eyes.js';
import type { Expression } from '../src/types.js';

const labels: Record<Expression, string> = {
  error: 'Erro',
  idle: 'Pronta',
  listening: 'Ouvindo',
  processing: 'Pensando',
  sleeping: 'Em repouso',
  speaking: 'Falando',
  success: 'Concluído',
  warning: 'Atenção',
};

describe('EyeController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', globalThis);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('maps every assistant state to deterministic visual data and text', () => {
    const eyes = { dataset: {} } as unknown as HTMLElement;
    const label = { textContent: '' } as unknown as HTMLElement;
    const controller = new EyeController(eyes, label);

    for (const [expression, expectedLabel] of Object.entries(labels) as Array<
      [Expression, string]
    >) {
      controller.set(expression);
      expect(eyes.dataset.expression).toBe(expression);
      expect(label.textContent).toBe(expectedLabel);
    }
  });

  it('settles result states to idle and sleeps after inactivity', () => {
    const eyes = { dataset: {} } as unknown as HTMLElement;
    const label = { textContent: '' } as unknown as HTMLElement;
    const controller = new EyeController(eyes, label);

    controller.set('success');
    vi.advanceTimersByTime(2_200);
    expect(controller.expression).toBe('idle');
    vi.advanceTimersByTime(45_000);
    expect(controller.expression).toBe('sleeping');
  });
});
