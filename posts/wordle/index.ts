import { five_letter_words } from "./five_letter_words";

const debug = (s: string) => {
  const DEBUG = false;
  if (DEBUG) {
    console.log(s);
  }
};

const num_five_letter_words = five_letter_words.length;

type char = string;

type color = "green" | "yellow" | "grey" | "none";

type update_resp = { input_colors: Array<color>; m: Map<char, color> };

type word_resp = "invalid" | "correct" | update_resp;

const prng = (() => {
  let seed_ = 0;

  const seed = (n: number) => {
    seed_ = n;
    if (seed_ <= 0) seed_ += 2147483646;
  };

  // random int \in [min, max)
  const int = (min: number, max: number) => {
    // seed_ is a pseudo-random value between 1 and 2^32 - 2
    seed_ = (seed_ * 16807) % 2147483647;

    const diff = max - min;
    return ((seed_ - 1) % diff) + min;
  };

  return { int, seed };
})();

const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const word_len = 5;

const num_words = 6;

const backend = (() => {
  let secret_word = "";

  const db = window.localStorage;

  const is_valid_word = (w: string) => {
    const is_in_dict = five_letter_words.includes(w);
    return is_in_dict && w.length === word_len;
  };

  const enter = (w: string): word_resp => {
    if (w === secret_word) {
      return "correct";
    }

    if (!is_valid_word(w)) {
      return "invalid";
    }

    const input_colors = new Array<color>(w.length);
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      let color = "grey";
      if (secret_word[i] === c) {
        color = "green";
      } else if (secret_word.includes(c)) {
        color = "yellow";
      }
      input_colors[i] = <color>color;
    }

    // bit hacky
    const m = new Map<char, color>();
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      if (!secret_word.includes(c)) {
        m.set(c, "grey");
      } else if (
        secret_word[i] === c &&
        (!m.get(c) || (m.get(c) && m.get(c) === "green"))
      ) {
        m.set(c, "green");
      } else if (secret_word.includes(c)) {
        m.set(c, "yellow");
      }
    }
    return { input_colors, m };
  };

  const today = new Date();
  const today_int = Number(
    `${today.getUTCFullYear()}${today.getUTCMonth()}${today.getUTCDate()}`
  );

  const reset = (bump_counter: boolean) => {
    const ri = prng.int(0, num_five_letter_words);
    secret_word = five_letter_words[ri];
    debug(`backend.init: secret=${secret_word}`);
    if (db && bump_counter) {
      const ctr = Number(db.getItem(today_int.toString()) || "0");
      db.setItem(today_int.toString(), (ctr + 1).toString());
    }
  };

  const init = (() => {
    prng.seed(today_int);

    // generate consistent words!
    if (db) {
      const ctr = Number(db.getItem(today_int.toString()) || "0");
      debug(`backend.init: ctr=${ctr}`);
      for (let i = 0; i < ctr; i++) {
        prng.int(0, num_five_letter_words);
      }
    }
  })();

  return {
    reset,
    enter,
    get_secret_word: () => secret_word,
  };
})();

const ui = (() => {
  const alphabet_key_map = new Map(
    alphabet.map((x) => [
      x,
      <HTMLDivElement>document.getElementById(`key-${x}`),
    ])
  );

  const reset_button = <HTMLButtonElement>document.getElementById("reset-btn");

  const box_els: Array<Array<HTMLDivElement>> = [
    "inp-1",
    "inp-2",
    "inp-3",
    "inp-4",
    "inp-5",
    "inp-6",
  ].map((id) =>
    Array.from(document.querySelectorAll<HTMLDivElement>(`#${id} > .input-box`))
  );

  let done = false;
  let ptr: Array<number> = [0, 0];
  let current_word = [];
  const is_current_word_full = () => current_word.length >= word_len;

  const ptr_next_char = () => {
    if (ptr[1] === word_len) {
      // do nothing
    } else {
      ptr[1] += 1;
    }
  };

  const ptr_prev_char = () => {
    if (ptr[1] === 0) {
      // do nothing
    } else {
      ptr[1] -= 1;
    }
  };

  const ptr_next_word = () => {
    ptr[0] += 1;
    ptr[1] = 0;
  };

  const with_ptr_box = (f: (el: HTMLDivElement) => void) => {
    const el = box_els[ptr[0]][ptr[1]];
    f(el);
  };

  const set_box_text = (c: string) =>
    with_ptr_box((el) => (el.innerText = c.toUpperCase()));

  const bsp = () => {
    current_word.pop();
    ptr_prev_char();
    set_box_text("");
  };

  const letter = (c: char) => {
    set_box_text(c);
    current_word.push(c);
    ptr_next_char();
  };

  const update_key_color = (c: char, color: color) => {
    const key = alphabet_key_map.get(c);
    key.style.background = color;
  };

  const reset = (is_init: boolean) => {
    done = false;
    reset_button.disabled = true;
    reset_button.innerText = "Try to guess the five letter word!";

    backend.reset(!is_init);
    ptr = [0, 0];
    current_word = [];
    alphabet.forEach((c) => update_key_color(c, "none"));

    for (let i = 0; i < word_len; i++) {
      for (let j = 0; j < num_words; j++) {
        box_els[j][i].style.background = "none";
        box_els[j][i].innerText = "";
      }
    }
  };

  const on_correct_word = (row: number) => {
    for (let i = 0; i < word_len; i++) {
      box_els[row][i].style.background = "green";
    }

    done = true;
    reset_button.disabled = false;
    reset_button.innerText = "Well done! Try again?";
  };

  const on_incorrect_valid_word = (
    cw: string,
    row: number,
    resp: update_resp
  ) => {
    for (let i = 0; i < word_len; i++) {
      box_els[row][i].style.background = resp.input_colors[i];
    }

    for (const [c, color] of resp.m.entries()) {
      update_key_color(c, color);
    }

    ptr_next_word();

    if (ptr[0] >= num_words) {
      // game over, unsuccessful
      done = true;
      reset_button.disabled = false;
      reset_button.innerText = `The word was ${backend
        .get_secret_word()
        .toUpperCase()}! Try again?`;
    }
    current_word = [];
  };

  const on_key_press_evt = (e: KeyboardEvent) => on_key_press(e.key);
  const on_key_press = (key: string) => {
    if (done) return; // only thing user can do is reset game
    const cwf = is_current_word_full();
    if (key === "Enter") {
      if (cwf) {
        const row = ptr[0];
        const cw = current_word.join("");
        const resp = backend.enter(cw);
        if (resp === "correct") {
          on_correct_word(row);
        } else if (resp === "invalid") {
          // do nothing
        } else {
          on_incorrect_valid_word(cw, row, resp);
        }
      }
    } else if (key === "Backspace") {
      bsp();
    } else if (/[a-zA-Z]/.test(key) && key.length === 1) {
      if (!cwf) letter(key.toLowerCase());
    }
  };

  const init = (() => {
    // bind functions to ui
    document.addEventListener("keydown", on_key_press_evt);
    alphabet.forEach(
      (x) =>
        (document.getElementById(`key-${x}`).onclick = (_) => on_key_press(x))
    );
    document.getElementById("key-bsp").onclick = (_) =>
      on_key_press("Backspace");
    document.getElementById("key-enter").onclick = (_) => on_key_press("Enter");
    reset_button.onclick = (_) => reset(false);

    // new game
    reset(true);
  })();
})();
