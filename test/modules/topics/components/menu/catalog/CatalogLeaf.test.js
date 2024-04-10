import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { TestUtils } from '../../../../../test-utils.js';
import { $injector } from '../../../../../../src/injection';
import { topicsReducer } from '../../../../../../src/store/topics/topics.reducer';
import { createDefaultLayer, layersReducer } from '../../../../../../src/store/layers/layers.reducer';
import { XyzGeoResource } from '../../../../../../src/domain/geoResources';
import { Checkbox } from '../../../../../../src/modules/commons/components/checkbox/Checkbox';
import { modalReducer } from '../../../../../../src/store/modal/modal.reducer';
import { isTemplateResult } from '../../../../../../src/utils/checks';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../../src/utils/markup';

window.customElements.define(CatalogLeaf.tag, CatalogLeaf);
window.customElements.define(Checkbox.tag, Checkbox);

describe('CatalogLeaf', () => {
	const geoResourceServiceMock = {
		byId() {},
		getKeywords: () => []
	};

	let store;

	const geoResourceId = 'geoResourceId';
	const layer = createDefaultLayer('id', geoResourceId);

	const setup = (topics = 'foo', layers = [layer], ready = true) => {
		const state = {
			topics: { current: topics },
			layers: {
				active: layers,
				ready: ready
			}
		};

		store = TestUtils.setupStoreAndDi(state, { topics: topicsReducer, layers: layersReducer, modal: modalReducer });

		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock).registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.renderAndLogLifecycle(CatalogLeaf.tag);
	};

	const getLeaf = () => ({ geoResourceId });

	describe('when initialized', () => {
		it('renders the nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when model changes', () => {
		describe('and layers are NOT yet loaded', () => {
			it('renders the nothing', async () => {
				const leaf = getLeaf();
				const element = await setup('foo', [layer], false);

				//assign data
				element.data = leaf;

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and layers are loaded', () => {
			it('renders a leaf', async () => {
				const geoResourceLabel = 'someLabel';
				spyOn(geoResourceServiceMock, 'byId')
					.withArgs(layer.geoResourceId)
					.and.returnValue(new XyzGeoResource(layer.id, geoResourceLabel, 'someUrl'));
				//load leaf data
				const leaf = getLeaf();
				const element = await setup();

				//assign data
				element.data = leaf;

				const checkbox = element.shadowRoot.querySelector('ba-checkbox');
				expect(checkbox).toBeTruthy();
				expect(checkbox.title).toBe(geoResourceLabel);
				expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe(geoResourceLabel);
				expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('ba-badge')).toHaveSize(0); // no badge, due to empty keyword-array

				expect(element.shadowRoot.querySelector('#info').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			});

			it('renders a leaf with keyword badges', async () => {
				const geoResourceLabel = 'someLabel';
				spyOn(geoResourceServiceMock, 'byId')
					.withArgs(layer.geoResourceId)
					.and.returnValue(new XyzGeoResource(layer.id, geoResourceLabel, 'someUrl'));
				spyOn(geoResourceServiceMock, 'getKeywords').withArgs(layer.geoResourceId).and.returnValue(['Foo', 'Bar']);
				//load leaf data
				const leaf = getLeaf();
				const element = await setup();

				//assign data
				element.data = leaf;

				const checkbox = element.shadowRoot.querySelector('ba-checkbox');
				expect(checkbox).toBeTruthy();
				expect(checkbox.title).toBe(geoResourceLabel);
				expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe(geoResourceLabel);
				expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('ba-badge')).toHaveSize(2);
				expect(element.shadowRoot.querySelectorAll('ba-badge')[0].label).toBe('Foo');
				expect(element.shadowRoot.querySelectorAll('ba-badge')[1].label).toBe('Bar');

				expect(element.shadowRoot.querySelector('#info').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			});

			it('renders a checkbox unchecked', async () => {
				const geoResourceLabel = 'someLabel';
				spyOn(geoResourceServiceMock, 'byId')
					.withArgs(layer.geoResourceId)
					.and.returnValue(new XyzGeoResource(layer.id, geoResourceLabel, 'someUrl'));
				//load leaf data
				const leaf = getLeaf();
				const element = await setup('foo', []);

				//assign data
				element.data = leaf;

				const checkbox = element.shadowRoot.querySelector('ba-checkbox');
				expect(checkbox.checked).toBeFalse();
			});

			it('renders a checkbox checked', async () => {
				const geoResourceLabel = 'someLabel';
				spyOn(geoResourceServiceMock, 'byId')
					.withArgs(layer.geoResourceId)
					.and.returnValue(new XyzGeoResource(layer.id, geoResourceLabel, 'someUrl'));
				//load leaf data
				const leaf = getLeaf();
				const element = await setup();

				//assign data
				element.data = leaf;

				const checkbox = element.shadowRoot.querySelector('ba-checkbox');
				expect(checkbox.checked).toBeTrue();
			});

			describe('geoResource not available', () => {
				it('sets the georesourceId as fallback label', async () => {
					spyOn(geoResourceServiceMock, 'byId').withArgs(layer.geoResourceId).and.returnValue(null);
					//load leaf data
					const leaf = getLeaf();
					const element = await setup();

					//assign data
					element.data = leaf;

					const checkbox = element.shadowRoot.querySelector('ba-checkbox');
					expect(checkbox.disabled).toBeTrue();
					expect(checkbox.title).toBe('topics_catalog_leaf_no_georesource_title');
					expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe(layer.geoResourceId);
				});
			});

			describe('checkbox events', () => {
				it('adds and removes a layer', async () => {
					const geoResourceLabel = 'someLabel';
					spyOn(geoResourceServiceMock, 'byId')
						.withArgs(layer.geoResourceId)
						.and.returnValue(new XyzGeoResource(layer.id, geoResourceLabel, 'someUrl'));
					//load leaf data
					const leaf = getLeaf();
					const element = await setup('foo', []);
					//assign data
					element.data = leaf;
					const checkbox = element.shadowRoot.querySelector('ba-checkbox');

					checkbox.click();

					expect(store.getState().layers.active[0].id.startsWith(`${layer.id}_`)).toBeTrue();

					checkbox.click();

					expect(store.getState().layers.active.length).toBe(0);
				});
			});

			describe('icon info events', () => {
				it('shows a georesourceinfo panel as modal', async () => {
					const geoResourceLabel = 'someLabel';
					spyOn(geoResourceServiceMock, 'byId')
						.withArgs(layer.geoResourceId)
						.and.returnValue(new XyzGeoResource(layer.id, geoResourceLabel, 'someUrl'));
					//load leaf data
					const leaf = getLeaf();
					const element = await setup('foo', []);
					//assign data
					element.data = leaf;
					const icon = element.shadowRoot.querySelector('ba-icon');

					icon.click();

					expect(store.getState().modal.data.title).toBe('someLabel');
					expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();
				});
			});
		});
	});
});
