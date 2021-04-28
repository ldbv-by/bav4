import { Feature } from 'ol';
import { OverlayManager } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OverlayManager';
import { TestUtils } from '../../../../../../test-utils.js';

TestUtils.setupStoreAndDi({},);

describe('OverlayManager', () => {
	const createFeature = () => {
		const feature = new Feature();
		feature.set('measurement', {});
		feature.set('area', {});
		feature.set('partitions', [{}, {}]);
		return feature;
	};

	const getOverlaysFromFeature = (feature) => {
		const overlays = [];
		overlays.push(feature.get('measurement'));
		overlays.push(feature.get('area'));
		feature.get('partitions').forEach(p => overlays.push(p));
		return overlays;
	};
	it('ctor', () => {
		const mapStub = {};
		const classUnderTest = new OverlayManager(mapStub);

		expect(classUnderTest).toBeTruthy();
		expect(classUnderTest._overlays).toEqual([]);
	});

	it('adds a overlay to map and state', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { addOverlay: addOverlaySpy };

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest.add({});

		expect(addOverlaySpy).toHaveBeenCalled();
		expect(classUnderTest.getOverlays().length).toBe(1);

	});

	it('removes a overlay from map and state', () => {
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeOverlaySpy };
		const overlayStub = {};

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest._overlays = [overlayStub];
		expect(classUnderTest.getOverlays().length).toBe(1);
		classUnderTest.remove(overlayStub);

		expect(removeOverlaySpy).toHaveBeenCalled();
		expect(classUnderTest.getOverlays().length).toBe(0);

	});

	it('apply callback on overlays', () => {
		const callbackSpy = jasmine.createSpy();
		const mapStub = {};

		const classUnderTest = new OverlayManager(mapStub);
		classUnderTest._overlays = [{}, {}, {}];
		expect(classUnderTest.getOverlays().length).toBe(3);
		classUnderTest.apply(callbackSpy);

		expect(callbackSpy).toHaveBeenCalledTimes(3);
	});

	it('resets state', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest._overlays = [{}, {}, {}];
		expect(classUnderTest.getOverlays().length).toBe(3);
		classUnderTest.reset();

		expect(removeSpy).toHaveBeenCalledTimes(3);
	});

	it('removes all overlays from feature', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };
		const feature = createFeature();

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest._overlays = getOverlaysFromFeature(feature);

		expect(classUnderTest.getOverlays().length).toBe(4);
		classUnderTest.removeFrom(feature);
		expect(removeSpy).toHaveBeenCalledTimes(4);
	});

});