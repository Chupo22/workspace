import { SchemaDSL } from '../dsl/schema-dsl';

export class TaskDSL {
  private _info: string[] = [];
  private commands: string[] = [];

  constructor(private readonly name: string) {}

  command(commands: string | string[]): void {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }

    for (const command of commands) {
      this.commands.push(command);
    }
  }

  info(content: string): string[] {
    if (content.trim()) {
      this._info = content.split('\n').reduce((result, line) => {
        line = line.trim();

        if (line) result.push(`echo "${line}"`);

        return result;
      }, this._info);
    }

    return this._info;
  }

  attach(dsl: SchemaDSL): void {
    const { name, commands } = this;

    const infoAlias = dsl.conveyor([name, 'info'], this._info);

    // TODO
    // dsl.conveyor(name, ...commands, ...infoAlias);
  }
}
