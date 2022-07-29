
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
				time: +time, coordinateToPixelTransform: transform, viewHints: [], viewState: viewState
			};
		};
		xit('draws a innerPolygon', () => {

			const mapMock = { getSize: () => [10, 10], getCoordinateFromPixel: (p) => p };
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const pageBuffer = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
			feature.set('name', '');
			feature.set('page_buffer', pageBuffer);

			const renderFunction = createMapMaskFunction(mapMock, feature);
			const context = get2dContext();
			spyOn(context, 'measureText').and.callFake(() => {
				10;
			});
			const getPostRenderEvent = (time) => new RenderEvent('postrender', transform, setupFrameState(time), context);



			renderFunction(getPostRenderEvent(0));
			expect(renderFunction).toEqual(jasmine.any(Function));
		});
	});
});
