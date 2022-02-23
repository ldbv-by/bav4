import { surveyProvide } from '../../../../src/modules/survey/i18n/survey.provider';


describe('i18n for coordinate select', () => {

	it('provides translation for en', () => {

		const map = surveyProvide('en');

		expect(map.survey_button).toBe('Survey');
		expect(map.survey_notification_header).toBe('Survey');
		expect(map.survey_notification_text).toBe('What functions would you like to see in the new BayernAtlas');
		expect(map.survey_notification_close).toBe('No thanks');
		expect(map.survey_notification_open).toBe('Sure');
		expect(map.survey_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('provides translation for de', () => {

		const map = surveyProvide('de');

		expect(map.survey_button).toBe('Umfrage');
		expect(map.survey_notification_header).toBe('Umfrage');
		expect(map.survey_notification_text).toBe('Welche Funktionen wünschen Sie sich für den neuen BayernAtlas?');
		expect(map.survey_notification_close).toBe('Nein Danke');
		expect(map.survey_notification_open).toBe('Mitmachen');
		expect(map.survey_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 6;
		const deMap = surveyProvide('de');
		const enMap = surveyProvide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {

		const map = surveyProvide('unknown');

		expect(map).toEqual({});
	});

});
