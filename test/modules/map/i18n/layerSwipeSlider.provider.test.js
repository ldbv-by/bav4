import { provide } from '@src/modules/map/i18n/layerSwipeSlider.provider';

describe('i18n for map module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_layerSwipeSlider).toBe('Nach links oder rechts verschieben');
		expect(map.map_layerSwipeSlider_modal_title).toBe('Vergleichen');
		expect(map.map_layerSwipeSlider_modal_link_text).toBe('Weitere Informationen');
		expect(map.map_layerSwipeSlider_modal_link_url).toBe('https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/funktionen/vergleichen.html ');
		expect(map.map_layerSwipeSlider_modal).toBe(
			'Bitte wählen Sie als zweite Karte eine der untenstehenden Basiskarten oder eine Ebene aus den Themen. Um unterschiedliche Jahre der Zeitreise vergleichen zu können, muss die Basiskarte „Zeitreise“ zweimal ausgewählt werden.'
		);
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_layerSwipeSlider).toBe('Move left or right');
		expect(map.map_layerSwipeSlider_modal_title).toBe('Compare');
		expect(map.map_layerSwipeSlider_modal_link_text).toBe('More Information');
		expect(map.map_layerSwipeSlider_modal_link_url).toBe('https://www.ldbv.bayern.de/produkte/dienste/ba_hilfe/funktionen/vergleichen.html ');
		expect(map.map_layerSwipeSlider_modal).toBe(
			'Please select one of the base maps below or a layer from the themes as your second map. To compare different years on the timeline, you must select the "Timeline" base map twice.'
		);
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 5;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
