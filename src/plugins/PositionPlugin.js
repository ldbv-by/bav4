/**
 * @module plugins/PositionPlugin
 */
import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { changeCenterAndRotation, changeZoomAndRotation, changeZoomCenterAndRotation, fit } from '../store/position/position.action';
import { isCoordinate, isNumber } from '../utils/checks';
import { observe } from '../utils/storeUtils';

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
			const isWGS84Coordinate = Math.abs(center[0]) <= 180 && Math.abs(center[1]) <= 90;
			return isWGS84Coordinate ? 4326 : mapService.getLocalProjectedSrid();
		};

		const parseCenter = (centerValue) => {
			if (centerValue) {
				const center = centerValue.split(',');
				if (center.length === 2 && isFinite(center[0]) && isFinite(center[1])) {
					const coordinate = center.map((v) => parseFloat(v));
					return coordinateService.transform(coordinate, detectSrid(coordinate), mapService.getSrid());
				}
			}

			return null;
		};

		const parseZoom = (zoomValue) => {
			if (zoomValue && isFinite(zoomValue)) {
				return parseFloat(zoomValue);
			}
			return null;
		};

		const parseRotation = (rotationValue) => {
			if (rotationValue && isFinite(rotationValue)) {
				return parseFloat(rotationValue);
			}
			return null;
		};

		const center = parseCenter(queryParams.get(QueryParameters.CENTER));
		const zoom = parseZoom(queryParams.get(QueryParameters.ZOOM));
		const rotation = parseRotation(queryParams.get(QueryParameters.ROTATION));

		if (isCoordinate(center) && isNumber(zoom)) {
			changeZoomCenterAndRotation({ zoom: zoom, center: center, rotation: isNumber(rotation) ? rotation : 0 });
		} else if (isCoordinate(center) && !isNumber(zoom)) {
			changeCenterAndRotation({ center, rotation: isNumber(rotation) ? rotation : 0 });
		} else if (!isCoordinate(center) && isNumber(zoom)) {
			changeZoomAndRotation({ zoom: zoom, rotation: isNumber(rotation) ? rotation : 0 });
		}
		//fallback
		else {
			this._setPositionFromConfig();
		}
	}

	_setPositionFromConfig() {
		const { MapService: mapService } = $injector.inject('MapService');

		setTimeout(() => {
			fit(mapService.getDefaultMapExtent(), { useVisibleViewport: false });
		});
	}

	_init(store) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		const queryParams = environmentService.getQueryParams();

		//from query params
		if (queryParams.has(QueryParameters.CENTER) || queryParams.has(QueryParameters.ZOOM)) {
			this._setPositionFromQueryParams(queryParams);
		}
		//from config
		else {
			this._setPositionFromConfig();
		}

		if (environmentService.isEmbeddedAsWC()) {
			// handle WC attribute changes
			observe(
				store,
				(state) => state.wcAttribute.changed,
				() => {
					this._setPositionFromQueryParams(environmentService.getQueryParams());
				}
			);
		}
	}

	/**
	 * @override
	 */
	async register(store) {
		this._init(store);
	}
}
