import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import {  loadExampleCatalog } from '../../../../../../src/modules/topics/services/provider/catalog.provider';
import { TestUtils } from '../../../../../test-utils.js';
import { $injector } from '../../../../../../src/injection';
import { topicsReducer } from '../../../../../../src/store/topics/topics.reducer';
import { layersReducer } from '../../../../../../src/store/layers/layers.reducer';
import {  defaultLayerProperties } from '../../../../../../src/store/layers/layers.reducer';



window.customElements.define(CatalogLeaf.tag, CatalogLeaf);

describe('CatalogLeaf', () => {

	const geoResourceServiceMock = {
		async init() { },
		all() { 
			return [];
		},
		byId() {}
	};

	const topicsServiceMock = {
		byId() { }
	};
	const layer = { ...defaultLayerProperties,  id:'atkis_sw', label:'atkis_sw' };
	const setup = (topics = 'foo', layers = [layer]) => {

		const state = {
			topics: { current: topics },
			layers: {
				active: layers
			}
		};

		TestUtils.setupStoreAndDi(state, { topics: topicsReducer, layers: layersReducer });
		
		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock);

		return TestUtils.render(CatalogLeaf.tag);
	};

	describe('when initialized', () => {

		it('renders the nothing', async () => {
			
			const element = await setup();
			
			expect(element.shadowRoot.children.length).toBe(0);			
		});
	});

	describe('when model changes', () => {

		it('renders a leaf', async () => {
			//load leaf data
			const leaf = (await loadExampleCatalog('foo')).pop();
			const element = await setup();

			//assign data
			element.data = leaf;

			expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);		
			expect(element.shadowRoot.querySelectorAll('ba-checkbox')).toHaveSize(1);		
			expect(element.shadowRoot.querySelector('.ba-list-item__text').innerText).toBe('no geoR');						
			expect(element.shadowRoot.querySelector('.ba-icon-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.info')).toBeTruthy();
		});
	});
});