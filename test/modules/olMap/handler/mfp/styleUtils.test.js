
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { get as getProjection } from 'ol/proj';
import RenderEvent from 'ol/render/Event';

import { Text as TextStyle } from 'ol/style';
import { createMapMaskFunction, mfpTextStyleFunction } from '../../../../../src/modules/olMap/handler/mfp/styleUtils';

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

	describe('createMapMaskFunction', () => {

		const createFeature = (name) => {
			const geometry = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
			const feature = new Feature({ geometry: geometry });
			const pageBuffer = geometry.clone();
			feature.set('name', name);
			feature.set('page_buffer', pageBuffer);

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

		it('draws a innerPolygon with mfpBoundaryStyle', () => {
			const expectedStrokeColor = 'rgba(9,157,220,1)';
			const expectedStrokeWidth = 3;
			const feature = createFeature('');
			const mapMock = createMapMock();
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => 10);

			const strokeStylePropertySpy = spyOnProperty(context, 'strokeStyle', 'set').and.callThrough();
			const strokeWidthPropertySpy = spyOnProperty(context, 'lineWidth', 'set').and.callThrough();

			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(strokeStylePropertySpy).toHaveBeenCalledWith(expectedStrokeColor);
			expect(strokeWidthPropertySpy).toHaveBeenCalledWith(expectedStrokeWidth);
		});

		it('draws a outerPolygon with maskFeatureStyle', () => {
			const expectedFillColor = 'rgba(0,0,0,0.4)';
			const feature = createFeature('');
			const mapMock = createMapMock();
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => 10);

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const mapSizeForMaskSpy = spyOn(mapMock, 'getSize').and.callThrough();
			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);
			expect(mapSizeForMaskSpy).toHaveBeenCalled();
		});

		it('draws a pagePolygon with mfpPageStyle', () => {
			const expectedFillColor = 'rgba(255,255,255,0.4)';
			const feature = createFeature('');
			const mapMock = createMapMock();
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => 10);

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const featurePropertySpy = spyOn(feature, 'get').withArgs(jasmine.any(String)).and.callThrough();
			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);
			expect(featurePropertySpy).toHaveBeenCalledWith('page_buffer');
		});

		it('draws text with mfpTextStyle', () => {
			const expectedFillColor = 'rgba(255,255,255,0.4)';
			const feature = createFeature('foo');
			const mapMock = createMapMock();
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => 10);

			const fillStylePropertySpy = spyOnProperty(context, 'fillStyle', 'set').and.callThrough();
			const fillTextSpy = spyOn(context, 'fillText').and.callThrough();
			const featurePropertySpy = spyOn(feature, 'get').withArgs(jasmine.any(String)).and.callThrough();
			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);
			expect(fillTextSpy).toHaveBeenCalledWith('foo', 0.5, -34.5);
			expect(featurePropertySpy).toHaveBeenCalledWith('name');
		});

		it('draws text with mfpTextStyle', () => {
			const feature = createFeature('foo\nbar\nbaz');
			const mapMock = createMapMock();
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => 10);

			const fillTextSpy = spyOn(context, 'fillText').and.callThrough();
			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillTextSpy).toHaveBeenCalledTimes(3);
		});

		it('does NOT draw overflowing text', () => {
			const feature = createFeature('overflow text');
			const mapMock = createMapMock();
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => {
				return { width: 10 };
			});

			const fillTextSpy = spyOn(context, 'fillText').and.callThrough();
			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillTextSpy).toHaveBeenCalledTimes(0);
		});
	});
});
