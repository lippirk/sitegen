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

test <- function() {
    T <- 50
    M <- 1000
    sigma2x <- 1
    sigmax <- sqrt(sigma2x)
    sigma2y <- 1
    sigmay <- sqrt(sigma2y)
    eps <- rnorm(T, mean = 0, sd = sigmax)
    nu <- rnorm(T, mean = 0, sd = sigmay)

    g <- function(x) {
        4 * x + sin(x)
    }

    xsreal <- cumsum(eps)
    ys <- g(xsreal) + nu

    draw_xs <- function(prev_xs) {
        prev_xs + rnorm(M, mean = 0, sd = sigmax)
    }

    draw_weights <- function(y, xs) {
        w <- dnorm(y, mean = g(xs), sd = sigmay)
        w <- w / sum(w)
        w
    }

    particles <- bf(ys, draw_xs, draw_weights, M)

    xs_post_means <- colMeans(particles)

    minmax <- function(x) {
        c(min(x), max(x))
    }

    par(oma=c(0, 0, 0, 0), mfrow=c(2, 1))
    plot(1:T,
         xs_post_means,
         col='black',
         pch=20,
         cex=1,
         ylim=minmax(xs_post_means),
         xlab='t',
         ylab='x(t)')
    points(1:T, xsreal, col='red', pch=20, cex=0.5)
    lines(spline(1:T, xsreal, n=T), col='red', lty='dotted')
    legend("topright",
           legend=c("estimate", "actual"),
           col=c('black', 'red'),
           lty=1:2,
           cex=0.5,
           pch=20)

    yhat <- g(xs_post_means)
    plot(1:T,
         yhat,
         col='black',
         pch=20,
         cex=1,
         ylim=minmax(yhat),
         xlab='t',
         ylab='y(t)')
    points(1:T, ys, col='red', pch=20, cex=0.5)
    lines(spline(1:T, ys, n=T), col='red', lty='dotted')
    legend("topright",
           legend=c("estimate", "actual"),
           col=c('black', 'red'),
           lty=1:2,
           cex=0.5,
           pch=20)

}

test()
