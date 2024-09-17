import json
import coloredlogs
from logging import info

coloredlogs.install(level='DEBUG')

movement_map = {
    "d": "h",
    "h": "j",
    "t": "k",
    "n": "l",
}

generic_map = {
    "l": "n",
    "j": "d",
    ";": ":",
    "-": "$",
}

insert_map = {
    "<C-c>": "<Esc>",
}

movement_keys = [
    "vim.commandLineModeKeyBindingsNonRecursive",
    "vim.normalModeKeyBindingsNonRecursive",
    "vim.visualModeKeyBindingsNonRecursive",
    "vim.operatorPendingModeKeyBindings",
]


def with_prefix(prefix: str, pair):
    if not prefix:
        return pair

    newpair = {}
    for k in pair:
        newpair[k] = [prefix]
        newpair[k].extend(pair[k])

    return newpair


def to_upper(pair):
    newpair = {}

    for k in pair:
        newpair[k] = list(map(lambda v: v.upper(), pair[k]))

    return newpair


def gen_map(keymap, cfgkeys, add_upper_case: bool = False, prefix: str = ""):
    settings = {}
    for k in cfgkeys:
        if k not in settings:
            settings[k] = []

        for before in keymap:
            after = keymap[before]
            pair = {"before": [before], "after": [after]}
            settings[k].append(with_prefix(prefix, pair))
            if add_upper_case:
                settings[k].append(with_prefix(prefix, to_upper(pair)))

    return settings


def generate():
    overlap_key = "vim.normalModeKeyBindingsNonRecursive"
    insert = gen_map(insert_map, ["vim.insertModeKeyBindingsNonRecursive"])
    all = gen_map(generic_map | movement_map, movement_keys, True)
    movement = gen_map(movement_map, [overlap_key], True, "<C-w>")

    all[overlap_key].extend(movement[overlap_key])

    return insert | all


template_json = "template.json"
settings_json = "settings.json"


def run():
    info(f"Reading {template_json}")
    with open(template_json, "r") as f:
        template = json.load(f)

    settings = template | generate()
    #print(json.dumps(settings, indent=2))

    info(f"Writing {settings_json}")
    with open(settings_json, "w") as f:
        json.dump(settings, f, indent=2)


if __name__ == "__main__":
    run()
