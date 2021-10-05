using ClimateMARGO
using ClimateMARGO.Models
using ClimateMARGO.Optimization
using PyPlot


function create_graphic(_params, _outfile)
  params = deepcopy(ClimateMARGO.IO.included_configurations["default"])

  m = ClimateModel(params);

  if _params["optimizeControls"] == 1
    @time optimize_controls!(m, temp_goal=_params["tempGoal"]);
  end

  fig, axes = ClimateMARGO.Plotting.plot_state(m);

  savefig(_outfile)

end