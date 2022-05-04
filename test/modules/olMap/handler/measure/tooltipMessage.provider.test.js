import { $injector } from '../../../../../src/injection';
import { InteractionSnapType, InteractionStateType } from '../../../../../src/modules/olMap/olInteractionUtils';
import { TestUtils } from '../../../../test-utils.js';
import { provide as measureProvide } from '../../../../../src/modules/olMap/handler/measure/tooltipMessage.provider';


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

describe('Measure tooltipMessageProvider', () => {
	const measureStateTemplate = {
		type: null,
		snap: null,
		coordinate: [0, 0],
		pointCount: 42,
		dragging: false
	};

	it('provides tooltip-messages', () => {
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.DRAW, pointCount: 1 })).toBe('map_olMap_handler_measure_continue_line');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.DRAW })).toBe('map_olMap_handler_measure_continue_line<br/>map_olMap_handler_delete_last_point');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.DRAW, snap: InteractionSnapType.FIRSTPOINT })).toBe('map_olMap_handler_measure_snap_first_point<br/>map_olMap_handler_delete_last_point');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.DRAW, snap: InteractionSnapType.LASTPOINT })).toBe('map_olMap_handler_measure_snap_last_point<br/>map_olMap_handler_delete_last_point');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.MODIFY })).toBe('map_olMap_handler_measure_modify_key_for_delete');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.VERTEX })).toBe('map_olMap_handler_measure_modify_click_or_drag');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.EDGE })).toBe('map_olMap_handler_measure_modify_click_new_point');
		expect(measureProvide({ ...measureStateTemplate, type: InteractionStateType.OVERLAY })).toBe('map_olMap_handler_measure_modify_click_drag_overlay');
	});
});

