import { Style, Stroke, Fill, Text as TextStyle } from 'ol/style';

import { DEVICE_PIXEL_RATIO } from 'ol/has';


import { FIELD_NAME_PAGE_PIXEL_COORDINATES } from './OlMfpHandler';
import { getPolygonFrom } from '../../utils/olGeometryUtils';
import { equals, getIntersection } from 'ol/extent';



const fontSizePX = 70;
export const createAreaPattern = () => {
	// Create a pattern
	const patternCanvas = document.createElement('canvas');
	const patternContext = patternCanvas.getContext('2d');

	// Give the pattern a width and height of 50
	patternCanvas.width = 50;
	patternCanvas.height = 50;

	// Give the pattern a background color and draw a line
	patternContext.fillStyle = 'rgba(204, 204, 204, 0.33)';
	patternContext.strokeStyle = 'rgba(100, 100, 100, 0.2)';
	patternContext.lineWidth = 15;
	patternContext.lineCap = 'square';
	// Shadow
	patternContext.shadowColor = 'rgba(100, 100, 100, 1)';
	patternContext.shadowBlur = 3;
	patternContext.beginPath();
	patternContext.moveTo(-50, 0);
	patternContext.lineTo(0, 50);
	patternContext.stroke();
	patternContext.beginPath();
	patternContext.moveTo(0, 0);
	patternContext.lineTo(50, 50);
	patternContext.stroke();
	patternContext.beginPath();
	patternContext.moveTo(50, 0);
	patternContext.lineTo(100, 50);
	patternContext.stroke();

	// Create our primary canvas and fill it with the pattern
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const pattern = ctx.createPattern(patternCanvas, 'repeat');
	return pattern;
};
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

export const createThumbnailStyleFunction = (label, warnLabel, validExtent) => {

	const baseStyle = new Style({
		stroke: new Stroke(
			{
				color: [9, 157, 220, 0.3],
				width: 3
			}),
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
	});

	const warnStyle = new Style({
		geometry: (feature) => {
			const extent = feature.getGeometry().getExtent();
			const intersect = getIntersection(extent, validExtent);
			if (!equals(intersect, extent)) {
				return feature.getGeometry();
			}
		},
		stroke: new Stroke(
			{
				color: [255, 100, 100, 1],
				width: 4
			}),
		text: new TextStyle(
			{
				text: warnLabel,
				textAlign: 'center',

				font: `bold ${fontSizePX / 4}px sans-serif`,
				stroke: new Stroke({
					color: [255, 255, 255, 0.8],
					width: 3
				}),
				fill: new Fill({
					color: [250, 50, 50, 1]
				}),
				scale: 1,
				offsetY: 15,
				overflow: false
			})
	});
	const pattern = createAreaPattern();
	const areaOfDistortionStyle = new Style({
		geometry: (feature) => {
			const extent = feature.getGeometry().getExtent();
			const intersect = getIntersection(extent, validExtent);
			if (!equals(intersect, extent)) {
				const outer = getPolygonFrom(extent);
				outer.appendLinearRing(getPolygonFrom(intersect));
				return outer;
			}
		},
		fill: new Fill({
			color: pattern
		})
	});
	return [
		baseStyle,
		warnStyle,
		areaOfDistortionStyle
	];
};

export const nullStyleFunction = () => [new Style({})];

const getMask = (map, pixelCoordinates) => {
	const size = map.getSize();
	const width = size[0] * DEVICE_PIXEL_RATIO;
	const height = size[1] * DEVICE_PIXEL_RATIO;

	const outerPixels = [
		[0, 0],
		[width, 0],
		[width, height],
		[0, height],
		[0, 0]];


	return [outerPixels, pixelCoordinates];
};

export const createMapMaskFunction = (map, feature) => {

	const drawMask = (ctx, mask) => {
		const outer = mask[0];
		const inner = mask[1];
		ctx.beginPath();

		// outside -> clockwise
		ctx.moveTo(outer[0][0], outer[0][1]);
		outer.slice(1).forEach(c => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		// inside -> counter-clockwise
		ctx.moveTo(inner[0][0], inner[0][1]);
		[...inner].reverse().slice(1).forEach(c => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		ctx.fillStyle = 'rgba(0,0,0,0.4)';
		ctx.fill();

	};

	const getPageRectangle = (pageCoordinates) => {
		const xValues = pageCoordinates.map(c => c[0]);
		const yValues = pageCoordinates.map(c => c[1]);
		const width = Math.max(...xValues) - Math.min(...xValues);
		const height = Math.max(...yValues) - Math.min(...yValues);

		return { x: Math.min(...xValues), y: Math.min(...yValues), width: width, height: height };
	};

	const getCenter = (rectangle) => {
		return [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
	};

	const getScaling = (rectangle, bufferFactor) => {
		return [1 + bufferFactor, 1 + bufferFactor];
	};

	const drawPassepartout = (ctx, pageCoordinates) => {
		const passepartoutWidthFactor = 0.02;
		const pageRectangle = getPageRectangle(pageCoordinates);
		const center = getCenter(pageRectangle);
		const centerRelative = pageCoordinates.map(c => [c[0] - center[0], c[1] - center[1]]);

		const scale = getScaling(pageRectangle, passepartoutWidthFactor);

		ctx.strokeStyle = 'rgba(255,255,255,0.4)';
		ctx.beginPath();

		ctx.translate(center[0], center[1]);
		ctx.scale(scale[0], scale[1]);
		ctx.lineWidth = pageRectangle.width * passepartoutWidthFactor;
		ctx.moveTo(centerRelative[0][0], centerRelative[0][1]);
		centerRelative.slice(1).forEach(c => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		ctx.stroke();
		ctx.setTransform(1, 0, 0, 1, 0, 0);

	};

	const renderMask = (event) => {
		const pixelCoordinates = feature.get(FIELD_NAME_PAGE_PIXEL_COORDINATES);
		const pixelMask = getMask(map, pixelCoordinates);
		const ctx = event.context;

		drawMask(ctx, pixelMask);
		drawPassepartout(ctx, pixelMask[1]);

		ctx.restore();

	};
	return renderMask;
};
