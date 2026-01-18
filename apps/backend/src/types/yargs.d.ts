declare module 'yargs' {
  type OptionType = 'string' | 'number' | 'boolean';

  type OptionDefinition = {
    alias?: string | readonly string[];
    type?: OptionType;
    describe?: string;
    default?: unknown;
  };

  interface Argv<TParsed = Record<string, unknown>> {
    option(optionName: string, option: OptionDefinition): Argv<TParsed>;
    help(): Argv<TParsed>;
    parseSync(): TParsed & { _: (string | number)[]; $0: string };
  }

  export default function yargs(
    args?: readonly string[],
    cwd?: string
  ): Argv;
}

declare module 'yargs/helpers' {
  export function hideBin(argv: string[]): string[];
}
