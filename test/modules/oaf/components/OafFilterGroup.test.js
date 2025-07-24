import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { OafFilterGroup } from '../../../../src/modules/oaf/components/OafFilterGroup';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils';
import { createDefaultOafFilter } from '../../../../src/modules/oaf/utils/oafUtils';
import { OafQueryableType } from '../../../../src/domain/oaf';

window.customElements.define(OafFilterGroup.tag, OafFilterGroup);
window.customElements.define(OafFilter.tag, OafFilter);

describe('OafFilterGroup', () => {
	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(OafFilterGroup.tag);
	};

	const createQueryable = (id, type) => {
		return {
			id: id,
			type: type,
			values: [],
			finalList: false
		};
	};

	const testQueryables = [
		{
			id: 'StringQueryable',
			title: 'String Title',
			type: 'string',
			values: ['A', 'B', 'C'],
			finalList: true,
			description: 'description'
		},
		{
			id: 'IntegerQueryable',
			type: 'integer',
			min: 20,
			max: 150,
			values: [],
			finalList: false,
			description: 'another description'
		}
	];

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new OafFilterGroup();

			expect(element.getModel()).toEqual({
				queryables: [],
				oafFilters: []
			});
		});

		it('has properties with default values from the model', async () => {
			await setup();
			const element = new OafFilterGroup();

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

			it('renders queryable select without options', async () => {
				const element = await setup();
				const select = element.shadowRoot.querySelector('#queryable-select');
				const label = element.shadowRoot.querySelector('#queryable-label');
				expect(select.options).toHaveSize(1);
				expect(select.options[0].innerText).toBe('');
				expect(label.innerText).toBe('oaf_group_select_filter');
			});

			it('renders "Remove Filter Group" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-remove')).not.toBeNull();
			});

			it('renders "Duplicate Filter Group" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-duplicate')).not.toBeNull();
			});

			it('fires "remove" event when "Remove Filter Group" Button was clicked', async () => {
				const element = await setup();
				const spy = jasmine.createSpy();
				element.addEventListener('remove', spy);
				element.shadowRoot.querySelector('#btn-remove').click();

				expect(spy).toHaveBeenCalledTimes(1);
			});

			it('fires "duplicate" event when "Duplicate Filter Group" Button was clicked', async () => {
				const element = await setup();
				const spy = jasmine.createSpy();
				element.addEventListener('duplicate', spy);
				element.shadowRoot.querySelector('#btn-duplicate').click();

				expect(spy).toHaveBeenCalledTimes(1);
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

			it('shows queryable title at queryable select', async () => {
				const element = await setup();
				element.queryables = [{ ...createQueryable('foo', OafQueryableType.STRING), title: 'BAR' }];

				// first child is an empty option -> skip
				const option = element.shadowRoot.querySelector('#queryable-select option:nth-child(2)');
				expect(option.innerText).toBe('BAR');
			});

			it('shows description in title attribute at queryable select', async () => {
				const element = await setup();
				element.queryables = [...testQueryables, createQueryable('NoDescription', OafQueryableType.STRING)];
				const select = element.shadowRoot.querySelector('#queryable-select');

				expect(select.options[1].title).toBe('description');
				expect(select.options[2].title).toBe('another description');
				expect(select.options[3].title).toBe('');
			});

			it('shows queryable id when title is missing', async () => {
				const element = await setup();
				element.queryables = [{ ...createQueryable('foo', OafQueryableType.STRING) }];
				const option = element.shadowRoot.querySelector('#queryable-select option:nth-child(2)');

				expect(option.innerText).toBe('foo');
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), title: null };
				expect(option.innerText).toBe('foo');
				element.queryable = { ...createQueryable('foo', OafQueryableType.STRING), title: '' };
				expect(option.innerText).toBe('foo');
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
				element.oafFilters = [{ ...createDefaultOafFilter(), queryable: { id: 'StringQueryable' } }];
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
						id: 'IntegerQueryable',
						type: 'integer',
						min: jasmine.anything(),
						max: jasmine.anything(),
						values: jasmine.any(Array),
						description: jasmine.any(String),
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
