import { GeoResourceTypes, VectorSourceType } from '../../../services/domain/geoResources';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { KML, GPX, GeoJSON } from 'ol/format';


export const mapVectorSourceTypeToFormat = (sourceType) => {


	switch (sourceType) {
		case VectorSourceType.KML:
			return new KML();


		case VectorSourceType.GPX:
			return new GPX();

		case VectorSourceType.GEOJSON:
			return new GeoJSON();
	}
	throw new Error(sourceType + ' currently not supported');
};

export const toOlLayer = (georesource) => {

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
					url: georesource.url,
					format: mapVectorSourceTypeToFormat(georesource.sourceType)
				}),
			});
	}

	throw new Error(georesource.getType() + ' currently not supported');
};

export const updateOlLayer = (olLayer, layer) => {

	olLayer.setVisible(layer.visible);
	olLayer.setOpacity(layer.opacity);
	return olLayer;
};