import { Style, Stroke, Fill, Text as TextStyle } from 'ol/style';
import { getVectorContext } from 'ol/render';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { Polygon } from 'ol/geom';

export const mfpBoundaryStyleFunction = (label = null) => [new Style({
	fill: new Fill({
		color: [9, 157, 220, 0.1]
	}),
	stroke: new Stroke({
		color: [9, 157, 220, 0.9],
		width: 1
	}),
	text: label ? new TextStyle({
		text: label,
		font: 'normal 70px sans-serif',
		stroke: new Stroke({
			//color: [9, 157, 220, 0.9],
			color: [0, 0, 0, 0.8],
			width: 2
		}),
		fill: new Fill({
			//color: [9, 157, 220, 0.4]
			color: [0, 0, 0, 0.4]
		}),
		scale: 1,
		placement: 'point',
		baseline: 'hanging'
	}) : null
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

export const createMapMaskFunction = (map, feature, text) => {

	const renderMask = (event) => {
		const vectorContext = getVectorContext(event);
		vectorContext.setStyle(maskFeatureStyleFunction(text));
		const innerPolygon = feature.getGeometry();

		const size = map.getSize();
		const width = size[0] * DEVICE_PIXEL_RATIO;
		const height = size[1] * DEVICE_PIXEL_RATIO;
		const outerPixels = [[0, 0], [width, 0], [width, height], [0, height], [0, 0]];
		const mask = new Polygon([outerPixels.map(p => map.getCoordinateFromPixel(p))]);
		mask.appendLinearRing(innerPolygon.getLinearRing(0));
		vectorContext.drawGeometry(mask);
	};
	return renderMask;

};
