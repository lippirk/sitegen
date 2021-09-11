import csv
import json

data = None
with open('mapping.csv', newline='') as f:
    reader = csv.reader(f)
    data = list(reader)

m = {}
exp_len = len(data) - 2
for l in data:
    k, v = l
    if len(k) != 2:
        continue
    elif k in m:
        print(f'duplicate kv: {(k, v)} and {(k, m[k])}')
    m[k] = v


assert exp_len == len(m), f"{exp_len} != {len(m)}"

with open('country_mapping.js', 'w') as f:
    f.write(f"export const country_mapping = {json.dumps(m, indent=4)};")
