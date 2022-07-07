/*
 * goal of this transformer:
 * - take .md files, use pandoc to convert them into equivalent .pug files
 * - include any necessary dependencies such as katex css+js
 *
 */
const { Transformer } = require("@parcel/plugin");
const { JSDOM } = require('jsdom');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const process = require('process');

const latex_macros = {
  '\\R': '\\mathbb{R}',
  '\\Nuzero': '\\mathbb{N}\\cup\\lbrace 0 \\rbrace',
  '\\N': '\\mathbb{N}',
  '\\vec': '\\bm{#1}',
  '\\matrix': '\\underline{\\underline{#1}}',
  '\\prob': '\\mathbb{P}',
  '\\d': '\\mathrm{d}',
  '\\pdiff': '\\frac{\\partial{#1}}{\\partial{#2}}',
};

const html_of_md = ({md, md_dir, metadata}) => {
  // lua filter path must be relative to the md dir, because
  // the working dir of the pandoc process is the md dir
  const lua_include_code_filter = path.relative(md_dir, 'lua-filters/include-code-files.lua');
  const lua_include_file_filter = path.relative(md_dir, 'lua-filters/include-files.lua');
  const use_katex = metadata.hasOwnProperty("katex") && metadata["katex"];
  const child = spawnSync(
    "pandoc",
    ["--from", "markdown+footnotes-markdown_in_html_blocks",
     `--lua-filter=${lua_include_code_filter}`,
     `--lua-filter=${lua_include_file_filter}`,
     "--to", "html5",
     use_katex ? "--katex" : "",
     "--standalone",
    ],
    { input: md,
      cwd: md_dir
    }
  );
  if (child.error) {
    const err = `pandoc conversion failed: ${child.error}`;
    throw new Error(err);
  }
  return child.stdout.toString();
};

const body_of_html = html => {
  const dom = new JSDOM(html);
  const body = dom.window.document.getElementsByTagName('body')[0];
  return body.innerHTML;
};

const with_pipes = (s, {indent_size} = {indent_size: 2}) => {
  const indent = ' '.repeat(indent_size);
  const res = s.replace(/\n/g, `\n${indent}| `);
  return `${indent}| ${res}`;
};

const split_md = md => {
  // TODO make this lenient parser less lenient...
  const splits = md.split('\n');
  let in_metadata = false;
  const metadata = {}
  const content = [];
  for (let i = 0; i < splits.length; i++) {
    const s = splits[i];
    if (s === '---' || s === '+++') {
      in_metadata = !in_metadata
    }
    else if (in_metadata) {
      const [k, v] = s.split(':').map(x => x.trim());
      metadata[k] = v;
    } else {
      content.push(s);
    }
  }

  return {'metadata': metadata,
          'md_content' : content.join('\n')
         }
};

const pug_of_md = ({md_blob, css_file, md_dir}) => {
  const {metadata, md_content} = split_md(md_blob);
  const html = html_of_md({md:md_content, md_dir, metadata});
  const body = body_of_html(html);
  const content = with_pipes(body);
  const extra_css = !css_file ?  '' :
  `
  | <link
  |    rel="stylesheet"
  |    type="text/css"
  |    href="${css_file}"
  | />`;
  const is_katex = metadata['katex'] === 'true'; // TODO detect
  const katex =  !is_katex ?  '' :
  `
  | <link
  |   rel="stylesheet"
  |   href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
  |   integrity="sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc"
  |   crossorigin="anonymous"
  | />
  | <style>
  | /* this handles overflowing equations (mainly for mobile) */
  | .katex-display > .katex {
  |   max-width: 100%;
  | }
  | .katex-display > .katex > .katex-html {
  |   max-width: 100%;
  |   overflow-x: auto;
  |   overflow-y: hidden;
  |   padding-left: 2px;
  |   padding-right: 2px;
  |   padding-top: 2px;
  |   padding-bottom: 2px;
  | }
  | .katex {
  |   font-size: 1em;
  | }
  | </style>
  | <script
  |   defer
  |   src="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.js"
  |   integrity="sha384-YNHdsYkH6gMx9y3mRkmcJ2mFUjTd0qNQQvY9VYZgQd7DcN7env35GzlmFaZ23JGp"
  |   crossorigin="anonymous"
  | ></script>
  | <script>
  |   document.addEventListener("DOMContentLoaded", function () {
  |     var mathElements = document.getElementsByClassName("math");
  |     for (var i = 0; i < mathElements.length; i++) {
  |       var texText = mathElements[i].firstChild;
  |       if (mathElements[i].tagName == "SPAN") {
  |         katex.render(texText.data, mathElements[i], {
  |           displayMode: mathElements[i].classList.contains("display"),
  |           throwOnError: false,
  |           macros: ${JSON.stringify(latex_macros)}
  |         });
  |       }
  |     }
  |   });
  | </script>`;

  const head_extra =`
block head-extra${extra_css}${katex}
`;
  const res = `
extends ../../layout.pug

${head_extra}

block content
${content}`;
  return res;
};

const get_css_file = (asset_dir) => {
  let css_file = path.join(asset_dir, 'index.css');
  if (!fs.existsSync(css_file)) {
    return undefined;
  }
  return './index.css';
}

const transformer = new Transformer({
  async transform({ asset }) {
    const asset_dir = path.dirname(asset.filePath);
    const css_file = get_css_file(asset_dir);
    const content = await asset.getCode();
    asset.type = "pug";
    const pug = pug_of_md({md_blob:content, css_file, md_dir:asset_dir});
    asset.setCode(pug);
    asset.filePath = path.join(asset_dir, 'index.pug');
    return [asset];
  },
});

exports.default = transformer;
