import { QueryParameters } from '../../src/domain/queryParameters';

describe('QueryParameters', () => {
	it('provides an enum of all valid query parameters', () => {
		expect(Object.keys(QueryParameters).length).toBe(20);

		expect(QueryParameters.CENTER).toBe('c');
		expect(QueryParameters.ZOOM).toBe('z');
		expect(QueryParameters.ROTATION).toBe('r');
		expect(QueryParameters.LAYER).toBe('l');
		expect(QueryParameters.LAYER_VISIBILITY).toBe('l_v');
		expect(QueryParameters.LAYER_OPACITY).toBe('l_o');
		expect(QueryParameters.TOPIC).toBe('t');
		expect(QueryParameters.QUERY).toBe('q');
		expect(QueryParameters.CHIP_ID).toBe('chid');
		expect(QueryParameters.MENU_ID).toBe('mid');
		expect(QueryParameters.TOOL_ID).toBe('tid');
		expect(QueryParameters.CROSSHAIR).toBe('crh');
		expect(QueryParameters.ZOOM_TO_EXTENT).toBe('zte');
		expect(QueryParameters.ROUTE_WAYPOINTS).toBe('rtwp');
		expect(QueryParameters.ROUTE_CATEGORY).toBe('rtc');

		expect(QueryParameters.DRAW_TOOL).toBe('draw_tool');
		expect(QueryParameters.ACTIVATE_MAP_BUTTON).toBe('activate_map_button');
		expect(QueryParameters.VIEW_LARGER_MAP_CHIP).toBe('view_larger_map-chip');

		expect(QueryParameters.T_ENABLE_TEST_IDS).toBe('t_enable-test-ids');
		expect(QueryParameters.T_DISABLE_INITIAL_UI_HINTS).toBe('t_disable-initial-ui-hints');
	});
});
