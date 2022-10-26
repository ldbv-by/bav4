import { Style, Stroke, Fill, Text as TextStyle } from 'ol/style';
import { getVectorContext } from 'ol/render';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { Polygon } from 'ol/geom';

import { FIELD_NAME_PAGE_BUFFER } from './OlMfpHandler';

const fontSizePX = 70;

export const mfpTextStyleFunction = (label, index = 0, globalOffset = 1) => {

	return new Style({
		text: new TextStyle({
			text: label,
			font: `normal ${fontSizePX}px sans-serif`,
			stroke: new Stroke({
				color: [0, 0, 0, 0.5],
				width: 2
			}),
			fill: new Fill({
				color: [80, 80, 80, 0.3]
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
	stroke: new Stroke({
		color: [9, 157, 220, 1],
		width: 3
	})
});

export const mfpPageStyleFunction = () => new Style({
	fill: new Fill({
		color: [255, 255, 255, 0.4]
	})
});

export const thumbnailStyleFunction = (label) => [
	new Style({
		stroke: new Stroke(
			{
				color: [9, 157, 220, 0.3],
				width: 3
			})
	}),
	new Style({
		text: new TextStyle(
			{
				text: '  ' + label.replace('\n', ' '),
				textAlign: 'left',
				font: `bold ${fontSizePX / 4}px sans-serif`,
				stroke: new Stroke({
					color: [255, 255, 255, 0.8],
					width: 2
				}),
				fill: new Fill({
					color: [44, 90, 146, 1]
				}),
				scale: 1,
				offsetY: 15,
				overflow: false,
				placement: 'line',
				baseline: 'hanging'
			})
	})];

export const nullStyleFunction = () => [new Style({})];

export const maskFeatureStyleFunction = () => {

	const fill = new Fill({
		color: [0, 0, 0, 0.4]
	});
	const maskStyle = new Style({
		fill: fill
	});

	return maskStyle;
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
	const pageStyle = mfpPageStyleFunction();

	const renderMask = (event) => {
		const pageBuffer = feature.get(FIELD_NAME_PAGE_BUFFER).clone();

		const innerPolygon = feature.getGeometry();
		const mask = getMaskGeometry(map, innerPolygon);
		const vectorContext = getVectorContext(event);

		vectorContext.setStyle(innerStyle);
		vectorContext.drawGeometry(innerPolygon);

		vectorContext.setStyle(outerStyle);
		vectorContext.drawGeometry(mask);

		pageBuffer.appendLinearRing(innerPolygon.getLinearRing(0));
		vectorContext.setStyle(pageStyle);
		vectorContext.drawGeometry(pageBuffer);
	};
	return renderMask;
};
