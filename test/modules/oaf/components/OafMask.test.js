import { OafMask } from '../../../../src/modules/oaf/components/OafMask';
import { OafFilterGroup } from '../../../../src/modules/oaf/components/OafFilterGroup';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';
import { addLayer } from '../../../../src/store/layers/layers.action';

window.customElements.define(OafMask.tag, OafMask);
window.customElements.define(OafFilterGroup.tag, OafFilterGroup);

describe('OafMask', () => {
	const importOafServiceMock = {
		getFilterCapabilities: async () => []
	};

	const geoResourceServiceMock = {
		byId: () => {}
	};

	const setup = async (state = {}, properties = {}) => {
		TestUtils.setupStoreAndDi(state, { layers: layersReducer });
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('ImportOafService', importOafServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		const layerId = properties.layerId !== undefined ? properties.layerId : -1;
		addLayer(layerId, { geoResourceId: `dummy ${layerId}` });

		return TestUtils.render(OafMask.tag, properties);
	};

	const fillImportOafServiceMock = (
		capabilities = {
			sampled: false,
			totalNumberOfItems: 1,
			queryables: [
				{
					name: 'foo',
					type: 'integer',
					values: [],
					finalList: false
				},
				{
					name: 'bar',
					type: 'string',
					values: ['A'],
					finalList: true
				}
			]
		}
	) => {
		spyOn(importOafServiceMock, 'getFilterCapabilities').and.returnValue(capabilities);
	};

	describe('static properties', () => {
		it('returns operator definitions', async () => {
			expect(OafMask.OPERATOR_DEFINITIONS).toEqual(['equals', 'between', 'greater', 'lesser']);
		});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await setup();
			expect(element.getModel()).toEqual({
				filterGroups: [],
				capabilities: [],
				layerId: -1,
				showConsole: false
			});
		});

		it('has properties with default values from the model', async () => {
			const element = await setup();

			//properties from model
			expect(element.layerId).toBe(-1);
			expect(element.showConsole).toBe(false);
		});

		it('updates layerId', async () => {
			const element = await setup({}, { layerId: 10 });

			expect(element.layerId).toBe(10);
		});
	});

	describe('when properties change', () => {
		it('renders expert mode when showConsole is true', async () => {
			const element = await setup();
			element.showConsole = true;

			expect(element.shadowRoot.querySelector('#filter-groups')).toBeNull();
			expect(element.shadowRoot.querySelector('#console')).not.toBeNull();
		});
	});

	describe('when the ui renders with default', () => {
		it('does not render filter groups', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('ba-oaf-filter-group')).toHaveSize(0);
		});

		it('does not render the "Add Filter Group" Button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('#btn-add-filter-group')).toBeNull();
		});

		it('does not render the "Console Mode" Button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('#btn-expert-mode')).toBeNull();
		});

		it('does not render the "Normal Mode" Button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('#btn-normal-mode')).toBeNull();
		});
	});

	describe('when the ui renders with filter capabilities', () => {
		beforeEach(() => {
			fillImportOafServiceMock();
		});

		describe('in normal mode', () => {
			it('does not render filter groups', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter-group')).toHaveSize(0);
			});

			it('does not render the "Normal Mode" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-normal-mode')).toBeNull();
			});

			it('renders the "Add Filter Group" Button', async () => {
				const element = await setup();
				const addButton = element.shadowRoot.querySelector('#btn-add-filter-group');
				expect(addButton).not.toBeNull();
				expect(addButton.label).toBe('oaf_mask_add_filter_group');
			});

			it('renders the "Console Mode" Button', async () => {
				const element = await setup();

				const consoleButton = element.shadowRoot.querySelector('#btn-expert-mode');
				expect(consoleButton).not.toBeNull();
				expect(consoleButton.label).toBe('oaf_mask_console_mode');
			});

			it('renders a filter-group when "Add Filter Group" Button clicked', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter-group')).toHaveSize(1);
			});

			it('adds a filter-group to model when "Add Filter Group" Button clicked', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				expect(element.getModel().filterGroups).toHaveSize(1);
				expect(element.getModel().filterGroups[0]).toEqual(jasmine.objectContaining({ id: jasmine.any(Number), oafFilters: [] }));
			});

			it('renders "Console Mode" when "Console Mode" Button clicked', async () => {
				const element = await setup();
				const expertModeBtn = element.shadowRoot.querySelector('#btn-expert-mode');
				expertModeBtn.click();

				expect(element.showConsole).toBeTrue();
				expect(element.shadowRoot.querySelector('#console')).not.toBeNull();
				expect(element.shadowRoot.querySelector('#btn-expert-mode')).toBeNull();
			});

			it('removes filter-group when "remove" Event received from filter-group', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				addFilterGroupbtn.click();
				addFilterGroupbtn.click();

				const groupsBeforeRemove = element.shadowRoot.querySelectorAll('ba-oaf-filter-group');
				groupsBeforeRemove[1].dispatchEvent(new CustomEvent('remove'));
				const groupsAfterRemove = element.shadowRoot.querySelectorAll('ba-oaf-filter-group');

				expect(groupsAfterRemove).toHaveSize(2);
				expect(groupsAfterRemove[0]).toBe(groupsBeforeRemove[0]);
				expect(groupsAfterRemove[1]).toBe(groupsBeforeRemove[2]);
			});

			it('removes filter-group from model when "remove" Event received from filter-group', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				addFilterGroupbtn.click();

				const filtersBeforeRemove = element.getModel().filterGroups;
				element.shadowRoot.querySelectorAll('ba-oaf-filter-group')[1].dispatchEvent(new CustomEvent('remove'));

				expect(filtersBeforeRemove).toHaveSize(2);
				expect(element.getModel().filterGroups).toHaveSize(1);
				expect(element.getModel().filterGroups[0]).toEqual(filtersBeforeRemove[0]);
			});

			it('it updates filter-groups when a filter-group changes', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				addFilterGroupbtn.click();

				const groups = element.shadowRoot.querySelectorAll('ba-oaf-filter-group');
				const groupToChange = groups[1];

				// assume method of oaf filter group invokes change event
				groupToChange._addFilter('foo');

				const maskModel = element.getModel();
				expect(maskModel.filterGroups[0].oafFilters).toHaveSize(0);
				expect(maskModel.filterGroups[1].oafFilters[0]).toEqual(
					jasmine.objectContaining({
						queryable: {
							name: 'foo',
							type: jasmine.any(String),
							values: jasmine.any(Array),
							finalList: jasmine.any(Boolean)
						},
						minValue: null,
						maxValue: null,
						value: null
					})
				);
			});
		});

		describe('in expert mode', () => {
			it('renders the "Normal Mode" Button', async () => {
				const element = await setup();
				element.showConsole = true;
				const normalModeBtn = element.shadowRoot.querySelector('#btn-normal-mode');
				expect(normalModeBtn).not.toBeNull();
				expect(normalModeBtn.label).toBe('oaf_mask_ui_mode');
			});

			it('does not render the "Console Mode" Button', async () => {
				const element = await setup();
				element.showConsole = true;

				expect(element.shadowRoot.querySelector('#btn-expert-mode')).toBeNull();
			});

			it('does not render the "Add Filter Group" Button', async () => {
				const element = await setup();
				element.showConsole = true;

				expect(element.shadowRoot.querySelector('#btn-add-filter-group')).toBeNull();
			});
		});
	});
});
