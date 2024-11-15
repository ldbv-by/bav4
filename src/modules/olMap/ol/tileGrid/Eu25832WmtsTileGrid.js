/**
 * @module modules/olMap/ol/tileGrid/AdvWmtsTileGrid
 */
import TileGrid from 'ol/tilegrid/TileGrid';
import { DEFAULT_TILE_SIZE } from 'ol/tilegrid/common';

/**
 * Defines an EU_EPSG_25832 compliant tile grid.
 * For more information see:
 * https://sgx.geodatenzentrum.de/wmts_topplus_open/1.0.0/WMTSCapabilities.xml
 */
export class Eu25832WmtsTileGrid extends TileGrid {
	constructor() {
		super({
			minZoom: 0,
			origin: [-3803165.98427299, 8805908.08284866],
			resolutions: resolutions,
			tileSize: DEFAULT_TILE_SIZE,
			extent: extent
		});
	}
}

const extent = [-46133.17, 5048875.26857567, 1206211.10142433, 6301219.54];

const resolutions = [
	4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.874056570353, 76.4370282851763, 38.2185141425881,
	19.1092570712941, 9.55462853564703, 4.77731426782352, 2.38865713391176, 1.19432856695588, 0.597164283477939, 0.2985821417389695, 0.14929107086948476
];
