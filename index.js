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
};

onload();
