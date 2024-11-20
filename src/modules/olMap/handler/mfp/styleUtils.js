/**
 * @module modules/olMap/handler/mfp/styleUtils
 */
import { Style, Fill, Circle } from 'ol/style';
import { getRenderPixel } from 'ol/render';

const Hint_Color_RGBA = 'rgba(9, 157, 220, 0.5)';
const Warn_Color_RGBA = 'rgba(231, 79, 13, 0.8)';
const Mask_Color_RGBA = 'rgba(0, 5, 25, 0.75)';
const Not_Supported_Color_RGBA = 'rgba(150, 150, 150, 0.5)';

export const createThumbnailStyleFunction = (beingDraggedCallback) => {
	const isPolygonArray = (arr) => arr[0][0] != null && arr[0][0][0] != null;

	const drawBoundary = (context, pixelCoordinates, style) => {
		context.beginPath();
		context.moveTo(pixelCoordinates[0][0], pixelCoordinates[0][1]);
		[...pixelCoordinates].slice(1).forEach((c) => context.lineTo(c[0], c[1]));
		context.closePath();

		context.lineWidth = style.lineWidth;
		context.strokeStyle = style.strokeStyle;
		context.stroke();
	};

	const renderStyle = new Style({
		renderer: (coordinates, state) => {
			const beingDragged = beingDraggedCallback();
			if (!beingDragged) {
				const inPrintableArea = state.feature.get('inPrintableArea') ?? true;
				const inSupportedArea = state.feature.get('inSupportedArea') ?? true;

				const style = {
					strokeStyle: inPrintableArea ? Hint_Color_RGBA : Warn_Color_RGBA,
					lineWidth: inPrintableArea ? 3 : 5
				};

				const pixelCoordinates = isPolygonArray(coordinates) ? coordinates[0] : coordinates;
				inSupportedArea ? drawBoundary(state.context, pixelCoordinates, style) : () => {};
			}
		}
	});

	return [renderStyle];
};

export const forceRenderStyle = new Style({
	image: new Circle({
		fill: new Fill({
			color: [255, 128, 0, 0]
		}),
		radius: 1
	})
});

export const nullStyleFunction = () => [new Style({})];

export const createMapMaskFunction = (map, getPixelCoordinatesCallback) => {
	const getMask = (map, event, pixelCoordinates) => {
		const [width, height] = map.getSize();
		const outerPixelPolygon = [
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0]
		];

		// the calculated pixelCoordinates must be adapted to get the pixel of the event's canvas context from the map viewport's CSS pixel.
		// @see {@link https://openlayers.org/en/latest/apidoc/module-ol_render.html| getRenderPixel}
		return {
			outer: outerPixelPolygon.map((c) => getRenderPixel(event, c)),
			inner: pixelCoordinates.map((c) => getRenderPixel(event, c))
		};
	};

	const drawMask = (ctx, mask, supportedArea) => {
		const { outer, inner } = mask;
		ctx.save();
		ctx.globalCompositeOperation = 'source-over';
		ctx.beginPath();

		// outside -> clockwise
		ctx.moveTo(outer[0][0], outer[0][1]);
		outer.slice(1).forEach((c) => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		// inside -> counter-clockwise
		ctx.moveTo(inner[0][0], inner[0][1]);
		[...inner].slice(1).forEach((c) => ctx.lineTo(c[0], c[1]));
		ctx.closePath();

		ctx.fillStyle = Mask_Color_RGBA;
		ctx.fill();

		if (!supportedArea) {
			ctx.beginPath();
			const reversedInner = [...inner].reverse();
			ctx.moveTo(reversedInner[0][0], reversedInner[0][1]);
			reversedInner.slice(1).forEach((c) => ctx.lineTo(c[0], c[1]));
			ctx.closePath();
			ctx.fillStyle = Not_Supported_Color_RGBA;
			ctx.fill();
		}
	};

	const renderMask = (event) => {
		const { pixelCoordinates, supportedArea } = getPixelCoordinatesCallback();
		const pixelMask = getMask(map, event, pixelCoordinates);
		const ctx = event.context;
		drawMask(ctx, pixelMask, supportedArea);
	};
	return renderMask;
};
