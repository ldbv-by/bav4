/**
 * @module domain/mainMenu
 */
/**
 * Available menu tabs.
 * @readonly
 * @enum {String}
 */
export const TabId = Object.freeze({
	TOPICS: 'topics',
	MAPS: 'maps',
	MISC: 'misc',
	ROUTING: 'routing',
	SEARCH: 'search',
	FEATUREINFO: 'featureinfo',
	valueOf: (index) => {
		switch (index) {
			case 0:
				return TabId.TOPICS;
			case 1:
				return TabId.MAPS;
			case 2:
				return TabId.SEARCH;
			case 3:
				return TabId.ROUTING;
			case 4:
				return TabId.MISC;
			case 5:
				return TabId.FEATUREINFO;
		}
		return null;
	}
});
