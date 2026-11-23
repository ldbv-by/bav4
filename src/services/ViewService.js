import { GeoResourceTypes } from '@src/domain/geoResources';
import { Tools, WcTools } from '@src/domain/tools';
import { ViewMode } from '@src/domain/view';
import { $injector } from '@src/injection';

export class ViewService {
	#geoResourceService;

	constructor() {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this.#geoResourceService = geoResourceService;
	}

	isGeoResourceAvailable(geoResourceId) {
		const geoResource = this.#geoResourceService.byId(geoResourceId);
		if (geoResource) {
			const supportedTypes = [GeoResourceTypes.XYZ, GeoResourceTypes.WMS, GeoResourceTypes.VECTOR];

			if (geoResource.getType() === GeoResourceTypes.AGGREGATE) {
				return geoResource.geoResourceIds.map((grId) => this.isGeoResourceAvailable(grId)).every((val) => val === true);
			}

			return supportedTypes.includes(geoResource.getType());
		}
		return false;
	}

	isToolAvailable(toolId) {
		const d2Tools = [...Object.values(Tools), ...WcTools];
		const d3Tools = [Tools.SHARE, Tools.IMPORT, Tools.EXPORT];

		return this._getCurrentViewMode() === ViewMode.D2 ? d2Tools.includes(toolId) : d3Tools.includes(toolId);
	}

	_getCurrentViewMode() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		return storeService.getStore().getState().view.mode === ViewMode.D3 ? ViewMode.D3 : ViewMode.D2;
	}
}
