import { $injector } from '../../../../../../src/injection';
import { CatalogContentPanel } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogContentPanel';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { loadExampleCatalog } from '../../../../../../src/modules/topics/services/provider/catalog.provider';
import { setCurrent } from '../../../../../../src/store/topics/topics.action';
import { topicsReducer } from '../../../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../../../test-utils.js';
import { topicsContentPanelReducer } from '../../../../../../src/modules/topics/store/topicsContentPanel.reducer';
import { TopicsContentPanelIndex } from '../../../../../../src/modules/topics/components/menu/TopicsContentPanel';
import { Topic } from '../../../../../../src/services/domain/topic';

window.customElements.define(CatalogContentPanel.tag, CatalogContentPanel);

describe('TopicsContentPanel', () => {

	const catalogServiceMock = {
		async byId() { },
	};

	const topicsServiceMock = {
		byId() { }
	};

	let store;

	const setup = (state) => {

		store = TestUtils.setupStoreAndDi(state, { topics: topicsReducer, topicsContentPanel: topicsContentPanelReducer });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CatalogService', catalogServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock);

		return TestUtils.render(CatalogContentPanel.tag);
	};

	describe('when initialized', () => {

		it('renders the nothing', async () => {

			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});



	describe('topic changes', () => {

		it('just renders the component once', async (done) => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...', ['bg0']);
			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);

			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				await loadExampleCatalog()
			);
			const element = await setup();
			const renderSpy = spyOn(element, 'render');
			//assign data
			element.data = topicId;

			setCurrent(topicId);
			
			//wait for elements
			window.requestAnimationFrame(() => {

				setCurrent(topicId);

				window.requestAnimationFrame(() => {
					expect(renderSpy).toHaveBeenCalledTimes(1);
					done();
				});
			});
		});

		it('shows or hides the component', async (done) => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...', ['bg0']);
			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);

			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				await loadExampleCatalog()
			);
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.style.display).toBe('inline');

				setCurrent('doesNotMatchTopicId');

				window.requestAnimationFrame(() => {
					expect(element.style.display).toBe('none');
					done();
				});
			});
		});
	});

	describe('and currentTopic matches', () => {

		it('renders the catalog panel', async (done) => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...', ['bg0']);
			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);

			const spy = spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				await loadExampleCatalog()
			);
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(spy).toHaveBeenCalledOnceWith(topicId);


				//test correct rendering of the style -tags
				expect(element.shadowRoot.styleSheets).toHaveSize(3);

				expect(element.shadowRoot.querySelectorAll('.ba-list-item__icon')).toHaveSize(1);

				// //test existence of important css classes
				expect(element.shadowRoot.querySelectorAll('.catalog-content-panel')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.ba-list-item__main-text')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.ba-list-item__main-text').textContent).toBe(topicLabel);
				expect(element.shadowRoot.querySelectorAll('.topic.ba-list-item.ba-list-inline.ba-list-item__header')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.ba-list-item__pre')).toHaveSize(1);
				// //no style present for current topic
				expect(element.shadowRoot.querySelectorAll('.svg-icon').length).toBe(0);
				// //test i18n
				expect(element.shadowRoot.querySelector('.ba-list-item__text').textContent).toBe('topics_catalog_panel_change_topic');
				//the example catalog returns one node and one leaf object on the top level
				expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);
				done();
			});
		});

		it('renders the topic style', async (done) => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...', ['bg0'], [], [], [], { hue: 42, icon: 'icon' });

			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);
			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				await loadExampleCatalog()
			);
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			window.requestAnimationFrame(() => {

				expect(element.shadowRoot.querySelectorAll('.svg-icon').length).toBe(1);
				done();
			});
		});

		describe(' currentTopic does NOT match', () => {

			it('renders nothing', async (done) => {
				const topicId = 'foo';
				const element = await setup();
				//assign data
				element.data = 'doesNotMatchTopicId';

				setCurrent(topicId);

				//wait for elements
				window.requestAnimationFrame(() => {
					expect(element.shadowRoot.children.length).toBe(0);
					done();
				});
			});
		});
	});

	describe('and CatalogService cannot fulfill', () => {

		it('logs a warn statement and renders nothing', async (done) => {

			const topicId = 'foo';
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicId, 'label', 'This is a fallback topic...', ['atkis', 'atkis_sw']));
			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				Promise.reject(new Error('Something got wrong'))
			);
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Something got wrong');
				expect(element.shadowRoot.children.length).toBe(0);
				done();
			});
		});
	});


	describe('change topic button clicked', () => {

		it('changes the index', async (done) => {

			const topicId = 'foo';
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicId, 'label', 'This is a fallback topic...', ['atkis', 'atkis_sw']));
			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(
				await loadExampleCatalog()
			);
			const element = await setup({
				topicsContentPanel: {
					index: TopicsContentPanelIndex.CATALOG_0
				}
			});
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.ba-list-item')).toBeTruthy();
				element.shadowRoot.querySelector('.ba-list-item').click();
				expect(store.getState().topicsContentPanel.index).toBe(TopicsContentPanelIndex.TOPICS);
				done();
			});
		});
	});
});
