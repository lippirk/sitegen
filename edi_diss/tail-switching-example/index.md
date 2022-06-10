---
title: tail switching example
date: 2022-06-07
katex: true
---

# Tail switching example

## Definitions

Define a joint probability distribution $F_{012}$ as follows:
$$
\begin{aligned}
F_{012}(\vec x) = \exp\left(-V(\vec x)\right),\, \vec x \in \R_{+}^3\\
\end{aligned}
$$

where

$$
\begin{aligned}
V(\vec x) &= \theta_0 x_0^{-1} + \theta_1 x_1^{-1} + \theta_2 x_2^{-1}\\
&+\theta_{01}\left\{(x_0^{-1/v_{01}} + x_1^{-1/v_{01}})^{v_{01}}
  + (x_1^{-1/v_{01}} + x_2^{-1/v_{01}})^{v_{01}}\right\}\\
&+\theta_{02}\left\{(x_0^{-1/v_{02}} + x_2^{-1/v_{02}})^{v_{02}}\right\}\\
&+\theta_{012}\left\{(x_0^{-1/v_{012}} + x_1^{-1/v_{012}} + x_2^{-1/v_{012}})^{v_{012}}\right\}\\
\\
&\vec\theta \geq 0,\, \vec v \gt 0.\\
\end{aligned}
$$

Note:

- the margins are Fréchet: $F_{i}(x) = \int_{\R_+^2} f_{012}(\vec x)\d x_j\,\d x_k = F_{012}(\vec x)|_{x_j=\infty,\,x_k=\infty} = \exp\left(-c_i/x\right)$;
- $\theta_{01}=\theta_{02}=\theta_{012} = 0\implies$ independent components.

Define order-2 Markov Chain:

$$
\begin{aligned}
X_0 &\sim F_{0} \text{ (this is univariate Fréchet)}\\
X_1|X_0 &\sim F_{1|0}\\
X_{t+2}|X_{t+1},X_{t}&\sim F_{2|0,1}.
\end{aligned}
$$

The idea is that this Markov Chain will exhibit tail switching.

## Coding the example

We draw from $F_{0}$, $F_{1|0}$ and $F_{2|01}$ using inverse sampling
($U\sim U[0,1]$, then $F^{-1}(U) \sim F$). Therefore we need to calculate
some inverses:

- $F^{-1}_0(u) = -\frac{\theta_{0} + \theta_{01} + \theta_{02} + \theta_{012}}{\log u}$
by direct calculation;
- $F_{1|0}^{-1}$ cannot be found analytically, so we'll have to solve
  numerically for $x_1$:

$$
\begin{aligned}
-\log u &= (\theta_0 + \theta_{02})x_0^{-1} + (\theta_1
+ \theta_{01})x_1^{-1}\\
&+ \theta_{01}(x_0^{-1/v_{01}} + x_1^{-1/v_{01}})^{v_{01}}\\
&+ \theta_{012}(x_0^{-1/v_{012}} + x_1^{-1/v_{012}})^{v_{012}}\\
\end{aligned}
$$

- similarly to find $F^{-1}_{2|0,1}$ we solve for $x_2$ in $F_{012}(x_0, x_1, x_2) = u$.



```{include="main.jl" .jl}
```

Test
