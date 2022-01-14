import { contextLinkProvide } from '../../../../src/modules/contextLink/i18n/contextLink.provider';


describe('i18n for baseLayer info', () => {

	it('provides translation for en', () => {

		const map = contextLinkProvide('en');

		expect(map.contextlink_feedback).toBe('Feedback');
	});


	it('provides translation for de', () => {

		const map = contextLinkProvide('de');

		expect(map.contextlink_feedback).toBe('Feedback');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 1;
		const deMap = contextLinkProvide('de');
		const enMap = contextLinkProvide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {

		const map = contextLinkProvide('unknown');

		expect(map).toEqual({});
	});
});
