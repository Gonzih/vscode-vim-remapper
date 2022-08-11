import { parse } from "https://deno.land/std/flags/mod.ts";

interface Args {
  source?: string;
  output?: string;
}

interface Mapping {
  before: Array<string>;
  after: Array<string>;
}

const movementMappings: Record<string, string> = {
  d: "h",
  h: "j",
  t: "k",
  n: "l",
}

const genericMappings: Record<string, string> = {
  l: "n",

  j: "d",
  jj: "dd",
  ';': ':',
  '-': '$',
}

const insertMappings: Record<string, string> = {
  "<C-c>": "<Esc>",
}

const movementKeys = [
  "vim.commandLineModeKeyBindingsNonRecursive",
  "vim.normalModeKeyBindingsNonRecursive",
  "vim.visualModeKeyBindingsNonRecursive",
]

function withPrefix(prefix: string, pair: Mapping): Mapping {
  const pa = [prefix];

  return {
    before: pa.concat(pair.before),
    after: pa.concat(pair.after),
  }
}

function toUpper(pair: Mapping): Mapping {
  return {
    before: pair.before.map((m) => m.toUpperCase()),
    after: pair.after.map((m) => m.toUpperCase()),
  };
}

function lline(l: string) {
  const d = '='.repeat(30);
  console.log(`${d} ${l} ${d}`);
}

function genMappings(settings: Record<string, any>) {
  Object.entries(insertMappings).forEach((mapping) => {
    const [before, after] = mapping;
    const pair = { before: [before], after: [after] };
    const k = "vim.insertModeKeyBindingsNonRecursive";
    settings[k] = [pair];
  });

  Object.entries({ ...genericMappings, ...movementMappings }).forEach((mapping) => {
    const [before, after] = mapping;
    const pair = { before: [before], after: [after] };
    movementKeys.forEach((k) => {
      settings[k] ||= [];
      settings[k].push(pair);
      settings[k].push(toUpper(pair));
    });
  });

  Object.entries(movementMappings).forEach((mapping) => {
    const [before, after] = mapping;
    const pair = { before: [before], after: [after] };
    const k = "vim.normalModeKeyBindingsNonRecursive";
    settings[k] ||= [];
    settings[k].push(withPrefix("<C-w>", pair));
    settings[k].push(withPrefix("<C-w>", toUpper(pair)));
  });
}

function main() {
  const args = parse(Deno.args) as Args;
  lline("ARGS");
  console.dir(args);

  const template: Record<string, any> = JSON.parse(Deno.readTextFileSync(args.source || "template.json"))
  lline("BEFORE");
  console.log(template);
  genMappings(template);
  lline("AFTER");
  console.log(template);
  Deno.writeTextFileSync(args.output || "settings.json", JSON.stringify(template, null, 2));
}

main();
