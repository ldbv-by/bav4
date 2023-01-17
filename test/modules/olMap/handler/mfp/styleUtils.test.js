
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { get as getProjection } from 'ol/proj';
import RenderEvent from 'ol/render/Event';

import { Style } from 'ol/style';
import { nullStyleFunction, createThumbnailStyleFunction, createMapMaskFunction } from '../../../../../src/modules/olMap/handler/mfp/styleUtils';

describe('mfp style utility functions', () => {

	const get2dContext = () => {
		const canvas = document.createElement('canvas');
		return canvas.getContext('2d');
	};

	describe('createThumbnailStyleFunction', () => {
		const beingDraggedCallback = () => false;
		const pixelCoordinates = [[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]];


		const geometry = new Polygon(pixelCoordinates);
		const feature = new Feature({ geometry: geometry });
		const defaultContextStub = { canvas: { width: 100, height: 100, style: { width: 100, height: 100 } }, stroke: () => {}, strokeStyle: 'foo', beginPath: () => { }, closePath: () => { }, moveTo: () => { }, lineTo: () => { } };
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

			const renderStyle = styles.find(style => style.getRenderer());

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

			renderStyle.getRenderer()([[0, 0], [1, 1]], renderState);
			expect(spy).not.toHaveBeenCalled();

			state.beingDragged = false;

			renderStyle.getRenderer()([[0, 0], [1, 1]], renderState);
			expect(spy).toHaveBeenCalled();
		});

		it('should use the basestyle for a feature in the printable area', () => {
			const pixelCoordinates = [[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]];
			const renderState = getRenderState();
			const spy = spyOn(renderState.context, 'beginPath');

			const styles = createThumbnailStyleFunction(beingDraggedCallback);
			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, renderState);

			expect(spy).toHaveBeenCalled();
			expect(renderState.context.strokeStyle).toBe('rgba(9, 157, 220, 0.5)');
		});

		it('should use the warnstyle for a feature out of the printable area', () => {
			const pixelCoordinates = [[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]];
			const renderState = getRenderState({ feature: new Feature({ 'inPrintableArea': false }) });
			const spy = spyOn(renderState.context, 'beginPath').and.callThrough();

			const styles = createThumbnailStyleFunction(beingDraggedCallback);
			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, renderState);

			expect(spy).toHaveBeenCalled();
			expect(renderState.context.strokeStyle).toBe('rgba(255, 100, 100, 0.5)');
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


	describe('createMapMaskFunction', () => {

		const pixelCoordinatesCallBack = () => [[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]];

		const createMapMock = () => {
			return {
				getSize: () => [10, 10], getCoordinateFromPixel: (p) => p, getPixelFromCoordinate: (c) => c
			};
		};

		it('creates a function', () => {
			const mapMock = {};
			const renderFunction = createMapMaskFunction(mapMock, pixelCoordinatesCallBack);

			expect(renderFunction).toEqual(jasmine.any(Function));
		});

		const transform = [1, 0, 0, 1, 0, 0];
		const projection = getProjection('EPSG:3857');
		const viewState = {
			projection: projection, resolution: 1, rotation: 0
		};
		const setupFrameState = (time) => {
			return {
				time: +time, coordinateToPixelTransform: transform, viewHints: [], viewState: viewState, extent: [0, 0, 10, 10]
			};
		};
		const getPostRenderEvent = (time, context) => new RenderEvent('postrender', transform, setupFrameState(time), context);

		it('draws a mask', () => {
			const expectedFillColor = 'rgba(0, 5, 25, 0.75)';
			const mapMock = createMapMock();
			const context = get2dContext();

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const moveToSpy = spyOn(context, 'moveTo').and.callThrough();

			const renderFunction = createMapMaskFunction(mapMock, pixelCoordinatesCallBack);
			renderFunction(getPostRenderEvent(0, context));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);

			// for outer drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(0, 0);
			// for inner drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(5, 5);
		});
	});
});
