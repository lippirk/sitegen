---
title: Bootstrap filter implementation
date: 2021-10-27
katex: true
tags: math
---

# Bootstrap filter implementation

_This is an implementation of the 'boostrap filter' (aka BF) as detailed in
[this paper](https://arxiv.org/pdf/1911.01383.pdf)._

Consider the state-space model distributions (see section 2.1 in the paper)

$$
\begin{aligned}
X_0 & \sim p(x_0)\\
X_t & \sim p(x_t | x_{t-1})\\
Y_t & \sim p(y_t | x_t).
\end{aligned}
$$

Assume we have some time series data $y_{1:t} := \{ y_1, \cdots, y_t\}.$
Particle filtering is all about finding $p(x_t | y_{1:t}).$ Example: $y_t$
is the measured number of people with a certain disease, and we are modelling
$x_t,$ the _actual_ number of people with said disease.

## $p(x_t | y_{1:t})$ decomposition

This is declared in the paper, but we derive it here.

Noting that terms containing only $y$'s
are just constants w.r.t $x$, and using modelling assumptions:

$$
p(x_t | y_{1:t})
=       \int p(x_t, x_{t-1} | y_{1:t})\d x_{t-1}\\
\propto \int p(x_t, x_{t-1}, y_t | y_{1:t-1}) \d x_{t-1}\\
\propto \int p(x_t, y_t | y_{1:t-1}, x_{t-1})p(x_{t-1} | y_{1:t-1}) \d x_{t-1}\\
\propto \int p(y_t | x_t) p(x_t | x_{t-1})p(x_{t-1} | y_{1:t-1}) \d x_{t-1}.
$$

In other words, we can write the filtering problem
at time $t$ in terms of the filtering problem at time $t-1$.
Assume we can draw from $p(x_t | x_{t-1})$ and $p(y_t | x_t)$
and that we have some particles (aka samples) from $p(x_{t-1} | y_{1:t-1})$,
then we can use importance sampling to draw particles from $p(x_t | y_{1:t}).$
This is exactly what BF does.

## BF Implementation

The implementation is simple in R, once you have defined a model (i.e.
you can implement `draw_xs` and `draw_weights`):

```
bf <- function(ys, draw_xs, draw_weights, M) {
    # BF implementation in 1 dimension
    #
    # params:
    #   ys:           time series \in R^{T x 1}
    #   draw_xs:      draws M particles from p(x_t | x_t-1)
    #   draw_weights: returns probability vector based on the likelihood p(y_t | x_t)
    #   M:            number of particles to draw
    T <- length(ys)

    # ps = particles
    # there is some arbitrariness in the initial particle choice
    prev_ps <- draw_xs(rep(0, M))
    ps <- matrix(, nrow=M, ncol = T)

    for(i in 1:T) {
        new_ps <- draw_xs(prev_ps)
        ws <- draw_weights(ys[i], new_ps)
        new_ps_weighted <- sample(new_ps, size=M, replace=TRUE, prob=ws)

        prev_ps <- new_ps_weighted
        ps[, i] <- prev_ps
    }
    ps
}
```

## Testing

Code [here](./filter.r).

To test the implementation, define the following state-space model:

$$
\begin{aligned}
X_0        & = & 0\\
X_t        & = & f(X_{t-1}) + \epsilon_t\\
Y_t        & = & g(X_t) + \nu_t\\
\epsilon_t & \sim_{\text{iid}} & N(0, 1^2)\\
\nu_t      & \sim_{\text{iid}} & N(0, 1^2)\\
t          & \in &\{ 1, \cdots, 50\}.
\end{aligned}
$$

BF can handle arbitrary $f$ and $g$! As sanity checks, setting $f(x) = x:$

- check that the posterior mean estimates for $x$ (aka mean of the particles)
look sensible, compared to the actual values of $x$,
- compare the actual values of $y$ with plug-in estimates for $y$ (using our posterior mean estimators for $x$).

### $g(x) = 4x + \mathrm{sin}(x):$

<img src="./plot-4x-sinx.svg" class="svgimg"/>

### $g(x) = \mathrm{e}^x:$

<img src="./plot-expx.svg" class="svgimg" />

BF seems to predict $x$ well when $g$ is not very sensitive to its argument.
This makes sense, because if $g$ is sensitive, small changes caused by our
random variables $\epsilon,\nu$ could drastically change the data $y.$

## Attributions

- [[link](https://arxiv.org/pdf/1911.01383.pdf)] V. Elvira, J. Miguez,
P. M. Djuric, "On the performance of particle filters with adaptive number of particles", to appear in Statistics and Computing, 2021.
