import { OafMask } from '../../../../src/modules/oaf/components/OafMask';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';
import { addLayer } from '../../../../src/store/layers/layers.action';

window.customElements.define(OafMask.tag, OafMask);

describe('OafMask', () => {
	const importOafServiceMock = {
		getFilterCapabilities: async () => []
	};

	const geoResourceServiceMock = {
		byId: () => {}
	};

	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, { layers: layersReducer });
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock).registerSingleton('ImportOafService', importOafServiceMock);

		addLayer(-1, { geoResourceId: 'dummy' });
		return TestUtils.render(OafMask.tag);
	};

	const fillImportOafServiceMock = (
		capabilities = [
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
		it('has no filter groups', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('ba-oaf-filter-group')).toHaveSize(0);
		});

		it('does not render the "Add Filter Group" Button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('#btn-add-filter-group')).toBeNull();
		});

		it('does not render the "Expert Mode" Button', async () => {
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
			it('has no filter groups', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter-group')).toHaveSize(0);
			});

			it('does not render the "Normal Mode" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-normal-mode')).toBeNull();
			});

			it('renders the "Add Filter Group" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-add-filter-group')).not.toBeNull();
			});

			it('renders the "Expert Mode" Button', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelector('#btn-expert-mode')).not.toBeNull();
			});

			it('renders a filter-group when "Add Filter Group" Button clicked', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				expect(element.shadowRoot.querySelectorAll('ba-oaf-filter-group')).toHaveSize(1);
			});

			it('removes filter-group when "remove" Event received from filter-group', async () => {
				const element = await setup();
				const addFilterGroupbtn = element.shadowRoot.querySelector('#btn-add-filter-group');
				addFilterGroupbtn.click();
				addFilterGroupbtn.click();
				addFilterGroupbtn.click();

				const groupdBeforeRemove = element.shadowRoot.querySelectorAll('ba-oaf-filter-group');
				groupdBeforeRemove[1].dispatchEvent(new CustomEvent('remove'));
				const groupsAfterRemove = element.shadowRoot.querySelectorAll('ba-oaf-filter-group');

				expect(groupsAfterRemove).toHaveSize(2);
				expect(groupsAfterRemove[0]).toBe(groupdBeforeRemove[0]);
				expect(groupsAfterRemove[1]).toBe(groupdBeforeRemove[2]);
			});
		});

		describe('in expert mode', () => {
			it('renders the "Normal Mode" Button', async () => {
				const element = await setup();
				element.showConsole = true;

				expect(element.shadowRoot.querySelector('#btn-normal-mode')).not.toBeNull();
			});

			it('does not render the "Expert Mode" Button', async () => {
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
