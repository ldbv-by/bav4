import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.routing_feedback_400).toBe('Anhand der angegebenen Punkte konnte keine Route erstellt werden');
		expect(map.routing_feedback_500).toBe('Aufgrund eines technischen Fehlers konnte keine Route erstellt werden');
		expect(map.routing_feedback_900).toBe('<b>Start</b> bzw. <b>Ziel</b> durch Klicken in die Karte angeben');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.routing_feedback_400).toBe('No route could be created based on the given points');
		expect(map.routing_feedback_500).toBe('Due to a technical error no route could be created');
		expect(map.routing_feedback_900).toBe('Specify <b>start</b> or <b>destination</b> by clicking in the map');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 3;
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
