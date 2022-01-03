import { Timeline, G } from "@svgdotjs/svg.js";

type animable = { el: any; attr: any };

// infinitely looping animation
export const anim_infinite = (
  mk_frames: () => Array<{
    wait?: number;
    item?: animable;
    items?: Array<animable>;
  }>
) => {
  const inner = () => {
    let delay = 0;
    const len = 1000; // ms
    const timeline = new Timeline();

    const frames = mk_frames();

    frames.forEach((x) => {
      if (x.item) {
        x.item.el.timeline(timeline);
      }
      if (x.items) {
        x.items.forEach((x_, _) => {
          x_.el.timeline(timeline);
        });
      }
    });

    timeline.speed(1.25);

    frames.forEach((x, _) => {
      const wait = x.wait ? x.wait : 0;
      if (x.item) {
        x.item.el.animate(len, delay, "now").attr(x.item.attr);
      } else if (x.items) {
        x.items.forEach((x_, _) => {
          x_.el.animate(len, delay, "now").attr(x_.attr);
        });
      }
      delay += len + wait;
    });

    let last: any = frames[frames.length - 1];
    last = last.item || last.items[last.items.length - 1];
    last.el.animate(len, delay, "now").after(() => inner());
    delay += len;
  };

  inner();
};

// declarative animations that loop
export const anim = (
  r: G,
  g: Array<{
    wait?: number;
    loop_start?: boolean;
    item?: animable;
    items?: Array<animable>;
  }>
) => {
  let delay = 0;
  const len = 1000; // ms
  const timeline = new Timeline();

  let loop_start = -1;

  g.forEach((x, i) => {
    if (loop_start < 0 && x.loop_start) {
      loop_start = i * len;
    }
    if (x.item) {
      x.item.el.timeline(timeline);
    }
    if (x.items) {
      x.items.forEach((x_, _) => {
        x_.el.timeline(timeline);
      });
    }
  });

  r.timeline(timeline);
  timeline.persist(true);
  timeline.speed(1.25);

  g.forEach((x, _) => {
    const wait = x.wait ? x.wait : 0;
    if (x.item) {
      x.item.el.animate(len, delay, "now").attr(x.item.attr);
    } else if (x.items) {
      x.items.forEach((x_, _) => {
        x_.el.animate(len, delay, "now").attr(x_.attr);
      });
    }
    delay += len + wait;
  });

  if (loop_start >= 0) {
    let last: any = g[g.length - 1];
    last = last.item || last.items[last.items.length - 1];
    r.animate(len, delay, "now").after(() => timeline.time(loop_start));
    delay += len;
  }
};
