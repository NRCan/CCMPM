# 🌏 Canada Critical Mineral Priority Mapper

> An interactive JupyterNotebook/Google Colab application for balancing priorities (e.g., mineral potential, economic viability, and environmental, social & governance (ESG) factors) using Pareto ranking to support sustainable exploration decisions.

---

## Overview

This tool implements multicriteria Pareto ranking for critical mineral exploration prioritisation, allowing decision makers to evaluate and visualise trade offs across competing objectives (e.g., critical mineral potential, economic viability, and ESG risk), without needing to assign subjective weights to individual criteria.
The application includes a variety of data for Canadian critical mineral prospectivity and pre-loaded ESG spatial layers, but is fully compatible with any user-supplied geospatial datasets. It is intended as a pre-competitive, high level decision support tool for mineral exploration and regional land-use planning.

There are two versions of this tool:
1. Online version hosted by Natural Resources Canada [Access the online tool here](https://dev.d3ty47mwxi69gs.amplifyapp.com). This version is limited to the supplied stock data layers for mineral prospectivity, economic constraints, and ESG layers.
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

The online version is hosted by Natural Resources Canada and provides access to pre-loaded datasets without requiring local installation. [Access the online tool here](https://dev.d3ty47mwxi69gs.amplifyapp.com).

### Run Locally/Google Colab 

**Google Colab (Recommended for Cloud):**
1. **Open the read-only version**: [Link to Colab notebook](https://colab.research.google.com/drive/1KSMcBoZAs8WwX6gDSvIT7UJHLBPQBlfj?usp=sharing)
2. **Make your own copy**: File → Save a copy in Drive
3. **Run setup cells**: Execute the package installation cell first
4. **Use the interface**: Select mineral type, priorities, and optionally upload custom data
5. **Process and visualize**: Click "Upload & Process" to run the analysis

**Local Jupyter/VS Code:**
1. **Download the notebook**: `ESG_Priority_Mapper.ipynb`
2. **Open in Jupyter Notebook/Lab or VS Code**
3. **Install dependencies**: Either run the package installation cell in the notebook or install from `requirements.txt`
4. **Start analysis**: Follow the interface prompts

**Note**: The notebook automatically detects your environment and configures paths accordingly.

---

## Technical Documentation

### System Requirements

**Minimum Requirements:**
- Python 3.10 or higher
- 8 GB RAM (16 GB recommended for large datasets)
- 2 GB free disk space for temporary files and outputs

**Recommended for Large Datasets (>1M points):**
- 16+ GB RAM
- Multi-core CPU
- SSD storage

### Technology Stack

**Core Technologies:**
- **Python 3.10+** — Primary programming language
- **Jupyter Notebook** — Interactive development environment
- **Pareto Ranking Algorithm** — Custom implementation with vectorized operations

**Online Version Infrastructure:**
- **AWS Amplify** — Static web hosting
- **AWS S3** — Cloud storage for pre-loaded datasets and results (accessed via pre-signed URLs)
- **HTML/JavaScript** — Web interface using GCWeb (Government of Canada design system)
- **MapLibre GL JS** — Interactive mapping
- **Plotly.js** — Interactive charts and visualizations

### Python Library Dependencies

```
boto3==1.40.4
geopandas==1.1.1
ipyfilechooser==0.6.0
ipywidgets==8.1.7
matplotlib==3.10.5
numpy==2.3.1
pandas==2.3.1
plotly==6.3.0
pyproj==3.7.1
rasterio==1.4.3
scipy==1.16.1
shapely==2.1.1
pyogrio==0.11.0
```

### Installation

#### Quick Install (Jupyter Notebook)
The notebook includes an automatic installation cell that handles all dependencies

#### Manual Installation (Command Line)

**Option 1: virtual environment**
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

**Option 2: conda environment**
```bash
conda create -n esg_mapper python=3.10 -y
conda activate esg_mapper
pip install -r requirements.txt
```

### Architecture Overview

#### Notebook Workflow
1. **Launch and Setup** — Open the notebook and run the setup cells to prepare the environment.
2. **Input Selection** — Select built-in layers and optionally add your own raster datasets.
3. **Data Processing**:
   - Raster reprojection and alignment
   - Percentile normalization
   - Pareto ranking algorithm
4. **Visualization**:
   - Static matplotlib outputs
   - Interactive dashboard with MapLibre GL
   - Plotly scatter plots for trade-off analysis
5. **Export** — GeoJSON, GeoTIFF, and HTML outputs

---

## Datasets

### Built-in Datasets

The application ships with the following pre-loaded data layers:

| Layer                                  | Layer Type                  | Source                                                                                                                 | Geo.ca Link                                                                              | Dataset Link                                                                                                                                                       |
| -------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Clastic-dominated zinc deposits        | Mineral prospectivity model | [Lawley et al., 2022](https://www.sciencedirect.com/science/article/pii/S0169136821006612)                             | [Link](https://app.geo.ca/en-ca/map-browser/record/84d566ad-42a4-938d-ae39-277bee3281be) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/cd_zinc.tif)                                                                                                  |
| Magmatic nickel deposits               | Mineral prospectivity model | [Lawley et al., 2021](https://www.sciencedirect.com/science/article/pii/S016913682100010X)                             | [Link](https://app.geo.ca/en-ca/map-browser/record/d6407ecb-5989-1376-8b3b-a2c354275cf1) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/magmatic_nickel.tif)                                                                                          |
| Mississippi Valley-type zinc deposits  | Mineral prospectivity model | [Lawley et al., 2022](https://www.sciencedirect.com/science/article/pii/S0169136821006612)                             | [Link](https://app.geo.ca/en-ca/map-browser/record/2854b1c2-ac15-5e8d-c76d-a0805c56d0b2) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/mvt_zinc.tif)                                                                                                 |
| Carbonatite-hosted REE and Nb deposits | Mineral prospectivity model | [Parsa et al., 2024](https://link.springer.com/article/10.1007/s11053-024-10369-7)                                     | [Link](https://app.geo.ca/en-ca/map-browser/record/3d1019fd-ced9-f38e-7c36-b4e5bbdb57ab) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/carbonatite_ree.tif)                                                                                          |
| Li-Cs-Ta pegmatite deposits            | Mineral prospectivity model | [Parsa et al., 2025](https://link.springer.com/article/10.1007/s11053-024-10438-x)                                     | [Link](https://app.geo.ca/en-ca/map-browser/record/b4d667c1-27db-d36a-e038-f8d93309b15f) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/pegmatite_lithium.tif)                                                                                        |
| Predictive model of graphite           | Mineral prospectivity model | [Zhang et al., 2025](https://link.springer.com/article/10.1007/s11053-024-10451-0)                                     | [Link](https://app.geo.ca/en-ca/map-browser/record/48d4c7dc-e7a2-1399-4b14-d5acfc23a895) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/graphite.tif)                                                                                                 |
| Road and powerline cost                | Economic model              | [Lawley et al., 2026](https://ostrnrcan-dostrncan.canada.ca/entities/publication/6c998b14-f490-4a7b-8071-aeac30151b46) |                                                                                          | Road: [Link](https://github.com/NRCan/CCMPM/blob/main/data/road_cost.tif)<br>Power Grid: [Link](https://github.com/NRCan/CCMPM/blob/main/data/power_grid_cost.tif) |
| Percentage of ecoregion protected      | ESG model                   | [Lawley et al., 2022](https://www.lyellcollection.org/doi/full/10.3389/esss.2022.10064)                                |                                                                                          | [Link](https://github.com/NRCan/CCMPM/blob/main/data/ecoregions_protected_percentage.tif)                                                                          |
| Critical habitat                       | ESG model                   | [Lawley et al., 2022](https://www.lyellcollection.org/doi/full/10.3389/esss.2022.10064)                                | [Link](https://app.geo.ca/en-ca/map-browser/record/47caa405-be2b-4e9e-8f53-c478ade2ca74) | [Link](https://github.com/NRCan/CCMPM/blob/main/data/critical_habitat.tif)                                                                                         |



### Bring Your Own Data

You can replace or supplement the built-in layers with any geospatial datasets in standard formats in the Juypter Notebook version. 

**Input Formats:**
- **Rasters**: GeoTIFF (.tif, .tiff)
- **Coordinate Systems**: Any valid EPSG code. Built-in layers are reprojected to EPSG:3978 for Canada. When using only custom uploaded rasters, the first uploaded raster defines the reference grid, and subsequent layers are reprojected and aligned to match it.
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

## License

This project is developed by Natural Resources Canada.

**Data Licensing:**
- Mineral prospectivity models: Open Government License - Canada
- ESG layers: Various (see individual dataset links)
- Custom data: Responsibility of user to ensure appropriate usage rights

**Code Licensing:**
- Apache 2.0

---

<!-- ## Contact & Support


--- -->

