import { ix_country_code_map, trans_matrix } from "./data.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const two_dp = (x: number) =>
  x.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

const rand_int = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// n = num countries
const n = trans_matrix.length;

type visit = {
  ix: number;
  n: number;
};

const sim_ui = () => {
  const svg = document.getElementById("nomad-sim");
  const svg_ns = "http://www.w3.org/2000/svg";
  const h = 75;
  const buff = 5;
  const num_show = 20;
  svg.style.height = `${buff + num_show * (h + buff)}px`;
  let max_w = svg.clientWidth;
  let texts = undefined;

  const images = new Map<number, HTMLImageElement>();
  for (const [ix, id] of Object.entries(ix_country_code_map)) {
    const el = <HTMLImageElement>document.getElementById(`flag-${id}`);
    if (!el) {
      throw new Error(`missing flag for ${id}`);
    }
    images.set(Number(ix), el);
  }

  const create_texts = () => {
    if (!texts) {
      texts = new Array(num_show);
      for (let i = 0; i < num_show; i++) {
        const t = document.createElementNS(svg_ns, "text");
        svg.appendChild(t);
        texts[i] = t;
      }
    }
  };

  const y_of_ix = (ix: number, { halfway = false } = {}) => {
    if (!halfway) {
      return (buff + (h + buff) * ix).toString();
    }
    return (buff + (h + buff) * ix + h / 2).toString();
  };

  const reset = ({ init = false } = {}) => {
    max_w = svg.clientWidth;
    const keys = Object.keys(ix_country_code_map);
    for (let i = 0; i < keys.length; i++) {
      const k = Number(keys[i]);
      const img = images.get(k);
      if (init && i < num_show) {
        const width = ((4 / 3) * h).toString();
        img.style.display = "block";
        img.setAttribute("width", width);
        img.setAttribute("height", h.toString());
        img.setAttribute("y", y_of_ix(i));
      } else {
        img.style.display = "none";
        img.setAttribute("y", "0");
      }

      img.setAttribute("preserveAspectRatio", "none");
      img.setAttribute("x", buff.toString());
    }

    if (texts) {
      for (const t of texts) {
        t.remove();
      }
      texts = undefined;
    }
  };

  const update = (vs: Array<visit>) => {
    max_w = svg.clientWidth;
    const num_visits = vs.reduce((acc, v) => v.n + acc, 0);

    create_texts();
    for (let i = 0; i < vs.length; i++) {
      const v = vs[i];
      const img = images.get(v.ix);
      if (i < num_show) {
        const width = Math.min(
          (4 / 3) * h * (1 + (20 * v.n) / num_visits),
          0.6 * max_w
        ).toString();
        img.style.display = "block";
        img.setAttribute("width", width);
        img.setAttribute("height", h.toString());
        img.setAttribute("y", y_of_ix(i));

        const t = texts[i];
        const pos = `#${i + 1}`.padStart(4, " ");
        t.textContent = `${v.n} (${two_dp(
          (100 * v.n) / num_visits
        )}%) - ${ix_country_code_map[v.ix].toUpperCase()} ${pos}`;
        t.setAttribute("x", max_w - buff);
        t.setAttribute("y", y_of_ix(i, { halfway: true }));
      } else {
        img.style.display = "none";
      }
    }
  };

  return {
    init: () => reset({ init: true }),
    reset: () => reset({ init: false }),
    update: update,
  };
};

const sim_toggle_button = <HTMLButtonElement>(
  document.getElementById("nomad-sim-button")
);
const sim_slider = <HTMLInputElement>(
  document.getElementById("nomad-sim-slider")
);
let update_cadence = Number(sim_slider.value);
const sim = () => {
  const max_iter = 1e9;
  const damping = 0.85;
  const wait_ms = 30;
  let cancelled = false;
  const ui = sim_ui();
  ui.init();

  const go = async () => {
    ui.reset();
    const rand_pos = () => rand_int(0, n - 1);
    let pos = rand_pos();
    const counter = new Map<number, number>();
    counter.set(pos, 1);

    const update_ui = async () => {
      const score = Array.from(counter, ([k, v]) => ({
        n: v,
        ix: k,
      })).sort((x: visit, y: visit) => y.n - x.n);

      ui.update(score);
      sim_slider.labels[0].innerText = `Iterations: ${i}`;
      await sleep(wait_ms);
    };

    let i = 0;
    while (i < max_iter && !cancelled) {
      i++;

      let acc = 0;
      let next = undefined;
      const rand = Math.random();
      const row = trans_matrix[pos];

      for (let j = 0; j < n; j++) {
        acc += row[j];
        if (acc >= rand) {
          next = j;
          break;
        }
      }

      counter.set(next, 1 + (counter.get(next) || 0));

      if (Math.random() > damping) {
        pos = rand_pos();
      } else {
        pos = next;
      }

      if (i % update_cadence === 0) {
        await update_ui();
      }
    }
  };

  let running = undefined;

  const stop = async () => {
    console.log("stopping running simulation...");
    cancelled = true;
    await running;
    running = undefined;
    console.log("running simulation stopped...");
    cancelled = false;
  };

  const start = async () => {
    console.log("about to start new simulation...");
    running = go();
    await running;
    running = undefined;
  };

  const toggle = async () => {
    if (running) {
      await stop();
    } else {
      await start();
    }
  };

  return {
    toggle: toggle,
  };
};

const s = sim();
sim_slider.onchange = (_) => (update_cadence = Number(sim_slider.value));
sim_toggle_button.onclick = (e) => {
  e.preventDefault();
  sim_toggle_button.innerText =
    sim_toggle_button.innerText === "START" ? "STOP" : "START";
  s.toggle();
};

// const calc_weight_by_country = () => {
//   const res = new Map<number, number>();
//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < n; j++) {
//       const v = trans_matrix[i][j];
//       if (v === 0 || i === j) {
//         continue;
//       } else {
//         res.set(j, (res.has(j) ? res.get(j) : 0) + v / n);
//       }
//     }
//   }
//   const visits = Array.from(res, ([k, v]) => ({
//     n: v,
//     ix: k,
//   })).sort((x: visit, y: visit) => y.n - x.n);
//   let sum = 0;
//   for (let i = 0; i < visits.length; i++) {
//     sum += visits[i].n;
//     console.log(ix_country_code_map[visits[i].ix], visits[i].n);
//   }
// };

// calc_weight_by_country();
