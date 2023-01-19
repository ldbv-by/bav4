import { Style, Stroke, Fill, Text as TextStyle } from 'ol/style';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { toContext } from 'ol/render';

const fontSizePX = 70;

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

export const createMapMaskFunction = (map, getPixelCoordinatesCallback) => {

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
