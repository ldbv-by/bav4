import { Overlay } from 'ol';
import { $injector } from '../../../../src/injection';
import { HelpTooltip } from '../../../../src/modules/olMap/tooltip/HelpTooltip';
import { InteractionSnapType, InteractionStateType } from '../../../../src/modules/olMap/utils/olInteractionUtils';
import { TestUtils } from '../../../test-utils.js';
import { provide as measureProvide } from '../../../../src/modules/olMap/handler/measure/tooltipMessage.provider';

TestUtils.setupStoreAndDi({});
$injector.registerSingleton('UnitsService', {
	// eslint-disable-next-line no-unused-vars
	formatDistance: (distance, decimals) => {
		return distance + ' m';
	},
	// eslint-disable-next-line no-unused-vars
	formatArea: (area, decimals) => {
		return area + ' m²';
	}
});
$injector.registerSingleton('TranslationService', { translate: (key) => key });

describe('HelpTooltip', () => {
	it('ctor', () => {
		const overlayManager = {};
		const classUnderTest = new HelpTooltip(overlayManager);

		expect(classUnderTest).toBeTruthy();
		expect(classUnderTest.messageProvideFunction).toEqual(classUnderTest._tooltipMessageProvideFunction);
		expect(classUnderTest.active).toBeFalse();
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

	it('returns null if MessageProvideFunction is not set (default) ', () => {
		const overlayManager = {};
		const classUnderTest = new HelpTooltip(overlayManager);

		expect(classUnderTest._tooltipMessageProvideFunction()).toBeNull();
	});

	describe('on activate', () => {
		it('creates a overlay', () => {
			const addSpy = jasmine.createSpy();
			const mapMock = { addOverlay: addSpy };

			const classUnderTest = new HelpTooltip();
			classUnderTest.activate(mapMock);

			expect(addSpy).toHaveBeenCalledWith(jasmine.any(Overlay));
			expect(classUnderTest.active).toBeTrue();
		});
	});
	describe('on deactivate', () => {
		it('removes the overlay', () => {
			const removeSpy = jasmine.createSpy();
			const mapMock = { addOverlay: () => {}, removeOverlay: removeSpy };
			const classUnderTest = new HelpTooltip();

			classUnderTest.activate(mapMock);
			classUnderTest.deactivate();

			expect(removeSpy).toHaveBeenCalledWith(jasmine.any(Overlay));
			expect(classUnderTest.active).toBeFalse();
		});

		it('does nothing, when overlay is null', () => {
			const removeSpy = jasmine.createSpy();
			const mapMock = { addOverlay: () => {}, removeOverlay: removeSpy };
			const classUnderTest = new HelpTooltip();

			classUnderTest.activate(mapMock);
			classUnderTest._overlay = null;
			classUnderTest.deactivate();

			expect(removeSpy).not.toHaveBeenCalled();
			expect(classUnderTest.active).toBeFalse();
		});
	});
	describe('when notified', () => {
		const mapStub = { addOverlay: () => {} };
		const measureStateTemplate = {
			type: null,
			snap: null,
			coordinate: [0, 0],
			pointCount: 42,
			dragging: false
		};

		it("with interactionstate 'active' create overlay text", () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest.messageProvideFunction = measureProvide;
			classUnderTest._updateOverlay = jasmine.createSpy();
			const measureState = { ...measureStateTemplate, type: InteractionStateType.ACTIVE };

			classUnderTest.activate(mapStub);
			classUnderTest.notify(measureState);
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'olMap_handler_measure_start');
		});

		it("with interactionstate 'draw' create overlay text", () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest.messageProvideFunction = measureProvide;
			classUnderTest._updateOverlay = jasmine.createSpy();

			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.DRAW, pointCount: 1 });
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.DRAW });
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.DRAW, snap: InteractionSnapType.FIRSTPOINT });
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.DRAW, snap: InteractionSnapType.LASTPOINT });
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'olMap_handler_measure_continue_line');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(
				jasmine.any(Array),
				'olMap_handler_measure_continue_line<br/>olMap_handler_delete_last_point'
			);
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(
				jasmine.any(Array),
				'olMap_handler_measure_snap_first_point<br/>olMap_handler_delete_last_point'
			);
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(
				jasmine.any(Array),
				'olMap_handler_measure_snap_last_point<br/>olMap_handler_delete_last_point'
			);
		});

		it("with interactionstate 'modify' create overlay text", () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest.messageProvideFunction = measureProvide;
			classUnderTest._updateOverlay = jasmine.createSpy();

			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.MODIFY });
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.VERTEX });
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.EDGE });

			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'olMap_handler_measure_modify_key_for_delete');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'olMap_handler_measure_modify_click_or_drag');
			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'olMap_handler_measure_modify_click_new_point');
		});

		it("with interactionstate 'overlay' create overlay text", () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest.messageProvideFunction = measureProvide;
			classUnderTest._updateOverlay = jasmine.createSpy();

			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, type: InteractionStateType.OVERLAY });

			expect(classUnderTest._updateOverlay).toHaveBeenCalledWith(jasmine.any(Array), 'olMap_handler_measure_modify_click_drag_overlay');
		});

		it("with interactionstate 'dragging' hide overlay", () => {
			const classUnderTest = new HelpTooltip();
			classUnderTest.messageProvideFunction = measureProvide;
			classUnderTest.activate(mapStub);
			classUnderTest.notify({ ...measureStateTemplate, dragging: true });

			expect(classUnderTest._overlay.getPosition()).toBeUndefined();
		});
	});
});
