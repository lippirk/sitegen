using LinearAlgebra
using Plots
using Roots
using Distributions
using Random
using StatsPlots

# θ = [1, 1, 1, 1, 1, 1]#θ=[θ0,θ1,θ2,θ01,θ02,θ012]
# ν = [2,2,2]#ν=[ν01,ν02,ν012]

θ = [1.,1.,1.,0.,0.,0.]#θ=[θ0,θ1,θ2,θ01,θ02,θ012]
ν = [1.1,1.1,1.1]#ν=[ν01,ν02,ν012]

function V(x::Vector{<:Real}, θ, ν)
  c = [sum(x[[1,2]] .^ (-1/ν[1]))^ν[1] + sum(x[[2,3]] .^ (-1/ν[1]))^ν[1],
       sum(x[[1,3]] .^ (-1/ν[2]))^ν[2],
       sum(x .^ (-1/ν[3]))^ν[3]
      ]
  dot(1 ./ x, θ[1:3]) + dot(c, θ[4:6])
end

F(x::Vector{<:Real}, θ, ν) = exp(-V(x, θ, ν))
F(x::Vector{<:Real}) = F(x, θ, ν)
F(x0::Real,x1::Real,x2::Real) = F([x0,x1,x2])

F012(x0, x1, x2) = F([x0, x1, x2])
F0(x) = F([x, Inf, Inf])
F10(x1, x0) = F([x0, x1, Inf])

F0_inv(u) = -sum(θ[[1,4,5,6]])/log(u)
F10_inv(u, x0) = fzero(x -> F10(x, x0) - u, 1)
F201_inv(u, x0, x1) = fzero(x -> F012(x0, x1, x) - u, 1)

Random.seed!(0)
n = 1000
X = zeros(n)
U = rand(Uniform(0,1), n)

for i ∈ eachindex(X)
  if i >= 3
    X[i] = F201_inv(U[i], X[i-2], X[i-1])
  elseif i == 2
    X[i] = F10_inv(U[i], X[i-1])
  else
    X[i] = F0_inv(U[i])
  end;
end

plot(eachindex(X), X)


# check that X_0 has Frechet(1)
histogram(F0_inv.(U), normalize=:probability, xlim=(0, 100))
plot!(Frechet())

# TODO check that F_10 has Frechet(1)
# TODO check that F_201 has Frechet(1)

## TODO: plot density F0,F1
## TODO: plot density F0,F2
## TODO: plot density F1,F2
