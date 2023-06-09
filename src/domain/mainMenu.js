/**
 * @module domain/mainMenu
 */
/**
 * Available menu tabs.
 * @readonly
 * @enum {String}
 */
export const TabIds = Object.freeze({
	TOPICS: 'topics',
	MAPS: 'maps',
	MISC: 'misc',
	ROUTING: 'routing',
	SEARCH: 'search',
	FEATUREINFO: 'featureinfo',

	valueOf: (index) => {
		switch (index) {
			case 0:
				return TabIds.TOPICS;
			case 1:
				return TabIds.MAPS;
			case 2:
				return TabIds.SEARCH;
			case 3:
				return TabIds.ROUTING;
			case 4:
				return TabIds.MISC;
			case 5:
				return TabIds.FEATUREINFO;
		}
		return null;
	}
});
