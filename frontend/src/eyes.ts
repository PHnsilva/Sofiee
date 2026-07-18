import type { Expression } from './types.js';

const LABELS: Record<Expression, string> = {
  error: 'Erro',
  idle: 'Pronta',
  listening: 'Ouvindo',
  processing: 'Pensando',
  sleeping: 'Em repouso',
  speaking: 'Falando',
  success: 'Concluído',
  warning: 'Atenção',
};

export class EyeController {
  #expression: Expression = 'sleeping';
  #settleTimer: number | undefined;
  #sleepTimer: number | undefined;

  constructor(
    private readonly eyes: HTMLElement,
    private readonly label: HTMLElement,
  ) {}

  get expression(): Expression {
    return this.#expression;
  }

  set(expression: Expression): void {
    this.#clearTimers();
    this.#expression = expression;
    this.eyes.dataset.expression = expression;
    this.label.textContent = LABELS[expression];

    if (['success', 'warning', 'error'].includes(expression)) {
      this.#settleTimer = window.setTimeout(() => this.set('idle'), 2_200);
    } else if (expression === 'idle') {
      this.#scheduleSleep();
    }
  }

  touch(): void {
    if (this.#expression === 'sleeping') {
      this.set('idle');
      return;
    }
    if (this.#expression === 'idle') {
      this.#scheduleSleep();
    }
  }

  #scheduleSleep(): void {
    window.clearTimeout(this.#sleepTimer);
    this.#sleepTimer = window.setTimeout(() => this.set('sleeping'), 45_000);
  }

  #clearTimers(): void {
    window.clearTimeout(this.#settleTimer);
    window.clearTimeout(this.#sleepTimer);
    this.#settleTimer = undefined;
    this.#sleepTimer = undefined;
  }
}
