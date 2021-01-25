import { GeoResourceTypes } from '../../../services/domain/geoResources';
import { Image as ImageLayer } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';

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
	}

	throw new Error(georesource.getType() + ' currently not supported');
};

export const updateOlLayer = (olLayer, layer) => {

	olLayer.setVisible(layer.visible);
	olLayer.setOpacity(layer.opacity);
	return olLayer;
};