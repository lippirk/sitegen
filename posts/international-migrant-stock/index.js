import { d } from "./d_pop_and_mig_2019";
import { world_map_colorer, selected_color, red_plus_default, green_plus_default, ul_of_array } from "./lib";
import { country_mapping } from "./country_mapping";

const two_dp = x =>
  x.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

const svg = document.getElementById('world-map');
const svg_desc = document.getElementById('world-map-desc');
const selected_country = document.getElementById('world-map-selected-country');
let last_clicked = {
  id: undefined,
  // modes cycle through:
  // 1. im
  // 2. em
  mode: undefined,
};
let mode = undefined;
const set_last_clicked = id => {
  if (last_clicked.id === id) {
    if (last_clicked.mode === 'im') {
      last_clicked.mode = 'em';
      mode = 'em';
    } else if (last_clicked.mode === 'em') {
      last_clicked.mode = 'im';
      mode = 'im';
    }
  } else {
    last_clicked.mode = 'im';
    mode = 'im';
  }
  last_clicked.id = id;
};
const reset = () => {
  last_clicked = { id: undefined, mode: undefined };
  clrr([]);
  selected_country.innerText = '';
  svg_desc.innerHTML = '';
};

const pp_id = id => `${country_mapping[id]} (${id})`;

const pp_number = x => Number(x).toLocaleString();

const calc_desc = (id, total, top, im_tot, em_tot, tot_pop)  => {
  if (!last_clicked.mode) {
    return '';
  }
  if (mode === 'em') {
    const tot = tot_pop - im_tot + em_tot;
    const num_string = `${pp_number(em_tot)}* natives (out of a total of ${pp_number(tot)} natives ~ ${pp_number(two_dp(100 * em_tot/tot))}%)`;
    const para = `${country_mapping[id]}: ${num_string} are living in another country. The most common destinations are:`;
    // const missing_data = total !== ac_total ? `<p>There is a discrepancy in the number of emigrants** of ${pp_number(Math.abs(ac_total - total))}.</p>` : '';
    const missing_data = '';
    return `<p>${para}</p>${ul_of_array(top)}${missing_data}`;
  } else if (mode === 'im') {
    const num_string = `${pp_number(im_tot)}* immigrants (out of a total population of ${pp_number(tot_pop)} ~ ${pp_number(two_dp(100 * im_tot/tot_pop))}%)`;
    const para = `${country_mapping[id]}: ${num_string} live here. The most common origins are:`;
    const missing_data = total !== im_tot ? `<p>Origin data is missing for ${pp_number(im_tot - total)} immigrants.</p>` : '';
    return `<p>${para}</p>${ul_of_array(top)}${missing_data}`;
  }
};

const id_of_composed_path = p => {
  let id = undefined;
  for (let i = 0; i < p.length; i++) {
    if (p[i].id) {
      id = p[i].id;
      break;
    }
  }
  return id;
};

const clrr = world_map_colorer(svg);

const set_title = id => selected_country.innerText = pp_id(id);

const set_desc = x => svg_desc.innerHTML = x;

const click_country = id => {
  if (!country_mapping[id]) {
    console.log(`id=${id} is not a country => resetting`);
    reset();
    return;
  }

  if (!d[id]) {
    const colors = [[id, { fill: selected_color }]];
    const para = `${country_mapping[id]}: no data!`;

    reset();
    set_desc(`<p>${para}</p>`);
    set_title(id);
    clrr(colors);
    return;
  }

  console.log(`updating ${id} on map`);
  set_last_clicked(id);

  const colors = [];
  const m = d[id];
  const total = Object.values(m).reduce((acc, x) => x[mode] ? acc + x[mode] : acc, 0);
  const top = Object.entries(m)
    .filter(([_, v]) => v[mode])
    .map(([k, v]) => [k, v[mode]])
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => `${pp_id(k)} - ${pp_number(v)}`)
    .slice(0, 3);
  for (const k in m) {
    const v = m[k][mode];
    if (!v) {
      continue;
    }

    const proportion = Math.ceil(v) / total;
    const obj = {
      fill: mode === 'im' ? red_plus_default(proportion) : green_plus_default(proportion)
    };
    colors.push([k, obj]);
  }
  colors.push([id, { fill: selected_color }]);
  clrr(colors);

  set_desc(calc_desc(id, total, top, m['im_tot'], m['em_tot'], m['tot_pop']));
  set_title(id);
};

const on_svg_click = e => {
  // on chrome this is equivalent to 'e.path', but this does not work on firefox
  const path = e.composedPath();

  if (!path) {
    return;
  }

  const id = id_of_composed_path(path);

  if (!id) {
    console.log(`unknown id=${id}`);
    reset();
    return;
  }

  click_country(id);
};

svg.onclick = on_svg_click;