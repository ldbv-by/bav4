/**
 * @module domain/queryParameters
 */
/**
 * Enum which holds all valid query parameter keys.
 * @readonly
 * @enum {String}
 */
export const QueryParameters = Object.freeze({
	// official parameters
	/**
	 * The zoom level of the map (`number`)
	 */
	ZOOM: 'z',
	/**
	 * The center of the map (two `numbers`, comma-separated)
	 */
	CENTER: 'c',
	/**
	 * The rotation of the map (`number`, in radians)
	 */
	ROTATION: 'r',
	/**
	 * The ids of the layer of the map  (`string`, comma-separated).
	 * The id internally represent the id of a {@link GeoResource}
	 */
	LAYER: 'l',
	/**
	 * The visibility of a layer (`boolean`, comma-separated)
	 */
	LAYER_VISIBILITY: 'l_v',
	/**
	 * The opacity of a layer (`number`, 0-1, comma-separated)
	 */
	LAYER_OPACITY: 'l_o',
	/**
	 * Currently not supported. The active topic (`string`)
	 */
	TOPIC: 't',
	/**
	 * A `string` which will initialize a search request for that query
	 */
	QUERY: 'q',
	/**
	 * Id (`string`) of a Chip component which should be displayed
	 */
	CHIP_ID: 'chid',
	/**
	 * Id (`integer`) of a menu item which should be displayed
	 */
	MENU_ID: 'mid',
	/**
	 * Id (`string`)  of a tool item which should initially active
	 */
	TOOL_ID: 'tid',
	/**
	 * Id (`string`) of the type of marker which should be initially displayed in the center of the map
	 */
	CROSSHAIR: 'crh',
	/**
	 *The index (`number`) of the layer (see `LAYER` parameter) which extent should be used to fit on the map size.
	 */
	ZOOM_TO_EXTENT: 'zte',
	/**
	 * The waypoints of a route (two or more `numbers` (always a pair, mod 2 must be 0), comma-separated)
	 */
	ROUTE_WAYPOINTS: 'rtwp',
	/**
	 * The category (vehicle) of a route (`string`)
	 */
	ROUTE_CATEGORY: 'rtc',

	/**
	 * EMBED MODE CONFIGURATION PARAMETERS
	 */

	/**
	 * The drawing tool (`point`, `line`,`polygon`, comma-separated)
	 */
	DRAW_TOOL: 'draw_tool',
	/**
	 * Show the map  insensitive for user interactions unless the user activates the map via a button (`boolean`)
	 */
	ACTIVATE_MAP_BUTTON: 'activate_map_button',
	/**
	 * Show a chip that opens the current view in the default application (`boolean`)
	 */
	VIEW_LARGER_MAP_CHIP: 'view_larger_map-chip',

	/**
	 * TECHNICAL PARAMETERS
	 */

	/**
	 * Render test ids (`boolean`)
	 */
	T_ENABLE_TEST_IDS: 't_enable-test-ids',
	/**
	 * Currently not supported.
	 */
	T_DISABLE_INITIAL_UI_HINTS: 't_disable-initial-ui-hints'
});
