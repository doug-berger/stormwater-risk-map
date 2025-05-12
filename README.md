# Stormwater Flood Risk Map

This web map is intended as a tool for small business owners and property owners to better understand their flood risk and quickly access recommendations and resources to
assist them in mitigating these risks. The information displayed is customized to a risk profile developed using the [NYC Stormwater Flood Maps layers](https://data.cityofnewyork.us/Environment/NYC-Stormwater-Flood-Maps/9i7c-xyvv/about_data) from NYC DEP available through NYC Open Data.

## Data Process

I uploaded the "NYC Stormwater Flood Map - Moderate Flood (2.13 inches per hr) with Current Sea Levels" and "NYC Stormwater Flood Map - Extreme Flood (3.66 inches per hr) with 2080 Sea Level Rise".GDB directories were exported to QGIS as individual GeoJSON files, reprojected in a WGS 84 CRS. The Moderate Flood shapefile was dissolved in QGIS to combine the "nuisance" and "deep and continuous" flooding attributes. The same process was repeated with the Extreme Flood shapefile after removing the 2080 high tides. This was done to reduce the size of files, focus on the current stormwater flooding risk (as opposed to future high tides). The 100-year floodplain geojson was put through the same process.

After I exported the processed shapefiles as GeoJSONs, I simplified them further using [mapshaper](https://mapshaper.org/) to reduce the files to a manageable size with minimal visible changes to the JSON. 

## Map Logic

The map works by placing a pin on the address searched for by the user and iterating through an else-if logic. Depending on the location within (here defined as within 35ft of the edge) the moderate stormwater flood zone, the extreme stormwater flood zone, and the 100-year flood plain, the code returns a different set of text explaining the local risk and providing customized recommendations with links to additional information and resources. I added the 35ft buffer to the logic because the stormwater flood maps display street flooding, which may not technically include neighboring properties, especially if the marker is placed in the center of the parcel. 

## Potential for Future Refinement

There are a number of different ways this tool could be improved and made more sophisticated. On the data side, if the "nuisance" and "deep and continuous" flooding attributes were retained, they could be added to the logic to further refine the risk profile and recommendations. Additionally, the 500-year flood plain, or different levels of risk in FEMA's flood maps, could be included without aggregation for the same reason. Alternatively, the [Hurricane Sandy inundation zone ](https://data.cityofnewyork.us/Environment/Sandy-Inundation-Zone/uyj8-7rv5) could be used in place of flooding projections to provide a more grounded measure of coastal flooding risk. However, this may have the opposite of the desired effect in parts of coastal New York that suffered less severe storm surge in 2012. 


