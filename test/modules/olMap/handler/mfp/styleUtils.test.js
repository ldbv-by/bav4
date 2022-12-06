
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { get as getProjection } from 'ol/proj';
import RenderEvent from 'ol/render/Event';

import { Style, Text as TextStyle } from 'ol/style';
import { createMapMaskFunction, mfpTextStyleFunction, nullStyleFunction, createThumbnailStyleFunction } from '../../../../../src/modules/olMap/handler/mfp/styleUtils';

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

		it('should create a style ', () => {

			const styles = createThumbnailStyleFunction('foo', 'bar', []);
			expect(styles).toHaveSize(3);
			expect(styles).toEqual([jasmine.any(Style), jasmine.any(Style), jasmine.any(Style)]);
		});

		it('should create a base style with a stroke style ', () => {
			const styles = createThumbnailStyleFunction('foo', 'bar', []);

			expect(styles).toHaveSize(3);
			const style = styles[0];
			expect(style.getStroke().getColor()).toEqual([9, 157, 220, 0.3]);
			expect(style.getStroke().getWidth()).toBe(3);
		});


		it('should create a base style with a text style ', () => {
			const styles = createThumbnailStyleFunction('foo', 'bar', []);

			expect(styles).toHaveSize(3);
			const style = styles[0];
			expect(style.getText().getText()).toEqual('  foo');
			expect(style.getText().getTextAlign()).toBe('left');
			expect(style.getText().getStroke().getColor()).toEqual([255, 255, 255, 0.8]);
			expect(style.getText().getStroke().getWidth()).toBe(2);
			expect(style.getText().getFill().getColor()).toEqual([44, 90, 146, 1]);
		});

		describe('with a warnstyle', () => {

			it('should have a stroke style ', () => {
				const styles = createThumbnailStyleFunction('foo', 'bar', [0, 0, 1, 1]);

				const style = styles[1];

				expect(style.getStroke().getColor()).toEqual([255, 100, 100, 1]);
				expect(style.getStroke().getWidth()).toBe(4);
			});
			it('should have a text style ', () => {
				const styles = createThumbnailStyleFunction('foo', 'bar', []);

				const style = styles[1];

				expect(style.getText().getText()).toEqual('bar');
				expect(style.getText().getTextAlign()).toBe('center');
				expect(style.getText().getStroke().getColor()).toEqual([255, 255, 255, 0.8]);
				expect(style.getText().getStroke().getWidth()).toBe(3);
				expect(style.getText().getFill().getColor()).toEqual([250, 50, 50, 1]);
			});

			it('should have a geometry function ', () => {
				const styles = createThumbnailStyleFunction('foo', 'bar', [0, 0, 1, 1]);

				const style = styles[1];

				expect(style.getGeometry()).toEqual(jasmine.any(Function));
			});

			it('should have a geometry function validating the extent ', () => {
				const featureWithinOrEqualsStyleExtent = new Feature();
				const geometryWithinOrEqualsMock = { getExtent: () => [0, 0, 1, 1] };

				const featureIntersectingStyleExtent = new Feature();
				const geometryIntersectingMock = { getExtent: () => [0, 0, 2, 2] };

				const featureDisjoiningStyleExtent = new Feature();
				const geometryDisjoiningMock = { getExtent: () => [2, 2, 3, 3] };

				spyOn(featureWithinOrEqualsStyleExtent, 'getGeometry').and.callFake(() => geometryWithinOrEqualsMock);
				spyOn(featureIntersectingStyleExtent, 'getGeometry').and.callFake(() => geometryIntersectingMock);
				spyOn(featureDisjoiningStyleExtent, 'getGeometry').and.callFake(() => geometryDisjoiningMock);

				const styles = createThumbnailStyleFunction('foo', 'bar', [0, 0, 1, 1]);

				const style = styles[1];
				const geometryFunction = style.getGeometry();

				expect(geometryFunction(featureWithinOrEqualsStyleExtent)).toBeUndefined();
				expect(geometryFunction(featureIntersectingStyleExtent)).toBe(geometryIntersectingMock);
				expect(geometryFunction(featureDisjoiningStyleExtent)).toBe(geometryDisjoiningMock);
			});
		});

		describe('with a areaOfDistortionStyle', () => {

			it('should have a pattern as fill style ', () => {
				const styles = createThumbnailStyleFunction('foo', 'bar', [0, 0, 1, 1]);

				const style = styles[2];

				expect(style.getFill().getColor()).toEqual(jasmine.any(CanvasPattern));
			});

			it('should have a geometry function validating the extent and creating a overlapping polygon', () => {
				const featureWithinOrEqualsStyleExtent = new Feature();
				const geometryWithinOrEqualsMock = { getExtent: () => [0, 0, 1, 1] };

				const featureIntersectingStyleExtent = new Feature();
				const geometryIntersectingMock = { getExtent: () => [0, 0, 2, 2] };

				const featureDisjoiningStyleExtent = new Feature();
				const geometryDisjoiningMock = { getExtent: () => [2, 2, 3, 3] };

				spyOn(featureWithinOrEqualsStyleExtent, 'getGeometry').and.callFake(() => geometryWithinOrEqualsMock);
				spyOn(featureIntersectingStyleExtent, 'getGeometry').and.callFake(() => geometryIntersectingMock);
				spyOn(featureDisjoiningStyleExtent, 'getGeometry').and.callFake(() => geometryDisjoiningMock);

				const styles = createThumbnailStyleFunction('foo', 'bar', [0, 0, 1, 1]);

				const style = styles[2];
				const geometryFunction = style.getGeometry();


				// we test only the creation of a polygon, not the specific coordinates due to usage of
				// openlayers internal geometry functions for building intersections
				expect(geometryFunction(featureWithinOrEqualsStyleExtent)).toBeUndefined();
				expect(geometryFunction(featureIntersectingStyleExtent)).toEqual(jasmine.any(Polygon));
				expect(geometryFunction(featureDisjoiningStyleExtent)).toEqual(jasmine.any(Polygon));
			});
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

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0, context));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(fillStylePropertySpy).toHaveBeenCalledWith(expectedFillColor);

			// for outer drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(0, 0);
			// for inner drawn polygon
			expect(moveToSpy).toHaveBeenCalledWith(5, 5);
		});

		it('draws a passpartout', () => {
			const expectedStrokeColor = 'rgba(255,255,255,0.4)';
			const expectedStrokeWidth = 20;
			const feature = createFeature('');
			const mapMock = createMapMock();
			const context = get2dContext();

			const strokeStylePropertySpy = spyOnProperty(context, 'strokeStyle', 'set').and.callThrough();
			const strokeWidthPropertySpy = spyOnProperty(context, 'lineWidth', 'set').and.callThrough();

			const renderFunction = createMapMaskFunction(mapMock, feature);
			renderFunction(getPostRenderEvent(0, context));

			expect(renderFunction).toEqual(jasmine.any(Function));
			expect(strokeStylePropertySpy).toHaveBeenCalledWith(expectedStrokeColor);
			expect(strokeWidthPropertySpy).toHaveBeenCalledWith(expectedStrokeWidth);
		});
	});
});
