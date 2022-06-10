import hljs from "highlight.js";
hljs.registerLanguage('julia', require('highlight.js/lib/languages/julia'));
hljs.registerLanguage('js', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('r', require('highlight.js/lib/languages/r'));
import 'highlight.js/styles/stackoverflow-light.css';

const onload = () => {
  // Z button
  const ztoggle = document.getElementById("ztoggle");
  const container = document.getElementsByClassName("container")[0];
  let flag = false;
  ztoggle.onclick = () => {
    flag
      ? container.classList.remove("fillwidth", "pad-lr")
      : container.classList.add("fillwidth", "pad-lr");
    flag = !flag;
  };

  // inlinegraph figure css
  const inlinegraphs = document.getElementsByClassName("inlinegraph");
  for(let el of inlinegraphs) {
    if (el.tagName === "IMG" && el.parentElement.tagName === "FIGURE") {
      el.parentElement.classList.add("inlinegraphfig")
    }
  }

  // highlight.js
  hljs.highlightAll();
};

onload();
