// import { TaskDSL } from './task-dsl';
import { Alias } from '../alias';
import { getName } from '../shared';

export class SchemaDSL {
  aliases: Alias[] = [];

  constructor(private readonly groupName: string | null = null) {}

  alias(
    name: string | string[],
    command: string,
    options?: { skipAttachGroupName?: boolean },
  ): Alias {
    const { groupName } = this;

    if (typeof name === 'string') {
      name = [name];
    }

    if (groupName && !options?.skipAttachGroupName) {
      name = [groupName, ...name];
    }

    const alias = new Alias(name, command);

    this.aliases.push(alias);

    return alias;
  }

  // task(name: string | string[], fn: (dls: SchemaDSL) => void) {
  //   const dsl = new TaskDSL(getName(name));
  //
  //   fn(dsl);
  //
  //   dsl.attach(this);
  // }

  group(groupName: string | string[], fn: (dls: SchemaDSL) => void): void {
    const baseGroupName = this.groupName;
    const name = baseGroupName
      ? [baseGroupName, getName(groupName)]
      : getName(groupName);
    const dsl = new SchemaDSL(getName(name));

    fn(dsl);

    for (const alias of dsl.aliases) {
      this.aliases.push(alias);
    }
  }

  useAlias(alias: Alias, name: string | string[], command: string): Alias {
    const parentName = alias.name;
    const options = { skipAttachGroupName: true };

    name = getName([parentName, getName(name)]);
    command = `${alias.name} ${command}`;

    return this.alias(name, command, options);
  }

  conveyor(name: string | string[], aliases: Array<string | Alias>): Alias {
    return this.alias(
      name,
      aliases
        .map((i) => (typeof i === 'string' ? i : i.name))
        .filter(Boolean) // TODO по идее это нужно выпилить
        .join(' && '),
    );
  }

  toString(): string {
    return this.aliases
      .map((alias) => alias.toString())
      .filter(Boolean) // TODO по идее это нужно выпилить
      .join('\n');
  }
}
