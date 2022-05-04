import { Feature } from 'ol';
import { getOverlays, OverlayStyle } from '../../../src/modules/olMap/OverlayStyle';
import { TestUtils } from '../../test-utils.js';

describe('OverlayStyle', () => {
	const setup = () => {
		TestUtils.setupStoreAndDi({});

	};

	beforeEach(() => {
		setup();
	});

	it('ctor', () => {
		const classUnderTest = new OverlayStyle();

		expect(classUnderTest).toBeTruthy();
	});
	it('call for add all overlays for feature, throws error', () => {
		const feature = new Feature();
		const classUnderTest = new OverlayStyle();

		expect(() => classUnderTest.add(feature)).toThrowError(TypeError, 'Please implement and call abstract method #add from child or do not call super.add from child.');
	});

	it('call for update all overlays for feature, throws error', () => {
		const feature = new Feature();
		const classUnderTest = new OverlayStyle();

		expect(() => classUnderTest.update(feature)).toThrowError(TypeError, 'Please implement and call abstract method #update from child or do not call super.update from child.');
	});

	it('removes all overlays from feature', () => {
		const feature = new Feature();
		feature.set('overlays', [{}, {}]);
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeOverlaySpy };

		const classUnderTest = new OverlayStyle();
		classUnderTest.remove(feature, mapMock);

		expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
	});

	it('remove a unreferenced overlay from feature, removes this overlay only from map', () => {
		const feature = new Feature();
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeOverlaySpy };
		const overlayStub = {};
		const classUnderTest = new OverlayStyle();

		classUnderTest._remove(overlayStub, feature, mapMock);

		expect(removeOverlaySpy).toHaveBeenCalledTimes(1);
	});



	describe('getOverlays()', () => {

		it('returns all on features referenced overlays as list', () => {
			const featureMock = {
				get: (key) => {
					return key === 'overlays' ? [{}, {}, {}] : undefined;
				}
			};
			const sourceMock = { getFeatures: () => [featureMock] };
			const layerMock = { getSource: () => sourceMock };


			const actualOverlays = getOverlays(layerMock);

			expect(actualOverlays.length).toBe(3);
		});

		it('returns empty list, when overlays referenced other than in \'overlays\'-property ', () => {
			const featureMock = {
				get: (key) => {
					return key === 'somethingElse' ? [{}, {}, {}] : undefined;
				}
			};
			const sourceMock = { getFeatures: () => [featureMock] };
			const layerMock = { getSource: () => sourceMock };


			const actualOverlays = getOverlays(layerMock);

			expect(actualOverlays).toEqual([]);
		});


	});

});
