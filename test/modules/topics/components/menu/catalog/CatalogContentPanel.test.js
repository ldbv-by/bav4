import { $injector } from '../../../../../../src/injection';
import { CatalogContentPanel } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogContentPanel';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { loadExampleCatalog } from '../../../../../../src/modules/topics/services/provider/catalog.provider';
import { setCurrent } from '../../../../../../src/store/topics/topics.action';
import { topicsReducer } from '../../../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../../../test-utils.js';

window.customElements.define(CatalogContentPanel.tag, CatalogContentPanel);

describe('TopicsContentPanel', () => {

	const catalogServiceMock = {
		async byId() { },
	};


	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { topics: topicsReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CatalogService', catalogServiceMock);
		return TestUtils.render(CatalogContentPanel.tag);
	};

	describe('when initialized', () => {

		it('renders the nothing', async () => {

			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});



	describe('topic changes', () => {

		it('renders a list of topic elements', async () => {
			const topicId = 'foo';
			const spy = spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				await loadExampleCatalog()
			);
			const element = await setup();

			setCurrent(topicId);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(spy).toHaveBeenCalledOnceWith(topicId);
				//test correct rendering of the catalog
				//the example catalog returns one node and one leaf object on the top level
				expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);
			});
		});

		describe('and CatalogService cannot fulfill', () => {

			it('it logs a warn statement and renders nothing', async () => {
				const topicId = 'foo';
				spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
					Promise.reject(new Error('Something got wrong'))
				);
				const warnSpy = spyOn(console, 'warn');
				const element = await setup();

				setCurrent(topicId);

				setTimeout(() => {
					expect(warnSpy).toHaveBeenCalledWith('Something got wrong');
					expect(element.shadowRoot.children.length).toBe(0);	
				});
			});
		});
	});
});
