import { provide } from '../../../../src/modules/oaf/i18n/oaf.provider';

describe('i18n for header module', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.oaf_mask_title).toBe('Filter');
		expect(map.oaf_mask_ui_mode).toBe('Normal View');
		expect(map.oaf_mask_console_mode).toBe('Edit CQL');
		expect(map.oaf_mask_add_filter_group).toBe('Add Filter Group');
		expect(map.oaf_mask_button_apply).toBe('Apply');
		expect(map.oaf_mask_filter_results).toBe('Results:');
		expect(map.oaf_mask_filter_not_displayable).toBe(
			'The CQL expression cannot be displayed visually. The expression can be edited using the “Edit CQL” button.'
		);
		expect(map.oaf_mask_filter_no_queryables).toBe('The OGC API - Features endpoint does not provide any filter capabilities');
		expect(map.oaf_mask_zoom_to_extent).toBe('Zoom on current result');
		expect(map.oaf_group_select_filter).toBe('Select Filter...');
		expect(map.oaf_mask_or).toBe('OR');
		expect(map.oaf_filter_yes).toBe('Yes');
		expect(map.oaf_filter_no).toBe('No');
		expect(map.oaf_operator_equals).toBe('Equals');
		expect(map.oaf_operator_not_equals).toBe('Not equals');
		expect(map.oaf_operator_contains).toBe('Contains');
		expect(map.oaf_operator_not_contains).toBe("Doesn't contain");
		expect(map.oaf_operator_begins_with).toBe('Begins with');
		expect(map.oaf_operator_not_begins_with).toBe("Doesn't begin with");
		expect(map.oaf_operator_ends_with).toBe('Ends with');
		expect(map.oaf_operator_not_ends_with).toBe("Doesn't end with");
		expect(map.oaf_operator_greater).toBe('Greater than');
		expect(map.oaf_operator_greater_equals).toBe('Greater or equal');
		expect(map.oaf_operator_less).toBe('Less than');
		expect(map.oaf_operator_less_equals).toBe('Less or equal');
		expect(map.oaf_operator_between).toBe('Between');
		expect(map.oaf_operator_not_between).toBe('Outside');
		expect(map.oaf_operator_date).toBe('Date');
		expect(map.oaf_operator_timestamp).toBe('Timestamp');
		expect(map.oaf_operator_and).toBe('And');
		expect(map.oaf_operator_or).toBe('Or');
		expect(map.oaf_operator_like).toBe('Like');
		expect(map.oaf_operator_not).toBe('Not');
		expect(map.oaf_filter_dropdown_header_title).toBe('Examples');
		expect(map.oaf_filter_input_placeholder).toBe('Filter by...');
		expect(map.oaf_filter_pattern_validation_msg(['foo'])).toBe('Please enter a value that fits the format (e.g. foo)');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.oaf_mask_title).toBe('Filter');
		expect(map.oaf_mask_ui_mode).toBe('Normale Ansicht');
		expect(map.oaf_mask_console_mode).toBe('CQL bearbeiten');
		expect(map.oaf_mask_add_filter_group).toBe('Neue Filtergruppe');
		expect(map.oaf_mask_button_apply).toBe('Anwenden');
		expect(map.oaf_mask_filter_results).toBe('Ergebnisse:');
		expect(map.oaf_mask_zoom_to_extent).toBe('Auf aktuelles Ergebnis zoomen');
		expect(map.oaf_mask_filter_not_displayable).toBe(
			'Der CQL-Ausdruck ist nicht visuell darstellbar. Mit der Schaltfläche "CQL bearbeiten" kann der Ausdruck bearbeitet werden'
		);
		expect(map.oaf_mask_filter_no_queryables).toBe('Der OGC API - Features Endpunkt bietet keine Filtermöglichkeit an');
		expect(map.oaf_group_select_filter).toBe('Wähle Filter...');
		expect(map.oaf_mask_or).toBe('ODER');
		expect(map.oaf_filter_yes).toBe('Ja');
		expect(map.oaf_filter_no).toBe('Nein');
		expect(map.oaf_operator_equals).toBe('Ist gleich');
		expect(map.oaf_operator_contains).toBe('Enthält');
		expect(map.oaf_operator_not_contains).toBe('Enthält nicht');
		expect(map.oaf_operator_begins_with).toBe('Beginnt mit');
		expect(map.oaf_operator_not_begins_with).toBe('Beginnt nicht mit');
		expect(map.oaf_operator_ends_with).toBe('Endet mit');
		expect(map.oaf_operator_not_ends_with).toBe('Endet nicht mit');
		expect(map.oaf_operator_greater).toBe('Größer als');
		expect(map.oaf_operator_greater_equals).toBe('Größer gleich');
		expect(map.oaf_operator_less).toBe('Kleiner als');
		expect(map.oaf_operator_less_equals).toBe('Kleiner gleich');
		expect(map.oaf_operator_between).toBe('Zwischen');
		expect(map.oaf_operator_not_between).toBe('Außerhalb');
		expect(map.oaf_operator_date).toBe('Datum');
		expect(map.oaf_operator_timestamp).toBe('Datum + Zeit');
		expect(map.oaf_operator_and).toBe('Und');
		expect(map.oaf_operator_or).toBe('Oder');
		expect(map.oaf_operator_like).toBe('Ähnlich');
		expect(map.oaf_operator_not).toBe('Nicht');
		expect(map.oaf_filter_dropdown_header_title).toBe('Beispiele');
		expect(map.oaf_filter_input_placeholder).toBe('Filtern nach...');
		expect(map.oaf_filter_pattern_validation_msg(['foo'])).toBe('Bitte geben Sie einen Wert ein, der dem Format entspricht (z.B. foo)');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 36;
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
