/**
 * @module modules/olMap/handler/measure/OlOverlayMapHandler
 */
import { containsCoordinate, getBottomLeft, getBottomRight, getTopLeft, getTopRight } from 'ol/extent';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { BaOverlay } from '../../components/BaOverlay';
import { OlMapHandler } from '../OlMapHandler';

const Epsg_WebMercartor = 'EPSG:3857';
const Epsg_Wgs84 = 'EPSG:4326';

export class OlOverlayMapHandler extends OlMapHandler {
	constructor() {
		super('Overlay_Handler');

		this._map = null;
	}

	register(map) {
		this._map = map;
		this._map.getView().on('change:center', () => this._updateOverlays());
	}

	_updateOverlays() {
		const baOverlays = this._map
			.getOverlays()
			.getArray()
			.filter((o) => o.getElement() instanceof BaOverlay);

		if (baOverlays.length !== 0) {
			const viewExtent = this._map.getView().calculateExtent(this._map.getSize());
			const wgs84Extent = transformExtent(viewExtent, Epsg_WebMercartor, Epsg_Wgs84);

			const getOffset = (latitude) => {
				return -180 > latitude ? (latitude - (latitude % 360)) / 360 : -180 < latitude && latitude < 180 ? 0 : (latitude - (latitude % 360)) / 360;
			};
			const worldOffset = [
				getOffset(getBottomLeft(wgs84Extent)[0]),
				getOffset(getBottomRight(wgs84Extent)[0]),
				getOffset(getTopLeft(wgs84Extent)[0]),
				getOffset(getTopRight(wgs84Extent)[0])
			];

			const offsetMinMax = [Math.min(...worldOffset), Math.max(...worldOffset)];

			baOverlays.forEach((o) => this._updatePosition(o, viewExtent, offsetMinMax));
		}
	}

	_updatePosition(overlay, viewExtent, offsetMinMax) {
		const overlayPosition = overlay.getPosition();

		if (overlayPosition && !containsCoordinate(viewExtent, overlayPosition)) {
			const wgs84Position = toLonLat(overlayPosition, Epsg_WebMercartor);
			const withOffset = (offset, wgs84Position) => {
				const wgs84Coordinate = [offset * 360 + wgs84Position[0], wgs84Position[1]];
				return fromLonLat(wgs84Coordinate, Epsg_WebMercartor);
			};

			const findBestOffset = (minMax, position, extent) => {
				const [min, max] = minMax;

				for (let offset = min - 1; offset <= max + 1; offset++) {
					const candidate = withOffset(offset, position);
					if (containsCoordinate(extent, candidate)) {
						return offset;
					}
				}

				return null;
			};

			const bestOffset = findBestOffset(offsetMinMax, wgs84Position, viewExtent);
			if (bestOffset !== null) {
				const newPos = withOffset(bestOffset, wgs84Position);
				overlay.setPosition(newPos);
			}
		}
	}
}
