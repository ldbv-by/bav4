import { Style } from 'ol/style';
import { DEVICE_PIXEL_RATIO } from 'ol/has';

export const createThumbnailStyleFunction = (beingDraggedCallback) => {

	const isPolygonArray = (arr) => arr[0][0] != null && arr[0][0][0] != null;

	const drawBoundary = (context, pixelCoordinates, style) => {
		context.beginPath();
		context.moveTo(pixelCoordinates[0][0], pixelCoordinates[0][1]);
		[...pixelCoordinates].slice(1).forEach(c => context.lineTo(c[0], c[1]));
		context.closePath();

		context.lineWidth = 3;
		context.strokeStyle = style;
		context.stroke();
	};

	const renderStyle = new Style({
		renderer: (coordinates, state) => {
			const beingDragged = beingDraggedCallback();


			if (!beingDragged) {
				const inPrintableArea = state.feature.get('inPrintableArea') ?? true;
				const strokeStyle = inPrintableArea ? 'rgba(9, 157, 220, 0.5)' : 'rgba(255, 100, 100, 0.5)';

				const pixelCoordinates = isPolygonArray(coordinates) ? coordinates[0] : coordinates;
				drawBoundary(state.context, pixelCoordinates, strokeStyle);
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
