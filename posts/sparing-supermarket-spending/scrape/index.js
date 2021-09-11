const process = require("process");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { eq_objs_dirty, dp } = require("myprelude");

const in_ = "tesco-items.reduced.json";
const out_ = "data.reduced.json";

const litre_conversions = {
  // 1 litre of X in kg
  "coconut-milk": 0.964,
  milk: 1.04,
  "stella-artois": 1.01,
};

const read_json_file = (path) => {
  const f = fs.readFileSync(path);
  return JSON.parse(f);
};

const init = async () => {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({ headless: true });
  return browser;
};

const assert = (b, s) => {
  if (!b) {
    throw new Error(`assert: ${s}`);
  }
};

const get_data = async (browser) => {
  const tesco = read_json_file(in_);

  res = [];
  for (const o of tesco) {
    const display_name = Object.keys(o)[0];
    const name = display_name.split(" ").join("-");
    const path = `./raw-html/${name}.html`;
    let html = undefined;
    if (fs.existsSync(path)) {
      html = fs.readFileSync(path);
    } else {
      const url = o[display_name];
      console.log(`obtaining html for ${name}... url=${url}`);
      const page = await browser.newPage();
      await page.goto(url);
      html = await page.content();
      fs.writeFileSync(path, html);
    }
    const obj = {
      display_name: display_name,
      name: name,
      html: fs.readFileSync(path),
    };
    res.push(obj);
  }

  return res;
};

// a descent into madness lies below

const extract = (obj) => {
  const dom = new JSDOM(obj.html);
  const pqw = dom.window.document.getElementsByClassName(
    "price-per-quantity-weight"
  )[0];
  const pit = dom.window.document.getElementsByClassName(
    "product__info-table"
  )[0];
  const nc = dom.window.document.getElementById("net-contents");
  const dbg = () => `name=${obj.name}`;

  const currency = pqw.querySelector("span[class=currency]").innerHTML;
  if (currency !== "£") {
    throw new Error(`unexpected currency! ${dbg()}`);
  }

  const price_per_unit = Number(
    pqw.querySelector("span[data-auto=price-value]").innerHTML
  );

  // | 50g
  // | each
  // | 100ml
  // | ...
  let per_unit = pqw.querySelector("span[class=weight]").innerHTML;
  if (per_unit.startsWith("/")) {
    per_unit = per_unit.slice(1);
  }

  const get_nutrition = () => {
    if (!pit) {
      console.log(`no product info table. ${dbg()}`);
      return undefined;
    }
    const trs = pit.querySelector("thead").querySelector("tr").childNodes;
    if (!trs || trs.length < 2) {
      console.log(`no nutrition table for ${dbg()}`);
      return undefined;
    }

    const n_cols = trs.length;
    const col_names = [];
    for (let i = 1; i < n_cols; i++) {
      col_names.push(trs[i].innerHTML);
    }
    const nutrition = {
      col_names: col_names,
    };

    for (const tr of pit.querySelector("tbody").children) {
      const cols = [];
      const cns = tr.childNodes;
      for (let i = 1; i < n_cols; i++) {
        cols.push(cns[i].innerHTML);
      }
      const nutrient = cns[0].innerHTML.trim();
      nutrition[nutrient] = cols;
    }

    return nutrition;
  };

  const get_net_contents = () => {
    if (!nc) {
      console.log(`no net contents. ${dbg()}`);
      return undefined;
    } else {
      const x = nc.querySelector(
        "p[class=product-info-block__content]"
      ).innerHTML;
      const spl1 = x.split(" e");
      const spl2 = x.split(" ℮");
      if (spl1.length === 2) {
        return spl1[0];
      } else if (spl2.length === 2) {
        return spl2[0];
      }
      return x;
    }
  };

  const res = {
    ...obj,
    per_unit: per_unit,
    price_per_unit: price_per_unit,
    nutrition: get_nutrition(),
    net_contents: get_net_contents(),
  };
  delete res.html;

  return res;
};

const parse = (obj) => {
  const extract_per_num_gram = (x) => {
    let g = undefined;
    const re = /per (\d+)g.*/i;
    const res = re.exec(x);
    if (res) {
      g = res[1];
    }

    const re2 = /[^\d]*(\d+)g (contains|includes)?/i;
    const res2 = re2.exec(x);
    if (res2) {
      g = res2[1];
    }

    g = Number(g);
    assert(g > 0, "g > 0");
    return g;
  };

  const extract_per_num_ml = (x) => {
    let ml = undefined;
    const re = /per (\d+)ml.*/i;
    const res = re.exec(x);
    if (res) {
      ml = res[1];
    }

    const re2 = /[^\d]*(\d+)ml (contains|includes)?/i;
    const res2 = re2.exec(x);
    if (res2) {
      ml = res2[1];
    }

    ml = Number(ml);
    assert(ml > 0, "g > 0");
    return ml;
  };

  const extract_num_kJ = (x) => {
    const re = /([0-9]+.?[0-9]*)kJ.*/i;
    const res = re.exec(x);
    if (res) {
      return Number(res[1]);
    }
    return undefined;
  };

  const extract_num_gram = (x) => {
    if (x === '.00') {
      return 0;
    }
    const re = /([0-9]+.?[0-9]*)g/i;
    const res = re.exec(x);
    if (res) {
      return Number(res[1]);
    }

    // typically '<0.01g'
    const re2 = /&lt;([0-9]+.?[0-9]*)g/i;
    const res2 = re2.exec(x);
    if (res2) {
      return 0;
    }

    return undefined;
  };

  const get_price_and_unit = () => {
    if (obj.per_unit === "kg") {
      return { price: obj.price_per_unit, unit: "kg", orig_unit: "kg" };
    }

    if (obj.per_unit === "litre") {
      return {
        price: obj.price_per_unit / litre_conversions[obj.name],
        unit: "kg",
        orig_unit: "litre",
      };
    }

    const num_gram = extract_num_gram(obj.per_unit);
    assert(!Number.isNaN(num_gram), "num_gram is nan");
    if (num_gram && num_gram > 0) {
      return {
        price: (obj.price_per_unit * 1000) / num_gram,
        unit: "kg",
        orig_unit: "g",
      };
    }

    if (obj.name === "eggs") {
      // one egg weighs ~ 60g
      return {
        price: (obj.price_per_unit / 60) * 1000,
        unit: "kg",
        orig_unit: obj.per_unit,
      };
    }

    if (obj.name === "garlic-bulb") {
      // one clove weighs ~ 6g
      // one bulb contains ~ 10 cloves
      return {
        price: (obj.price_per_unit / 60) * 1000,
        unit: "kg",
        orig_unit: obj.per_unit,
      };
    }

    if (obj.name === "cauliflower") {
      // one head weighs ~ 580g
      return {
        price: (obj.price_per_unit / 580) * 1000,
        unit: "kg",
        orig_unit: obj.per_unit,
      };
    }

    throw new Error(`get_price_and_unit: ${JSON.stringify(obj)}`);
  };

  const get_nutrition = ({ orig_unit, unit, price }) => {
    if (obj.name === "salt") {
      assert(unit === "kg", "salt in kg");
      return { salt: 1 };
    }

    const get_col = (col, v) => {
      const f = (x) => {
        if (obj.nutrition[x]) {
          return obj.nutrition[x][col];
        }
        return undefined;
      };
      if (typeof v === "string") {
        return f(v);
      } else if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++) {
          let res = f(v[i]);
          if (res) return res;
        }
        return undefined;
      }
      throw new Error("expected v to be string or array");
    };

    const nutrients_of = (extract_num, ratio, col) => {
      const salt = extract_num(get_col(col, "Salt")) * ratio;
      assert(
        salt !== undefined && !Number.isNaN(salt),
        `salt not undefined, ${JSON.stringify(obj)}`
      );

      const fat = extract_num(get_col(col, "Fat")) * ratio;
      assert(
        fat !== undefined && !Number.isNaN(fat),
        `fat not undefined, ${JSON.stringify(obj)}`
      );

      const protein = extract_num(get_col(col, "Protein")) * ratio;
      assert(
        protein !== undefined && !Number.isNaN(protein),
        `protein not undefined, ${JSON.stringify(obj)}`
      );

      let fibre = undefined;
      const fibre_ = get_col(col, "Fibre");
      if (fibre_) {
        fibre = extract_num(fibre_) * ratio;
        assert(
          fibre !== undefined && !Number.isNaN(fibre),
          `fibre not undefined, ${JSON.stringify(obj)}`
        );
      } else {
        fibre = 0;
      }

      const carb =
        extract_num(get_col(col, ["Carbohydrate", "Carbohydrates"])) * ratio;
      assert(
        carb !== undefined && !Number.isNaN(carb),
        `carb not undefined, ${JSON.stringify(obj)}`
      );

      const sugar =
        extract_num(
          get_col(col, [
            "Sugars",
            "of which sugars",
            "- of which Sugars",
            "of which Sugars",
            "sugars",
          ])
        ) * ratio;
      assert(
        sugar !== undefined && !Number.isNaN(sugar),
        `sugar not undefined, ${JSON.stringify(obj)}`
      );

      const saturated_fat =
        extract_num(
          get_col(col, [
            "of which saturates",
            "saturates",
            "of which Saturates",
            "Saturates",
            "- of which Saturates",
          ])
        ) * ratio;
      assert(
        saturated_fat !== undefined && !Number.isNaN(saturated_fat),
        `saturated_fat not undefined, ${JSON.stringify(obj)}`
      );

      const energy =
        extract_num_kJ(get_col(col, ["Energy", "Energy - kJ", "Energy kJ"])) *
        ratio;
      assert(
        energy !== undefined && !Number.isNaN(energy),
        `energy not undefined, ${JSON.stringify(obj)}`
      );

      const zero_dp = (x) => Number(dp(x, 0).replace(/,/g, ""));

      return {
        salt: zero_dp(salt, 0),
        fat: zero_dp(fat, 0),
        protein: zero_dp(protein, 0),
        fibre: zero_dp(fibre, 0),
        carb: zero_dp(carb, 0),
        sugar: zero_dp(sugar, 0),
        saturated_fat: zero_dp(saturated_fat, 0),
        // energy is implicitly in kJ
        energy: zero_dp(energy, 0),
      };
    };

    if (orig_unit === "litre") {
      const col = 0;
      const num_ml = extract_per_num_ml(obj.nutrition.col_names[col]);
      const ratio = 1000 / num_ml / litre_conversions[obj.name];
      return nutrients_of(extract_num_gram, ratio, col);
    } else if (unit === "kg") {
      const col = 0;
      const num_gram = extract_per_num_gram(obj.nutrition.col_names[col]);
      const ratio = 1000 / num_gram;
      return nutrients_of(extract_num_gram, ratio, col);
    }
    throw new Error(`don't know what to do with ${obj.name}`);
  };

  const price_and_unit = get_price_and_unit();
  let price = Number(dp(price_and_unit.price, 2));

  const res = {
    ...price_and_unit,
    ...get_nutrition(price_and_unit),
    name: obj.name,
    display_name: obj.display_name,
    price,
  };

  return res;
};

const test = (xs) => {
  const expected_bread = {
    price: 1.2,
    unit: "kg",
    orig_unit: "g",
    salt: 9,
    fat: 17,
    protein: 87,
    fibre: 24,
    carb: 446,
    sugar: 35,
    saturated_fat: 3,
    energy: 9870,
    name: "bread",
    display_name: "bread",
  };

  const expected_coconut_milk = {
    price: 2.21,
    unit: "kg",
    orig_unit: "litre",
    salt: 1,
    fat: 156,
    protein: 9,
    fibre: 0,
    carb: 33,
    sugar: 20,
    saturated_fat: 135,
    energy: 6483,
    name: "coconut-milk",
    display_name: "coconut milk",
  };

  const get = (name) => {
    for (let i = 0; i < xs.length; i++) {
      if (xs[i].name === name) {
        return xs[i];
      }
    }
    return undefined;
  };

  assert(eq_objs_dirty(expected_bread, get("bread")), "bread not right");
  assert(
    eq_objs_dirty(expected_coconut_milk, get("coconut-milk")),
    "coconut milk not right"
  );
};

const main = async () => {
  try {
    const browser = await init();
    const objs = await get_data(browser);

    const xs = [];
    for (const obj of objs) {
      const ex_obj = extract(obj);
      const parsed = parse(ex_obj);
      console.log(parsed);
      xs.push(parsed);
    }

    test(xs);

    fs.writeFileSync(out_, JSON.stringify(xs));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

main();
