---
title: Migrant Stock Monte Carlo
date: 07-28-2021
katex: true
---

# Migrant Stock Monte Carlo

## What?

Ranking countries by popularity among migrants.

## Why?

Suppose you want to emigrate from your native country, and would like to make a
shortlist of candidate destinations. How useful are frequently quoted high-level
metrics, such as GDP or happiness?

If you are not highly motivated by money, then GDP may not be too helpful.  On
the other hand, knowing how happy a country's residents are is a great
indicator, but existing data on this topic may not be so reliable because
happiness is so difficult to quantify.

I propose that we can trust what migrants have to say on the matter (in the
aggregate). After all, they have skin in the game and live by their
conviction. It is not difficult to convince oneself that the majority of
migrants migrate because they believe it will lead to a better quality of life
(aid workers are one exception of course). A __migrant metric__, a measure of
how likely migrants are to flock to a country, should give us a good idea about
which countries have a good quality of life and which do not, and therefore help
us decide where to emigrate to (or at the very least where _not_ to emigrate to).


## Simulation

We'll simulate a nomad who moves randomly from
country to country. Each time he visits a country, that country gets a point.
The more points a country gets, the more that our nomad likes that country.

The probabilities with which the nomad transitions from country to country are
chosen such that the nomad is representative of an average 'real world' migrant.
(Exactly how the nomad works is defined [below](#mathematical-setup).)

Start the simulation to see the migrant metric! As the number of iterations (aka
migrant hops) gets larger, we see the ranking settle down.

<div>
<form id="nomad-sim-form">
<button id="nomad-sim-button">START</button>
<input id="nomad-sim-slider" type="range" min="1" max="1000" value="1"></input>
<label for="nomad-sim-slider">Iterations: 0</label>
</form>
<svg version="1.1"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     style="width: 100%"
     id="nomad-sim">
<image id="flag-af" xlink:href="/assets/flags/4x3/af.svg" width="0px" height="0px"></image>
<image id="flag-al" xlink:href="/assets/flags/4x3/al.svg" width="0px" height="0px"></image>
<image id="flag-dz" xlink:href="/assets/flags/4x3/dz.svg" width="0px" height="0px"></image>
<image id="flag-as" xlink:href="/assets/flags/4x3/as.svg" width="0px" height="0px"></image>
<image id="flag-ad" xlink:href="/assets/flags/4x3/ad.svg" width="0px" height="0px"></image>
<image id="flag-ao" xlink:href="/assets/flags/4x3/ao.svg" width="0px" height="0px"></image>
<image id="flag-ai" xlink:href="/assets/flags/4x3/ai.svg" width="0px" height="0px"></image>
<image id="flag-ag" xlink:href="/assets/flags/4x3/ag.svg" width="0px" height="0px"></image>
<image id="flag-ar" xlink:href="/assets/flags/4x3/ar.svg" width="0px" height="0px"></image>
<image id="flag-am" xlink:href="/assets/flags/4x3/am.svg" width="0px" height="0px"></image>
<image id="flag-aw" xlink:href="/assets/flags/4x3/aw.svg" width="0px" height="0px"></image>
<image id="flag-au" xlink:href="/assets/flags/4x3/au.svg" width="0px" height="0px"></image>
<image id="flag-at" xlink:href="/assets/flags/4x3/at.svg" width="0px" height="0px"></image>
<image id="flag-az" xlink:href="/assets/flags/4x3/az.svg" width="0px" height="0px"></image>
<image id="flag-bs" xlink:href="/assets/flags/4x3/bs.svg" width="0px" height="0px"></image>
<image id="flag-bh" xlink:href="/assets/flags/4x3/bh.svg" width="0px" height="0px"></image>
<image id="flag-bd" xlink:href="/assets/flags/4x3/bd.svg" width="0px" height="0px"></image>
<image id="flag-bb" xlink:href="/assets/flags/4x3/bb.svg" width="0px" height="0px"></image>
<image id="flag-by" xlink:href="/assets/flags/4x3/by.svg" width="0px" height="0px"></image>
<image id="flag-be" xlink:href="/assets/flags/4x3/be.svg" width="0px" height="0px"></image>
<image id="flag-bz" xlink:href="/assets/flags/4x3/bz.svg" width="0px" height="0px"></image>
<image id="flag-bj" xlink:href="/assets/flags/4x3/bj.svg" width="0px" height="0px"></image>
<image id="flag-bm" xlink:href="/assets/flags/4x3/bm.svg" width="0px" height="0px"></image>
<image id="flag-bt" xlink:href="/assets/flags/4x3/bt.svg" width="0px" height="0px"></image>
<image id="flag-bo" xlink:href="/assets/flags/4x3/bo.svg" width="0px" height="0px"></image>
<image id="flag-bq" xlink:href="/assets/flags/4x3/bq.svg" width="0px" height="0px"></image>
<image id="flag-ba" xlink:href="/assets/flags/4x3/ba.svg" width="0px" height="0px"></image>
<image id="flag-bw" xlink:href="/assets/flags/4x3/bw.svg" width="0px" height="0px"></image>
<image id="flag-br" xlink:href="/assets/flags/4x3/br.svg" width="0px" height="0px"></image>
<image id="flag-vg" xlink:href="/assets/flags/4x3/vg.svg" width="0px" height="0px"></image>
<image id="flag-bn" xlink:href="/assets/flags/4x3/bn.svg" width="0px" height="0px"></image>
<image id="flag-bg" xlink:href="/assets/flags/4x3/bg.svg" width="0px" height="0px"></image>
<image id="flag-bf" xlink:href="/assets/flags/4x3/bf.svg" width="0px" height="0px"></image>
<image id="flag-bi" xlink:href="/assets/flags/4x3/bi.svg" width="0px" height="0px"></image>
<image id="flag-cv" xlink:href="/assets/flags/4x3/cv.svg" width="0px" height="0px"></image>
<image id="flag-kh" xlink:href="/assets/flags/4x3/kh.svg" width="0px" height="0px"></image>
<image id="flag-cm" xlink:href="/assets/flags/4x3/cm.svg" width="0px" height="0px"></image>
<image id="flag-ca" xlink:href="/assets/flags/4x3/ca.svg" width="0px" height="0px"></image>
<image id="flag-ky" xlink:href="/assets/flags/4x3/ky.svg" width="0px" height="0px"></image>
<image id="flag-cf" xlink:href="/assets/flags/4x3/cf.svg" width="0px" height="0px"></image>
<image id="flag-td" xlink:href="/assets/flags/4x3/td.svg" width="0px" height="0px"></image>
<image id="flag-cl" xlink:href="/assets/flags/4x3/cl.svg" width="0px" height="0px"></image>
<image id="flag-cn" xlink:href="/assets/flags/4x3/cn.svg" width="0px" height="0px"></image>
<image id="flag-hk" xlink:href="/assets/flags/4x3/hk.svg" width="0px" height="0px"></image>
<image id="flag-mo" xlink:href="/assets/flags/4x3/mo.svg" width="0px" height="0px"></image>
<image id="flag-co" xlink:href="/assets/flags/4x3/co.svg" width="0px" height="0px"></image>
<image id="flag-km" xlink:href="/assets/flags/4x3/km.svg" width="0px" height="0px"></image>
<image id="flag-cg" xlink:href="/assets/flags/4x3/cg.svg" width="0px" height="0px"></image>
<image id="flag-ck" xlink:href="/assets/flags/4x3/ck.svg" width="0px" height="0px"></image>
<image id="flag-cr" xlink:href="/assets/flags/4x3/cr.svg" width="0px" height="0px"></image>
<image id="flag-ci" xlink:href="/assets/flags/4x3/ci.svg" width="0px" height="0px"></image>
<image id="flag-hr" xlink:href="/assets/flags/4x3/hr.svg" width="0px" height="0px"></image>
<image id="flag-cu" xlink:href="/assets/flags/4x3/cu.svg" width="0px" height="0px"></image>
<image id="flag-cw" xlink:href="/assets/flags/4x3/cw.svg" width="0px" height="0px"></image>
<image id="flag-cy" xlink:href="/assets/flags/4x3/cy.svg" width="0px" height="0px"></image>
<image id="flag-cz" xlink:href="/assets/flags/4x3/cz.svg" width="0px" height="0px"></image>
<image id="flag-kp" xlink:href="/assets/flags/4x3/kp.svg" width="0px" height="0px"></image>
<image id="flag-cd" xlink:href="/assets/flags/4x3/cd.svg" width="0px" height="0px"></image>
<image id="flag-dk" xlink:href="/assets/flags/4x3/dk.svg" width="0px" height="0px"></image>
<image id="flag-dj" xlink:href="/assets/flags/4x3/dj.svg" width="0px" height="0px"></image>
<image id="flag-dm" xlink:href="/assets/flags/4x3/dm.svg" width="0px" height="0px"></image>
<image id="flag-do" xlink:href="/assets/flags/4x3/do.svg" width="0px" height="0px"></image>
<image id="flag-ec" xlink:href="/assets/flags/4x3/ec.svg" width="0px" height="0px"></image>
<image id="flag-eg" xlink:href="/assets/flags/4x3/eg.svg" width="0px" height="0px"></image>
<image id="flag-sv" xlink:href="/assets/flags/4x3/sv.svg" width="0px" height="0px"></image>
<image id="flag-gq" xlink:href="/assets/flags/4x3/gq.svg" width="0px" height="0px"></image>
<image id="flag-er" xlink:href="/assets/flags/4x3/er.svg" width="0px" height="0px"></image>
<image id="flag-ee" xlink:href="/assets/flags/4x3/ee.svg" width="0px" height="0px"></image>
<image id="flag-sz" xlink:href="/assets/flags/4x3/sz.svg" width="0px" height="0px"></image>
<image id="flag-et" xlink:href="/assets/flags/4x3/et.svg" width="0px" height="0px"></image>
<image id="flag-fk" xlink:href="/assets/flags/4x3/fk.svg" width="0px" height="0px"></image>
<image id="flag-fo" xlink:href="/assets/flags/4x3/fo.svg" width="0px" height="0px"></image>
<image id="flag-fj" xlink:href="/assets/flags/4x3/fj.svg" width="0px" height="0px"></image>
<image id="flag-fi" xlink:href="/assets/flags/4x3/fi.svg" width="0px" height="0px"></image>
<image id="flag-fr" xlink:href="/assets/flags/4x3/fr.svg" width="0px" height="0px"></image>
<image id="flag-gf" xlink:href="/assets/flags/4x3/gf.svg" width="0px" height="0px"></image>
<image id="flag-pf" xlink:href="/assets/flags/4x3/pf.svg" width="0px" height="0px"></image>
<image id="flag-ga" xlink:href="/assets/flags/4x3/ga.svg" width="0px" height="0px"></image>
<image id="flag-gm" xlink:href="/assets/flags/4x3/gm.svg" width="0px" height="0px"></image>
<image id="flag-ge" xlink:href="/assets/flags/4x3/ge.svg" width="0px" height="0px"></image>
<image id="flag-de" xlink:href="/assets/flags/4x3/de.svg" width="0px" height="0px"></image>
<image id="flag-gh" xlink:href="/assets/flags/4x3/gh.svg" width="0px" height="0px"></image>
<image id="flag-gi" xlink:href="/assets/flags/4x3/gi.svg" width="0px" height="0px"></image>
<image id="flag-gr" xlink:href="/assets/flags/4x3/gr.svg" width="0px" height="0px"></image>
<image id="flag-gl" xlink:href="/assets/flags/4x3/gl.svg" width="0px" height="0px"></image>
<image id="flag-gd" xlink:href="/assets/flags/4x3/gd.svg" width="0px" height="0px"></image>
<image id="flag-gp" xlink:href="/assets/flags/4x3/gp.svg" width="0px" height="0px"></image>
<image id="flag-gu" xlink:href="/assets/flags/4x3/gu.svg" width="0px" height="0px"></image>
<image id="flag-gt" xlink:href="/assets/flags/4x3/gt.svg" width="0px" height="0px"></image>
<image id="flag-gn" xlink:href="/assets/flags/4x3/gn.svg" width="0px" height="0px"></image>
<image id="flag-gw" xlink:href="/assets/flags/4x3/gw.svg" width="0px" height="0px"></image>
<image id="flag-gy" xlink:href="/assets/flags/4x3/gy.svg" width="0px" height="0px"></image>
<image id="flag-ht" xlink:href="/assets/flags/4x3/ht.svg" width="0px" height="0px"></image>
<image id="flag-va" xlink:href="/assets/flags/4x3/va.svg" width="0px" height="0px"></image>
<image id="flag-hn" xlink:href="/assets/flags/4x3/hn.svg" width="0px" height="0px"></image>
<image id="flag-hu" xlink:href="/assets/flags/4x3/hu.svg" width="0px" height="0px"></image>
<image id="flag-is" xlink:href="/assets/flags/4x3/is.svg" width="0px" height="0px"></image>
<image id="flag-in" xlink:href="/assets/flags/4x3/in.svg" width="0px" height="0px"></image>
<image id="flag-id" xlink:href="/assets/flags/4x3/id.svg" width="0px" height="0px"></image>
<image id="flag-ir" xlink:href="/assets/flags/4x3/ir.svg" width="0px" height="0px"></image>
<image id="flag-iq" xlink:href="/assets/flags/4x3/iq.svg" width="0px" height="0px"></image>
<image id="flag-ie" xlink:href="/assets/flags/4x3/ie.svg" width="0px" height="0px"></image>
<image id="flag-im" xlink:href="/assets/flags/4x3/im.svg" width="0px" height="0px"></image>
<image id="flag-il" xlink:href="/assets/flags/4x3/il.svg" width="0px" height="0px"></image>
<image id="flag-it" xlink:href="/assets/flags/4x3/it.svg" width="0px" height="0px"></image>
<image id="flag-jm" xlink:href="/assets/flags/4x3/jm.svg" width="0px" height="0px"></image>
<image id="flag-jp" xlink:href="/assets/flags/4x3/jp.svg" width="0px" height="0px"></image>
<image id="flag-jo" xlink:href="/assets/flags/4x3/jo.svg" width="0px" height="0px"></image>
<image id="flag-kz" xlink:href="/assets/flags/4x3/kz.svg" width="0px" height="0px"></image>
<image id="flag-ke" xlink:href="/assets/flags/4x3/ke.svg" width="0px" height="0px"></image>
<image id="flag-ki" xlink:href="/assets/flags/4x3/ki.svg" width="0px" height="0px"></image>
<image id="flag-kw" xlink:href="/assets/flags/4x3/kw.svg" width="0px" height="0px"></image>
<image id="flag-kg" xlink:href="/assets/flags/4x3/kg.svg" width="0px" height="0px"></image>
<image id="flag-la" xlink:href="/assets/flags/4x3/la.svg" width="0px" height="0px"></image>
<image id="flag-lv" xlink:href="/assets/flags/4x3/lv.svg" width="0px" height="0px"></image>
<image id="flag-lb" xlink:href="/assets/flags/4x3/lb.svg" width="0px" height="0px"></image>
<image id="flag-ls" xlink:href="/assets/flags/4x3/ls.svg" width="0px" height="0px"></image>
<image id="flag-lr" xlink:href="/assets/flags/4x3/lr.svg" width="0px" height="0px"></image>
<image id="flag-ly" xlink:href="/assets/flags/4x3/ly.svg" width="0px" height="0px"></image>
<image id="flag-li" xlink:href="/assets/flags/4x3/li.svg" width="0px" height="0px"></image>
<image id="flag-lt" xlink:href="/assets/flags/4x3/lt.svg" width="0px" height="0px"></image>
<image id="flag-lu" xlink:href="/assets/flags/4x3/lu.svg" width="0px" height="0px"></image>
<image id="flag-mg" xlink:href="/assets/flags/4x3/mg.svg" width="0px" height="0px"></image>
<image id="flag-mw" xlink:href="/assets/flags/4x3/mw.svg" width="0px" height="0px"></image>
<image id="flag-my" xlink:href="/assets/flags/4x3/my.svg" width="0px" height="0px"></image>
<image id="flag-mv" xlink:href="/assets/flags/4x3/mv.svg" width="0px" height="0px"></image>
<image id="flag-ml" xlink:href="/assets/flags/4x3/ml.svg" width="0px" height="0px"></image>
<image id="flag-mt" xlink:href="/assets/flags/4x3/mt.svg" width="0px" height="0px"></image>
<image id="flag-mh" xlink:href="/assets/flags/4x3/mh.svg" width="0px" height="0px"></image>
<image id="flag-mq" xlink:href="/assets/flags/4x3/mq.svg" width="0px" height="0px"></image>
<image id="flag-mr" xlink:href="/assets/flags/4x3/mr.svg" width="0px" height="0px"></image>
<image id="flag-mu" xlink:href="/assets/flags/4x3/mu.svg" width="0px" height="0px"></image>
<image id="flag-yt" xlink:href="/assets/flags/4x3/yt.svg" width="0px" height="0px"></image>
<image id="flag-mx" xlink:href="/assets/flags/4x3/mx.svg" width="0px" height="0px"></image>
<image id="flag-fm" xlink:href="/assets/flags/4x3/fm.svg" width="0px" height="0px"></image>
<image id="flag-mc" xlink:href="/assets/flags/4x3/mc.svg" width="0px" height="0px"></image>
<image id="flag-mn" xlink:href="/assets/flags/4x3/mn.svg" width="0px" height="0px"></image>
<image id="flag-me" xlink:href="/assets/flags/4x3/me.svg" width="0px" height="0px"></image>
<image id="flag-ms" xlink:href="/assets/flags/4x3/ms.svg" width="0px" height="0px"></image>
<image id="flag-ma" xlink:href="/assets/flags/4x3/ma.svg" width="0px" height="0px"></image>
<image id="flag-mz" xlink:href="/assets/flags/4x3/mz.svg" width="0px" height="0px"></image>
<image id="flag-mm" xlink:href="/assets/flags/4x3/mm.svg" width="0px" height="0px"></image>
<image id="flag-na" xlink:href="/assets/flags/4x3/na.svg" width="0px" height="0px"></image>
<image id="flag-nr" xlink:href="/assets/flags/4x3/nr.svg" width="0px" height="0px"></image>
<image id="flag-np" xlink:href="/assets/flags/4x3/np.svg" width="0px" height="0px"></image>
<image id="flag-nl" xlink:href="/assets/flags/4x3/nl.svg" width="0px" height="0px"></image>
<image id="flag-nc" xlink:href="/assets/flags/4x3/nc.svg" width="0px" height="0px"></image>
<image id="flag-nz" xlink:href="/assets/flags/4x3/nz.svg" width="0px" height="0px"></image>
<image id="flag-ni" xlink:href="/assets/flags/4x3/ni.svg" width="0px" height="0px"></image>
<image id="flag-ne" xlink:href="/assets/flags/4x3/ne.svg" width="0px" height="0px"></image>
<image id="flag-ng" xlink:href="/assets/flags/4x3/ng.svg" width="0px" height="0px"></image>
<image id="flag-nu" xlink:href="/assets/flags/4x3/nu.svg" width="0px" height="0px"></image>
<image id="flag-mk" xlink:href="/assets/flags/4x3/mk.svg" width="0px" height="0px"></image>
<image id="flag-mp" xlink:href="/assets/flags/4x3/mp.svg" width="0px" height="0px"></image>
<image id="flag-no" xlink:href="/assets/flags/4x3/no.svg" width="0px" height="0px"></image>
<image id="flag-om" xlink:href="/assets/flags/4x3/om.svg" width="0px" height="0px"></image>
<image id="flag-pk" xlink:href="/assets/flags/4x3/pk.svg" width="0px" height="0px"></image>
<image id="flag-pw" xlink:href="/assets/flags/4x3/pw.svg" width="0px" height="0px"></image>
<image id="flag-pa" xlink:href="/assets/flags/4x3/pa.svg" width="0px" height="0px"></image>
<image id="flag-pg" xlink:href="/assets/flags/4x3/pg.svg" width="0px" height="0px"></image>
<image id="flag-py" xlink:href="/assets/flags/4x3/py.svg" width="0px" height="0px"></image>
<image id="flag-pe" xlink:href="/assets/flags/4x3/pe.svg" width="0px" height="0px"></image>
<image id="flag-ph" xlink:href="/assets/flags/4x3/ph.svg" width="0px" height="0px"></image>
<image id="flag-pl" xlink:href="/assets/flags/4x3/pl.svg" width="0px" height="0px"></image>
<image id="flag-pt" xlink:href="/assets/flags/4x3/pt.svg" width="0px" height="0px"></image>
<image id="flag-pr" xlink:href="/assets/flags/4x3/pr.svg" width="0px" height="0px"></image>
<image id="flag-qa" xlink:href="/assets/flags/4x3/qa.svg" width="0px" height="0px"></image>
<image id="flag-kr" xlink:href="/assets/flags/4x3/kr.svg" width="0px" height="0px"></image>
<image id="flag-md" xlink:href="/assets/flags/4x3/md.svg" width="0px" height="0px"></image>
<image id="flag-re" xlink:href="/assets/flags/4x3/re.svg" width="0px" height="0px"></image>
<image id="flag-ro" xlink:href="/assets/flags/4x3/ro.svg" width="0px" height="0px"></image>
<image id="flag-ru" xlink:href="/assets/flags/4x3/ru.svg" width="0px" height="0px"></image>
<image id="flag-rw" xlink:href="/assets/flags/4x3/rw.svg" width="0px" height="0px"></image>
<image id="flag-sh" xlink:href="/assets/flags/4x3/sh.svg" width="0px" height="0px"></image>
<image id="flag-kn" xlink:href="/assets/flags/4x3/kn.svg" width="0px" height="0px"></image>
<image id="flag-lc" xlink:href="/assets/flags/4x3/lc.svg" width="0px" height="0px"></image>
<image id="flag-pm" xlink:href="/assets/flags/4x3/pm.svg" width="0px" height="0px"></image>
<image id="flag-vc" xlink:href="/assets/flags/4x3/vc.svg" width="0px" height="0px"></image>
<image id="flag-ws" xlink:href="/assets/flags/4x3/ws.svg" width="0px" height="0px"></image>
<image id="flag-sm" xlink:href="/assets/flags/4x3/sm.svg" width="0px" height="0px"></image>
<image id="flag-st" xlink:href="/assets/flags/4x3/st.svg" width="0px" height="0px"></image>
<image id="flag-sa" xlink:href="/assets/flags/4x3/sa.svg" width="0px" height="0px"></image>
<image id="flag-sn" xlink:href="/assets/flags/4x3/sn.svg" width="0px" height="0px"></image>
<image id="flag-rs" xlink:href="/assets/flags/4x3/rs.svg" width="0px" height="0px"></image>
<image id="flag-sc" xlink:href="/assets/flags/4x3/sc.svg" width="0px" height="0px"></image>
<image id="flag-sl" xlink:href="/assets/flags/4x3/sl.svg" width="0px" height="0px"></image>
<image id="flag-sg" xlink:href="/assets/flags/4x3/sg.svg" width="0px" height="0px"></image>
<image id="flag-sx" xlink:href="/assets/flags/4x3/sx.svg" width="0px" height="0px"></image>
<image id="flag-sk" xlink:href="/assets/flags/4x3/sk.svg" width="0px" height="0px"></image>
<image id="flag-si" xlink:href="/assets/flags/4x3/si.svg" width="0px" height="0px"></image>
<image id="flag-sb" xlink:href="/assets/flags/4x3/sb.svg" width="0px" height="0px"></image>
<image id="flag-so" xlink:href="/assets/flags/4x3/so.svg" width="0px" height="0px"></image>
<image id="flag-za" xlink:href="/assets/flags/4x3/za.svg" width="0px" height="0px"></image>
<image id="flag-ss" xlink:href="/assets/flags/4x3/ss.svg" width="0px" height="0px"></image>
<image id="flag-es" xlink:href="/assets/flags/4x3/es.svg" width="0px" height="0px"></image>
<image id="flag-lk" xlink:href="/assets/flags/4x3/lk.svg" width="0px" height="0px"></image>
<image id="flag-ps" xlink:href="/assets/flags/4x3/ps.svg" width="0px" height="0px"></image>
<image id="flag-sd" xlink:href="/assets/flags/4x3/sd.svg" width="0px" height="0px"></image>
<image id="flag-sr" xlink:href="/assets/flags/4x3/sr.svg" width="0px" height="0px"></image>
<image id="flag-se" xlink:href="/assets/flags/4x3/se.svg" width="0px" height="0px"></image>
<image id="flag-ch" xlink:href="/assets/flags/4x3/ch.svg" width="0px" height="0px"></image>
<image id="flag-sy" xlink:href="/assets/flags/4x3/sy.svg" width="0px" height="0px"></image>
<image id="flag-tj" xlink:href="/assets/flags/4x3/tj.svg" width="0px" height="0px"></image>
<image id="flag-th" xlink:href="/assets/flags/4x3/th.svg" width="0px" height="0px"></image>
<image id="flag-tl" xlink:href="/assets/flags/4x3/tl.svg" width="0px" height="0px"></image>
<image id="flag-tg" xlink:href="/assets/flags/4x3/tg.svg" width="0px" height="0px"></image>
<image id="flag-tk" xlink:href="/assets/flags/4x3/tk.svg" width="0px" height="0px"></image>
<image id="flag-to" xlink:href="/assets/flags/4x3/to.svg" width="0px" height="0px"></image>
<image id="flag-tt" xlink:href="/assets/flags/4x3/tt.svg" width="0px" height="0px"></image>
<image id="flag-tn" xlink:href="/assets/flags/4x3/tn.svg" width="0px" height="0px"></image>
<image id="flag-tr" xlink:href="/assets/flags/4x3/tr.svg" width="0px" height="0px"></image>
<image id="flag-tm" xlink:href="/assets/flags/4x3/tm.svg" width="0px" height="0px"></image>
<image id="flag-tc" xlink:href="/assets/flags/4x3/tc.svg" width="0px" height="0px"></image>
<image id="flag-tv" xlink:href="/assets/flags/4x3/tv.svg" width="0px" height="0px"></image>
<image id="flag-ug" xlink:href="/assets/flags/4x3/ug.svg" width="0px" height="0px"></image>
<image id="flag-ua" xlink:href="/assets/flags/4x3/ua.svg" width="0px" height="0px"></image>
<image id="flag-ae" xlink:href="/assets/flags/4x3/ae.svg" width="0px" height="0px"></image>
<image id="flag-gb" xlink:href="/assets/flags/4x3/gb.svg" width="0px" height="0px"></image>
<image id="flag-tz" xlink:href="/assets/flags/4x3/tz.svg" width="0px" height="0px"></image>
<image id="flag-us" xlink:href="/assets/flags/4x3/us.svg" width="0px" height="0px"></image>
<image id="flag-vi" xlink:href="/assets/flags/4x3/vi.svg" width="0px" height="0px"></image>
<image id="flag-uy" xlink:href="/assets/flags/4x3/uy.svg" width="0px" height="0px"></image>
<image id="flag-uz" xlink:href="/assets/flags/4x3/uz.svg" width="0px" height="0px"></image>
<image id="flag-vu" xlink:href="/assets/flags/4x3/vu.svg" width="0px" height="0px"></image>
<image id="flag-ve" xlink:href="/assets/flags/4x3/ve.svg" width="0px" height="0px"></image>
<image id="flag-vn" xlink:href="/assets/flags/4x3/vn.svg" width="0px" height="0px"></image>
<image id="flag-wf" xlink:href="/assets/flags/4x3/wf.svg" width="0px" height="0px"></image>
<image id="flag-eh" xlink:href="/assets/flags/4x3/eh.svg" width="0px" height="0px"></image>
<image id="flag-ye" xlink:href="/assets/flags/4x3/ye.svg" width="0px" height="0px"></image>
<image id="flag-zm" xlink:href="/assets/flags/4x3/zm.svg" width="0px" height="0px"></image>
<image id="flag-zw" xlink:href="/assets/flags/4x3/zw.svg" width="0px" height="0px"></image>
</svg>
</div>

### Mathematical setup

The UN provides data about where immigrants come from, which ultimately allows
us to set up a nomad who is representative of an average 'real world' migrant.
From the data, we construct a _migration matrix_ $M.$ We define $M_{ij}
\in \Nuzero$ to be the number of natives from country $i$ who are living in
country $j$ (somebody is native to a country iff they were born there, i.e. a
person is native to exactly one country). We have that $\sum_j M_{ij}$ is the
total number of emigrants of country $i$, and that $\sum_i M_{ij}$ is the total
number of immigrants living in country $j.$ $M_{ii}$ is ambiguous, so set
$M_{ii} := 0.$

Define a matrix $P$ by $P_{ij} := \frac{M_{ij}}{\sum_k M_{ik}}.$ $P$ is a
transition matrix (because $\sum_j P_{ij} = 1$), therefore $P$ defines a
Discrete-time Markov Chain on the set of countries. Our nomad's path from
country to country is modelled by such a Markov Chain.

#### Finer details

- The implementation introduces a 'damping factor' $d=0.85$ which
encourages the nomad to explore more of the infrequently visited countries. This
is equivalent to setting $P_{ij} \leftarrow d \cdot P_{ij} + (1-d).$
- Vatican City was removed, because whilst the UN data showed that some
people did migrate there, there was no origin data. As a result, a simulated
nomad would never reach Vatican City (other than due to the behaviour induced
by the damping factor).

### Biases in this migrant metric

Our simulated nomad spends most of his time in the US, which in turn means that
the nomad spends a lot more time in the shoes of the average US emigrant than
say, the average Afghan migrant. In other words, this migrant metric is biased
towards the opinion of emigrants from countries that are ranked highly.

We could try a different approach to avoid this bias, for example by setting up
a scheme where each country has an equally valid opinion. However we would then
find that we have introduced a new bias - now the opinions of migrants
from smaller countries contribute more than the opinions of individual migrants
from larger countries.


#### Attributions

- [International migrant stock by destination and origin](https://www.un.org/en/development/desa/population/migration/data/estimates2/data/UN_MigrantStockByOriginAndDestination_2019.xlsx)
  by United Nations is licensed under a [CC license](http://creativecommons.org/licenses/by/3.0/igo/).
- [Total international migrant stock](https://www.un.org/en/development/desa/population/migration/data/estimates2/data/UN_MigrantStockTotal_2019.xlsx)
  by United Nations is licensed under a [CC license](http://creativecommons.org/licenses/by/3.0/igo/).
- [Flag icons](https://github.com/lipis/flag-icon-css) by lipis is licensed under the MIT License.

<script type="module" src="./index.ts" defer></script>