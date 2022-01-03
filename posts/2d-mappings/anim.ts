import { G, SVG } from "@svgdotjs/svg.js";
import { anim_infinite, anim } from "./anim_lib";

const size = 100;
const line_zero = { x1: 0, x2: 0, y1: 0, y2: 0 };
const circle_zero = { cx: 0, cy: 0, r: 0 };

const init = (root_name: string) => {
  const root = document.getElementById(root_name);
  const svg = SVG()
    .addTo(root)
    .attr({
      viewBox: `-${size / 2} -${size / 2} ${size} ${size}`,
    });
  const g = svg.group().attr({ transform: "scale(1, -1)" });
  return g;
};

const axes = (r: G) => {
  r.line(0, -size, 0, size).stroke({ width: 0.5, color: "black" });
  r.line(-size, 0, size, 0).stroke({ width: 0.5, color: "black" });
};

const householder = (r: G) => {
  const radius = 1;
  const ref_l = r
    .line()
    .stroke({
      width: 0.5,
      color: "grey",
      dasharray: "5 5",
    })
    .attr(line_zero);

  const u = r
    .line()
    .stroke({
      width: 0.5,
      color: "red",
    })
    .attr(line_zero);

  const x_to_ref_l = r.line(0, 0, 0, 0).stroke({
    width: 0.5,
    color: "red",
  });

  const ref_l_to_xp = r.line(0, 0, 0, 0).stroke({
    width: 0.5,
    color: "red",
  });

  const x = r.circle(0).attr(circle_zero);

  const r1 = Math.sqrt(0.5 * size ** 2);
  const ru = 10;

  const init_animable = ({ t1 }) => {
    const tu = t1 + Math.PI / 2;
    const ref_l_prop = {
      x1: -r1 * Math.cos(t1),
      y1: -r1 * Math.sin(t1),
      x2: r1 * Math.cos(t1),
      y2: r1 * Math.sin(t1),
    };
    const u_prop = {
      x2: ru * Math.cos(tu),
      y2: ru * Math.sin(tu),
    };
    return {
      items: [
        { el: ref_l, attr: ref_l_prop },
        { el: u, attr: u_prop },
      ],
    };
  };

  const mk_seq = ({ t1, tx }) => {
    const tu = Math.PI / 2 + t1;

    const ref_l_prop = {
      x1: -r1 * Math.cos(t1),
      y1: -r1 * Math.sin(t1),
      x2: r1 * Math.cos(t1),
      y2: r1 * Math.sin(t1),
    };

    const u_prop = {
      x2: ru * Math.cos(tu),
      y2: ru * Math.sin(tu),
    };

    const rx = 30;
    const x_prop = {
      cx: rx * Math.cos(tx),
      cy: rx * Math.sin(tx),
      r: radius,
    };

    // x |-> (I - 2uuT) x
    // NB: we need to normalize u
    const uuT = (Math.cos(tu - tx) * rx) / ru;
    const xp_prop = {
      cx: x_prop.cx - 2 * uuT * u_prop.x2,
      cy: x_prop.cy - 2 * uuT * u_prop.y2,
      r: radius,
    };
    const xp = r.circle(0).attr(circle_zero);

    const x_to_ref_l_prop = {
      x1: x_prop.cx,
      y1: x_prop.cy,
      x2: x_prop.cx - uuT * u_prop.x2,
      y2: x_prop.cy - uuT * u_prop.y2,
    };
    const ref_l_to_xp_prop = {
      x1: x_prop.cx - uuT * u_prop.x2,
      y1: x_prop.cy - uuT * u_prop.y2,
      x2: xp_prop.cx,
      y2: xp_prop.cy,
    };

    return [
      init_animable({ t1 }),
      {
        loop_start: true,
        items: [
          { el: ref_l, attr: ref_l_prop },
          { el: u, attr: u_prop },
        ],
      },
      {
        item: { el: x, attr: x_prop },
        wait: 1000,
      },
      {
        item: { el: x_to_ref_l, attr: x_to_ref_l_prop },
      },
      {
        item: { el: ref_l_to_xp, attr: ref_l_to_xp_prop },
      },
      {
        item: { el: xp, attr: xp_prop },
      },
      {
        items: [
          { el: x, attr: circle_zero },
          { el: x_to_ref_l, attr: line_zero },
          { el: ref_l_to_xp, attr: line_zero },
        ],
        wait: 1000,
      },
      {
        item: { el: xp, attr: circle_zero },
      },
    ];
  };

  const seq = [
    ...mk_seq({ t1: Math.PI / 6, tx: Math.PI / 8 }),
    ...mk_seq({ t1: Math.PI * 0.4, tx: Math.PI * 1.25 }),
    ...mk_seq({ t1: Math.PI * 0.9, tx: 1.1 * Math.PI }),
    init_animable({ t1: Math.PI / 6 }), // go back to start
  ];
  anim(r, seq);
};

const projection = (r: G) => {
  const radius = 1;
  const ref_l = r
    .line()
    .stroke({
      width: 0.5,
      color: "grey",
      dasharray: "5 5",
    })
    .attr(line_zero);

  const u = r
    .line()
    .stroke({
      width: 0.5,
      color: "red",
    })
    .attr(line_zero);

  const x_to_ref_l = r.line(0, 0, 0, 0).stroke({
    width: 0.5,
    color: "red",
  });

  const x = r.circle(0).attr(circle_zero);

  const r1 = Math.sqrt(0.5 * size ** 2);
  const ru = 10;

  const init_animable = ({ t1 }) => {
    const tu = t1 + Math.PI / 2;
    const ref_l_prop = {
      x1: -r1 * Math.cos(t1),
      y1: -r1 * Math.sin(t1),
      x2: r1 * Math.cos(t1),
      y2: r1 * Math.sin(t1),
    };
    const u_prop = {
      x2: ru * Math.cos(tu),
      y2: ru * Math.sin(tu),
    };
    return {
      items: [
        { el: ref_l, attr: ref_l_prop },
        { el: u, attr: u_prop },
      ],
    };
  };

  const mk_seq = ({ t1, tx }) => {
    const tu = Math.PI / 2 + t1;

    const ref_l_prop = {
      x1: -r1 * Math.cos(t1),
      y1: -r1 * Math.sin(t1),
      x2: r1 * Math.cos(t1),
      y2: r1 * Math.sin(t1),
    };

    const u_prop = {
      x2: ru * Math.cos(tu),
      y2: ru * Math.sin(tu),
    };

    const rx = 30;
    const x_prop = {
      cx: rx * Math.cos(tx),
      cy: rx * Math.sin(tx),
      r: radius,
    };

    // x |-> (I - uuT) x
    // NB: we need to normalize u
    const uuT = (Math.cos(tu - tx) * rx) / ru;
    const xp_prop = {
      cx: x_prop.cx - uuT * u_prop.x2,
      cy: x_prop.cy - uuT * u_prop.y2,
      r: radius,
    };
    const xp = r.circle(0).attr(circle_zero);

    const x_to_ref_l_prop = {
      x1: x_prop.cx,
      y1: x_prop.cy,
      x2: x_prop.cx - uuT * u_prop.x2,
      y2: x_prop.cy - uuT * u_prop.y2,
    };

    return [
      init_animable({ t1 }),
      {
        loop_start: true,
        items: [
          { el: ref_l, attr: ref_l_prop },
          { el: u, attr: u_prop },
        ],
      },
      {
        item: { el: x, attr: x_prop },
        wait: 1000,
      },
      {
        item: { el: x_to_ref_l, attr: x_to_ref_l_prop },
      },
      {
        item: { el: xp, attr: xp_prop },
      },
      {
        items: [
          { el: x, attr: circle_zero },
          { el: x_to_ref_l, attr: line_zero },
        ],
        wait: 1000,
      },
      {
        item: { el: xp, attr: circle_zero },
      },
    ];
  };

  const seq = [
    ...mk_seq({ t1: Math.PI * 0.6, tx: Math.PI * 0.2 }),
    ...mk_seq({ t1: Math.PI * 0.7, tx: Math.PI * 1.4 }),
    ...mk_seq({ t1: Math.PI * 0.1, tx: 1.3 * Math.PI }),
    init_animable({ t1: Math.PI * 0.6 }), // go back to start
  ];
  anim(r, seq);
};

const trans = (
  r: G,
  f: (o: { cx: number; cy: number }) => { cx: number; cy: number }
) => {
  const N = 10;
  const lb = -20;
  const ub = 20;
  const calc = (o) => ({ r: 1, ...f(o) });
  const xs = new Array(N);
  for (let i = 0; i < N; i++) {
    xs[i] = r.circle(0).attr(circle_zero);
  }

  const mk_x_attr = () => {
    const cx = Math.random() * (ub - lb) + lb;
    const cy = Math.random() * (ub - lb) + lb;
    const x_attr = { cx, cy, r: 1 };
    return x_attr;
  };

  const mk_frames = () => {
    const os = xs.map((x) => ({ x: x, x_attr: mk_x_attr() }));
    return [
      {
        wait: 1000,
        items: os.map((o) => ({ el: o.x, attr: o.x_attr })),
      },
      {
        wait: 1000,
        items: os.map((o) => ({ el: o.x, attr: calc(o.x_attr) })),
      },
      {
        items: os.map((o) => ({ el: o.x, attr: circle_zero })),
      },
    ];
  };

  anim_infinite(mk_frames);
};

const squeeze = (r: G) => {
  const k = 2;
  const f = ({ cx, cy }) => ({
    cx: k * cx,
    cy: (1 / k) * cy,
  });
  trans(r, f);
};

const shear = (r: G) => {
  const k = 1.4;
  const f = ({ cx, cy }) => ({
    cx: cx + k * cy,
    cy: cy,
  });
  trans(r, f);
};

const rotation = (r: G) => {
  const k = Math.PI / 2;
  trans(r, ({ cx, cy }) => ({
    cx: cx * Math.cos(k) - cy * Math.sin(k),
    cy: cx * Math.sin(k) + cy * Math.cos(k),
  }));
};

(() => {
  const rh = init("householder-root");
  axes(rh);
  householder(rh);

  const rp = init("projection-root");
  axes(rp);
  projection(rp);

  const rs = init("squeeze-root");
  axes(rs);
  squeeze(rs);

  const rsh = init("shear-root");
  axes(rsh);
  shear(rsh);

  const rr = init("rotation-root");
  axes(rr);
  rotation(rr);
})();
