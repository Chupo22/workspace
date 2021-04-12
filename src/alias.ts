import { getName, escapeQuotes } from './shared';

export class Alias {
  readonly name: string;

  constructor(name: string | string[], public command: string) {
    this.name = typeof name === 'string' ? name : getName(name);
  }

  toString() {
    return `alias ${this.name}="${escapeQuotes(this.command)}"`;
  }
}
