/**
 * @module domain/queryParameters
 */
/**
 * Enum which holds all valid query parameter keys for URL-based map configuration.
 *
 * Query parameters allow users to share and embed customized map states through URLs.
 * Parameters are organized into three categories: **Map View** (zoom, center, rotation),
 * **Layer Configuration** (layers, visibility, opacity, styling), and **Embed Mode** configuration.
 *
 * @readonly
 * @enum {String}
 * @example
 * // Share a map view with specific layers and zoom level
 * https://atlas.bayern.de?z=8&c=677751,5422939&l=atkis,tk
 */
export const QueryParameters = Object.freeze({
	// ============================================
	// MAP VIEW PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"z"`
	 * **Type:** `number` (0-20)
	 *
	 * Sets the zoom level of the map.
	 * @example https://atlas.bayern.de?z=8
	 */
	ZOOM: 'z',

	/**
	 * **Parameter Key:** `"c"`
	 * **Type:** `number,number` (comma-separated pair)
	 *
	 * Sets the center coordinate of the map in the format easting,northing (or longitude,latitude).
	 * Supported SRIDs: `25832` (ETRS89 / UTM zone 32N) and `4326` (WGS84)
	 * @example https://atlas.bayern.de?c=677751,5422939
	 */
	CENTER: 'c',

	/**
	 * **Parameter Key:** `"r"`
	 * **Type:** `number` (radians)
	 *
	 * Sets the rotation angle of the map.
	 * @example https://atlas.bayern.de?r=0.42
	 */
	ROTATION: 'r',

	// ============================================
	// LAYER PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"l"`
	 * **Type:** `string,string,...` (comma-separated list)
	 *
	 * Specifies the layers to display. Each layer can be identified by:
	 * - **ID:** An internal layer identifier (e.g., `atkis`, `tk`)
	 * - **URL:** An external GeoResource URL with optional format specifier
	 *
	 * **URL Patterns:**
	 * - **KML, GPX, GEOJSON, EWKT:** `url||[label]`
	 * - **WMS:** `url||layer||[label]`
	 *
	 * @example
	 * // By layer IDs
	 * https://atlas.bayern.de?l=atkis,tk
	 * @example
	 * // By layer ID and KML URL with label
	 * https://atlas.bayern.de?l=atkis,https%3A%2F%2Fgeodaten.bayern.de%2Fodd%2Fm%2F2%2Ffreizeitthemen%2Fkml%2Fzoo.kml||Zoos%20in%20Bayern
	 * @example
	 * // By layer ID and WMS URL with layer and label
	 * https://atlas.bayern.de?z=13&l=atkis,https%3A%2F%2Fgeoservices.bayern.de%2Fod%2Fwms%2Fatkis%2Fv1%2Ffreizeitwege||by_fzw_radwege||Radwege
	 */
	LAYER: 'l',

	/**
	 * **Parameter Key:** `"l_v"`
	 * **Type:** `boolean,boolean,...` (comma-separated, indexed by layer order)
	 *
	 * Controls the visibility of each layer. Order must correspond to the `LAYER` parameter order.
	 * @example https://atlas.bayern.de?l=atkis,tk&l_v=true,false
	 */
	LAYER_VISIBILITY: 'l_v',

	/**
	 * **Parameter Key:** `"l_o"`
	 * **Type:** `number,number,...` (0-1 range, comma-separated, indexed by layer order)
	 *
	 * Controls the opacity/transparency of each layer. Order must correspond to the `LAYER` parameter order.
	 * @example https://atlas.bayern.de?l=atkis,tk&l_o=1,0.5
	 */
	LAYER_OPACITY: 'l_o',

	/**
	 * **Parameter Key:** `"l_t"`
	 * **Type:** `string,string,...` (comma-separated, indexed by layer order)
	 *
	 * Sets the timestamp for time-based layers (rarely used in public URLs).
	 * @ignore
	 */
	LAYER_TIMESTAMP: 'l_t',

	/**
	 * **Parameter Key:** `"l_sa"`
	 * **Type:** `string,string,...` (comma-separated, indexed by layer order)
	 *
	 * Controls the swipe alignment direction for layer comparison (rarely used in public URLs).
	 * @ignore
	 */
	LAYER_SWIPE_ALIGNMENT: 'l_sa',

	/**
	 * **Parameter Key:** `"l_st"`
	 * **Type:** `string,string,...` (comma-separated, indexed by layer order)
	 *
	 * Specifies custom styling for each layer (rarely used in public URLs).
	 * @ignore
	 */
	LAYER_STYLE: 'l_st',

	/**
	 * **Parameter Key:** `"l_dfl"`
	 * **Type:** `boolean,boolean,...` (comma-separated, indexed by layer order)
	 *
	 * Controls whether each layer should display its feature labels if available.
	 * Order must correspond to the `LAYER` parameter order.
	 * @example https://atlas.bayern.de?l=atkis,f_11d82da0-caef-11f0-a60a-dfceed522f95_ba878c95-c163-4f34-a0cd-350c10556e00&l_dfl=true,false
	 */
	LAYER_DISPLAY_FEATURE_LABELS: 'l_dfl',

	/**
	 * **Parameter Key:** `"l_ui"`
	 * **Type:** `number,number,...` (seconds, comma-separated, indexed by layer order)
	 *
	 * Sets the update interval for each layer (rarely used in public URLs).
	 * @ignore
	 */
	LAYER_UPDATE_INTERVAL: 'l_ui',

	/**
	 * **Parameter Key:** `"l_f"`
	 * **Type:** `string,string,...` (comma-separated, indexed by layer order)
	 *
	 * Applies filter expressions to each layer (rarely used in public URLs).
	 * @ignore
	 */
	LAYER_FILTER: 'l_f',

	/**
	 * **Parameter Key:** `"sr"`
	 * **Type:** `number` (0-1 range)
	 *
	 * Controls the swipe ratio for layer comparison functionality (rarely used in public URLs).
	 * @ignore
	 */
	SWIPE_RATIO: 'sr',

	// ============================================
	// SEARCH AND FEATURE PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"q"`
	 * **Type:** `string`
	 *
	 * Initializes a search request with the given query string.
	 * @example https://atlas.bayern.de?q=München
	 */
	QUERY: 'q',

	/**
	 * **Parameter Key:** `"fir"`
	 * **Type:** `number,number` (coordinate pair in EPSG:3857)
	 *
	 * Triggers a FeatureInfo request at the specified coordinate.
	 * Coordinates must be in EPSG:3857 (Web Mercator) format.
	 * @example https://atlas.bayern.de?l=atkis,6f5a389c-4ef3-4b5a-9916-475fd5c5962b&fir=1269930.753480,6092384.278496
	 */
	FEATURE_INFO_REQUEST: 'fir',

	// ============================================
	// NAVIGATION AND INTERACTION PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"zte"`
	 * **Type:** `number` (layer index)
	 *
	 * Fits the map view to the extent of the specified layer.
	 * The index refers to the layer order in the `LAYER` parameter.
	 * @example https://atlas.bayern.de/?l=atkis,f_b8feba10-f14e-11f0-bfca-572ff6603ccf_9dc40aa9-acfe-47a0-a2a5-2976d826bff9&zte=1
	 */
	ZOOM_TO_EXTENT: 'zte',

	/**
	 * **Parameter Key:** `"crh"`
	 * **Type:** `boolean` or `boolean,number,number` (optional coordinate pair in EPSG:3857)
	 *
	 * Displays a crosshair/center marker. If coordinates are provided, the marker appears at that location
	 * instead of the map center.
	 * @example https://atlas.bayern.de?crh=true
	 * @example https://atlas.bayern.de?crh=true,1319753.835587,6495702.843419
	 */
	CROSSHAIR: 'crh',

	/**
	 * **Parameter Key:** `"gl"`
	 * **Type:** `boolean`
	 *
	 * Activates geolocation, attempting to center the map on the user's current location.
	 * @example https://atlas.bayern.de?gl=true
	 */
	GEOLOCATION: 'gl',

	// ============================================
	// ROUTING PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"rtwp"`
	 * **Type:** `number,number,number,number,...` (pairs of coordinate values, comma-separated)
	 *
	 * Specifies route waypoints. Must contain an even number of coordinate values (pairs).
	 * Minimum 2 waypoints (4 values) required.
	 * @ignore
	 */
	ROUTE_WAYPOINTS: 'rtwp',

	/**
	 * **Parameter Key:** `"rtc"`
	 * **Type:** `string`
	 *
	 * Sets the routing category/vehicle type (e.g., car, bike, pedestrian).
	 * @ignore
	 */
	ROUTE_CATEGORY: 'rtc',

	// ============================================
	// UI STATE PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"t"`
	 * **Type:** `string`
	 *
	 * Sets the active topic/thematic view.
	 * @ignore
	 */
	TOPIC: 't',

	/**
	 * **Parameter Key:** `"chid"`
	 * **Type:** `string`
	 *
	 * Specifies a Chip component to display.
	 * @ignore
	 */
	CHIP_ID: 'chid',

	/**
	 * **Parameter Key:** `"mid"`
	 * **Type:** `number`
	 *
	 * Specifies a menu item to display by index.
	 * @ignore
	 */
	MENU_ID: 'mid',

	/**
	 * **Parameter Key:** `"cnids"`
	 * **Type:** `string,string,...` (comma-separated list)
	 *
	 * Specifies catalog node IDs to display in expanded state.
	 * @ignore
	 */
	CATALOG_NODE_IDS: 'cnids',

	/**
	 * **Parameter Key:** `"tid"`
	 * **Type:** `string`
	 *
	 * Specifies a tool item to be initially active.
	 * @ignore
	 */
	TOOL_ID: 'tid',

	// ============================================
	// EMBED MODE CONFIGURATION PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"ec_draw_tool"`
	 * **Type:** `string` (comma-separated: `point`, `line`, `polygon`)
	 *
	 * Configures available drawing tools in embed mode.
	 * @ignore
	 */
	EC_DRAW_TOOL: 'ec_draw_tool',

	/**
	 * **Parameter Key:** `"ec_map_activation"`
	 * **Type:** `boolean`
	 *
	 * If true, the map is disabled for user interactions until explicitly activated via a button.
	 * Useful for preventing accidental pan/zoom in embedded contexts.
	 * @ignore
	 */
	EC_MAP_ACTIVATION: 'ec_map_activation',

	/**
	 * **Parameter Key:** `"ec_link_to_app"`
	 * **Type:** `boolean`
	 *
	 * If true, displays a chip/button that opens the current map view in the full application.
	 * @ignore
	 */
	EC_LINK_TO_APP: 'ec_link_to_app',

	/**
	 * **Parameter Key:** `"ec_srid"`
	 * **Type:** `number` (e.g., 4326, 25832)
	 *
	 * Specifies the SRID for returned coordinates and geometries in embed mode callbacks.
	 * Default: `4326` (WGS84)
	 * @ignore
	 */
	EC_SRID: 'ec_srid',

	/**
	 * **Parameter Key:** `"ec_geometry_format"`
	 * **Type:** `string` (one of: `ewkt`, `kml`, `geojson`, `gpx`)
	 *
	 * Specifies the format for returned feature geometries in embed mode.
	 * Default: `ewkt`
	 * @ignore
	 */
	EC_GEOMETRY_FORMAT: 'ec_geometry_format',

	// ============================================
	// TECHNICAL PARAMETERS
	// ============================================

	/**
	 * **Parameter Key:** `"t_enable-test-ids"`
	 * **Type:** `boolean`
	 *
	 * If true, renders test IDs on DOM elements for testing purposes.
	 * @ignore
	 */
	T_ENABLE_TEST_IDS: 't_enable-test-ids'
});
