import { $injector } from '../../../injection';
import { observe } from '../../../utils/storeUtils';
import { addLayer } from './layers.action';

export const register = (store) => {

	const {
		GeoResourceService: georesourceService,
	}
		= $injector.inject('GeoResourceService');
	
	georesourceService.init().then((geoResouces) => {
		const initialBgGeoResource = geoResouces.filter(geoResource => geoResource.background)[0];
		if (initialBgGeoResource) {
			addLayer(initialBgGeoResource.id, { label: initialBgGeoResource.label });
		}
	});


	const onLayersChanged = () => {


	};

	observe(store, state => state.layers.active, onLayersChanged);
};