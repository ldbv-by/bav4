import { GeoResourceTypes, VectorSourceType } from '../../../../services/domain/geoResources';
import { Image as ImageLayer, Vector as VectorLayer, Group as LayerGroup } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { KML, GPX, GeoJSON } from 'ol/format';
import { $injector } from '../../../../injection';
import { load as featureLoader } from './utils/feature.provider';


const getUrlService = () => {

	const { UrlService: urlService } = $injector.inject('UrlService');
	return urlService;
};

export const iconUrlFunction = (url) => getUrlService().proxifyInstant(url);

export const mapVectorSourceTypeToFormat = (sourceType) => {

	switch (sourceType) {
		case VectorSourceType.KML:
			return new KML({ iconUrlFunction: iconUrlFunction });

		case VectorSourceType.GPX:
			return new GPX();

		case VectorSourceType.GEOJSON:
			return new GeoJSON();
	}
	throw new Error(sourceType + ' currently not supported');
};

export const toOlLayer = (georesource) => {

	const {
		GeoResourceService: georesourceService,
		MapService: mapService
	} = $injector.inject('GeoResourceService', 'MapService');

	const createVectorSource = (geoResource) => {
		//external source
		if (geoResource.url) {

			return new VectorSource({
				url: getUrlService().proxifyInstant(georesource.url),
				loader: featureLoader,
				format: mapVectorSourceTypeToFormat(georesource.sourceType)
			});
		}

		//internal source
		const vectorSource = new VectorSource();
		geoResource.getData().then(data => {
			const format = mapVectorSourceTypeToFormat(georesource.sourceType);
			const features = format.readFeatures(data);

			//If we know now a better name for the geoResource we update the label
			switch (georesource.sourceType) {
				case VectorSourceType.KML:
					geoResource.label = format.readName(data) ?? geoResource.label;
					break;
			}

			features.forEach(f => {
				f.getGeometry().transform('EPSG:' + geoResource.srid, 'EPSG:' + mapService.getSrid());
				f.set('srid', mapService.getSrid(), true);
			});
			vectorSource.addFeatures(features);
		}, reason => {
			console.warn(reason);
		});
		return vectorSource;
	};

	switch (georesource.getType()) {
		case GeoResourceTypes.WMS:
			return new ImageLayer({
				id: georesource.id,
				source: new ImageWMS({
					url: georesource.url,
					crossOrigin: 'anonymous',
					params: {
						'LAYERS': georesource.layers,
						'FORMAT': georesource.format,
						'VERSION': '1.1.1'
					}
				}),
			});

		case GeoResourceTypes.WMTS:
			return new TileLayer({
				id: georesource.id,
				source: new XYZSource({
					url: georesource.url,
				})
			});

		case GeoResourceTypes.VECTOR: {

			const vgr = new VectorLayer({
				id: georesource.id,
				source: createVectorSource(georesource)
			});

			return vgr;
		}


		case GeoResourceTypes.AGGREGATE: {
			return new LayerGroup({
				id: georesource.id,
				layers: georesource.geoResourceIds.map(id => toOlLayer(georesourceService.byId(id)))
			});
		}
	}

	throw new Error(georesource.getType() + ' currently not supported');
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