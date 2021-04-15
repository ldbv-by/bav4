import { $injector } from '../../../injection';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { BaPlugin } from '../../../store/BaPlugin';
import { changeZoomAndCenter, setFit } from './position.action';

/**
 * @class
 * @author taulinger
 */
export class PositionPlugin extends BaPlugin {

	_setPositionFromQueryParams(queryParams) {

		const {
			CoordinateService: coordinateService,
			MapService: mapService,
		} = $injector.inject('CoordinateService', 'MapService');

		const detectSrid = (center) => {
			const isWGS84Coordinate = Math.abs(center[0]) <= 180 && Math.abs(center[1]) <= 90;
			return isWGS84Coordinate ? 4326 : mapService.getDefaultGeodeticSrid();
		};

		const parseCenter = (centerValue) => {
			const center = centerValue.split(',');
			if (center.length === 2 && isFinite(center[0]) && isFinite(center[1])) {
				const coordinate = center.map(v => parseFloat(v));
				return coordinateService.transform(coordinate, detectSrid(coordinate), mapService.getSrid());
			}

			return;
		};

		const parseZoom = (zoomValue) => {
			if (zoomValue && isFinite(zoomValue)) {
				return parseFloat(zoomValue);
			}
			return;
		};

		const center = parseCenter(queryParams.get(QueryParameters.CENTER));
		const zoom = parseZoom(queryParams.get(QueryParameters.ZOOM));

		if (center && zoom) {
			changeZoomAndCenter({ zoom: zoom, center: center });
		}
		//fallback
		else {
			this._setPositionFromConfig();
		}
	}

	_setPositionFromConfig() {
		const {
			MapService: mapService,
		} = $injector.inject('MapService');

		setTimeout(() => {
			setFit(mapService.getDefaultMapExtent());
		});
	}

	_init() {

		const { EnvironmentService: environmentService }
			= $injector.inject('EnvironmentService');

		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

		//from query params
		if (queryParams.has(QueryParameters.CENTER) && queryParams.has(QueryParameters.ZOOM)) {
			this._setPositionFromQueryParams(queryParams);
		}
		//from config
		else {
			this._setPositionFromConfig();
		}
	}

	/**
	 * @override
	 */
	async register() {
		this._init();
	}
}
