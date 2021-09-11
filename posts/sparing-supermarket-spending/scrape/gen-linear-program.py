#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json

path = "./data.reduced.json"
o = None
with open(path, 'r') as f:
    o = json.load(f)

s = []

def name(x):
    return x['name'].replace('-', '_')

for i, x in enumerate(o):
    s.append(f"var {name(x)} >= 0;")

s.append("\n")
sum_ = [f"{x['price']} * {name(x)}" for x in o]
s.append(f"minimize z: {' + '.join(sum_)};")
s.append("\n")

for v in ["salt", "fat", "protein", "carb", "sugar", "energy"]:
    def get_v(x):
        if v in x:
            return x[v]
        return None
    acc = [f"{get_v(x)} * {name(x)}" for x in o if get_v(x) != None and get_v(x) != 0]
    cond = {
        "salt": "<= 6",
        "protein": ">= 50",
        "sugar": "<= 30",
        "fibre": ">= 30",
        "carb": ">= 260",
        "fat": ">= 70",
        "energy": ">= 8400"
    }
    s.append(f"subject to constraint_{v}: {' + '.join(acc)} {cond[v]};\n")

s.append("end;")
print('\n'.join(s))
