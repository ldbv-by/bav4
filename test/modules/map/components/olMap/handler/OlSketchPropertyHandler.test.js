import { Feature } from 'ol';
import { LineString, Point, Polygon } from 'ol/geom';
import { OlSketchPropertyHandler } from '../../../../../../src/modules/map/components/olMap/handler/OlSketchPropertyHandler';

describe('OlSketchPropertyHandler', () => {

	describe('when initialized', () => {
		it('registers a listener for feature change', () => {
			const featureMock = { on: () => { }, getGeometry: () => new Point([0, 0]) };
			const listenerSpy = spyOn(featureMock, 'on');
			const classUnderTest = new OlSketchPropertyHandler(featureMock);

			expect(classUnderTest).toBeTruthy();
			expect(listenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
		});

		it('throws a TypeError , when feature is falsy', () => {

			expect(() => new OlSketchPropertyHandler(null)).toThrowError(TypeError, 'sketchFeature must be defined');

		});



		it('have default properties', () => {
			const featureMock = {
				on: () => { },
				getGeometry: () => new Point([0, 0])
			};

			const classUnderTest = new OlSketchPropertyHandler(featureMock);

			expect(classUnderTest).toBeTruthy();
			expect(classUnderTest.pointCount).toBe(1);
			expect(classUnderTest.isFinishOnFirstPoint).toBe(false);
			expect(classUnderTest.isSnapOnLastPoint).toBe(false);
		});

		it('monitors feature changes', () => {
			const feature = new Feature(new Point([0, 0]));
			const classUnderTest = new OlSketchPropertyHandler(feature);

			expect(classUnderTest.pointCount).toBe(1);

			feature.setGeometry(new LineString([[0, 0], [1, 1]]));
			feature.dispatchEvent('change');

			expect(classUnderTest.pointCount).toBe(2);
		});

		it('detects finishOnFirstPoint for polyline', () => {

			const feature = new Feature(new LineString([[0, 0], [1, 1], [2, 2]]));
			const classUnderTest = new OlSketchPropertyHandler(feature);



			feature.setGeometry(new LineString([[0, 0], [1, 1], [2, 2], [0, 0]]));
			feature.dispatchEvent('change');


			expect(classUnderTest.isFinishOnFirstPoint).toBe(true);
		});

		it('detects finishOnFirstPoint for polygon', () => {

			const feature = new Feature(new Polygon([[[0, 0], [1, 1], [2, 2], [2, 2]]]));
			const classUnderTest = new OlSketchPropertyHandler(feature);

			feature.setGeometry(new Polygon([[[0, 0], [1, 1], [2, 2], [0, 0], [0, 0]]]));
			feature.dispatchEvent('change');

			expect(classUnderTest.isFinishOnFirstPoint).toBe(true);
		});

		it('detects isSnapOnLastPoint for polygon', () => {

			const feature = new Feature(new Polygon([[[0, 0], [1, 1], [2, 2], [2, 2]]]));
			const classUnderTest = new OlSketchPropertyHandler(feature);

			feature.setGeometry(new Polygon([[[0, 0], [1, 1], [2, 2], [2, 2], [0, 0]]]));
			feature.dispatchEvent('change');

			expect(classUnderTest.isSnapOnLastPoint).toBe(true);
		});

		it('deregisters listener on release', () => {
			const feature = new Feature(new Point([0, 0]));
			const classUnderTest = new OlSketchPropertyHandler(feature);
			const empty = {};
			classUnderTest.release();

			expect(classUnderTest._listener).toEqual(empty);
		});
	});
});
