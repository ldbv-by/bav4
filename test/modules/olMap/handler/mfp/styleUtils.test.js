import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { get as getProjection } from 'ol/proj';
import RenderEvent from 'ol/render/Event';

import { Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import {
	nullStyleFunction,
	createThumbnailStyleFunction,
	createMapMaskFunction,
	forceRenderStyle
} from '../../../../../src/modules/olMap/handler/mfp/styleUtils';

describe('mfp style utility functions', () => {
	const get2dContext = () => {
		const canvas = document.createElement('canvas');
		return canvas.getContext('2d');
	};

	describe('createThumbnailStyleFunction', () => {
		const beingDraggedCallback = () => false;
		const pixelCoordinates = [
			[
				[5, 5],
				[6, 5],
				[6, 6],
				[5, 6],
				[5, 5]
			]
		];

		const geometry = new Polygon(pixelCoordinates);
		const feature = new Feature({ geometry: geometry });
		const defaultContextStub = {
			canvas: { width: 100, height: 100, style: { width: 100, height: 100 } },
			stroke: () => {},
			strokeStyle: 'foo',
			beginPath: () => {},
			closePath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			setLineDash: () => {}
		};
		const defaultRenderState = { feature: feature, context: defaultContextStub, geometry: geometry };
		const getRenderState = (state = {}) => {
			return { ...defaultRenderState, ...state };
		};
		it('should create a preview-style with renderer-function ', () => {
			const styles = createThumbnailStyleFunction(beingDraggedCallback);
			expect(styles).toHaveSize(1);
			expect(styles).toEqual([jasmine.any(Style)]);

			const renderStyle = styles[0];
			const renderFunction = renderStyle.getRenderer();

			expect(renderFunction).toEqual(jasmine.any(Function));
		});

		it('should draw to context with preview-style', () => {
			const styles = createThumbnailStyleFunction(beingDraggedCallback);

			const renderStyle = styles.find((style) => style.getRenderer());

			const contextSpy = spyOn(defaultContextStub, 'moveTo');
			const customRenderer = renderStyle.getRenderer();
			customRenderer(pixelCoordinates, getRenderState());

			expect(contextSpy).toHaveBeenCalled();
		});

		it('should have a preview-style with renderer-function, which skips rendering, while beingDragged=true', () => {
			const state = { beingDragged: true };
			const styles = createThumbnailStyleFunction(() => state.beingDragged);
			const renderState = getRenderState();
			const spy = spyOn(renderState.context, 'beginPath');
			const renderStyle = styles[0];

			renderStyle.getRenderer()(
				[
					[0, 0],
					[1, 1]
				],
				renderState
			);
			expect(spy).not.toHaveBeenCalled();

			state.beingDragged = false;

			renderStyle.getRenderer()(
				[
					[0, 0],
					[1, 1]
				],
				renderState
			);
			expect(spy).toHaveBeenCalled();
		});

		it('should use the basestyle for a feature in the printable area', () => {
			const pixelCoordinates = [
				[
					[5, 5],
					[6, 5],
					[6, 6],
					[5, 6],
					[5, 5]
				]
			];
			const renderState = getRenderState();
			const spy = spyOn(renderState.context, 'beginPath');

			const styles = createThumbnailStyleFunction(beingDraggedCallback);
			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, renderState);

			expect(spy).toHaveBeenCalled();
			expect(renderState.context.strokeStyle).toBe('rgba(9, 157, 220, 0.5)');
		});

		it('should use the warnStyle for a feature out of the printable area', () => {
			const pixelCoordinates = [
				[
					[5, 5],
					[6, 5],
					[6, 6],
					[5, 6],
					[5, 5]
				]
			];
			const renderState = getRenderState({ feature: new Feature({ inPrintableArea: false }) });
			const spy = spyOn(renderState.context, 'beginPath').and.callThrough();

			const styles = createThumbnailStyleFunction(beingDraggedCallback);
			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, renderState);

			expect(spy).toHaveBeenCalled();
			expect(renderState.context.strokeStyle).toBe('rgba(231, 79, 13, 0.8)');
			expect(renderState.context.lineWidth).toBe(5);
		});

		it('should NOT draw a style for a feature completely out of the printable area', () => {
			const pixelCoordinates = [
				[
					[5, 5],
					[6, 5],
					[6, 6],
					[5, 6],
					[5, 5]
				]
			];
			const renderState = getRenderState({ feature: new Feature({ inPrintableArea: false, inSupportedArea: false }) });
			const spy = spyOn(renderState.context, 'beginPath').and.callThrough();

			const styles = createThumbnailStyleFunction(beingDraggedCallback);
			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, renderState);

			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('nullStyleFunction', () => {
		it('should create a style', () => {
			const styles = nullStyleFunction();

			expect(styles).toHaveSize(1);
			expect(styles).toEqual([jasmine.any(Style)]);
		});

		it('should create a style without any further style ', () => {
			const styles = nullStyleFunction();

			expect(styles[0].getStroke()).toBeNull();
			expect(styles[0].getFill()).toBeNull();
			expect(styles[0].getImage()).toBeNull();
			expect(styles[0].getText()).toBeNull();
		});
	});

	describe('forceRenderStyle', () => {
		it('have a transparent imageStyle', () => {
			expect(forceRenderStyle.getImage()).toEqual(jasmine.any(CircleStyle));
			expect(forceRenderStyle.getImage().getRadius()).toBe(1);
			expect(forceRenderStyle.getImage().getFill().getColor()).toEqual([255, 128, 0, 0]);
		});
	});

	describe('createMapMaskFunction', () => {
		const getPixelCoordinatesCallBack = (supportedArea) => {
			const pixelCoordinatesObject = {
				pixelCoordinates: [
					[5, 5],
					[6, 5],
					[6, 6],
					[5, 6],
					[5, 5]
				],
				supportedArea
			};
			return () => pixelCoordinatesObject;
		};

		const createMapMock = () => {
			return {
				getSize: () => [10, 10],
				getCoordinateFromPixel: (p) => p,
				getPixelFromCoordinate: (c) => c
			};
		};

		it('creates a function', () => {
			const mapMock = {};
			const renderFunction = createMapMaskFunction(mapMock, getPixelCoordinatesCallBack(true));

			expect(renderFunction).toEqual(jasmine.any(Function));
		});

		const transform = [1, 0, 0, 1, 0, 0];
		const projection = getProjection('EPSG:3857');
		const viewState = {
			projection: projection,
			resolution: 1,
			rotation: 0
		};
		const setupFrameState = (time) => {
			return {
				time: +time,
				coordinateToPixelTransform: transform,
				viewHints: [],
				viewState: viewState,
				extent: [0, 0, 10, 10]
			};
		};
		const getPostRenderEvent = (time, context) => new RenderEvent('postrender', transform, setupFrameState(time), context);

		it('draws a mask inside the supported extent', () => {
			const expectedFillColor = 'rgba(0, 5, 25, 0.75)';
			const mapMock = createMapMock();
			const context = get2dContext();

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const moveToSpy = spyOn(context, 'moveTo').and.callThrough();

			const renderFunction = createMapMaskFunction(mapMock, getPixelCoordinatesCallBack(true));
			renderFunction(getPostRenderEvent(0, context));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);

			// for outer drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(0, 0);
			// for inner drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(5, 5);
		});

		it('draws a mask outside the supported extent', () => {
			const expectedMaskFillColor = 'rgba(0, 5, 25, 0.75)';
			const expectedNotSupportedFillColor = 'rgba(150, 150, 150, 0.5)';
			const mapMock = createMapMock();
			const context = get2dContext();

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const moveToSpy = spyOn(context, 'moveTo').and.callThrough();

			const renderFunction = createMapMaskFunction(mapMock, getPixelCoordinatesCallBack(false));
			renderFunction(getPostRenderEvent(0, context));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedMaskFillColor);
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedNotSupportedFillColor);

			// for all drawn polygon -> [[start of outer], [start of inner],[start of not_supported]]]
			expect(moveToSpy.calls.allArgs()).toEqual([
				[0, 0],
				[5, 5],
				[5, 5]
			]);
		});
	});
});
