#!/bin/bash
v="$(jq -s '.[0] * .[1]'\
     <(jq 'map_values({"tot_pop": .})' d_pop_2019.json)\
     ./d_2019.json)"

echo "$v" > d_pop_and_mig_2019.json
echo "export const d = $v;" > d_pop_and_mig_2019.js