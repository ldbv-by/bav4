import { Overlay } from 'ol';
import { $injector } from '../../../../../../../src/injection';
import { HelpTooltip } from '../../../../../../../src/modules/map/components/olMap/handler/measure/HelpTooltip';
import { MeasureSnapType, MeasureStateType } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OlMeasurementHandler';
import { TestUtils } from '../../../../../../test-utils.js';


TestUtils.setupStoreAndDi({},);
$injector.registerSingleton('UnitsService', { 
	// eslint-disable-next-line no-unused-vars
	formatDistance:(distance, decimals) => {
		return distance + ' m';
	},
	// eslint-disable-next-line no-unused-vars
	formatArea:(area, decimals) => {
		return area + ' m²';
	} });
$injector.registerSingleton('TranslationService', { translate: (key) => key });

describe('HelpTooltip', () => {

	it('ctor', () => {
		const overlayManager = {};
		const classUnderTest = new HelpTooltip(overlayManager);

		expect(classUnderTest).toBeTruthy();
	});

	it('does nothing, when not activated', () => {
		const overlayManager = {};
		const classUnderTest = new HelpTooltip(overlayManager);
		classUnderTest._updateOverlay = jasmine.createSpy();
		classUnderTest._hide = jasmine.createSpy();

		classUnderTest.notify({});
        
		expect(classUnderTest._updateOverlay).not.toHaveBeenCalled();
		expect(classUnderTest._hide).not.toHaveBeenCalled();
	});

	describe('on activate', () => {
		it('creates a overlay', () => {
			const addSpy = jasmine.createSpy();
			const mapMock = { addOverlay:addSpy,  };
		
			const classUnderTest = new HelpTooltip();			
			classUnderTest.activate(mapMock);

			expect(addSpy).toHaveBeenCalledWith(jasmine.any(Overlay));
		});
	});
	describe('on deactivate', () => {
		it('removes the overlay', () => {
			const removeSpy = jasmine.createSpy();
			const mapMock = { addOverlay:() => {}, removeOverlay:removeSpy };
			const classUnderTest = new HelpTooltip();
			
			classUnderTest.activate(mapMock);
			classUnderTest.deactivate();

			expect(removeSpy).toHaveBeenCalledWith(jasmine.any(Overlay));
		});
	});
	describe('when notified', () => {
		const mapStub = { addOverlay:() => {} };
		const measureStateTemplate = {
			type:null,
			snap:null,
			coordinate:[0, 0], 
			pointCount:42,
			dragging:false
		};

		it('with measurestate \'active\' create overlay text', () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest._updateOverlay = jasmine.createSpy();
			const measureState = { ...measureStateTemplate, type:MeasureStateType.ACTIVE };
			
			classUnderTest.activate(mapStub);
			classUnderTest.notify(measureState);
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_start');
		});

		it('with measurestate \'draw\' create overlay text', () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest._updateOverlay = jasmine.createSpy();
			
			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.DRAW, pointCount:1 });
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.DRAW });
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.DRAW, snap:MeasureSnapType.FIRSTPOINT });
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.DRAW, snap:MeasureSnapType.LASTPOINT });
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_continue_line');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_continue_line<br/>map_olMap_handler_delete_last_point');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_snap_first_point<br/>map_olMap_handler_delete_last_point');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_snap_last_point<br/>map_olMap_handler_delete_last_point');            
		});

		it('with measurestate \'modify\' create overlay text', () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest._updateOverlay = jasmine.createSpy();
			
			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.MODIFY });
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.MODIFY, snap:MeasureSnapType.VERTEX });
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.MODIFY, snap:MeasureSnapType.EDGE });

			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_modify_key_for_delete');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_modify_click_or_drag');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_modify_click_new_point');
		});

		it('with measurestate \'overlay\' create overlay text', () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest._updateOverlay = jasmine.createSpy();
			
			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, type:MeasureStateType.OVERLAY });
			
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'map_olMap_handler_measure_modify_click_drag_overlay');			
		});

		it('with measurestate \'dragging\' hide overlay', () => {
			const classUnderTest = new HelpTooltip();
			
			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, dragging:true });
			
			expect(classUnderTest._overlay.getPosition()).toBeUndefined();			
		});
	});
});