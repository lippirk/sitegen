---
title: 2D mapping visualizations
date: 2022-01-03
katex: true
---

# 2D Linear visualizations

## Householder transformation

$$
\vec x \mapsto (I - 2\vec u\vec u^T)\vec x
$$

<div id="householder-root" class="animation center-children"></div>

## Projection

$$
\vec x \mapsto (I - \vec u\vec u^T)\vec x
$$

<div id="projection-root" class="animation center-children"></div>

## Squeeze

$$
\vec x \mapsto
\begin{bmatrix}
k & 0\\
0 & \frac{1}{k}
\end{bmatrix}\vec x
$$

<div id="squeeze-root" class="animation center-children"></div>

## Shear

$$
\vec x \mapsto
\begin{bmatrix}
1 & k\\
0 & 1
\end{bmatrix}\vec x
$$

<div id="shear-root" class="animation center-children"></div>

## Rotation

$$
\vec x \mapsto
\begin{bmatrix}
\cos \theta & -\sin\theta\\
\sin\theta & \cos\theta
\end{bmatrix}\vec x
$$

<div id="rotation-root" class="animation center-children"></div>

<script type="module" src="anim.ts" async></script>