using ClimateMARGO
using ClimateMARGO.Models
using ClimateMARGO.Optimization
using PyPlot


function create_graphic(_params, _outfile)
  params = deepcopy(ClimateMARGO.IO.included_configurations["default"])

  m = ClimateModel(params);

  if _params["optimizeControls"] == 1
    @time optimize_controls!(m, temp_goal=_params["tempGoal"], obj_option=_params["optimizeFor"]);
  end


  plotf = getfield(ClimateMARGO.Plotting, Symbol(string("plot_", _params["plot"])))

  if _params["plot"] == "state" || _params["plot"] == "temperatures"
    fig, axes = plotf(m, temp_goal=_params["tempGoal"]);
  elseif _params["plot"] == "controls" || _params["plot"] == "concentrations"
    plotf(m);
    legend();
  else
    plotf(m);
  end

  savefig(_outfile)
end


