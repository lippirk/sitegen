module Tmp

export draw, turing_6_mixture, em_6_mixture, resids, πs_of_Γs, draw_samples,
       EM_empirical_classes

using Plots
using StatsPlots
using StatsBase
using CSV
using DataFrames
using LaTeXStrings
using Distributions
using Turing
using DynamicHMC
import Optim

function empirical_transform_copula(dist::UnivariateDistribution,
                                    data::Matrix{<:Real};
                                    minq=0, maxq=length(data)/(length(data)+1))
  # maps data along each dimension to supp(dist)^d
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

function draw(;lthresh=2.8,len=400)
  M = 1000; N = 30
  fname = "data/m-1000-n-30.csv"
  X = CSV.read(fname, DataFrame) |> Matrix

  Z1 = zeros(M,N-2,3)
  for i in 1:M
    Z1[i,:,1] = X[i,1:(end-2)]
    Z1[i,:,2] = X[i,2:(end-1)]
    Z1[i,:,3] = X[i,3:end]
  end

  Z2::Matrix{Float64} = [Z1[i,:,:] for i in 1:M] |> x -> vcat(x...)

  for i in 1:3
    Z2[:,i] = empirical_transform_copula(Laplace(), Z2[:,i])
  end

  n = len
  Z3 = Z2[(Z2[:,1] .> lthresh) .|| (Z2[:,2] .> lthresh),:]
  Z3 = Z3[1:n,:]
  X1 = Z3[:,1]; X2 = Z3[:,2]; X3 = Z3[:,3]
  return (X1,X2,X3)
end

function get_a(c::Real, x1::Real, x2::Real, ν::Real)
  if c == 1
    -ν * log(exp(-x1/ν) + exp(-x2/ν))
  elseif c == 2
    x1
  elseif c == 3
    x2
  else
    0
  end
end

@model function turing_6_mixture(;X1, X2, X3, ν=0.5)
  # priors
  # setting up a prior like π ~ Dirichlet(6, 1) tended not to converge
  # π ~ Dirichlet(6, 1)
  αμ ~ Gamma(); βμ ~ Gamma()
  # αμ = 0.5; βμ = 0.5
  μσ ~ InverseGamma(αμ, βμ)
  μ ~ filldist(Normal(0,μσ), 6)

  ασ ~ Gamma(); βσ ~ Gamma()
  # ασ = 0.5; βσ = 0.5
  σ ~ filldist(InverseGamma(ασ,βσ), 6)

  # model
  for i in eachindex(X3)
    Z = X3[i] .- get_a.(1:6, X1[i], X2[i], ν)
    ds = Normal.(μ, σ)
    c = argmax(logpdf.(ds, Z))

    # π̃ = π .* pdf.(ds, Z)
    # π̃ = π̃ ./ sum(π̃)
    # @assert (sum(π̃) ≈ 1) && all(π̃ .≥ 0)
    # c = Categorical(π̃) |> rand
    @assert 1 ≤ c && c ≤ 6
    Z[c] ~ ds[c]
  end
end

function resids(μ,σ,X1,X2,X3;ν=0.5)
  n = length(X3)
  C = zeros(n,2)
  for i in eachindex(X3)
    Z = X3[i] .- get_a.(1:6, X1[i], X2[i], ν) # residual
    c = argmax(logpdf.(Normal.(μ,σ), Z))

    C[i,1] = c # category
    C[i,2] = Z[c]
  end

  p1 = Plots.histogram(C[C[:,1].≈1,2], normalize=:pdf, title="mixture 123", legend=false);
  Plots.plot!(p1, Normal(μ[1],σ[1]));

  p2 = Plots.histogram(C[C[:,1].≈2,2], normalize=:pdf, title="mixture 13", legend=false);
  Plots.plot!(p2, Normal(μ[2],σ[2]));

  p3 = Plots.histogram(C[C[:,1].≈3,2], normalize=:pdf, title="mixture 23", legend=false);
  Plots.plot!(p3, Normal(μ[3],σ[3]));

  p4 = Plots.histogram(C[C[:,1].≈4,2], normalize=:pdf, title="mixture 12", legend=false);
  Plots.plot!(p4, Normal(μ[4],σ[4]));

  p5 = Plots.histogram(C[C[:,1].≈5,2], normalize=:pdf, title="mixture 2", legend=false);
  Plots.plot!(p5, Normal(μ[5],σ[5]));

  p6 = Plots.histogram(C[C[:,1].≈6,2], normalize=:pdf, title="mixture 1", legend=false);
  Plots.plot!(p6, Normal(μ[6],σ[6]));

  Plots.plot(p1, p2, p3, p4, p5, p6, layout=(3,2))
end



function πs_of_Γs(Γ1::Real,Γ2::Real,Γ3::Real,Γ4::Real,Γ5::Real)
  sum_Γi = Γ1+Γ2+Γ3+Γ4+Γ5
  π_denom = sum(exp.([Γ1,Γ2,Γ3,Γ4,Γ5])) + exp(-sum_Γi)
  π1 = exp(Γ1) / π_denom; π2 = exp(Γ2) / π_denom; π3 = exp(Γ3) / π_denom;
  π4 = exp(Γ4) / π_denom; π5 = exp(Γ5) / π_denom; π6 = exp(-sum_Γi) / π_denom
  [π1,π2,π3,π4,π5,π6]
end

function em_6_mixture(;X1::Vector{<:Real},
                       X2::Vector{<:Real},
                       X3::Vector{<:Real}, ν=0.5, inits=nothing, niter=10)
  if isnothing(inits)
    ps = [1.,2,2,3,-1,  #Γ1,Γ2,Γ3,Γ4,Γ5
          1,1,1,1,-1,2, #μ1,μ2,μ3,μ4,μ5,μ6
          5,5,5,5,5,5   #σ1,σ2,σ3,σ4,σ5,σ6
         ]
  else
    ps = inits
  end

  @assert length(ps) == 5 + 6 + 6

  function mkQ(ps_::Vector{<:Real})
    Γ1_ = ps_[1]; Γ2_= ps_[2]; Γ3_= ps_[3]; Γ4_= ps_[4]; Γ5_= ps_[5]
    μ1_= ps_[6]; μ2_= ps_[7]; μ3_= ps_[8]; μ4_= ps_[9]; μ5_= ps_[10]; μ6_= ps_[11]
    σ1_= ps_[12]; σ2_= ps_[13]; σ3_= ps_[14]; σ4_= ps_[15]; σ5_= ps_[16]; σ6_= ps_[17]

    π_ = πs_of_Γs(Γ1_,Γ2_,Γ3_,Γ4_,Γ5_)
    @assert sum(π_) ≈ 1
    @assert all(x -> x ≥ 0, π_)

    ds_ = hcat(Normal.(μ1_ .+ get_a.(1,X1,X2,ν),σ1_),
               Normal.(μ2_ .+ get_a.(2,X1,X2,ν),σ2_),
               Normal.(μ3_ .+ get_a.(3,X1,X2,ν),σ3_),
               [Normal(μ4_,σ4_) for _ in eachindex(X3)],
               [Normal(μ5_,σ5_) for _ in eachindex(X3)],
               [Normal(μ6_,σ6_) for _ in eachindex(X3)])
    @assert size(ds_) == (length(X3), 6)

    # Π_ is E[Z |X,θ^t], i.e. a load of probabilities
    Π_ = zeros(length(X3),6)
    for i in eachindex(X3)
      ϕ_ = pdf.(ds_[i,:], X3[i])
      @assert length(ϕ_) == 6
      x = π_ .* ϕ_
      @assert length(x) == 6
      Π_[i,:] = x / sum(x)
    end

    # this is Q(⋅|θ')
    return function(ps::Vector{<:Real})
      Γ1 = ps[1]; Γ2= ps[2]; Γ3= ps[3]; Γ4= ps[4]; Γ5= ps[5]
      μ1= ps[6]; μ2= ps[7]; μ3= ps[8]; μ4= ps[9]; μ5= ps[10]; μ6= ps[11]
      σ1= ps[12]; σ2= ps[13]; σ3= ps[14]; σ4= ps[15]; σ5= ps[16]; σ6= ps[17]
      π = πs_of_Γs(Γ1,Γ2,Γ3,Γ4,Γ5)
      @assert sum(π) ≈ 1
      @assert all(x -> x ≥ 0, π)

      if any(x->x≤0, π) || any(x->x≤0, [σ1,σ2,σ3,σ4,σ5,σ6])
        return -Inf
      end

      ds = hcat(Normal.(μ1 .+ get_a.(1,X1,X2,ν),σ1),
                Normal.(μ2 .+ get_a.(2,X1,X2,ν),σ2),
                Normal.(μ3 .+ get_a.(3,X1,X2,ν),σ3),
                [Normal(μ4,σ4) for _ in eachindex(X3)],
                [Normal(μ5,σ5) for _ in eachindex(X3)],
                [Normal(μ6,σ6) for _ in eachindex(X3)])
      @assert size(ds_) == (length(X3), 6)

      res = 0
      for i in eachindex(X3)
        for j in 1:6
          res += Π_[i,j] * (log(π[j]) + loglikelihood(ds[i,j], X3[i]))
        end
      end
      res

      # res =  Π_[:,1] .* (log(π[1]) .+ loglikelihood.(ds[1], Z[1]))
      # res += Π_[:,2] .* (log(π[2]) .+ loglikelihood.(ds[2], Z[2]))
      # res += Π_[:,3] .* (log(π[3]) .+ loglikelihood.(ds[3], Z[3]))
      # res += Π_[:,4] .* (log(π[4]) .+ loglikelihood.(ds[4], Z[4]))
      # res += Π_[:,5] .* (log(π[5]) .+ loglikelihood.(ds[5], Z[4]))
      # res += Π_[:,6] .* (log(π[6]) .+ loglikelihood.(ds[6], Z[]))
      # res
    end
  end

  lb = [-Inf,-Inf,-Inf,-Inf,-Inf,      #Γ
        -Inf,-Inf,-Inf,-Inf,-Inf,-Inf, #μ
        0,0,0,0,0,0                    #σ
       ]
  ub = [Inf,Inf,Inf,Inf,Inf,           #Γ
        Inf,Inf,Inf,Inf,Inf,Inf,       #μ
        Inf,Inf,Inf,Inf,Inf,Inf        #σ
       ]
  for n in 1:niter
    Q = mkQ(ps) # Q(⋅|θ')
    println("\n====\nn=$n\n====")
    # println("ps=$(round.(ps, digits=4))")
    println("Γ1=$(ps[1])")
    println("Γ2=$(ps[2])")
    println("Γ3=$(ps[3])")
    println("Γ4=$(ps[4])")
    println("Γ5=$(ps[5])")
    println("μ1=$(ps[6])")
    println("μ2=$(ps[7])")
    println("μ3=$(ps[8])")
    println("μ4=$(ps[9])")
    println("μ5=$(ps[10])")
    println("μ6=$(ps[11])")
    println("σ1=$(ps[12])")
    println("σ2=$(ps[13])")
    println("σ3=$(ps[14])")
    println("σ4=$(ps[15])")
    println("σ5=$(ps[16])")
    println("σ6=$(ps[17])")
    println("Q=$(Q(ps))")
    res = Optim.optimize(x -> -Q(x), lb, ub, ps);
    ps = res.minimizer
  end
  ps
end

function compare_X3_hist(ps::Vector{<:Real}; X1, X2, X3)
  Γ1 = ps[1]; Γ2= ps[2]; Γ3= ps[3]; Γ4= ps[4]; Γ5= ps[5]
  μ1= ps[6]; μ2= ps[7]; μ3= ps[8]; μ4= ps[9]; μ5= ps[10]; μ6= ps[11]
  σ1= ps[12]; σ2= ps[13]; σ3= ps[14]; σ4= ps[15]; σ5= ps[16]; σ6= ps[17]
  π1,π2,π3,π4,π5,π6 = πs_of_Γs(Γ1,Γ2,Γ3,Γ4,Γ5)
  function epdf(x::Real, x1::Real, x2::Real)
    ϕ1 = pdf(Normal(μ1 + get_a(1,x1,x2,ν),σ1), x)
    ϕ2 = pdf(Normal(μ2 + get_a(2,x1,x2,ν),σ2), x)
    ϕ3 = pdf(Normal(μ3 + get_a(3,x1,x2,ν),σ3), x)
    ϕ4 = pdf(Normal(μ4,σ4), x)
    ϕ5 = pdf(Normal(μ5,σ5), x)
    ϕ6 = pdf(Normal(μ6,σ6), x)
    return ϕ1 + ϕ2 + ϕ3 + ϕ4 + ϕ5 + ϕ6
  end

  p = Plots.histogram(X3);
end

function draw_samples(ps::Vector{<:Real}; X1, X2, n, ν)
  m = length(X1)
  @assert m == length(X2)
  # draws samples of X3, given X1, X2
  Γ1 = ps[1]; Γ2= ps[2]; Γ3= ps[3]; Γ4= ps[4]; Γ5= ps[5]
  μ1= ps[6]; μ2= ps[7]; μ3= ps[8]; μ4= ps[9]; μ5= ps[10]; μ6= ps[11]
  σ1= ps[12]; σ2= ps[13]; σ3= ps[14]; σ4= ps[15]; σ5= ps[16]; σ6= ps[17]
  πs = πs_of_Γs(Γ1,Γ2,Γ3,Γ4,Γ5)

  ds = hcat(Normal.(μ1 .+ get_a.(1,X1,X2,ν),σ1),
            Normal.(μ2 .+ get_a.(2,X1,X2,ν),σ2),
            Normal.(μ3 .+ get_a.(3,X1,X2,ν),σ3),
            [Normal(μ4,σ4) for _ in eachindex(X1)],
            [Normal(μ5,σ5) for _ in eachindex(X1)],
            [Normal(μ6,σ6) for _ in eachindex(X1)])
  @assert size(ds) == (m, 6)

  # sample from each of the mixture components for each data point
  # and select
  samp = zeros(n,m)
  for i in 1:n # for each sample
    R = rand.(ds)
    for j in 1:m # for each observation
      x = R[j,:]

      # this produces bad results
      # Π = πs .* pdf.(ds[j,:],x)
      # Π = Π ./ sum(Π)
      # samp[i,j] = x[rand(Categorical(Π))]

      # also bad
      # c = argmax(logpdf.(ds[j,:],x))
      # samp[i,j] = x[c]

      # best
      Π = πs
      samp[i,j] = x[rand(Categorical(Π))]
    end
  end
  samp
end

function EM_pi_hat(ps, X1, X2, X3; ν=0.5)
  tab = zeros(6)
  μ1= ps[6]; μ2= ps[7]; μ3= ps[8]; μ4= ps[9]; μ5= ps[10]; μ6= ps[11]
  σ1= ps[12]; σ2= ps[13]; σ3= ps[14]; σ4= ps[15]; σ5= ps[16]; σ6= ps[17]

  ds = hcat(Normal.(μ1 .+ get_a.(1,X1,X2,ν),σ1),
            Normal.(μ2 .+ get_a.(2,X1,X2,ν),σ2),
            Normal.(μ3 .+ get_a.(3,X1,X2,ν),σ3),
            [Normal(μ4,σ4) for _ in eachindex(X1)],
            [Normal(μ5,σ5) for _ in eachindex(X1)],
            [Normal(μ6,σ6) for _ in eachindex(X1)])

  for i in eachindex(X3)
    c = argmax(logpdf.(ds[i,:], X3[i]))
    tab[c] += 1
  end
  tab ./ sum(tab)
end

function plot_data_2d(data::Matrix{Float64}; thresh, kwargs...)
  default(markersize=3, markerstrokewidth=0.5)
  u = thresh
  noext = (data[:,1] .<= u) .&& (data[:,2] .<= u) .&& (data[:,3] .<= u)
  ext1 = (data[:,1] .> u) .&& (data[:,2] .<= u) .&& (data[:,3] .<= u)
  ext2 = (data[:,1] .<= u) .&& (data[:,2] .> u) .&& (data[:,3] .<= u)
  ext3 = (data[:,1] .<= u) .&& (data[:,2] .<= u) .&& (data[:,3] .> u)
  ext12 = (data[:,1] .> u) .&& (data[:,2] .> u) .&& (data[:,3] .<= u)
  ext13 = (data[:,1] .> u) .&& (data[:,2] .<= u) .&& (data[:,3] .> u)
  ext23 = (data[:,1] .<= u) .&& (data[:,2] .> u) .&& (data[:,3] .> u)
  ext123 = (data[:,1] .> u) .&& (data[:,2] .> u) .&& (data[:,3] .> u)

  cats = [
    # (label="no extreme", color="lightblue", set=noext),
    (label="X1 > $u", color="green", set=ext1),
    (label="X2 > $u", color="blue", set=ext2),
    # (label="X3 > $u", color="yellow", set=ext3),
    (label="X1 > $u, X2 > $u", color="red", set=ext12),
    (label="X1 > $u, X3 > $u", color="purple", set=ext13),
    (label="X2 > $u, X3 > $u", color="orange", set=ext23),
    (label="X1 > $u, X2 > $u, X3 > $u", color="black", set=ext123),
  ]
  function plt_cats(x,y, xlab, ylab; kwargs...)
    c = cats[1]
    p = Plots.scatter(x[c.set], y[c.set], color=c.color,
                      label=c.label, xlab=xlab, ylab=ylab;
                      kwargs...)
    for c in cats[2:end]
      Plots.scatter!(p, x[c.set], y[c.set],
                     color=c.color, label=c.label)
    end
    return p
  end
  p12 = plt_cats(data[:,1], data[:,2], "X1", "X2", legend=false)
  p23 = plt_cats(data[:,2], data[:,3], "X2", "X3", legend=false)
  p13 = plt_cats(data[:,1], data[:,3], "X1", "X3", legend=:outerright)
  l = @layout [ [ a b ] ;  c ]
  Plots.plot(p12, p23, p13, layout=l; kwargs...)
end


function plot_data_3d(data::Matrix{<:Real}; thresh, kwargs...)
  plotly()
  u = thresh
  noext = (data[:,1] .<= u) .&& (data[:,2] .<= u) .&& (data[:,3] .<= u)
  ext1 = (data[:,1] .> u) .&& (data[:,2] .<= u) .&& (data[:,3] .<= u)
  ext2 = (data[:,1] .<= u) .&& (data[:,2] .> u) .&& (data[:,3] .<= u)
  ext3 = (data[:,1] .<= u) .&& (data[:,2] .<= u) .&& (data[:,3] .> u)
  ext12 = (data[:,1] .> u) .&& (data[:,2] .> u) .&& (data[:,3] .<= u)
  ext13 = (data[:,1] .> u) .&& (data[:,2] .<= u) .&& (data[:,3] .> u)
  ext23 = (data[:,1] .<= u) .&& (data[:,2] .> u) .&& (data[:,3] .> u)
  ext123 = (data[:,1] .> u) .&& (data[:,2] .> u) .&& (data[:,3] .> u)
  cats = [
    (label="no extreme", color="lightblue", set=noext),
    (label="X1 > $u", color="green", set=ext1),
    (label="X2 > $u", color="blue", set=ext2),
    (label="X3 > $u", color="yellow", set=ext3),
    (label="X1 > $u, X2 > $u", color="red", set=ext12),
    (label="X1 > $u, X3 > $u", color="purple", set=ext13),
    (label="X2 > $u, X3 > $u", color="orange", set=ext23),
    (label="X1 > $u, X2 > $u, X3 > $u", color="black", set=ext123),
  ]
  c = cats[1]
  x=data[:,1]; y=data[:,2]; z=data[:,3]
  p = Plots.scatter(x[c.set], y[c.set], z[c.set], color=c.color,
                    label=c.label, xlab="X1", ylab="X2", zlab="X3"; kwargs...)
  for c in cats[2:end]
    Plots.scatter!(p, x[c.set], y[c.set], z[c.set],
                   color=c.color, label=c.label)
  end
  p
end

end
