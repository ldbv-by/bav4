import { Style, Stroke, Fill, Text as TextStyle } from 'ol/style';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { toContext } from 'ol/render';



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

export const createThumbnailStyleFunction = (warnLabel, beingDraggedCallback) => {
	const getCanvasContextRenderFunction = (state) => {
		const renderContext = toContext(state.context, { pixelRatio: 1 });
		return (geometry, style) => {
			renderContext.setStyle(style);
			renderContext.drawGeometry(geometry);
		};
	};

	const baseStyle = new Style({
		stroke: new Stroke(
			{
				color: [9, 157, 220, 0.5],
				width: 3
			})
	});

	const warnStyle = new Style({
		stroke: new Stroke(
			{
				color: [255, 100, 100, 0.5],
				width: 3
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

	const renderStyle = new Style({
		renderer: (pixelCoordinates, state) => {
			const getContextRenderFunction = (state) => state.customContextRenderFunction ? state.customContextRenderFunction : getCanvasContextRenderFunction(state);
			const beingDragged = beingDraggedCallback();
			if (!beingDragged) {
				const geometry = state.geometry.clone();
				geometry.setCoordinates(pixelCoordinates);
				const inPrintableArea = state.feature.get('inPrintableArea') ?? true;

				const contextRenderFunction = getContextRenderFunction(state);
				contextRenderFunction(geometry, inPrintableArea ? baseStyle : warnStyle);
			}
		}
	});

	return [renderStyle];
};


export const nullStyleFunction = () => [new Style({})];

export const createSimpleMapMaskFunction = (map, getPixelCoordinatesCallback) => {

	const getMask = (map, pixelCoordinates) => {
		const size = map.getSize();
		const width = size[0] * DEVICE_PIXEL_RATIO;
		const height = size[1] * DEVICE_PIXEL_RATIO;
		const outerPixelPolygon = [
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0]];

		return [outerPixelPolygon, pixelCoordinates.map(c => [c[0] * DEVICE_PIXEL_RATIO, c[1] * DEVICE_PIXEL_RATIO])];
	};

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

		ctx.fillStyle = 'rgba(0, 5, 25, 0.75)';
		ctx.fill();
	};

	const renderMask = (event) => {
		const pixelCoordinates = getPixelCoordinatesCallback();
		const pixelMask = getMask(map, pixelCoordinates);
		const ctx = event.context;
		drawMask(ctx, pixelMask);

		ctx.restore();
	};
	return renderMask;
};


export const createMapMaskFunction = (map, feature, useCacheCallback) => {
	let cachedPixelCoordinates = null;
	const getMask = (map, pixelCoordinates) => {
		const size = map.getSize();
		const width = size[0] * DEVICE_PIXEL_RATIO;
		const height = size[1] * DEVICE_PIXEL_RATIO;

		const outerPixelPolygon = [
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0]];

		return [outerPixelPolygon, pixelCoordinates];
	};

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

	const drawPassepartout = (ctx, pageCoordinates) => {
		const passepartoutWidthFactor = 0.02;
		const pageRectangle = getPageRectangle(pageCoordinates);
		const center = getCenter(pageRectangle);
		const centerRelative = pageCoordinates.map(c => [c[0] - center[0], c[1] - center[1]]);

		ctx.strokeStyle = 'rgba(255,255,255,0.4)';
		ctx.beginPath();

		ctx.translate(center[0], center[1]);
		ctx.scale(1 + passepartoutWidthFactor, 1 + passepartoutWidthFactor);
		ctx.lineWidth = pageRectangle.width * passepartoutWidthFactor;
		ctx.moveTo(centerRelative[0][0], centerRelative[0][1]);
		centerRelative.slice(1).forEach(c => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		ctx.stroke();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	};

	const drawInnerContour = (ctx, pageCoordinates) => {

		ctx.strokeStyle = 'rgba(44, 90, 146, 1)';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(pageCoordinates[0], pageCoordinates[1]);
		pageCoordinates.slice(1).forEach(c => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		ctx.stroke();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	};

	const toPixelCoordinates = (geometry) => {
		return geometry.getCoordinates()[0].map(c => map.getPixelFromCoordinate(c));
	};
	const getOrCreatePixelCoordinates = (feature) => {
		const createNew = () => {
			const pixelCoordinates = toPixelCoordinates(feature.getGeometry());
			cachedPixelCoordinates = pixelCoordinates;
			return pixelCoordinates;
		};

		const getCached = () => {
			return cachedPixelCoordinates ? cachedPixelCoordinates : createNew();
		};
		const useCache = useCacheCallback();
		return useCache ? getCached() : createNew();
	};

	const renderMask = (event) => {
		const pixelCoordinates = getOrCreatePixelCoordinates(feature);
		const pixelMask = getMask(map, pixelCoordinates);
		const ctx = event.context;

		drawMask(ctx, pixelMask);
		drawPassepartout(ctx, pixelMask[1]);
		drawInnerContour(ctx, pixelMask[1]);

		ctx.restore();
	};
	return renderMask;
};
