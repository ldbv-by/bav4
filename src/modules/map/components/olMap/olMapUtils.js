import { GeoResourceTypes } from '../../../../services/domain/geoResources';
import { Image as ImageLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import { $injector } from '../../../../injection';


export const toOlLayer = (geoResource) => {

	const {
		GeoResourceService: georesourceService,
		VectorImportService: vectorImportService
	} = $injector.inject('GeoResourceService', 'VectorImportService');

	const createVectorSource = (geoResource) => {
		return geoResource.url
			? vectorImportService.vectorSourceFromExternalData(geoResource)
			: vectorImportService.vectorSourceFromInternalData(geoResource);
	};


	switch (geoResource.getType()) {
		case GeoResourceTypes.WMS:
			return new ImageLayer({
				id: geoResource.id,
				source: new ImageWMS({
					url: geoResource.url,
					crossOrigin: 'anonymous',
					params: {
						'LAYERS': geoResource.layers,
						'FORMAT': geoResource.format,
						'VERSION': '1.1.1'
					}
				}),
			});

		case GeoResourceTypes.WMTS:
			return new TileLayer({
				id: geoResource.id,
				source: new XYZSource({
					url: geoResource.url,
				})
			});

		case GeoResourceTypes.VECTOR: {

			const vgr = new VectorLayer({
				id: geoResource.id,
				source: createVectorSource(geoResource)
			});

			return vgr;
		}

		case GeoResourceTypes.AGGREGATE: {
			return new LayerGroup({
				id: geoResource.id,
				layers: geoResource.geoResourceIds.map(id => toOlLayer(georesourceService.byId(id)))
			});
		}
	}

	throw new Error(geoResource.getType() + ' currently not supported');
};

export const updateOlLayer = (olLayer, layer) => {

	olLayer.setVisible(layer.visible);
	olLayer.setOpacity(layer.opacity);
	return olLayer;
};


export const toOlLayerFromHandler = (id, handler, map) => {

	const olLayer = handler.activate(map);

	if (olLayer) {
		olLayer.set('id', id);
	}
	return olLayer;
};

/**
 * Registers a listener on long touch/click events.
 * @param {OlMap} map 
 * @param {function(MapBrowserEvent)} callback callback with a MapBrowserEvent as argument
 * @param {number} [delay] delay in ms (default=300)
 */
export const registerLongPressListener = (map, callback, delay = 300) => {

	let timeoutID;
	map.on('pointerdown', (evt) => {
		if (timeoutID) {
			window.clearTimeout(timeoutID);
		}
		timeoutID = window.setTimeout(() => callback(evt), delay);
	});
	map.on('pointerup', () => {
		window.clearTimeout(timeoutID);
	});
	map.on('pointermove', (event) => {
		if (event.dragging) {
			window.clearTimeout(timeoutID);
		}
	});
};