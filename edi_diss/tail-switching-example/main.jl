using LinearAlgebra
using Plots
using Roots
using Distributions
using Random
using StatsPlots
using Zygote
using KernelDensity
# using NLsolve
using ForwardDiff
using LaTeXStrings

pref = "indep"

## util
## ====
function unif()
  rand(Uniform(), 1000)
end

## visualization
## =============

# default(size=(600,600),fc=:heat)
# f(x, y; v) = exp(-(x^(-1/v) + y^(-1/v))^v)
# x, y = 0:0.1:10, 0:0.1:10
# z = Surface((x,y)->f(x,y; v=3), x, y)
# surface(x,y,z,linealpha=.3)

## definitions
## ===========
# θ=[0.8,0.6,0.8,0.2,0,0]; ν=[0.8,0.8,0.8];
θ=[1,1,1,0,0,0]; ν=[1,1,1];
function check_params(θ,ν)
  @assert all(z -> z ≤ 1, ν)
  @assert sum(θ[[1,4,5,6]]) ≈ 1
  @assert dot(θ[[2,4,6]], [1,2,1]) ≈ 1
  @assert sum(θ[3:6]) ≈ 1
end
check_params(θ,ν)

function V(x::Vector{<:Real}, θ, ν)
  if any(z->z≈0,x)
    Inf
  else
    dot(1 ./ x, θ[1:3]) +
    (θ[4] ≈ 0 ? 0 : (sum(x[[1,2]] .^ (-1/ν[1]))^ν[1] + sum(x[[2,3]] .^ (-1/ν[1]))^ν[1])*θ[4]) +
    (θ[5] ≈ 0 ? 0 : (sum(x[[1,3]] .^ (-1/ν[2]))^ν[2])*θ[5]) +
    (θ[6] ≈ 0 ? 0 : (sum(x .^ (-1/ν[3]))^ν[3])*θ[6])
  end;
end
V(x::Vector{<:Real}) = V(x, θ, ν)
V(x0::Real, x1::Real, x2::Real) = V([x0,x1,x2])
@assert V(Inf, Inf, Inf) ≈ 0
@assert V(0, 0, 0) ≈ Inf
@assert isapprox(V([1, 2, 3], [1, 2, 3, 4, 5, 6], [2, 3, 4]), 320.029, atol=1e-4)

F(x::Vector{<:Real}, θ, ν) = exp(-V(x, θ, ν))
F(x::Vector{<:Real}) = F(x, θ, ν)
F(x0::Real,x1::Real,x2::Real) = F([x0,x1,x2])
@assert F(0,0,0) ≈ 0
@assert F(Inf, Inf, Inf) ≈ 1

F0(x) = F(x, Inf, Inf)
F1(x) = F(Inf, x, Inf)
F2(x) = F(Inf, Inf, x)

# quantile functions (these have been derived analytically)
F0_inv(u) = -sum(θ[[1,4,5,6]])/log(u)
F1_inv(u) = -dot(θ[[2,4,6]],[1,2,1])/log(u)
F2_inv(u) = -sum(θ[[3,4,5,6]])/log(u)
@assert F0_inv(F0(0.8)) ≈ 0.8
@assert F1_inv(F1(0.3)) ≈ 0.3
@assert F2_inv(F2(0.4)) ≈ 0.4

## conditional distributions
## =========================

### F_{1|0}
dF0(x0,x1,x2) = gradient(z -> F(z, x1, x2), x0)[1]
function F1_0(x, x0)
  if x≈0
    0
  else
    dF0(x0, x, Inf) / dF0(x0, Inf, Inf)
  end
end
F1_0_inv(u, x0) = fzero(x -> F1_0(x, x0) - u, 1)
@assert F1_0_inv(F1_0(0.3, 1), 1) ≈ 0.3
@assert F1_0(F1_0_inv(0.8, 2), 2) ≈ 0.8
## the following pdf should look like U[0,1]
# density(F1_0.(F1_0_inv.(unif(), X0), X0))

### F_{2|0,1}
# INEFFICIENT - don't need to calculate whole hessian
d2Fd0d1(x::Vector{<:Real}) = hessian(z -> F(z...), x)[1,2]
d2Fd0d1(x0::Real,x1::Real,x2::Real) = d2Fd0d1([x0,x1,x2])
function F2_01(x, x0, x1)
  if x≈0
    0
  else
    d2Fd0d1([x0, x1, x]) / d2Fd0d1(x0, x1, Inf)
  end
end
# F2_01_inv(u, x0, x1) = find_zero(x -> F2_01(x,x0,x1) - u, 1, Steffensen(), maxiters=1000)
F2_01_inv(u, x0, x1) = fzero(x -> F2_01(x,x0,x1) - u, 1)
@assert F2_01(F2_01_inv(0.5,1,1),1,1) ≈ 0.5
@assert F2_01(F2_01_inv(0.9,2,3),2,3) ≈ 0.9
@assert F2_01(F2_01_inv(1e-2,0.1,0.2),0.1,0.2) ≈ 1e-2
## struggles with this when ν<1
@assert F2_01(F2_01_inv(1e-3,0.1,0.2),0.1,0.2) ≈ 1e-3
@assert F2_01(F2_01_inv(big"0.01",BigFloat(0.1),BigFloat(0.2)),BigFloat(0.1),BigFloat(0.2)) |> Float64 ≈ 0.01

## the following pdf should look like U[0,1]
#X0 = 0.5; X1 = 0.5
#density(F2_01.(F2_01_inv.(unif(), X0, X1), X0, X1))
## can also inspect F
#xrange=0:.01:10
#plot(xrange, F2_01.(xrange, 1,1))

## markov chain
## ============

Random.seed!(2)
n = 500
U = rand(Uniform(0,1), n)
X = zeros(n)
X[1] = F0_inv(U[1])
X[2] = F1_0_inv(U[2], X[1])
for i ∈ 3:length(X)
  X[i] = F2_01_inv(U[i], X[i-2], X[i-1])
end
p = plot(X, title=L"Realization of $X_t$", xlab=L"t", ylab=L"X_t", legend=false);
savefig(p, "$pref-x_t.svg")

#### uniform margins
#Y[1] = F0(X[1])
#Y[2] = F1_0(X[2], X[1])
#for i ∈ 3:length(Y)
#  Y[i] = F2_01(X[i], X[i-2], X[i-1])
#end
## sanity check margins
#density(Y)
#plot!(Uniform())

### exponential margins
Y = zeros(n)
Y[1] = -log(1 - F0(X[1]))
Y[2] = -log(1-F1_0(X[2], X[1]))
for i ∈ 3:length(Y)
  Y[i] = -log(1-F2_01(X[i], X[i-2], X[i-1]))
end
p = plot(Y, title="Transformation to exp", xlab=L"t", ylab=L"Y_t", legend=false);
savefig(p, "$pref-y_t.svg")
## sanity check margins
## density(Y)
p = histogram(Y, normalize=:pdf);
plot!(p, Exponential(), title=L"Histogram for $Y_t$, and exp density", legend=false);
savefig(p, "$pref-y_hist.svg")

## analysis
## ========

#### mean residual life plot
start = 10
ixs = start:(length(Y) -2)
Ysort = sort(Y)
threshold = zeros(length(ixs))
mean_exceedance = zeros(length(ixs))
ci_diff = zeros(length(ixs))
for i in ixs
  j = i-start+1
  u = Ysort[j]
  sample = Ysort[i+1:length(Y)]
  threshold[j] = u
  mean_exceedance[j] = mean(sample)
  ci_diff[j] = 1.96 * std(sample) / sqrt(length(sample))
end
# want to choose threshold above which the mean res life plot is linear
# on viewing, almost any threshold will do, but pick threshold = 2.5
p = plot(threshold, mean_exceedance, title="mean res life", xlab="threshold",
     ylab="mean excess", legend=false, ribbon=ci_diff);
savefig(p, "$pref-y_meanres.svg")

u_thresh = 2.5 # ≈ q(0.90) for exp distribution
Z = [[Y[i+1], Y[i+2]] for i in 1:(length(Y)-2) if Y[i] > u_thresh]
Z = hcat(Z...) |> transpose
p = plot(kde((Z[:,1], Z[:,2])), legend=false, title=L"KDE of $Y_{t+2},Y_{t+1}|Y_t > 2.5$",
        xlab=L"y_1",ylab=L"y_2");
savefig(p, "$pref-y1y2joint.svg")

##### compare with just exponential data
#Y = rand(Exponential(), (1000, 2))
#u_thresh = 2.5 # ≈ q(0.90) for exp distribution
#Z = [[Y[i+1], Y[i+2]] for i in 1:(length(Y)-2) if Y[i] > u_thresh]
#Z = hcat(Z...) |> transpose
#plot(kde((Z[:,1], Z[:,2])))
#cor(Z[:,1],Z[:,2])
#

##### finding F1_0_inv directly just seems worse than
##### the naive method using zygote...
##### absence of a param implicitly means it is ∞
#function ∂V∂0(x0,x1)
#  -(θ[1]+θ[5])*x0^(-2) -
#  θ[4]*x0^(-1/ν[1]-1)*(x0^(-1/ν[1])+x1^(-1/ν[1]))^(ν[1]-1) -
#  θ[6]*x0^(-1/ν[3]-1)*(x0^(-1/ν[3])+x1^(-1/ν[3]))^(ν[3]-1)
#end
#∂F∂0(x0,x1) = -∂V∂0(x0,x1)*F(x0,x1,Inf)
#∂V∂0(x0) = -x0^(-2)*sum(θ[[1,4,5,6]])
#∂F∂0(x0) = -∂V∂0(x0)*F(x0,Inf,Inf)
#F1_0(x::Real, x0::Real) = ∂F∂0(x0,x)/∂F∂0(x0)
#DF1_0(x0) = x->ForwardDiff.derivative(F1_0,float(x))
#F1_0_inv(u::Real,x0::Real) = find_zero((x -> F1_0(x, x0)-u,DF1_0(x0)), 1., Roots.Newton())
#F1_0_inv(u::Real,x0::Real) = find_zero(x->F1_0(x, x0)-u, 1., Roots.Order5())
#@assert F1_0(F1_0_inv(0.5, 1.),1.) ≈ 0.5
#@assert F1_0(F1_0_inv(1e-2, 2), 2) ≈ 1e-2
#@assert F1_0(F1_0_inv(0.99,2), 2) ≈ 0.99

##### this method for inverting F1_0 is not good
##### (it was an attempt to put things on the log scale)
#function F1_0_inv(u, x0)
#  fzero(z -> log(u) + V(x0, z, Inf) - V(x0, Inf, Inf) -log(∂V∂0(x0,z,Inf)/∂V∂0(x0,Inf,Inf)), 1)
#end

##### NLsolve seems equivalent to Roots.jl
#using NLsolve
#function F1_0_inv(u, x0)
#  function F1_0!(F, x)
#    F[1] = F1_0(x[1], x0) - u
#  end
#  res = nlsolve(F1_0!, [1.]);
#  if res |> converged
#    res.zero[1]
#  else
#    NaN
#  end;
#end
#F1_0_inv(1e-4,1)
