import { surveyProvide } from '../../../../src/modules/survey/i18n/survey.provider';


describe('i18n for baseLayer info', () => {

	it('provides translation for en', () => {

		const map = surveyProvide('en');

		expect(map.survey_feedback).toBe('Survey');
	});


	it('provides translation for de', () => {

		const map = surveyProvide('de');

		expect(map.survey_feedback).toBe('Umfrage');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 1;
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
