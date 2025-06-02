import { provide } from '../../../../src/modules/oaf/i18n/oafUi.provider';

describe('i18n for header module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.oafUi_mask_ui_mode).toBe('Normale Ansicht');
		expect(map.oafUi_mask_console_mode).toBe('Konsolen Ansicht');
		expect(map.oafUi_mask_add_filter_group).toBe('Neue Filtergruppe');
		expect(map.oafUi_group_title).toBe('Filtergruppe');
		expect(map.oafUi_group_select_filter).toBe('Wähle Filter...');
		expect(map.oafUi_mask_or).toBe('ODER');
		expect(map.oafUi_filter_yes).toBe('Ja');
		expect(map.oafUi_filter_no).toBe('Nein');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.oafUi_mask_ui_mode).toBe('Normal View');
		expect(map.oafUi_mask_console_mode).toBe('Console View');
		expect(map.oafUi_mask_add_filter_group).toBe('Add Filter Group');
		expect(map.oafUi_group_title).toBe('Filter Group');
		expect(map.oafUi_group_select_filter).toBe('Select Filter...');
		expect(map.oafUi_mask_or).toBe('OR');
		expect(map.oafUi_filter_yes).toBe('Yes');
		expect(map.oafUi_filter_no).toBe('No');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 8;
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
