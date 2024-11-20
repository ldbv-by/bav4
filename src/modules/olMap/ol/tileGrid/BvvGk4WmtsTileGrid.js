/**
 * @module modules/olMap/ol/tileGrid/BvvGk4WmtsTileGrid
 */
import { getTopLeft } from 'ol/extent';
import TileGrid from 'ol/tilegrid/TileGrid';
import { DEFAULT_TILE_SIZE } from 'ol/tilegrid/common';

/**
 * Defines a Bvv Gk4 WMTS compliant tile grid.
 */
export class BvvGk4WmtsTileGrid extends TileGrid {
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

const extent = [3925712.0, 4875712.0, 4974288.0, 5924288.0];

const resolutions = [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125];
