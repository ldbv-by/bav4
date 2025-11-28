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
	 * `z`: The zoom level of the map (`number`)
	 * @example https://atlas.bayern.de?z=8
	 *
	 */
	ZOOM: 'z',
	/**
	 * `c`: The Center coordinate (easting,northing / longitude,latitude) in a supported SRID (25832, 4326) (two `numbers`, comma-separated).
	 * @example https://atlas.bayern.de?c=677751,5422939
	 */
	CENTER: 'c',
	/**
	 * `r`: The rotation of the map (`number`, in radians)
	 * @example https://atlas.bayern.de?r=0.42
	 */
	ROTATION: 'r',
	/**
	 * `l`: The id or URL of the layers of the map  (`string`, comma-separated).
	 * An id represents an internal, a URL a external `GeoResource`.
	 *
	 * URL-Patterns:<br>
	 * KML, GPX, GEOJSON, EWKT: `url||[label]` <br>
	 * WMS: `url||layer||[label]`
	 * @example // By layer ID
	 * https://atlas.bayern.de?l=atkis,tk
	 * @example //By layer ID and URL for KML, GPX, GEOJSON, EWKT
	 * https://atlas.bayern.de?l=atkis,https%3A%2F%2Fgeodaten.bayern.de%2Fodd%2Fm%2F2%2Ffreizeitthemen%2Fkml%2Fzoo.kml||Zoos%20in%20Bayern
	 * @example //By layer ID and URL for WMS
	 * https://atlas.bayern.de?c=646193,5479249&z=13&l=atkis,https%3A%2F%2Fgeoservices.bayern.de%2Fod%2Fwms%2Fatkis%2Fv1%2Ffreizeitwege||by_fzw_radwege||Radwege
	 */
	LAYER: 'l',
	/**
	 * `l_v`: The visibility of a layer (in relation to the layer index) (`boolean`, comma-separated)
	 * @example https://atlas.bayern.de?l=atkis,tk&l_v=true,false
	 */
	LAYER_VISIBILITY: 'l_v',
	/**
	 * `l_o`: The opacity of a layer (in relation to the layer index) (`number`, 0-1, comma-separated)
	 * @example https://atlas.bayern.de?l=atkis,tk&l_o=1,0.5
	 */
	LAYER_OPACITY: 'l_o',
	/**
	 * @ignore
	 * The timestamp of a layer (`string`, comma-separated)
	 */
	LAYER_TIMESTAMP: 'l_t',
	/**
	 * @ignore
	 * The swipe alignment of a layer (`string`, comma-separated)
	 */
	LAYER_SWIPE_ALIGNMENT: 'l_sa',
	/**
	 * @ignore
	 * The style of a layer (`string`, comma-separated)
	 */
	LAYER_STYLE: 'l_st',

	/**
	 * `l_dfl`: A layer should display its feature labels (if available) (in relation to the layer index) (`boolean`, comma-separated)
	 * @example https://atlas.bayern.de?l=atkis,f_11d82da0-caef-11f0-a60a-dfceed522f95_ba878c95-c163-4f34-a0cd-350c10556e00&l_dfl=true,false
	 */
	LAYER_DISPLAY_FEATURE_LABELS: 'l_dfl',
	/**
	 * @ignore
	 * The update interval of a layer in seconds (`number`, comma-separated)
	 */
	LAYER_UPDATE_INTERVAL: 'l_ui',
	/**
	 * @ignore
	 * The filter expression of a layer (`string`, comma-separated)
	 */
	LAYER_FILTER: 'l_f',
	/**
	 * @ignore
	 * The swipe ratio of the map (`number`, 0-1,  comma-separated)
	 */
	SWIPE_RATIO: 'sr',
	/**
	 * @ignore
	 * The active topic (`string`)
	 */
	TOPIC: 't',
	/**
	 * `q`: A `string` which will initialize a search request for that query
	 *  @example https://atlas.bayern.de?q=München
	 */
	QUERY: 'q',
	/**
	 * @ignore
	 * Id (`string`) of a Chip component which should be displayed
	 */
	CHIP_ID: 'chid',
	/**
	 * @ignore
	 * Id (`integer`) of a menu item which should be displayed
	 */
	MENU_ID: 'mid',
	/**
	 * @ignore
	 * Ids of catalog nodes which should be displayed open (`string`, comma-separated)
	 */
	CATALOG_NODE_IDS: 'cnids',
	/**
	 * @ignore
	 * Id (`string`)  of a tool item which should initially active
	 */
	TOOL_ID: 'tid',
	/**
	 * `crh`: Id (`string`) of the type of marker which should be initially displayed in the center of the map.
	 * If the marker should be displayed elsewhere two `numbers` representing the coordinate (in 3857) could be appended (comma-separated)
	 * @example https://atlas.bayern.de?crh=true
	 * @example https://atlas.bayern.de?crh=true,1319753.835587,6495702.843419
	 */
	CROSSHAIR: 'crh',
	/**
	 *The index (`number`) of the layer (see `LAYER` parameter) which extent should be used to fit on the map size.
	 */
	ZOOM_TO_EXTENT: 'zte',
	/**
	 * @ignore
	 * The waypoints of a route (two or more `numbers` (always a pair, mod 2 must be 0), comma-separated)
	 */
	ROUTE_WAYPOINTS: 'rtwp',
	/**
	 * @ignore
	 * The category (vehicle) of a route (`string`)
	 */
	ROUTE_CATEGORY: 'rtc',
	/**
	 * `gl`: Activated geolocation (`boolean`)
	 * @example https://atlas.bayern.de?gl=true
	 */
	GEOLOCATION: 'gl',
	/**
	 *
	 * `fir`: The coordinate (in 3857) for an initial FeatureInfo request (two `numbers`, comma-separated)
	 * @example https://atlas.bayern.de?l=atkis,f_11d82da0-caef-11f0-a60a-dfceed522f95_ba878c95-c163-4f34-a0cd-350c10556e00&&fir=1306912.414835,6294520.584972
	 */
	FEATURE_INFO_REQUEST: 'fir',

	/**
	 * EMBED MODE CONFIGURATION PARAMETERS
	 */

	/**
	 * @ignore
	 * The drawing tool (`point`, `line`,`polygon`, comma-separated)
	 */
	EC_DRAW_TOOL: 'ec_draw_tool',
	/**
	 * @ignore
	 * Show the map insensitive for user interactions unless the user activates the map via a button (`boolean`)
	 */
	EC_MAP_ACTIVATION: 'ec_map_activation',
	/**
	 * @ignore
	 * Show a chip that opens the current view in the application (`boolean`)
	 */
	EC_LINK_TO_APP: 'ec_link_to_app',

	/**
	 * TECHNICAL PARAMETERS
	 */

	/**
	 * @ignore
	 * Render test ids (`boolean`)
	 */
	T_ENABLE_TEST_IDS: 't_enable-test-ids'
});
