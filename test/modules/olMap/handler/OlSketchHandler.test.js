import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { DefaultIdPrefix, OlSketchHandler } from '../../../../src/modules/olMap/handler/OlSketchHandler';
import { Tools } from '../../../../src/domain/tools';
import { asInternalProperty } from '../../../../src/utils/propertyUtils';

describe('OlSketchHandler', () => {
	describe('constants', () => {
		it('have a DefaultIdPrefix based on Tools.DRAW', () => {
			expect(DefaultIdPrefix).toBe(Tools.DRAW + '_');
		});
	});
	describe('when initialized', () => {
		it('have default properties', () => {
			const classUnderTest = new OlSketchHandler();

			expect(classUnderTest).toBeTruthy();
			expect(classUnderTest.active).toBeNull();
			expect(classUnderTest.isActive).toBeFalse();
			expect(classUnderTest.pointCount).toBe(0);
			expect(classUnderTest.isFinishOnFirstPoint).toBe(false);
			expect(classUnderTest.isSnapOnLastPoint).toBe(false);
		});
	});

	describe('when set a activeSketch', () => {
		it('registers a listener for feature change', () => {
			const featureMock = {
				on: () => {},
				getGeometry: () =>
					new LineString([
						[0, 0],
						[0, 1]
					]),
				setId: () => {},
				setProperties: () => {},
				getRevision: () => 1,
				set: () => {}
			};
			const listenerSpy = spyOn(featureMock, 'on');

			const classUnderTest = new OlSketchHandler();
			classUnderTest.activate(featureMock);

			expect(classUnderTest).toBeTruthy();
			expect(listenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
		});

		it('monitors feature changes', () => {
			const feature = new Feature(new LineString([[0, 0]]));

			const classUnderTest = new OlSketchHandler();
			classUnderTest.activate(feature);

			expect(classUnderTest.pointCount).toBe(1);

			feature.setGeometry(new LineString([[0, 0]]));
			feature.dispatchEvent('change');

			expect(classUnderTest.pointCount).toBe(1);

			feature.setGeometry(
				new LineString([
					[0, 0],
					[1, 1]
				])
			);
			feature.dispatchEvent('change');

			expect(classUnderTest.pointCount).toBe(2);
		});

		it('detects finishOnFirstPoint for polyline', () => {
			const feature = new Feature(
				new LineString([
					[0, 0],
					[1, 1],
					[2, 2]
				])
			);
			const classUnderTest = new OlSketchHandler();
			classUnderTest.activate(feature);

			feature.setGeometry(
				new LineString([
					[0, 0],
					[1, 1],
					[2, 2],
					[0, 0]
				])
			);
			feature.dispatchEvent('change');

			expect(classUnderTest.isFinishOnFirstPoint).toBe(true);
		});

		it('detects finishOnFirstPoint for polygon', () => {
			const feature = new Feature(
				new Polygon([
					[
						[0, 0],
						[1, 1],
						[2, 2],
						[2, 2]
					]
				])
			);
			const classUnderTest = new OlSketchHandler();
			classUnderTest.activate(feature);

			feature.setGeometry(
				new Polygon([
					[
						[0, 0],
						[1, 1],
						[2, 2],
						[0, 0],
						[0, 0]
					]
				])
			);
			feature.dispatchEvent('change');

			expect(classUnderTest.isFinishOnFirstPoint).toBe(true);
		});

		it('detects isSnapOnLastPoint for polygon', () => {
			const feature = new Feature(
				new Polygon([
					[
						[0, 0],
						[1, 1],
						[2, 2],
						[2, 2]
					]
				])
			);
			const classUnderTest = new OlSketchHandler();
			classUnderTest.activate(feature);

			feature.setGeometry(
				new Polygon([
					[
						[0, 0],
						[1, 1],
						[2, 2],
						[2, 2],
						[0, 0]
					]
				])
			);
			feature.dispatchEvent('change');

			expect(classUnderTest.isSnapOnLastPoint).toBe(true);
		});

		it('deregisters listener on release', () => {
			const feature = new Feature(
				new LineString([
					[0, 0],
					[1, 1]
				])
			);
			const classUnderTest = new OlSketchHandler();
			classUnderTest.activate(feature);
			feature.dispatchEvent('change');
			const empty = {};
			classUnderTest.deactivate();

			expect(classUnderTest._listener).toEqual(empty);
			expect(feature.get(asInternalProperty('finishOnFirstPoint'))).toBeUndefined();
		});
	});
});
