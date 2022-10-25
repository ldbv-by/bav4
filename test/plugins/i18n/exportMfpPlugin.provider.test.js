import { provide } from '../../../src/plugins/i18n/exportMfpPlugin.provider';


describe('i18n for ExportMfpPlugin', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.exportMfpPlugin_mfpService_createJob_exception).toBe('PDF generation was not successful.');
	});

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.exportMfpPlugin_mfpService_createJob_exception).toBe('PDF konnte nicht erstellt werden.');
	});

	it('have the expected amount of translations', () => {

		const expectedSize = 1;
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
