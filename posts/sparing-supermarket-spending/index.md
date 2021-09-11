---
title: Sparing Supermarket Spending
date: 09-26-2021
katex: true
---

# Sparing Supermarket Spending

Suppose you are hungry but are tight on cash, or alternatively that you have
some poor souls to feed in your COVID hotel. In other words, you want to
minimize the cost of a food purchase. What should you buy?

We'll impose a sensible constraint: the food should satisfy the 'recommended
daily intake'. However, if you were on a ketogenic diet you might want to
instead satisfy `0 <= carbs < c`, where `c` is miserably small.

## tldr;

This is a linear programming problem. Using [this linear
optimizer](https://online-optimizer.appspot.com/) and [this linear
program](./linear-program.txt), we find that basic nutritional needs are
satisfied with less than £1 per day! You should eat approximately (each day):

- 60g of custard creams,
- 110g of peanut butter,
- 575g of pasta.

## Derivation

Consider $n$ foods and $m$ nutrients, with food $i$ having price $p_i$ per unit
mass. Let $N_{ij}\geq 0$ be the amount of nutrient $i$ contained in one unit
of food $j.$ Let $x_i$ be the amount of food $i$ consumed, then $N\vec
x\in\R^m$ is the vector of amounts of each nutrient consumed. For example, if
nutrient 1 is _salt_ then $\sum_j N_{1j} x_j = (N\vec x)_1$ is the amount of
salt consumed.

We can enforce constraints on the components of $N\vec x$ (e.g. 'no more than 6g
of salt' translates to  '$(N\vec x)_1 < 6$'). Some sensible constraints for an
adult human can be found at
[nutrition.org.uk](https://www.nutrition.org.uk/healthyliving/helpingyoueatwell/324-labels.html?start=4):


```
1. no more than 6g of salt
2. no more than 30g of sugar
3. at least 260g of carbs
4. at least 70g of fat
5. at least 30g of fibre
6. at least 50g of protein
7. at least 8400kJ of energy
```

Minimizing cost of food equates to minimizing $\sum_i x_i p_i = \vec{p}^T \vec
x$. In particular we are minimizing something linear, and we have linear
constraints, so this is a linear programming problem:

$$
\begin{aligned}
&\text{minimize } \vec p^T \vec x \text{ such that:}\\
&(N\vec x)_1 &\leq 6\\
&(N\vec x)_2 &\leq 30\\
&(N\vec x)_3 &\geq 260\\
&(N\vec x)_4 &\geq 70\\
&(N\vec x)_5 &\geq 30\\
&(N\vec x)_6 &\geq 50\\
&(N\vec x)_7 &\geq 8400\\
&\vec x &\geq 0\\
\end{aligned}
$$

### Finding values for $N$ and $\vec p$

We need a concrete set of foods, and concrete nutrition and price information
in order to perform any calculations.

Unfortunately I found it quite difficult to get hold of a (free) dataset that
included information about both nutrition _and_ price. As a result I resorted to
scraping information from the Tesco website about some arbitrarily chosen foods
(~50 foods).  Each food item's web page gives us all the necessary information:
price per unit mass, carbs per unit mass, fat per unit mass, etc.[^1] As an
example, see [this product page for gala
apples](https://www.tesco.com/groceries/en-GB/products/253559147).

The end result can be seen [above](#tldr).

## Further lines of enquiry

It'd be nice to curate a larger set of foods, and also to try out some different
constraints. For example, what happens if you include constraints on amounts of
iron, magnesium, vitamins, etc?

[^1]: Trying to parse this information from html was quite painful (perhaps a
machine learning solution would have been more appropriate here). Principally
this was because different products are measured using different units (e.g. kg,
g, litre, 'each', etc.). In my opinion, having also experienced a related
problem when following recipes, is that we should all consistently measure food
quantities in grams.