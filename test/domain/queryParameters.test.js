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
		expect(QueryParameters.LAYER_TIMESTAMP).toBe('l_t');
		expect(QueryParameters.TOPIC).toBe('t');
		expect(QueryParameters.QUERY).toBe('q');
		expect(QueryParameters.CHIP_ID).toBe('chid');
		expect(QueryParameters.MENU_ID).toBe('mid');
		expect(QueryParameters.TOOL_ID).toBe('tid');
		expect(QueryParameters.CROSSHAIR).toBe('crh');
		expect(QueryParameters.ZOOM_TO_EXTENT).toBe('zte');
		expect(QueryParameters.ROUTE_WAYPOINTS).toBe('rtwp');
		expect(QueryParameters.ROUTE_CATEGORY).toBe('rtc');

		expect(QueryParameters.EC_DRAW_TOOL).toBe('ec_draw_tool');
		expect(QueryParameters.EC_MAP_ACTIVATION).toBe('ec_map_activation');
		expect(QueryParameters.EC_LINK_TO_APP).toBe('ec_link_to_app');

		expect(QueryParameters.T_ENABLE_TEST_IDS).toBe('t_enable-test-ids');
	});
});
