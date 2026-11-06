/**
 * @module plugins/PositionPlugin
 */

import { QueryParameters } from '@src/domain/queryParameters';
import { $injector } from '@src/injection';
import { changeRotation, changeZoomCenterRotationPitchRoll, fit } from '@src/store/position/position.action';
import { isCoordinate, isNumber } from '@src/utils/checks';
import { fromString, isWGS84Coordinate } from '@src/utils/coordinateUtils';
import { BaPlugin } from './BaPlugin';

/**
 * This plugin does the following position-related things:
 *
 * - initially set the position from available query parameters or configuration
 *
 * - handle position-related attribute changes of the public web component
 *
 * @class
 * @extends BaPlugin
 * @author taulinger
 */
export class PositionPlugin extends BaPlugin {
	_setPositionFromQueryParams(queryParams) {
		const { CoordinateService: coordinateService, MapService: mapService } = $injector.inject('CoordinateService', 'MapService');

		const detectSrid = (center) => {
			return isWGS84Coordinate(center) ? 4326 : mapService.getLocalProjectedSrid();
		};

		const parseCoordinate = (coordinateValue) => {
			if (coordinateValue) {
				const coordinate = fromString(coordinateValue);
				if (isCoordinate(coordinate)) {
					return coordinateService.transform(coordinate, detectSrid(coordinate), mapService.getSrid());
				}
			}

			return null;
		};

		const parseNumber = (value) => {
			return isNumber(value, false) ? parseFloat(value) : null;
		};

		const zoom = parseNumber(queryParams.get(QueryParameters.ZOOM));
		const center = parseCoordinate(queryParams.get(QueryParameters.CENTER));
		const rotation = parseNumber(queryParams.get(QueryParameters.ROTATION)) ?? 0;
		const pitch = parseNumber(queryParams.get(QueryParameters.PITCH)) ?? 0;
		const roll = parseNumber(queryParams.get(QueryParameters.ROLL)) ?? 0;
		if (isCoordinate(center) || isNumber(zoom)) {
			changeZoomCenterRotationPitchRoll({
				zoom: zoom ?? Math.round(mapService.getMaxZoomLevel() - mapService.getMaxZoomLevel() / 2),
				center: center ?? coordinateService.getCenter(mapService.getDefaultMapExtent()),
				rotation,
				pitch,
				roll
			});
		}
		//fallback
		else {
			this._setPositionFromConfig(rotation);
		}
	}

	_setPositionFromConfig(rotation) {
		const { MapService: mapService } = $injector.inject('MapService');

		setTimeout(() => {
			fit(mapService.getDefaultMapExtent(), { useVisibleViewport: false });
			changeRotation(rotation);
		});
	}

	_init() {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		const queryParams = environmentService.getQueryParams();

		this._setPositionFromQueryParams(queryParams);
	}

	/**
	 * @override
	 */
	async register() {
		this._init();
	}
}
