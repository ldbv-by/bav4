import { provide } from '../../../../src/modules/oaf/i18n/oaf.provider';

describe('i18n for header module', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.oaf_mask_title).toBe('Filter');
		expect(map.oaf_mask_ui_mode).toBe('Normal View');
		expect(map.oaf_mask_console_mode).toBe('Console View');
		expect(map.oaf_mask_add_filter_group).toBe('Add Filter Group');
		expect(map.oaf_group_select_filter).toBe('Select Filter...');
		expect(map.oaf_mask_or).toBe('OR');
		expect(map.oaf_filter_yes).toBe('Yes');
		expect(map.oaf_filter_no).toBe('No');
		expect(map.oaf_operator_equals).toBe('Equals');
		expect(map.oaf_operator_like).toBe('Like');
		expect(map.oaf_operator_greater).toBe('Greater Than');
		expect(map.oaf_operator_lesser).toBe('Less Than');
		expect(map.oaf_operator_between).toBe('Between');
		expect(map.oaf_filter_dropdown_header_title).toBe('Examples');
		expect(map.oaf_filter_input_placeholder).toBe('Filter by...');
		expect(map.oaf_filter_not_button).toBe('NOT');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.oaf_mask_ui_mode).toBe('Normale Ansicht');
		expect(map.oaf_mask_console_mode).toBe('Konsolen Ansicht');
		expect(map.oaf_mask_add_filter_group).toBe('Neue Filtergruppe');
		expect(map.oaf_group_title).toBe('Filtergruppe');
		expect(map.oaf_group_select_filter).toBe('Wähle Filter...');
		expect(map.oaf_mask_or).toBe('ODER');
		expect(map.oaf_filter_yes).toBe('Ja');
		expect(map.oaf_filter_no).toBe('Nein');
		expect(map.oaf_operator_equals).toBe('Ist gleich');
		expect(map.oaf_operator_like).toBe('Enthält');
		expect(map.oaf_operator_greater).toBe('Größer als');
		expect(map.oaf_operator_lesser).toBe('Kleiner als');
		expect(map.oaf_operator_between).toBe('Zwischen');
		expect(map.oaf_filter_dropdown_header_title).toBe('Beispiele');
		expect(map.oaf_filter_input_placeholder).toBe('Filtern nach...');
		expect(map.oaf_filter_not_button).toBe('NICHT');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 16;
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
