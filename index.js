const onload = () => {
  const ztoggle = document.getElementById("ztoggle");
  const container = document.getElementsByClassName("container")[0];
  let flag = false;
  ztoggle.onclick = () => {
    flag
      ? container.classList.remove("fillwidth", "pad-lr")
      : container.classList.add("fillwidth", "pad-lr");
    flag = !flag;
  };
};

onload();
