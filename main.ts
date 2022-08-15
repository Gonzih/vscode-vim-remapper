import { parse } from "https://deno.land/std/flags/mod.ts";

type Settings = Record<string, any>;
type Mappings = Record<string, string>;

interface Args {
  source?: string;
  output?: string;
}

interface Mapping {
  before: Array<string>;
  after: Array<string>;
}

const movementMappings: Mappings = {
  d: "h",
  h: "j",
  t: "k",
  n: "l",
};

const genericMappings: Mappings = {
  l: "n",

  j: "d",
  ";": ":",
  "-": "$",
};

const insertMappings: Mappings = {
  "<C-c>": "<Esc>",
};

const movementKeys = [
  "vim.commandLineModeKeyBindingsNonRecursive",
  "vim.normalModeKeyBindingsNonRecursive",
  "vim.visualModeKeyBindingsNonRecursive",
];

function withPrefix(prefix: string, pair: Mapping): Mapping {
  const pa = [prefix];

  return {
    before: pa.concat(pair.before),
    after: pa.concat(pair.after),
  };
}

function toUpper(pair: Mapping): Mapping {
  return {
    before: pair.before.map((m) => m.toUpperCase()),
    after: pair.after.map((m) => m.toUpperCase()),
  };
}

function lline(l: string) {
  const d = "=".repeat(30);
  console.log(`${d} ${l} ${d}`);
}

function addMappings(
  settings: Settings,
  mappings: Mappings,
  keys: Array<string>,
  addUpper: boolean = false,
  prefix: string = ""
) {
  Object.entries(mappings).forEach((mapping) => {
    const [before, after] = mapping;
    const pair = { before: [before], after: [after] };

    keys.forEach((k) => {
      settings[k] ||= [];

      if (prefix !== "") {
        settings[k].push(withPrefix("<C-w>", pair));

        if (addUpper) {
          settings[k].push(withPrefix("<C-w>", toUpper(pair)));
        }
      } else {
        settings[k].push(pair);

        if (addUpper) {
          settings[k].push(toUpper(pair));
        }
      }
    });
  });
}

function genMappings(settings: Settings) {
  addMappings(settings, insertMappings, [
    "vim.insertModeKeyBindingsNonRecursive",
  ]);

  addMappings(
    settings,
    { ...genericMappings, ...movementMappings },
    movementKeys,
    true
  );

  addMappings(
    settings,
    movementMappings,
    ["vim.normalModeKeyBindingsNonRecursive"],
    true,
    "<C-w>"
  );
}

function main() {
  const args = parse(Deno.args) as Args;
  lline("ARGS");
  console.dir(args);

  const template: Settings = JSON.parse(
    Deno.readTextFileSync(args.source || "template.json")
  );

  lline("BEFORE");
  console.log(template);

  genMappings(template);

  lline("AFTER");
  console.log(template);

  Deno.writeTextFileSync(
    args.output || "settings.json",
    JSON.stringify(template, null, 2)
  );
}

main();
