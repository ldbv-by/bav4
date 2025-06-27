import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { OafFilterGroup } from '../../../../src/modules/oaf/components/OafFilterGroup';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils';
import { createDefaultOafFilter } from '../../../../src/modules/oaf/utils/oafUtils';

window.customElements.define(OafFilterGroup.tag, OafFilterGroup);
window.customElements.define(OafFilter.tag, OafFilter);

describe('OafFilterGroup', () => {
	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
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
				element.oafFilters = [createDefaultOafFilter(), createDefaultOafFilter()];

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
				const select = element.shadowRoot.querySelector('#queryable-select');
				const label = element.shadowRoot.querySelector('#queryable-label');
				expect(select.options).toHaveSize(1);
				expect(select.options[0].innerText).toBe('');
				expect(label.innerText).toBe('oaf_group_select_filter');
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

			it('blurs filter-select when a filter was added', async () => {
				const element = await setup();
				element.queryables = testQueryables;
				const select = element.shadowRoot.querySelector('#queryable-select');
				const blurSpy = spyOn(select, 'blur');

				select.options[1].selected = true;
				select.dispatchEvent(new Event('change'));

				expect(blurSpy).toHaveBeenCalled();
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

			it('renders only unused queryable options', async () => {
				const element = await setup();

				element.queryables = testQueryables;
				element.oafFilters = [{ ...createDefaultOafFilter(), queryable: { name: 'StringQueryable' } }];
				const select = element.shadowRoot.querySelector('#queryable-select');

				expect(select.options).not.toContain(jasmine.objectContaining({ value: 'StringQueryable' }));
			});

			it('updates oafFilters when an oafFilter changes', async () => {
				const element = await setup();
				element.queryables = testQueryables;

				element._addFilter('IntegerQueryable');
				element._addFilter('StringQueryable');

				const oafFilter = element.shadowRoot.querySelector('ba-oaf-filter:nth-child(2)');
				oafFilter.value = 'B';

				expect(element.oafFilters[1]).toEqual(jasmine.objectContaining({ value: 'B' }));
			});
		});
	});

	describe('when internal methods invoked', () => {
		it('adds an "oafFilter" and a filled queryable to model with "_addFilter"', async () => {
			const element = await setup();
			element.queryables = testQueryables;

			element._addFilter('IntegerQueryable');

			expect(element.oafFilters).toHaveSize(1);
			expect(element.oafFilters[0]).toEqual(
				jasmine.objectContaining({
					queryable: {
						name: 'IntegerQueryable',
						type: 'integer',
						min: jasmine.anything(),
						max: jasmine.anything(),
						values: jasmine.any(Array),
						finalList: jasmine.any(Boolean)
					}
				})
			);
		});

		it('invokes a change event when "_addFilter" is called', async () => {
			const element = await setup();
			element.queryables = testQueryables;
			const spy = jasmine.createSpy();

			element.addEventListener('change', spy);
			element._addFilter('IntegerQueryable');

			expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
		});

		it('invokes a change event with "_removeFilter" is called', async () => {
			const element = await setup();
			element.queryables = testQueryables;
			const spy = jasmine.createSpy();

			element._addFilter('IntegerQueryable');
			element.addEventListener('change', spy);
			element._removeFilter('IntegerQueryable');

			expect(spy).toHaveBeenCalledOnceWith(jasmine.anything());
		});
	});
});
