# sitegen

This repo contains:

- a static site generator, based on parcel.js
- some content (hosted [here](https://lippirk.github.io))

## Motivation

I wanted a static site generator which:

- supports Markdown with Pandoc extensions (i.e. we can use latex)
- allows the use of raw HTML and JS when required (e.g. for interactivity,
  animations)
- is flexible and not opinionated

I tried standard solutions: [Hakyll](https://github.com/jaspervdj/hakyll),
[Hugo](https://github.com/gohugoio/hugo) and
[Zola](https://github.com/getzola/zola). I found that Hakyll was not flexible
and the internals are too complex; Hugo probably would have worked, but I might
have had to learn Go, and also [its Pandoc support isn't
perfect](https://github.com/gohugoio/hugo/issues/8152); Zola was not flexible
and didn't support raw HTML.

Parcel.js on the other hand is very flexible, and supports a lot out of the box.
The only necessary thing to implement (so far) was Pandoc support ([see
here](./parcel-transformer-pandoc)). Parcel sometimes generates output with a
strange file tree structure, but you can hack around this ([see
here](./parcel-namer-namer)).

## Design

`make build` tells parcel to convert index.pug into index.html. Internally
parcel will recursively handle any linked items (JS, HTML pages, svgs, md, etc.)
and everything is bundled into `./build`.

We use Pug rather than raw HTML because it allows easy templating; the template
for all pages is defined by [layout.pug](./layout.pug). Pug is handy because it
  supports raw HTML nicely.

`parcel-transformer-pandoc` transforms Markdown into HTML, by first transforming
Markdown into pug, with the parcel pug transformer performing the pug to HTML
transformation.

## Testing

I try to test the output with [Brave](https://brave.com/), Chrome and Firefox.
