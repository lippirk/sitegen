// #dedede
const default_color = [222, 222, 222];
const blue = "#00a7fa";
const red = [255, 43, 43];
const green = [29, 92, 7];
export const selected_color = blue;

const style_svg_path = (el, style) => {
    const fill = style.fill ? `fill:${style.fill}` : '';
    const opac = style.opacity ? `opacity:${style.opacity}` : '';
    if (fill || opac) {
        const s = [fill, opac].filter(x => x).join(';');
        el.setAttribute('style', s);
    }
};

const rbg_to_hex = rbg => {
    let r = rbg[0].toString(16);
    let g = rbg[1].toString(16);
    let b = rbg[2].toString(16);
    r = r.length == 1 ? "0" + r : r;
    g = g.length == 1 ? "0" + g : g;
    b = b.length == 1 ? "0" + b : b;
    return `#${r}${g}${b}`;
};

const color_plus_default = c => w => {
    const wc = Math.pow(w, 0.33)
    const wdef = 1 - wc;
    const rgb = [
        Math.round(default_color[0] * wdef + c[0] * wc),
        Math.round(default_color[1] * wdef + c[1] * wc),
        Math.round(default_color[2] * wdef + c[2] * wc)
    ];
    return rbg_to_hex(rgb);
};

export const red_plus_default = color_plus_default(red);

export const green_plus_default = color_plus_default(green);

const default_style = `fill:${rbg_to_hex(default_color)}`;
const unstyle_svg_path = el => el.setAttribute('style', default_style);

export const world_map_colorer = svg => {
    // see world-map.svg
    const path_els = [];

    const els_of_id = id => {
        const el = svg.getElementById(id);
        if (!el) {
            return [];
        }
        return el.tagName === 'path' ? [el] : el.getElementsByTagName('path');
    };

    return o => {
        for (const el of path_els) {
            unstyle_svg_path(el);
        }

        path_els.length = 0;

        for (const [id, style] of o) {
            for (const el of els_of_id(id)) {
                style_svg_path(el, style);
                path_els.push(el);
            }
        }
    };
};

export const table_of_array = xs => {
    const s = ['<table>'];
    for (let x of xs) {
        let row = ['<tr>'];
        for (let col of x) {
            row.push(`<td>${col}</td>`);
        }
        row.push('</tr>');
        s.push(row.join(''));
    }
    s.push("</table>")
    return s.join('');
};

export const ul_of_array = xs => {
    const s = ['<ul>'];
    for (let x of xs) {
        s.push(`<li>${x}</li>`);
    }
    s.push('</ul>');
    return s.join('');
};