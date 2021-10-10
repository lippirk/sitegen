draw_Xs <- function(N, n) {
  # draw N samples of a time series of length n
  # time series obeys: x_t = x_{t - 1} + eps_t
  # where eps_t ~ N(0, sigma^2) (sigma is unknown and drawn from an Exp(1) prior)
  # assume eps_t iid
  sds <- rexp(N)
  prob_sds <- dexp(sds)
  xs <- matrix(0, N, n)
  prob_xs <- matrix(0, N, n)
  for (i in 1:N) {
    sd <- sds[i]
    x <- rnorm(n, mean=0, sd=sd)
    x_ <- cumsum(x)
    xmeans <- diff(x_)
    prob_xs[i,1] <- dnorm(x_[1], mean=0, sd=sd)
    prob_xs[i, 2:n] <- dnorm(x_[2:n], mean=xmeans, sd=sd)
    xs[i,] <- x_
  }
  list(sds=sds, prob_sds=prob_sds, xs=xs, prob_xs=prob_xs)
}

posterior_approx <- function(delta, sigma_y2, N, n, Xs, ys) {
  # crude integral approximation

  # hack: multiply small numbers by a big number to avoid issues with rounding to 0
  prod_factor <- 10

  sigma_y <- sqrt(sigma_y2)
  pi_theta <- prod_factor * Xs$prob_sds
  prob_xs <- rep(0, N)
  for(i in 1:N) {
    prob_xs[i] <- prod((prod_factor * Xs$prob_xs[i,]))
  }

  xs <- Xs$xs
  y_densities <- rep(0, N)
  for (i in 1:N) {
    xsi <- xs[i,]
    densities <- rep(0, n)
    for(j in 1:n) {
      mu <- xsi[j] + delta
      densities[j] <- prod_factor * dnorm(ys[j], mean=mu[j], sd=sigma_y)
    }
    y_densities[i] <- prod(densities)
  }
  sum(pi_theta * prob_xs * y_densities)
}

main <- function() {
  N <- 100
  n <- 50
  sigma_x2 <- 0.5
  sigma_y2 <- 0.5

  create_fake_data <- function() {
    delta <- 2
    x <- rnorm(n, mean=0, sd=sqrt(sigma_x2))
    x <- cumsum(x)
    yerr <- rnorm(n, mean=0, sd=sqrt(sigma_y2))
    y <- x + delta
    y
  }

  Y <- create_fake_data()

  # generating samples for approximation
  Xs <- draw_Xs(N, n)

  by <- 0.01
  deltas <- seq(1, 3, by=by)
  m <- length(deltas)
  density <- rep(0, m)

  # actually evaluate the approximation
  for(i in 1:m) {
    delta <- deltas[i]
    res <- posterior_approx(delta, sigma_y2, N, n, Xs, Y)
    if(is.finite(res)) {
      density[i] <- res
    } else {
      print(c(i, "not finite!"))
    }
  }

  # plot
  plot(deltas, density, pch=20, col='black', cex=0.5, xlab="delta", ylab="posterior approx", yaxt='n')
  lines(spline(deltas, density, n=m), col='red')
}

# main()