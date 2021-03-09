import { $injector } from '../../../injection';
import { addLayer } from './layers.action';


export class LayersHandler  {

	/**
	 * Initializes the georesource service and adds a layer  (kind of background layer) to the list of layers in the store
	 */
	async init() {

		//Todo: bgLayerIds needs to be loaded from backend at a later moment
		const bgLayerIds = ['atkis'];
		const { GeoResourceService: georesourceService } = $injector.inject('GeoResourceService');

		//no try-catch needed, service at least delivers a fallback
		const geoResources = await georesourceService.init();
		//add bg layer
		const bgGeoresources = geoResources.filter(geoResource => geoResource.id === bgLayerIds[0]);
		//fallback: add the first available georesource as bg
		if (bgGeoresources.length === 0) {
			bgGeoresources.push(geoResources[0]);
		}
		addLayer(bgGeoresources[0].id, { label: bgGeoresources[0].label });
	}
}

export const register = (store, handler = new LayersHandler()) => {

	handler.init();

	//will come later
	// const onLayersChanged = () => {};
	// observe(store, state => state.layers.active, onLayersChanged);
};