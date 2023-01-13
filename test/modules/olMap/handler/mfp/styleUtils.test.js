
import { Feature } from 'ol';
import { Geometry, Point, Polygon } from 'ol/geom';
import { get as getProjection } from 'ol/proj';
import RenderEvent from 'ol/render/Event';

import { Stroke, Style, Text as TextStyle } from 'ol/style';
import { createMapMaskFunction, mfpTextStyleFunction, nullStyleFunction, createThumbnailStyleFunction, createSimpleMapMaskFunction } from '../../../../../src/modules/olMap/handler/mfp/styleUtils';

describe('mfp style utility functions', () => {

	const get2dContext = () => {
		const canvas = document.createElement('canvas');
		return canvas.getContext('2d');
	};

	describe('mfpTextStyleFunction', () => {

		it('should create a text-style ', () => {
			const label = 'foo';
			const textStyle = mfpTextStyleFunction(label).getText();

			expect(textStyle).toEqual(jasmine.any(TextStyle));
			expect(textStyle.getText()).toBe(label);
			expect(textStyle.getFont()).toBe('normal 70px sans-serif');
			expect(textStyle.getFill()).toBeTruthy();
			expect(textStyle.getStroke()).toBeTruthy();
			expect(textStyle.getScale()).toBe(1);
			expect(textStyle.getOverflow()).toBeFalse();
			expect(textStyle.getPlacement()).toBe('point');
		});

		it('should create a text-style with offset ', () => {
			expect(mfpTextStyleFunction('foo', 0, 1).getText().getOffsetY()).toBe(-35);
			expect(mfpTextStyleFunction('foo', 0).getText().getOffsetY()).toBe(-35);
			expect(mfpTextStyleFunction('foo').getText().getOffsetY()).toBe(-35);

			expect(mfpTextStyleFunction('foo', 0, 2).getText().getOffsetY()).toBe(-70);
			expect(mfpTextStyleFunction('foo', 1, 2).getText().getOffsetY()).toBe(0);


			expect(mfpTextStyleFunction('foo', 0, 3).getText().getOffsetY()).toBe(-105);
			expect(mfpTextStyleFunction('foo', 1, 3).getText().getOffsetY()).toBe(-35);
			expect(mfpTextStyleFunction('foo', 2, 3).getText().getOffsetY()).toBe(35);
		});
	});

	describe('createThumbnailStyleFunction', () => {
		const beingDraggedCallback = () => false;
		const pixelCoordinates = [[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]];
		const geometry = new Polygon(pixelCoordinates);
		const feature = new Feature({ geometry: geometry });
		it('should create a preview-style with renderer-function ', () => {
			const styles = createThumbnailStyleFunction('foo', beingDraggedCallback);
			expect(styles).toHaveSize(1);
			expect(styles).toEqual([jasmine.any(Style)]);

			const renderStyle = styles[0];
			const renderFunction = renderStyle.getRenderer();

			expect(renderFunction).toEqual(jasmine.any(Function));
		});

		it('should draw to context with preview-style', () => {
			const styles = createThumbnailStyleFunction('foo', beingDraggedCallback);
			const contextMock = { canvas: { width: 100, height: 100, style: { width: 100, height: 100 } }, stroke: () => new Stroke(), beginPath: () => { }, closePath: () => { }, moveTo: () => { }, lineTo: () => { }, setLineDash: () => { } };
			const stateMock = { feature: feature, context: contextMock, geometry: geometry };
			const renderStyle = styles.find(style => style.getRenderer());

			const contextSpy = spyOn(contextMock, 'moveTo');
			const customRenderer = renderStyle.getRenderer();
			customRenderer(pixelCoordinates, stateMock);

			expect(contextSpy).toHaveBeenCalled();
		});

		it('should have a preview-style with renderer-function, which uses customContextRenderFunction', () => {
			const styles = createThumbnailStyleFunction('foo', beingDraggedCallback);
			const stateMock = { feature: feature, context: null, geometry: geometry, pixelRatio: 1, customContextRenderFunction: () => { } };
			const spy = spyOn(stateMock, 'customContextRenderFunction');

			const renderStyle = styles[0];
			renderStyle.getRenderer()([[0, 0], [1, 1]], stateMock);

			expect(spy).toHaveBeenCalled();
		});

		it('should have a preview-style with renderer-function, which skips rendering, while beingDragged=true', () => {
			const state = { beingDragged: true };
			const styles = createThumbnailStyleFunction('foo', () => state.beingDragged);
			const stateMock = { feature: feature, context: null, geometry: geometry, pixelRatio: 1, customContextRenderFunction: () => { } };
			const spy = spyOn(stateMock, 'customContextRenderFunction');
			const renderStyle = styles[0];

			renderStyle.getRenderer()([[0, 0], [1, 1]], stateMock);
			expect(spy).not.toHaveBeenCalled();

			state.beingDragged = false;

			renderStyle.getRenderer()([[0, 0], [1, 1]], stateMock);
			expect(spy).toHaveBeenCalled();
		});

		it('should use the basestyle for a feature in the printable area', () => {
			const pixelCoordinates = [[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]];
			const styles = createThumbnailStyleFunction('foo', beingDraggedCallback);
			let receivedStyle = null;
			const stateMock = {
				feature: new Feature(), context: null, geometry: new Point([0, 0]), pixelRatio: 1, customContextRenderFunction: (geometry, style) => {
					receivedStyle = style;
				}
			};
			const spy = spyOn(stateMock, 'customContextRenderFunction').and.callThrough();

			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, stateMock);

			expect(spy).toHaveBeenCalledWith(jasmine.any(Geometry), jasmine.any(Style));
			expect(receivedStyle.getStroke().getColor()).toEqual([9, 157, 220, 0.5]);
			expect(receivedStyle.getStroke().getWidth()).toBe(3);
		});

		it('should use the warnstyle for a feature out of the printable area', () => {
			const pixelCoordinates = [[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]];
			const styles = createThumbnailStyleFunction('foo', beingDraggedCallback);
			let receivedStyle = null;
			const stateMock = {
				feature: new Feature({ 'inPrintableArea': false }), context: null, geometry: new Point([0, 0]), pixelRatio: 1, resolution: 1, customContextRenderFunction: (geometry, style) => {
					receivedStyle = style;
				}
			};
			const spy = spyOn(stateMock, 'customContextRenderFunction').and.callThrough();

			const renderStyle = styles[0];
			renderStyle.getRenderer()(pixelCoordinates, stateMock);

			expect(spy).toHaveBeenCalledWith(jasmine.any(Geometry), jasmine.any(Style));
			expect(receivedStyle.getStroke().getColor()).toEqual([255, 100, 100, 0.5]);
			expect(receivedStyle.getStroke().getWidth()).toBe(3);
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

		const createFeature = (name) => {
			const geometry = new Polygon([[[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]]);
			const feature = new Feature({ geometry: geometry });

			feature.set('name', name);
			feature.set('page_pixel_coordinates', [[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]);

			return feature;
		};

		const createMapMock = () => {
			return {
				getSize: () => [10, 10], getCoordinateFromPixel: (p) => p, getPixelFromCoordinate: (c) => c
			};
		};

		it('creates a function', () => {
			const mapMock = {};
			const feature = new Feature();
			const renderFunction = createMapMaskFunction(mapMock, feature);

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
			const expectedFillColor = 'rgba(0,0,0,0.4)';
			const feature = createFeature('');
			const mapMock = createMapMock();
			const context = get2dContext();

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const moveToSpy = spyOn(context, 'moveTo').and.callThrough();

			const renderFunction = createMapMaskFunction(mapMock, feature, () => false);
			renderFunction(getPostRenderEvent(0, context));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);

			// for outer drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(0, 0);
			// for inner drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(5, 5);
		});

		it('uses chached pixelCoordinates for the mask', () => {
			const feature = createFeature('');
			const mapMock = createMapMock();
			const context = get2dContext();
			const expectedRequests = 5; // for each coordinate in a boundary-polygon

			const renderFunction = createMapMaskFunction(mapMock, feature, () => true);
			const mapSpy = spyOn(mapMock, 'getPixelFromCoordinate').and.callThrough();

			renderFunction(getPostRenderEvent(0, context)); // --> pixelCoordinates now cached

			expect(mapSpy).toHaveBeenCalledTimes(expectedRequests);

			renderFunction(getPostRenderEvent(0, context)); // should not request pixelCoordinates anymore
			expect(mapSpy).toHaveBeenCalledTimes(expectedRequests);
		});
	});

	describe('createSimpleMapMaskFunction', () => {

		const pixelCoordinatesCallBack = () => [[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]];

		const createMapMock = () => {
			return {
				getSize: () => [10, 10], getCoordinateFromPixel: (p) => p, getPixelFromCoordinate: (c) => c
			};
		};

		it('creates a function', () => {
			const mapMock = {};
			const renderFunction = createSimpleMapMaskFunction(mapMock, pixelCoordinatesCallBack);

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

			const renderFunction = createSimpleMapMaskFunction(mapMock, pixelCoordinatesCallBack);
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
