import { Feature } from 'ol';
import { OverlayManager } from '../../../../../src/modules/map/components/olMap/OverlayManager';
import { TestUtils } from '../../../../test-utils.js';

describe('OverlayManager', () => {
	const setup = () => {
		TestUtils.setupStoreAndDi({},);
		
	};

	beforeEach(() => {
		setup();
	}); 
		
	it('ctor', () => {		
		const classUnderTest = new OverlayManager();

		expect(classUnderTest).toBeTruthy();
		expect(classUnderTest._overlays).toEqual([]);
	});

	it('adds a overlay to map and state', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { 
			addOverlay: addOverlaySpy,
			removeOverlay: () => {} };

		const classUnderTest = new OverlayManager();
		classUnderTest.activate(mapMock);
		classUnderTest.add({});

		expect(addOverlaySpy).toHaveBeenCalled();
		expect(classUnderTest.getOverlays().length).toBe(1);

	});

	it('removes a overlay from map and state', () => {
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeOverlaySpy };
		const overlayStub = {};

		const classUnderTest = new OverlayManager();
		classUnderTest.activate(mapMock);		
		classUnderTest._overlays = [overlayStub];
		expect(classUnderTest.getOverlays().length).toBe(1);
		classUnderTest.remove(overlayStub);

		expect(removeOverlaySpy).toHaveBeenCalled();
		expect(classUnderTest.getOverlays().length).toBe(0);

	});

	it('apply callback on overlays', () => {
		const callbackSpy = jasmine.createSpy();
		const mapStub = {};

		const classUnderTest = new OverlayManager();
		classUnderTest.activate(mapStub);		
		classUnderTest._overlays = [{}, {}, {}];
		expect(classUnderTest.getOverlays().length).toBe(3);
		classUnderTest.apply(callbackSpy);

		expect(callbackSpy).toHaveBeenCalledTimes(3);
	});

	it('resets state', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };

		const classUnderTest = new OverlayManager();
		classUnderTest.activate(mapMock);		
		classUnderTest._overlays = [{}, {}, {}];
		classUnderTest.reset();

		expect(removeSpy).toHaveBeenCalledTimes(3);
	});

	it('call for removes all overlays from feature, throws error', () => {		
		const feature = new Feature();
		const classUnderTest = new OverlayManager();

		expect(() => classUnderTest.removeFrom(feature)).toThrowError(TypeError, 'Please implement and call abstract method #removeFrom from child or call static OverlayManager.removeFrom.');
	});

	it('call for create all overlays for feature, throws error', () => {		
		const feature = new Feature();
		const classUnderTest = new OverlayManager();

		expect(() => classUnderTest.createFor(feature)).toThrowError(TypeError, 'Please implement and call abstract method #createFor from child or call static OverlayManager.createFor.');
	});

	
});