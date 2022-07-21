import { Style, Stroke, Fill } from 'ol/style';
import { getVectorContext } from 'ol/render';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { Polygon } from 'ol/geom';

export const mfpBoundaryStyleFunction = () => [new Style({
	fill: new Fill({
		color: [255, 0, 0, 0.1]
	}),
	stroke: new Stroke({
		color: [255, 0, 0, 0.9],
		width: 3
	})
})];

export const nullStyleFunction = () => [new Style({})];

export const maskFeatureStyleFunction = () => {

	const stroke = new Stroke(
		{
			color: [0, 0, 0, 0.8],
			width: 1
		}
	);
	const fill = new Fill({
		color: [0, 0, 0, 0.4]
	});
	const maskStyle = new Style({
		fill: fill,
		stroke: stroke
	});

	return maskStyle;
};

export const createMapMaskFunction = (map, feature) => {

	const renderMask = (event) => {
		const vectorContext = getVectorContext(event);


		const innerCoords = feature.getGeometry().getCoordinates();
		const innerPixels = innerCoords[0].map(c => map.getPixelFromCoordinate(c));
		const size = map.getSize();
		const width = size[0] * DEVICE_PIXEL_RATIO;
		const height = size[1] * DEVICE_PIXEL_RATIO;
		const maskBoundaryInPixels = [[0, 0], [width, 0], [width, height], [0, height], [0, 0]];
		const mask = new Polygon([maskBoundaryInPixels,
			innerPixels
		]);

		vectorContext.setStyle(maskFeatureStyleFunction());
		vectorContext.drawGeometry(mask);
	};
	return renderMask;

};
