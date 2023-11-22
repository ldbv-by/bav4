import { provide } from '../../../../src/modules/routing/i18n/routingContext.provider';

describe('i18n for the routing module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.routing_contextContent_start).toBe('Hier starten');
		expect(map.routing_contextContent_destination).toBe('Als Ziel');
		expect(map.routing_contextContent_intermediate).toBe('Wegpunkt hinzufügen');
		expect(map.routing_contextContent_remove_waypoint).toBe('Wegpunkt entfernen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.routing_contextContent_start).toBe('Start here');
		expect(map.routing_contextContent_destination).toBe('Finish here');
		expect(map.routing_contextContent_intermediate).toBe('Insert Waypoint');
		expect(map.routing_contextContent_remove_waypoint).toBe('Remove Waypoint');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 4;
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
