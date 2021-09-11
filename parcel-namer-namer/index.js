const Namer = require('@parcel/plugin').Namer;
const process = require('process');

// this is a hack to stop parcel putting index.js + index.css in silly places
const namer = new Namer({
  async name({bundle}) {
    const assets = bundle.getEntryAssets();
    if (assets.length === 1) {
      const asset = assets[0];
      if (asset.filePath === process.cwd() + "/index.js") {
        return `/index.${bundle.hashReference}.js`;
      }
      if (asset.filePath === process.cwd() + "/index.css") {
        return `/index.${bundle.hashReference}.css`;
      }
    }

    // hand naming decision to the default parcel namer
    return null;
  },
});

exports.default = namer;