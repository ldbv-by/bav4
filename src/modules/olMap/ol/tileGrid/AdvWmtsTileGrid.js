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
	4891.969810251280,
	2445.984905125640,
	1222.992452562820,
	611.4962262814100,
	305.7481131407050,
	152.8740565703530,
	76.43702828517630,
	38.21851414258810,
	19.10925707129410,
	9.554628535647030,
	4.777314267823520,
	2.388657133911760,
	1.194328566955880,
	0.5971642834779390,
	0.2985821417389695,
	0.14929107086948476
];
