import { Style, Stroke, Fill, Text as TextStyle } from 'ol/style';
import { getVectorContext } from 'ol/render';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { Polygon } from 'ol/geom';

import { getBottomRight, getTopLeft } from 'ol/extent';

const fontSizePX = 70;

export const mfpTextStyleFunction = (label, index = 0, globalOffset = 1) => {

	return new Style({
		text: new TextStyle({
			text: label,
			font: `normal ${fontSizePX}px sans-serif`,
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
			offsetY: fontSizePX * index - (globalOffset / 2) * fontSizePX,
			overflow: false,
			placement: 'point',
			baseline: 'hanging'
		})
	});
};

export const mfpBoundaryStyleFunction = () => new Style({
	fill: new Fill({
		color: [9, 157, 220, 0.1]
	}),
	stroke: new Stroke({
		color: [9, 157, 220, 0.9],
		width: 1
	})
});

export const thumbnailStyleFunction = () => [new Style({
	stroke: new Stroke(
		{
			color: [9, 157, 220, 0.1],
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
const getPixelWidth = (geometry, map) => {
	const boundingBox = geometry.getExtent();
	const boundingBoxPixel = [map.getPixelFromCoordinate(getTopLeft(boundingBox)), map.getPixelFromCoordinate(getBottomRight(boundingBox))];
	return boundingBoxPixel[1][0] - boundingBoxPixel[0][0];
};

const getMaskGeometry = (map, innerGeometry) => {
	const size = map.getSize();
	const width = size[0] * DEVICE_PIXEL_RATIO;
	const height = size[1] * DEVICE_PIXEL_RATIO;
	const outerPixels = [[0, 0], [width, 0], [width, height], [0, height], [0, 0]];
	const mask = new Polygon([outerPixels.map(p => map.getCoordinateFromPixel(p))]);
	mask.appendLinearRing(innerGeometry.getLinearRing(0));

	return mask;
};

export const createMapMaskFunction = (map, feature) => {

	const innerStyle = mfpBoundaryStyleFunction();
	const outerStyle = maskFeatureStyleFunction();

	const renderMask = (event) => {
		const text = feature.get('name');
		const textLines = text ? text.split('\n') : null;
		const textStyles = textLines ? textLines.map((l, i, a) => mfpTextStyleFunction(l, i, a.length)) : [];

		const context2d = event.context.canvas.getContext('2d');
		const innerPolygon = feature.getGeometry();
		const mask = getMaskGeometry(map, innerPolygon);
		const vectorContext = getVectorContext(event);


		vectorContext.setStyle(innerStyle);
		vectorContext.drawGeometry(innerPolygon);

		const maxTextWidth = Math.max(...textLines.map(t => context2d.measureText(t).width));
		const geomWidth = getPixelWidth(innerPolygon, map);

		const isTextOverflow = maxTextWidth > geomWidth;
		if (!isTextOverflow) {
			textStyles.forEach(style => {
				vectorContext.setStyle(style);
				vectorContext.drawGeometry(innerPolygon);
			});
		}

		vectorContext.setStyle(outerStyle);
		vectorContext.drawGeometry(mask);
	};
	return renderMask;

};
