import { containsCoordinate, getBottomLeft, getBottomRight, getTopLeft, getTopRight } from '../../../../../node_modules/ol/extent';
import { fromLonLat, toLonLat, transformExtent } from '../../../../../node_modules/ol/proj';
import { MeasurementOverlay } from '../../components/MeasurementOverlay';
import { OlMapHandler } from '../OlMapHandler';

export class OlOverlayMapHandler extends OlMapHandler {
	constructor() {
		super('Overlay_Handler');

		this._viewListener = null;
		this._map = null;
	}

	register(map) {
		this._map = map;
		this._map.getView().on('change:center', () => this._updateOverlays());
	}

	_updateOverlays() {
		const viewExtent = this._map.getView().calculateExtent(this._map.getSize());
		const wgs84Extent = transformExtent(viewExtent, 'EPSG:3857', 'EPSG:4326');

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
		this._map
			.getOverlays()
			.getArray()
			.filter((o) => o.getElement() instanceof MeasurementOverlay)
			.forEach((o) => {
				const overlayPosition = o.getPosition();

				if (!containsCoordinate(viewExtent, overlayPosition)) {
					const wgs84Position = toLonLat(overlayPosition, 'EPSG:3857');

					const withOffset = (offset, wgs84Position) => {
						const wgs84Coordinate = [offset * 360 + wgs84Position[0], wgs84Position[1]];
						return fromLonLat(wgs84Coordinate, 'EPSG:3857');
					};
					const findBestOffset = (minMax, position, extent) => {
						// const bestOffset = minMax.find((offset) => {
						// 	const candidate = withOffset(offset, position);
						// 	return containsCoordinate(extent, candidate);
						// });
						// return bestOffset ?? null;

						const [min, max] = minMax;
						let bestOffset = null;
						for (let offset = min - 1; offset <= max + 1; offset++) {
							const candidate = withOffset(offset, position);
							if (containsCoordinate(extent, candidate)) {
								bestOffset = offset;
								break;
							}
						}
						return bestOffset;
					};

					const bestOffset = findBestOffset(offsetMinMax, wgs84Position, viewExtent);
					if (bestOffset) {
						const newPos = withOffset(bestOffset, wgs84Position);
						o.setPosition(newPos);
					}
				}
			});
	}
}
