import { OafFilterGroup } from '../../../../src/modules/oaf/components/OafFilterGroup';
import { TestUtils } from '../../../test-utils';

window.customElements.define(OafFilterGroup.tag, OafFilterGroup);

describe('OafFilterGroup', () => {
	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		return TestUtils.render(OafFilterGroup.tag);
	};

	const testQueryables = [
		{
			name: 'StringQueryable',
			type: 'string',
			values: ['A', 'B', 'C'],
			finalList: true
		},
		{
			name: 'IntegerQueryable',
			type: 'integer',
			min: 20,
			max: 150,
			values: [],
			finalList: false
		}
	];

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();
			expect(element.getModel()).toEqual({
				queryables: [],
				oafFilters: []
			});
		});

		it('has properties with default values from the model', async () => {
			const element = await setup();

			//properties from modelba-oaf-filter
			expect(element.oafFilters).toHaveSize(0);
			expect(element.queryables).toBeUndefined();
		});
	});

	describe('when property', () => {
		describe('queryables', () => {
			it('has values it renders the queryable select with options', async () => {
				const element = await setup();
				element.queryables = testQueryables;

				expect(element.shadowRoot.querySelectorAll('#queryable-select option')).toHaveSize(testQueryables.length + 1);
			});
		});

		describe('oafFilters', () => {
			it('has values it renders filters', async () => {
				const element = await setup();
				element.oafFilters = [element._createDefaultOafFilter(), element._createDefaultOafFilter()];

				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter')).toHaveSize(2);
			});
		});
	});

	describe('when the ui renders', () => {
		describe('with defaults', () => {
			it('does not render filters', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter')).toHaveSize(0);
			});

			it('renders "Remove Filter Group" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-remove-group')).not.toBeNull();
			});

			it('fires remove event when "Remove Filter Group" Button was clicked', async () => {
				const element = await setup();
				const spy = jasmine.createSpy();
				element.addEventListener('remove', spy);
				element.shadowRoot.querySelector('#btn-remove-group').click();

				expect(spy).toHaveBeenCalledTimes(1);
			});

			it('renders queryable select without options', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelectorAll('#queryable-select option')).toHaveSize(1);
			});
		});

		describe('with queryables', () => {
			it('renders no filter when selecting an invalid option', async () => {
				const element = await setup();
				element.queryables = testQueryables;
				const select = element.shadowRoot.querySelector('#queryable-select');

				select.dispatchEvent(new Event('change'));

				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter')).toHaveSize(0);
			});

			it('renders a filter when selecting an option', async () => {
				const element = await setup();
				element.queryables = testQueryables;
				const select = element.shadowRoot.querySelector('#queryable-select');

				select.options[1].selected = true;
				select.dispatchEvent(new Event('change'));

				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter')).toHaveSize(1);
			});

			it('removes filter from view when its remove event triggered', async () => {
				const element = await setup();
				element.queryables = testQueryables;
				const select = element.shadowRoot.querySelector('#queryable-select');

				select.options[1].selected = true;
				select.dispatchEvent(new Event('change'));
				const oafFilter = element.shadowRoot.querySelector('ba-oaf-filter');
				oafFilter.dispatchEvent(new CustomEvent('remove'));

				expect(element.shadowRoot.querySelector('ba-oaf-filter')).toBeNull();
			});

			it('removes filter from property oafFilters when its remove event triggered', async () => {
				const element = await setup();
				element.queryables = testQueryables;
				const select = element.shadowRoot.querySelector('#queryable-select');

				select.options[1].selected = true;
				select.dispatchEvent(new Event('change'));
				const oafFilter = element.shadowRoot.querySelector('ba-oaf-filter');
				oafFilter.dispatchEvent(new CustomEvent('remove'));

				expect(element.oafFilters).toHaveSize(0);
			});

			it('adds an "oafFilter" to model when selecting an option', async () => {
				const element = await setup();

				element.queryables = testQueryables;
				const select = element.shadowRoot.querySelector('#queryable-select');
				select.options[1].selected = true;
				select.dispatchEvent(new Event('change'));

				expect(element.oafFilters).toHaveSize(1);
			});

			it('renders queryable options that are not used by oafFilters', async () => {
				const element = await setup();

				element.queryables = testQueryables;
				element.oafFilters = [{ ...element._createDefaultOafFilter(), queryable: { name: 'StringQueryable' } }];
				const select = element.shadowRoot.querySelector('#queryable-select');

				expect(select.options).not.toContain(jasmine.objectContaining({ value: 'StringQueryable' }));
			});
		});
	});
});
