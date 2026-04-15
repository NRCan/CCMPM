# 🌏 Canada Critical Mineral Priority Mapper

> An interactive JupyterNotebook/Google Colab application for balancing priorities (e.g., mineral potential, economic viability, and environmental, social & governance (ESG) factors) using Pareto ranking to support sustainable exploration decisions.

---

## Overview

This tool implements multicriteria Pareto ranking for critical mineral exploration prioritisation, allowing decision makers to evaluate and visualise trade offs across competing objectives (e.g., critical mineral potential, economic viability, and ESG risk), without needing to assign subjective weights to individual criteria.
The application includes a vareity of data for Canadian critical mineral prospevtivity and pre-loaded ESG spatial layers, but is fully compatible with any user-supplied geospatial datasets. It is intended as a pre-competitive, high level decision support tool for mineral exploration and regional land-use planning.

There are two versions of this tool:
1. Online version hosted by Natural Resrouces Canada (link). This version is limited to the supplied stock data layers for mineral prospectivity, economic constraints, and ESG layers.
2. Downloadable JupyterNotebook which allows for users to upload their own data layers.

Both versions have similar plotting and visualization functionalities, and it only the ability for users to provide their own data layers (downloadable JupyterNotebook/Colab). 

---
## Background

Traditional approaches to multi-objective decision-making require decision-makers to assign subjective weights or thresholds to criteria (e.g., weighted criteria optimisation), which can introduce bias. **Pareto ranking** avoids this by identifying the set of options that are not dominated by any other across all criteria simultaneously. Spatially, this can be thought of comparing all points on the map in terms of the chosen criteria. Some areas may be more favourable for exploration, and others more favourable for reducing environmental risk. By comparing all points, a range of choices exist. This allows exploration targets to be prioritised based on balanced performance rather than optimised performance on any single dimension.

This application implements the methodology described in:
> **Walsh, S.D.C., Haynes, M.W. & Wang, C. (2024)**. *Multicriteria resource potential mapping: balancing geological, economic & environmental factors.* Exploring for the Future: Extended Abstracts. Geoscience Australia. [doi:10.26186/149250](https://doi.org/10.26186/149250)

Other examples of this workflow are included in:
> **Lebre et al. (2025)**. *ESG mapping of the Australian mining sector – The state of play on mobilising spatial datasets for decision making* Resources Policy. [doi:10.1016/10559](https://doi.org/10.1016/j.resourpol.2025.105592)


## How Pareto Ranking Works

The Pareto algorithm is an iterative ranking algorithm, where the locations are ranked from 0 → n and rank 0 are the most extreme combinations of the modeled priority layers. A location is *Pareto optimal* or *on the Pareto frontier* (Rank 0) if no other location outperforms it across all criteria simultaneously. Locations are then ranked by their "distance" from the Pareto frontier. This ranking does not require user-defined weighting criteria. For full algorithmic detail, see Walsh et al. (2024).


---

## Features

- ✅ **Pareto ranking engine** — fast implementation supporting 1M+ points, handling both positive criteria (higher = better) and negative criteria (higher = worse)
- ✅ **Stock Canadian Critical minerals prospectivity and ESG data** — pre-loaded mineral potential and ESG layers (see below)
- ✅ **Custom data support** — upload any geospatial raster or vector data to run your own analysis (JypterNotebook features)
- ✅ **Interactive trade-off visualisation** — scatter plots of the Pareto frontier coloured by average relative rank under varying criteria weightings

---

## Getting Started

### Online NRCAN CCMPM

### Run Locally/Google Colab 

---
## Datasets
### Built-in Datasets

The application ships with the following pre-loaded data layers:

| Layer | Layer Type | Source | Geo.ca Link |
|---|---|---|---|
| Clastic-dominated zinc deposits | Mineral prospectivity model | [Lawley et al., 2022](https://www.sciencedirect.com/science/article/pii/S0169136821006612) | [Link](https://app.geo.ca/en-ca/map-browser/record/84d566ad-42a4-938d-ae39-277bee3281be) |
| Magmatic nickel deposits | Mineral prospectivity model | [Lawley et al., 2021](https://www.sciencedirect.com/science/article/pii/S016913682100010X) | [Link](https://app.geo.ca/en-ca/map-browser/record/d6407ecb-5989-1376-8b3b-a2c354275cf1) |
| Mississippi Valley-type zinc deposits | Mineral prospectivity model | [Lawley et al., 2022](https://www.sciencedirect.com/science/article/pii/S0169136821006612) | [Link](https://app.geo.ca/en-ca/map-browser/record/2854b1c2-ac15-5e8d-c76d-a0805c56d0b2) |
| Carbonatite-hosted REE and Nb deposits | Mineral prospectivity model | [Parsa et al., 2024](https://link.springer.com/article/10.1007/s11053-024-10369-7) | [Link](https://app.geo.ca/en-ca/map-browser/record/3d1019fd-ced9-f38e-7c36-b4e5bbdb57ab) |
| Li-Cs-Ta pegmatite deposits | Mineral prospectivity model | [Parsa et al., 2025](https://link.springer.com/article/10.1007/s11053-024-10438-x) | [Link](https://app.geo.ca/en-ca/map-browser/record/b4d667c1-27db-d36a-e038-f8d93309b15f) |
| Road and powerline cost | Economic model | [Lawley et al., 2026](https://ostrnrcan-dostrncan.canada.ca/entities/publication/6c998b14-f490-4a7b-8071-aeac30151b46) |  |
| Percentage of ecoregion protected | ESG model | [Lawley et al. 2022](https://www.lyellcollection.org/doi/full/10.3389/esss.2022.10064) |  |
| Critical habitat | ESG model | [Lawley et al. 2022](https://www.lyellcollection.org/doi/full/10.3389/esss.2022.10064) | [Link](https://app.geo.ca/en-ca/map-browser/record/47caa405-be2b-4e9e-8f53-c478ade2ca74) |


### Bring Your Own Data

You can replace or supplement the built-in layers with any geospatial datasets in standard formats in the JuypterNotebook version. All layers (.tif) must be in the same coordinate reference system.


---

## Output & Visualisation

The notebook produces the following outputs:

**Maps**
- Static and interactive maps of the study area
- Highlighted Pareto frontier locations
  
**Plots**
- 2D scatter plot of any two criteria, with points coloured by Pareto rank - filterable by user selection

**Exports**
- GeoJSON / CSV of all points with assigned Pareto ranks or Pareto frontier locations
- PNG figures for all plots

---
