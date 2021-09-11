import json

with open('d_2019.json', 'r') as f:
    d_2019 = json.load(f)

with open('d_pop_2019.json', 'r') as f:
    d_pop_2019 = json.load(f)

assert set(d_2019.keys()) == set(d_pop_2019.keys())
assert len(d_2019.keys()) == len(d_pop_2019.keys())
all_countries = d_2019.keys()

def find_unreachable():
    # BFS to find all reachable countries from gb
    start = 'gb'
    poss = [start]
    seen = set(start)
    while len(poss) > 0:
        next_poss = []
        for i in poss:
            for j in all_countries:
                if j in seen or j not in d_2019[i]:
                    continue
                elif 'em' in d_2019[i][j]:
                    em = d_2019[i][j]['em']
                    if em and em > 0:
                      seen.add(j)
                      next_poss.append(j)
        poss = next_poss

    return set(all_countries).difference(seen)

unreachable = find_unreachable()
assert 'va' in find_unreachable() and len(unreachable) == 1

d_2019.pop('va')
d_pop_2019.pop('va')
all_countries = d_2019.keys()
N = len(all_countries)

map = {i:k for i, k in enumerate(d_2019)}
matrix = []
for i, k in map.items():
    l = []
    d = d_2019[k]
    for j, k in map.items():
        if i == j:
            # nomad can't migrate from a country to itself
            l.append(0)
            # another approach is to account for the native population with
            # l.append(d_pop_2019[k])
        elif (v := d.get(k, None)) and (v := v.get('em', None)):
            l.append(v)
        else:
            l.append(0)
    l_sum = sum(l)
    l = [x / l_sum for x in l]
    matrix.append(l)

for l in matrix:
    assert len(l) == N

with open('data.js', 'w') as f:
    print(f"export const ix_country_code_map = {map};", file=f)
    print("", file=f)
    print(f"export const trans_matrix = {matrix};", file=f)