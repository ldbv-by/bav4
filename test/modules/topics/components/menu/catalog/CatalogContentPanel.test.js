import { $injector } from '../../../../../../src/injection';
import { CatalogContentPanel } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogContentPanel';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { setCurrent } from '../../../../../../src/store/topics/topics.action';
import { topicsReducer } from '../../../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../../../test-utils.js';
import { Topic } from '../../../../../../src/domain/topic';
import { Spinner } from '../../../../../../src/modules/commons/components/spinner/Spinner';
import { topicsContentPanelReducer } from '../../../../../../src/store/topicsContentPanel/topicsContentPanel.reducer';
import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel.js';
import { notificationReducer } from '../../../../../../src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '../../../../../../src/store/notifications/notifications.action.js';
import { TopicsContentPanelIndex } from '../../../../../../src/store/topicsContentPanel/topicsContentPanel.action.js';

window.customElements.define(CatalogContentPanel.tag, CatalogContentPanel);

describe('TopicsContentPanel', () => {
	const testCatalog = [
		{
			label: 'Subtopic 1',
			children: [
				{
					geoResourceId: 'gr0'
				},
				{
					geoResourceId: 'gr1'
				},
				{
					label: 'Subtopic 2',
					children: [
						{
							geoResourceId: 'gr3'
						}
					]
				}
			]
		},
		{
			geoResourceId: 'gr3'
		}
	];

	const catalogServiceMock = {
		async byId() {}
	};

	const topicsServiceMock = {
		byId() {}
	};

	let store;

	const setup = (state) => {
		store = TestUtils.setupStoreAndDi(state, {
			topics: topicsReducer,
			topicsContentPanel: topicsContentPanelReducer,
			notifications: notificationReducer
		});

		$injector
			.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` })
			.registerSingleton('CatalogService', catalogServiceMock)
			.registerSingleton('TopicsService', topicsServiceMock);

		return TestUtils.render(CatalogContentPanel.tag);
	};

	describe('class', () => {
		it('inherits from AbstractMvuContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new CatalogContentPanel();

			expect(element.getModel()).toEqual({
				matchingTopicId: false,
				catalog: null,
				active: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders the nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('topic changes', () => {
		it('renders the component exactly twice', async () => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...');
			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);

			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(Promise.resolve(testCatalog));
			const element = await setup();
			const renderSpy = spyOn(element, 'render');
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			await TestUtils.timeout();

			expect(renderSpy).toHaveBeenCalledTimes(2);

			//should not cause further calls of #render
			setCurrent(topicId);
			setCurrent(topicId);
			setCurrent(topicId);

			await TestUtils.timeout();
			expect(renderSpy).toHaveBeenCalledTimes(2);
		});

		it('shows or hides the component', async () => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...');
			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);

			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(Promise.resolve(testCatalog));
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			await TestUtils.timeout();
			expect(element.shadowRoot.children.length).not.toBe(0);

			setCurrent('doesNotMatchTopicId');

			await TestUtils.timeout();
			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('and currentTopic matches', () => {
		it('renders the catalog panel', async () => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...');
			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);

			const spy = spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(Promise.resolve(testCatalog));
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//during loading the catalog we show a spinner
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(1);

			//wait for elements
			await TestUtils.timeout();
			expect(spy).toHaveBeenCalledOnceWith(topicId);

			//test correct rendering of the style -tags
			expect(element.shadowRoot.styleSheets).toHaveSize(3);

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__icon')).toHaveSize(1);

			// //test existence of important css classes
			expect(element.shadowRoot.querySelectorAll('.catalog-content-panel')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__main-text')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.back-icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.ba-list-item__main-text').textContent).toBe(topicLabel);
			expect(element.shadowRoot.querySelectorAll('.topic.ba-list-item.ba-list-inline.ba-list-item__header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__pre')).toHaveSize(1);
			// //no style present for current topic
			expect(element.shadowRoot.querySelectorAll('.svg-icon').length).toBe(0);
			// //test i18n
			expect(element.shadowRoot.querySelector('.ba-list-item__header').title).toBe('topics_catalog_panel_change_topic');
			//the example catalog returns one node and one leaf object on the top level
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
		});

		it('renders the topic style', async () => {
			const topicId = 'foo';
			const topicLabel = 'label';
			const topic = new Topic(topicId, topicLabel, 'This is Topic 0...', null, [], [], [], { hue: 42, icon: 'icon' });

			spyOn(topicsServiceMock, 'byId').and.returnValue(topic);
			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(Promise.resolve(testCatalog));
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			await TestUtils.timeout();

			expect(element.shadowRoot.querySelectorAll('.svg-icon').length).toBe(1);
		});

		describe('currentTopic does NOT match', () => {
			it('renders nothing', async () => {
				const topicId = 'foo';
				const element = await setup();
				//assign data
				element.data = 'doesNotMatchTopicId';

				setCurrent(topicId);

				//wait for elements
				await TestUtils.timeout();
				expect(element.shadowRoot.children.length).toBe(0);
			});
		});
	});

	describe('and CatalogService cannot fulfill', () => {
		it('logs, shows a WARN notification and renders nothing', async () => {
			const error = new Error('Something got wrong');
			const topicId = 'foo';
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicId, 'label', 'This is a fallback topic...'));
			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(Promise.reject(error));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			await TestUtils.timeout();
			expect(errorSpy).toHaveBeenCalledWith(error);
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll(Spinner.tag)).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.ba-list-item__text_warning').textContent).toBe('topics_catalog_contentPanel_topic_not_available');
			expect(store.getState().notifications.latest.payload.content).toBe('topics_catalog_contentPanel_topic_could_not_be_loaded [foo]');
			expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.WARN);
		});
	});

	describe('change topic button clicked', () => {
		it('changes the index', async () => {
			const topicId = 'foo';
			spyOn(topicsServiceMock, 'byId').and.returnValue(new Topic(topicId, 'label', 'This is a fallback topic...'));
			spyOn(catalogServiceMock, 'byId').withArgs(topicId).and.returnValue(Promise.resolve(testCatalog));
			const element = await setup({
				topicsContentPanel: {
					index: TopicsContentPanelIndex.CATALOG_0
				}
			});
			//assign data
			element.data = topicId;

			setCurrent(topicId);

			//wait for elements
			await TestUtils.timeout();
			expect(element.shadowRoot.querySelector('.ba-list-item')).toBeTruthy();
			element.shadowRoot.querySelector('.ba-list-item').click();
			expect(store.getState().topicsContentPanel.index).toBe(TopicsContentPanelIndex.TOPICS);
		});
	});
});
