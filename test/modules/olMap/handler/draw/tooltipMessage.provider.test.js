import { $injector } from '../../../../../src/injection';
import { InteractionSnapType, InteractionStateType } from '../../../../../src/modules/olMap/utils/olInteractionUtils';
import { TestUtils } from '../../../../test-utils.js';
import { provide as drawProvide } from '../../../../../src/modules/olMap/handler/draw/tooltipMessage.provider';

TestUtils.setupStoreAndDi({});
$injector.registerSingleton('TranslationService', { translate: (key) => key });

describe('Draw tooltipMessageProvider', () => {
	const drawStateTemplate = {
		type: null,
		snap: null,
		coordinate: [0, 0],
		pointCount: 42,
		dragging: false
	};

	it('provides tooltip-messages', () => {
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.DRAW, pointCount: 1 })).toBe('olMap_handler_draw_continue_line');
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.DRAW })).toBe(
			'olMap_handler_draw_continue_line<br/>olMap_handler_delete_last_point'
		);
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.DRAW, snap: InteractionSnapType.FIRSTPOINT })).toBe(
			'olMap_handler_measure_snap_first_point<br/>olMap_handler_delete_last_point'
		);
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.DRAW, snap: InteractionSnapType.LASTPOINT })).toBe(
			'olMap_handler_measure_snap_last_point<br/>olMap_handler_delete_last_point'
		);
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.MODIFY })).toBe('olMap_handler_draw_modify_key_for_delete');
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.VERTEX, geometryType: null })).toBe(
			'olMap_handler_measure_modify_click_or_drag'
		);
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.VERTEX, geometryType: 'Polygon' })).toBe(
			'olMap_handler_measure_modify_polygon_click_or_drag'
		);
		expect(
			drawProvide({ ...drawStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.VERTEX, geometryType: 'LineString' })
		).toBe('olMap_handler_measure_modify_linestring_click_or_drag');

		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.MODIFY, snap: InteractionSnapType.EDGE })).toBe(
			'olMap_handler_measure_modify_click_new_point'
		);
		expect(drawProvide({ ...drawStateTemplate, type: InteractionStateType.OVERLAY })).toBe('olMap_handler_measure_modify_click_drag_overlay');
	});
});
