import { GeoResourceTypes, VectorSourceType } from '../../../../services/domain/geoResources';
import { Image as ImageLayer, Vector as VectorLayer, Group as LayerGroup, Layer } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { KML, GPX, GeoJSON } from 'ol/format';
import { $injector } from '../../../../injection';
import { load as featureLoader } from './utils/feature.provider';
import { Map as MlMap } from 'maplibre-gl';
import { toLonLat } from 'ol/proj';
import { observe } from '../../../../utils/storeUtils';


const getUrlService = () => {

	const { UrlService: urlService } = $injector.inject('UrlService');
	return urlService;
};

const getStoreService = () => {

	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService;
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

export const toOlLayer = (georesource, mapContainer) => {

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

		case GeoResourceTypes.VECTOR:
			return new VectorLayer({
				id: georesource.id,
				source: new VectorSource({
					url: getUrlService().proxifyInstant(georesource.url),
					loader: featureLoader,
					format: mapVectorSourceTypeToFormat(georesource.sourceType)
				}),
			});

		case GeoResourceTypes.AGGREGATE: {
			return new LayerGroup({
				id: georesource.id,
				layers: georesource.geoResourceIds.map(id => toOlLayer(id))
			});
		}

		case GeoResourceTypes.VECTOR_TILES:
			return createMlLayer(georesource.id, mapContainer);
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

const createMlLayer = (id, mapContainer) => {



	const mlMap = new MlMap({
		style: 'https://adv-smart.de/styles/public/de_style_colour_light.json',
		attributionControl: false,
		boxZoom: false,
		center: [0, 0],
		container: mapContainer,
		doubleClickZoom: false,
		dragPan: false,
		dragRotate: false,
		interactive: false,
		keyboard: false,
		pitchWithRotate: false,
		scrollZoom: false,
		touchZoomRotate: false
	});


	const setStyle = (theme) => {
		if (theme === 'dark') {
			mlMap.setStyle('https://adv-smart.de/styles/public/de_style_night.json');
		}
		else {
			mlMap.setStyle('https://adv-smart.de/styles/public/de_style_colour_light.json');
		}

	};
	setStyle(getStoreService().getStore().getState().uiTheme.theme);
	observe(getStoreService().getStore(), state => state.uiTheme.theme, setStyle);



	const mlLayer = new Layer({
		id: id,
		render: function (frameState) {
			const canvas = mlMap.getCanvas();
			const viewState = frameState.viewState;
			const visible = mlLayer.getVisible();
			canvas.style.display = visible ? 'block' : 'none';
			const opacity = mlLayer.getOpacity();
			canvas.style.opacity = opacity;
			// adjust view parameters in mapbox
			const rotation = viewState.rotation;
			if (rotation) {
				mlMap.rotateTo(-rotation * 180 / Math.PI, {
					animate: false
				});
			}
			mlMap.jumpTo({
				center: toLonLat(viewState.center),
				zoom: viewState.zoom - 1,
				animate: false
			});
			// cancel the scheduled update & trigger synchronous redraw
			// see https://github.com/mapbox/mapbox-gl-js/issues/7893#issue-408992184
			// NOTE: THIS MIGHT BREAK WHEN UPDATING MAPBOX
			if (mlMap._frame) {
				mlMap._frame.cancel();
				mlMap._frame = null;
			}
			mlMap._render();
			return canvas;
		}
	});
	return mlLayer;
};
