import { OafMask } from '../../../../src/modules/oaf/components/OafMask';
import { OafFilterGroup } from '../../../../src/modules/oaf/components/OafFilterGroup';
import { OafFilter } from '../../../../src/modules/oaf/components/OafFilter';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';
import { addLayer } from '../../../../src/store/layers/layers.action';
import { createDefaultFilterGroup, createDefaultOafFilter } from '../../../../src/modules/oaf/utils/oafUtils';

window.customElements.define(OafMask.tag, OafMask);
window.customElements.define(OafFilterGroup.tag, OafFilterGroup);
window.customElements.define(OafFilter.tag, OafFilter);

describe('OafMask', () => {
	let store;

	const oafMaskParserServiceMock = {
		// eslint-disable-next-line no-unused-vars
		parse: (string) => {
			return [];
		}
	};

	const importOafServiceMock = {
		getFilterCapabilities: async () => []
	};

	const geoResourceServiceMock = {
		byId: () => {}
	};

	const setup = async (state = {}, properties = {}, layerProperties = {}) => {
		store = TestUtils.setupStoreAndDi(state, { layers: layersReducer });
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('ImportOafService', importOafServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('OafMaskParserService', oafMaskParserServiceMock);

		const layerId = layerProperties.layerId !== undefined ? layerProperties.layerId : -1;
		addLayer(layerId, { geoResourceId: `dummy ${layerId}`, ...layerProperties });

		return TestUtils.renderAndLogLifecycle(OafMask.tag, { layerId, ...properties });
	};

	const fillImportOafServiceMock = (
		capabilities = {
			sampled: false,
			totalNumberOfItems: 1,
			queryables: [
				{
					id: 'foo',
					type: 'integer',
					values: [],
					finalList: false
				},
				{
					id: 'bar',
					type: 'string',
					values: ['A'],
					finalList: true
				}
			]
		}
	) => {
		spyOn(importOafServiceMock, 'getFilterCapabilities').and.returnValue(capabilities);
	};

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
			const element = await setup({}, {}, { layerId: 10 });

			expect(element.layerId).toBe(10);
		});

		it('it populates the model with filters when the active layer has a CQL string', async () => {
			const fakeOafFilter = { ...createDefaultOafFilter(), value: 'foo' };
			const fakeParsedFilterDef = [{ ...createDefaultFilterGroup(), oafFilters: [fakeOafFilter] }];
			const parserServiceSpy = spyOn(oafMaskParserServiceMock, 'parse').and.returnValue(fakeParsedFilterDef);
			fillImportOafServiceMock();

			const element = await setup({}, {}, { constraints: { filter: 'awesome cql string' } });

			expect(parserServiceSpy).toHaveBeenCalled();
			expect(element.getModel().filterGroups[0].oafFilters[0].value).toBe('foo');
		});

		it('it skips parsingService when the active layer has no filter-query', async () => {
			const fakeOafFilter = { ...createDefaultOafFilter(), value: 'foo' };
			const fakeParsedFilterDef = [{ ...createDefaultFilterGroup(), oafFilters: [fakeOafFilter] }];
			const parserServiceSpy = spyOn(oafMaskParserServiceMock, 'parse').and.returnValue(fakeParsedFilterDef);
			fillImportOafServiceMock();

			const element = await setup({}, {}, {});

			expect(parserServiceSpy).not.toHaveBeenCalled();
			expect(element.getModel().filterGroups).toHaveSize(0);
		});

		it('it skips parsingService when capabilities have no queryables', async () => {
			fillImportOafServiceMock({
				sampled: false,
				totalNumberOfItems: 1,
				queryables: []
			});
			const parserServiceSpy = spyOn(oafMaskParserServiceMock, 'parse');

			const element = await setup({}, {}, {});

			expect(parserServiceSpy).not.toHaveBeenCalled();
			expect(element.getModel().filterGroups).toHaveSize(0);
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

		it('renders a loading spinner', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('ba-spinner')).not.toBeNull();
		});
	});

	describe('when the ui renders with filter capabilities', () => {
		beforeEach(() => {
			fillImportOafServiceMock();
		});

		describe('in normal mode', () => {
			it('does not render a loading spinner', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('ba-spinner')).toBeNull();
			});

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
				expect(addFilterGroupbtn.label).toBe('oaf_mask_add_filter_group');
				expect(element.shadowRoot.querySelectorAll('.no-group')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.group')).toHaveSize(0);

				addFilterGroupbtn.click();
				expect(element.getModel().filterGroups).toHaveSize(1);
				expect(element.getModel().filterGroups[0]).toEqual(jasmine.objectContaining({ id: jasmine.any(Number), oafFilters: [] }));
				expect(addFilterGroupbtn.label).toBe('');
				expect(element.shadowRoot.querySelectorAll('.no-group')).toHaveSize(0);
				expect(element.shadowRoot.querySelectorAll('.group')).toHaveSize(1);
			});

			it('renders "Console Mode" when "Console Mode" Button clicked', async () => {
				const element = await setup();
				const expertModeBtn = element.shadowRoot.querySelector('#btn-expert-mode');
				expertModeBtn.click();

				expect(element.showConsole).toBeTrue();
				expect(element.shadowRoot.querySelector('#console')).not.toBeNull();
				expect(element.shadowRoot.querySelector('#btn-expert-mode')).toBeNull();
				expect(element.shadowRoot.querySelector('#console-btn-apply').label).toBe('oaf_mask_button_apply');
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

			it("it updates active layer's filter constraint when a filter-group is removed", async () => {
				const element = await setup();
				element.shadowRoot.querySelector('#btn-add-filter-group').click();
				const group = element.shadowRoot.querySelector('ba-oaf-filter-group');
				group._addFilter('foo');

				const oafFilter = group.shadowRoot.querySelector('ba-oaf-filter');
				oafFilter.value = 24;

				group.dispatchEvent(new CustomEvent('remove'));

				const layer = store.getState().layers.active.find((l) => l.id === -1);
				expect(layer.constraints).toEqual(jasmine.objectContaining({ filter: null }));
			});

			it("it updates active layer's filter constraint when a filter-group changes", async () => {
				const element = await setup();
				element.shadowRoot.querySelector('#btn-add-filter-group').click();
				const group = element.shadowRoot.querySelector('ba-oaf-filter-group');
				group._addFilter('foo');

				const oafFilter = group.shadowRoot.querySelector('ba-oaf-filter');
				oafFilter.value = 24;

				const layer = store.getState().layers.active.find((l) => l.id === -1);
				expect(layer.constraints).toEqual(jasmine.objectContaining({ filter: '(((foo = 24)))' }));
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
							id: 'foo',
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
			it('does not render a loading spinner', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('ba-spinner')).toBeNull();
			});

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
