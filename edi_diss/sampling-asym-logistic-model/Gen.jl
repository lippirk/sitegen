using Random
using LinearAlgebra
using Roots
using Random
using Zygote
using Distributed
using ProgressMeter

function test_inverse(f, finv; us=nothing)
  if false
    return true
  end;
  if isnothing(us)
    us = [1e-5:1e-5:0.0001; 0.9999:1e-5:0.99999]
  end
  for u in us
    try
      if f(finv(u)) ≈ u
        continue
      else
        println("test_inverse failed at u=$u")
        return false
      end;
    catch e
        showerror(stderr, e)
        println("\ntest_inverse failed at u=$u")
        return false
    end;
  end;
  return true
end

function check_params(θ,ν)
  @assert all(z -> z ≤ 1, ν)
  @assert sum(θ[[1,4,5,6]]) ≈ 1
  @assert dot(θ[[2,4,6]], [1,2,1]) ≈ 1
  @assert sum(θ[3:6]) ≈ 1
end

function norm(x; ν, η=ν)
  sum(x .^ (-1/ν))^η
end

function V(x::Vector{<:Real}, θ, ν)
  @assert length(x) == 3
  if any(z->z==0,x)
    Inf
  else
    dot(1 ./ x, θ[1:3]) +
    θ[4]*(norm(x[[1,2]], ν=ν[1]) + norm(x[[2,3]], ν=ν[1])) +
    θ[5]*norm(x[[1,3]], ν=ν[2]) +
    θ[6]*norm(x, ν=ν[3])
  end;
end
@assert isapprox(V([1, 2, 3], [1, 2, 3, 4, 5, 6], [2, 3, 4]), 320.029, atol=1e-4)

function ∂V∂0(x::Vector{<:Real}, θ, ν)
  if any(z->z==0,x)
    Inf
  else
    -θ[1]*x[1]^-2 -
    θ[4]*x[1]^(-1/ν[1]-1)*norm(x[[1,2]], ν=ν[1], η=ν[1]-1) -
    θ[5]*x[1]^(-1/ν[2]-1)*norm(x[[1,3]], ν=ν[2], η=ν[2]-1) -
    θ[6]*x[1]^(-1/ν[3]-1)*norm(x, ν=ν[3], η=ν[3]-1)
  end;
end
@assert isapprox(∂V∂0([3, 4, 5], [0.4,0.5,0.4,0.2,0.3,0.1], [0.5, 0.6, 0.7]), -0.09997514479825662)

function ∂V∂1(x::Vector{<:Real}, θ, ν)
  if any(z->z==0,x)
    Inf
  else
    -θ[2]*x[2]^-2 -
    θ[4]*x[2]^(-1/ν[1]-1)*(norm(x[[1,2]], ν=ν[1], η=ν[1]-1) + norm(x[[2,3]], ν=ν[1], η=ν[1]-1)) -
    θ[6]*x[2]^(-1/ν[3]-1)*norm(x, ν=ν[3], η=ν[3]-1)
  end;
end
@assert isapprox(∂V∂1([3, 4, 5], [0.4,0.5,0.4,0.2,0.3,0.1], [0.5, 0.6, 0.7]), -0.05290531139161226)

function ∂2V∂0∂1(x::Vector{<:Real}, θ, ν)
  if any(z->z==0,x)
    Inf
  else
    θ[4]*x[1]^(-1/ν[1]-1)*x[2]^(-1/ν[1]-1)*norm(x[[1,2]],ν=ν[1],η=ν[1]-2)*(ν[1]-1)/ν[1] +
    θ[6]*x[1]^(-1/ν[3]-1)*x[2]^(-1/ν[3]-1)*norm(x,ν=ν[3],η=ν[3]-2)*(ν[3]-1)/ν[3]
  end;
end
@assert isapprox(∂2V∂0∂1([3, 4, 5], [0.4,0.5,0.4,0.2,0.3,0.1], [0.5, 0.6, 0.7]), -0.0018926662498043576)

function gen_X_Y(;θ,ν,n,seed=0)
  check_params(θ,ν)

  #### V
  V_(x0::Real,x1::Real,x2::Real) = V([x0,x1,x2],θ,ν)
  dV0(x0,x1,x2) = ∂V∂0([x0,x1,x2],θ,ν)
  dV1(x0,x1,x2) = ∂V∂1([x0,x1,x2],θ,ν)
  d2V01(x0,x1,x2) = ∂2V∂0∂1([x0,x1,x2],θ,ν)

  #### F
  F(x::Vector{<:Real}) = exp(-V_(x[1],x[2],x[3]))
  F(x0::Real,x1::Real,x2::Real) = F([x0,x1,x2])

  #### generate values from F0
  F0(x::Real) = F(x, Inf, Inf)
  F0_inv(u::Real) = -sum(θ[[1,4,5,6]])/log(u)
  @assert test_inverse(F0, F0_inv)

  #### generate values from F_{1|0}
  function F1_0(x, x0)
    # work on log scale and then exp up
    res = -V_(x0, x, Inf) + V_(x0, Inf, Inf)
    res += log(-dV0(x0, x, Inf))
    res -= log(-dV0(x0, Inf, Inf))
    exp(res)
  end
  function F1_0_inv(u::Real, x0::Real)
    # we want to find the zero in the domain [0,∞] but
    # the solver prefers it if we instead solve in the domain [0,1].
    # we do this by solving f(x/(1-x))=0, x∈[0,1]. finally, map that
    # back to the real line with x/(1-x)
    function f(x)
      if x≈0
        -u
      elseif x≈1
        1-u
      else
        y = x/(1-x)
        F1_0(y, x0) - u
      end
    end
    res = fzero(f, (0,1))
    res/(1-res)
  end
  @assert test_inverse(x->F1_0(x,1e-4), x->F1_0_inv(x,1e-4))
  @assert test_inverse(x->F1_0(x,1e4), x->F1_0_inv(x,1e4))

  #### generate values from F_{2|0,1}
  function F2_01(x::Real, x0::Real, x1::Real)
    # work on log scale and then exp up
    res = -V_(x0, x1, x) + V_(x0, x1, Inf)
    a = -dV0(x0,x1,x)*dV1(x0,x1,x)+d2V01(x0,x1,x)
    b = -dV0(x0,x1,Inf)*dV1(x0,x1,Inf)+d2V01(x0,x1,Inf)
    @assert sign(a) == sign(b)
    res += log(abs(a))
    res -= log(abs(b))
    exp(res)
  end
  function F2_01_inv(u::Real, x0::Real, x1::Real)
    function f(x)
      if x≈0
        -u
      elseif x≈1
        1-u
      else
        y = x/(1-x)
        F2_01(y, x0, x1) - u
      end
    end
    res = fzero(f, (1e-8,1-1e-8))
    res/(1-res)
  end
  @assert test_inverse(x->F2_01(x,1e4,1e4), x->F2_01_inv(x,1e4,1e4))
  @assert test_inverse(x->F2_01(x,1e-4,1e-4), x->F2_01_inv(x,1e-4,1e-4))

  #### generate values from the markov chain
  Random.seed!(seed)
  U = rand(Uniform(), n)
  X = zeros(n)
  X[1] = F0_inv(U[1])
  X[2] = F1_0_inv(U[2], X[1])
  @showprogress for i ∈ 3:length(X)
    X[i] = F2_01_inv(U[i], X[i-2], X[i-1])
  end

  # TODO think about why we do this?
  Y = -log.(1 .- exp.(-1 ./ X))
  return (X, Y)
end
#(X, Y) = gen_X_Y(θ=[0.4,0.5,0.4,0.2,0.3,0.1],ν=[0.1,0.1,0.1],n=200)

# function drawing_samples()
  # (Xindep, _) = gen_X_Y(θ=[1,1,1,0,0,0],ν=[1,1,1],n=150,seed=1)
  # (Xnoindep, _) = gen_X_Y(θ=[0.2,0.3,0.2,0.1,0.2,0.5],ν=[0.1,0.1,0.1],n=150,seed=1)
  # p1 = plot(Xindep,legend=false,color=1,ylab=L"$X_t$",
            # title=L"no dependence - $\theta_0=\theta_1=\theta_2=1$",
            # titlefontsize=10);
  # p2 = plot(Xnoindep,legend=false,color=2,xlab=L"$t$", ylab=L"$X_t$",
            # title=L"dependence - $\nu=1,\,\theta_0=0.2,\,\theta_1=0.3,\,\theta_2=0.2,\,\theta_{01}=0.1,\,\theta_{02}=0.2$",
            # titlefontsize=10);
  # p = plot(p1, p2, layout=(2,1));
  # savefig(p, "example-samples-x.svg")
# end
# drawing_samples()
