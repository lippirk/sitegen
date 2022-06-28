using Plots
using StatsPlots
using Distributions
using StatsBase
using Random
using LaTeXStrings
import Optim

ρ = 0.8; Σ = [ 1 ρ ; ρ 1 ]; μ = [0, 0]; n = 1000;

Random.seed!(0)

data = rand(MultivariateNormal(μ, Σ), n)

p = Plots.scatter(data[1,:], data[2,:], xlim=(0, 4), ylim=(0, 4),legend=false,xlab="X",ylab="Y");
Plots.plot!(p, Shape([(0,4),(4,4),(4,0),(2.5,0),(2.5,2.5),(0,2.5)]), color="red", opacity=.5,legend=false);
savefig(p, "figures/red-region-eg.svg")

function empirical_transform_copula(dist::UnivariateDistribution,
                                    data::Matrix{<:Real};
                                    minq=0, maxq=length(data)/(length(data)+1))
  # maps data along each dimension to [0,1]^d
  n,d = size(data)
  res = deepcopy(data);
  for j in 1:d
    res[:,j] = minq .+ (maxq - minq) .* ecdf(data[:,j]).(data[:,j])
  end
  res = quantile.(dist, res)
  res
end
empirical_transform_copula(dist::UnivariateDistribution,
                           data::Vector{<:Real}; kwargs...) =
  empirical_transform_copula(dist, hcat(data); kwargs...)[:,1]

data = rand(MultivariateNormal(μ,Σ), n) |> transpose|> collect
data = empirical_transform_copula(Laplace(), data)
xthresh_fit = quantile(Laplace(), 0.95)
ixs = data[:,1] .> xthresh_fit
X = data[ixs,1]; Y = data[ixs,2]
p = Plots.scatter(X, Y, legend=false, xlab=L"X_i", ylab=L"Y_i");
savefig(p, "figures/exceedances.svg")

function HT_joint_max(Y, X)
  function fit_(Y, Y_)
    ll(α,β,μ,σ) = loglikelihood.(Normal.(μ .* Y_ .^ β .+ α .* Y_, σ .* Y_ .^ β), Y) |> sum
    negll(x) = -ll(x...)
    lower = [-1, -Inf, -Inf, 0]
    upper = [1, 1, Inf, Inf]
    x_init = [0.5,0.1,1,1]
    Optim.optimize(negll, lower, upper, x_init)
  end
  res = fit_(Y, X).minimizer
  α = res[1]; β = res[2]
  μ = res[3]; σ = res[4]
  Z = (Y .- α .* X) ./ X .^ β
  p = Plots.histogram(Z, normalize=:pdf, title="Histogram of residuals", label="Z")
  Plots.plot!(p, Normal(μ, σ), label="Assumed pdf");
  savefig(p, "figures/histogram-of-residuals.svg")
  (Z,α,β)
end
(Z,α,β) = HT_joint_max(Y, X)

function Finv(data)
  Zsort = sort(data)
  n = length(Zsort)
  return function(u)
    ix = ceil(n*u) |> Int
    Zsort[ix]
  end
end
@assert Finv([1,2,3])(0.5) ≈ 2
@assert Finv([1,2,3])(0.9) ≈ 3

Ginv = Finv(Z)


function draw_HT_samples(n, xthresh)
  a = cdf(Laplace(), xthresh); b = 1
  X = quantile.(Laplace(), rand(Uniform(a, b), n))
  Z = Ginv.(rand(Uniform(), n))
  Y = Z .* X .^ β + α .* X
  (X, Y)
end

Xsamp,Ysamp = draw_HT_samples(30, xthresh_fit)
p = Plots.scatter(X, Y, color="red")
Plots.scatter!(p, Xsamp, Ysamp, color="green")

## probability that Y > ythresh | X > xthresh
xthresh = quantile(Laplace(), 0.99)
ythresh = quantile(Laplace(), 0.99)
X,Y = draw_HT_samples(5_000_0000, xthresh)
p̂ = sum(Y .> ythresh) / length(Y)


## probability using true dist
Random.seed!(1)
u = quantile(Normal(), 0.99)
d = rand(MultivariateNormal(μ,Σ), 5_000_000) |> transpose |> collect
X = d[:,1]; Y = d[:,2]
p_est = sum((X .> u) .&& (Y .> u)) / sum(X .> u)
