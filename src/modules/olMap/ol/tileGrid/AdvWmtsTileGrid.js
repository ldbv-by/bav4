/**
 * @module modules/olMap/ol/tileGrid/AdvWmtsTileGrid
 */
import { getTopLeft } from 'ol/extent';
import TileGrid from 'ol/tilegrid/TileGrid';
import { DEFAULT_TILE_SIZE } from 'ol/tilegrid/common';

/**
 * Defines an ADV WMTS compliant tile grid.
 * For more information see:
 * https://www.adv-online.de/AdV-Produkte/Standards-und-Produktblaetter/AdV-Profile/binarywriterservlet?imgUid=36060b99-b8c4-0a41-ba3c-cdd1072e13d6&uBasVariant=11111111-1111-1111-1111-111111111111
 */
export class AdvWmtsTileGrid extends TileGrid {
	constructor() {
		super({
			minZoom: 0,
			origin: getTopLeft(extent),
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
