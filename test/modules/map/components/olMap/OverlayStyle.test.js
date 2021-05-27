import { Feature } from 'ol';
import { OverlayStyle } from '../../../../../src/modules/map/components/olMap/OverlayStyle';
import { TestUtils } from '../../../../test-utils.js';

describe('OverlayStyle', () => {
	const setup = () => {
		TestUtils.setupStoreAndDi({},);
		
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
		const mapMock = { removeOverlay:removeOverlaySpy,  };
		
		const classUnderTest = new OverlayStyle();
		classUnderTest.remove(feature, mapMock);
		
		expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
	});
	
});