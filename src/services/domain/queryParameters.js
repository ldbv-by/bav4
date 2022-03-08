/**
 * Enum which holds all valid query parameter keys.
 * @enum
 */
export const QueryParameters = Object.freeze({
	// official parameters
	ZOOM: 'z',
	CENTER: 'c',
	ROTATION: 'r',
	LAYER: 'l',
	LAYER_VISIBILITY: 'l_v',
	LAYER_OPACITY: 'l_o',
	TOPIC: 't',
	// technical parameters
	T_ENABLE_TEST_IDS: 't_enable-test-ids',
	T_DISABLE_INITIAL_UI_HINTS: 't_disable-initial-ui-hints'
});
