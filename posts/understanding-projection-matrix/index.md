---
title: Understanding the projection matrix
date: 2021-10-07
katex: true
tags: math
---

# Understanding the projection matrix


Given a full rank matrix $X$, the associated projection matrix $P_X$ is defined by

$$
P_X = X(X^TX)^{-1}X^T.
$$

The projection matrix [appears in linear
regression](https://en.wikipedia.org/wiki/Projection_matrix#Ordinary_least_squares).
In particular it is also a linear map which projects its input onto the columns
of $X,$ which was not obvious to me at all. However if we have a linear model
$Y=X\beta + \epsilon,$ then qualitatively it _does_ seem like a good idea to see
what our response variable $Y$ looks like in our 'data space', the vector
space spanned by our data $X$ (recall that
in a linear model, $X$ is constructed such that the columns correspond to the
explanatory variables).

## Why does $P_X$ project onto columns of $X$?

Take $X\in\R^{n\times p}$ with full rank, $p < n$ and let
$\lbrace x_i\rbrace _{i\in\lbrace 1,\cdots,p\rbrace}$ be the columns of $X.$
The crucial observation is that $P_X X = X,$ because then $(Px_j)_i =
(PX)_{ij} = X_{ij} \implies Px_j = x_j.$

Since the column space of $X$ of does not span $\R^n,$ we can find some
linearly independent vectors $\lbrace e_i\rbrace_{i \in \lbrace p+1,\cdots, n\rbrace}$
such that $x^T_i e_j = 0,$ and $\text{span}\lbrace x_1,\cdots,x_p,e_{p+1},\cdots,e_n \rbrace = \R^n.$

Given an arbitrary $x^*\in\R^n$, we can write it in terms of our new basis:

$$
x^* = \sum_{i=1}^p \lambda_i x_i + \sum_{i=p+1}^n \lambda_i e_i,
$$

which gives

$$
P_X x^* = \sum^p_{i=1}\lambda_i x_i.
$$

So $P_X$ definitely does give us $x^*$ in terms of the columns of $X$!

In terms of the linear model, we can think of $P_X$ as discarding any information
that cannot be written as a linear combination of our data.