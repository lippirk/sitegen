module Test
using Turing
using LaTeXStrings
using Plots
using KernelDensity

include("Tmp.jl")
using .Tmp

X1,X2,X3 = draw()

function save_plot_data_2d()
  p = Tmp.plot_data_2d(hcat(X1,X2,X3), thresh=2.8);
  savefig(p, "figures/plot_data_2d.svg")
end

function save_plot_data_3d()
  p = Tmp.plot_data_3d(hcat(X1,X2,X3), thresh=2.8);
  savefig(p, "figures/plot_data_3d.html")
  cp("figures/plot_data_3d.html", "figures/plot_data_3d.js", force=true)
end


#### EM
function EM(inits; niter=10)
# inits = [-1.2255626161849638, -0.12430571379746261, -0.02406329153824867,
         # -0.014496793279555931, 0.9475019008860528, 4.761466724608619,
         # 0.5562635470274145, -0.2718712005235628, -1.1862681251090283,
         # -0.00221508626917005, 3.2669704500656223, 1.167252524549132,
         # 0.4061167999838851, 0.6030217561647027, 1.388617010365227,
         # 0.6926307734539003, 0.6468301507591216]
  res = em_6_mixture(X1=X1,X2=X2,X3=X3,inits=inits,niter=niter)

  res
end

function plot_EM_resids(ps)
  Γ = ps[1:5]
  μ = ps[6:11]
  σ = ps[12:17]
  πs = πs_of_Γs(Γ...)
  p = resids(μ,σ,X1,X2,X3,ν=0.5);
  savefig(p, "figures/em-resid-check.svg")
end

function EM_draw_samples_hist(ps)
  pyplot()
  R = draw_samples(ps, X1=X1, X2=X2, n=100, ν = 0.5)
  p = Plots.plot(vcat(R...)|>kde, label="kde of model samples");
  Plots.plot!(p, X3|>kde, label="kde of true data");
  savefig(p, "figures/model-kde-vs-data-kde.svg")
end

#### Bayes

# nsample = 50000
# burnin=1
# model = turing_6_mixture(X1=X1, X2=X2, X3=X3)
# sampler = HMC(0.01,10)
# samples = sample(model, sampler, nsample, save_state=true)
# samples = sample(model, sampler, nsample, save_state=true, resume_from=chn)
# chn = samples[burnin:end,:,:]

# ps = mean(chn)[:,2]
# μ =
# resids(μ,σ,X1,X2,X3)
# res3 = go_turing(nsample=60000, burnin=1)
# write("data/n-400-samples-60000-turing-6-mixture-results.jls", res.chn)

end
