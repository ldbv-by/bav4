import { $injector } from '../../../../../src/injection';
import { AbstractContentPanel } from '../../../../../src/modules/menu/components/mainMenu/content/AbstractContentPanel';
import { CatalogContentPanel } from '../../../../../src/modules/topics/components/menu/catalog/CatalogContentPanel';
import { TopicsContentPanel, TopicsContentPanelIndex } from '../../../../../src/modules/topics/components/menu/TopicsContentPanel';
import { topicsContentPanelReducer } from '../../../../../src/modules/topics/store/topicsContentPanel.reducer';
import { Topic } from '../../../../../src/services/domain/topic';
import { topicsReducer } from '../../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(TopicsContentPanel.tag, TopicsContentPanel);

describe('TopicsContentPanelIndex', () => {

	it('is an enum', () => {

		expect(Object.entries(TopicsContentPanelIndex).length).toBe(3);
		expect(Object.isFrozen(TopicsContentPanelIndex)).toBeTrue();
		expect(TopicsContentPanelIndex.TOPICS).toBe(0);
		expect(TopicsContentPanelIndex.CATALOG_0).toBe(1);
		expect(TopicsContentPanelIndex.CATALOG_1).toBe(2);
	});
});


describe('TopicsContentPanel', () => {

	const topic0 = new Topic('topic0', 'Topic 0', 'This is Topic 0...', ['bg0']);
	const topic1 = new Topic('topic1', 'Topic 1', 'This is Topic 1...', ['bg1']);


	let store;

	const topicsServiceMock = {
		all() { }
	};

	const setup = (state) => {

		store = TestUtils.setupStoreAndDi(state, { topics: topicsReducer, topicsContentPanel: topicsContentPanelReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('TopicsService', topicsServiceMock);
		return TestUtils.render(TopicsContentPanel.tag);
	};

	describe('class', () => {

		it('inherits from AbstractContentPanel', async () => {

			const element = await setup();

			expect(element instanceof AbstractContentPanel).toBeTrue();
		});
	});

	describe('when initialized', () => {

		describe('and no topics are available', () => {

			it('renders the nothing', async () => {

				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and topics state is not ready', () => {
			it('renders the nothing', async () => {
				spyOn(topicsServiceMock, 'all').and.returnValue([
					topic0,
					topic1
				]);

				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and all set', () => {

			describe('and topics should be visible', () => {

				it('renders a list of topic elements and the CatalogContentPanel', async () => {
					spyOn(topicsServiceMock, 'all').and.returnValue([
						topic0,
						topic1
					]);

					const element = await setup({
						topics: {
							ready: true,
							current: topic0.id
						},
						topicsContentPanel: {
							index: TopicsContentPanelIndex.TOPICS
						}
					});

					expect(element.shadowRoot.querySelectorAll('.topics-content-panel')).toHaveSize(1);
					expect(element.shadowRoot.querySelector('.topics-content-panel').classList.contains('invisible')).toBeFalse();

					expect(element.shadowRoot.querySelectorAll('.topic')).toHaveSize(2);					

					expect(element.shadowRoot.querySelectorAll('.topic')[0].classList.contains('active')).toBeTrue();		
					expect(element.shadowRoot.querySelectorAll('.topic')[0].getAttribute('tabindex')).toBe('0');      
					expect(element.shadowRoot.querySelectorAll('.icon-topic0')).toHaveSize(1);				
					expect(element.shadowRoot.querySelectorAll('.ba-list-item__primary-text')[0].innerText).toBe(topic0.label);		
					expect(element.shadowRoot.querySelectorAll('.ba-list-item__secondary-text')[0].innerText).toBe(topic0.description);		
                    
					expect(element.shadowRoot.querySelectorAll('.topic')[1].classList.contains('active')).toBeFalse();                
					expect(element.shadowRoot.querySelectorAll('.topic')[1].getAttribute('tabindex')).toBe('0');
					expect(element.shadowRoot.querySelectorAll('.icon-topic1')).toHaveSize(1);				
					expect(element.shadowRoot.querySelectorAll('.ba-list-item__primary-text')[1].innerText).toBe(topic1.label);		
					expect(element.shadowRoot.querySelectorAll('.ba-list-item__secondary-text')[1].innerText).toBe(topic1.description);		

					expect(element.shadowRoot.querySelectorAll(CatalogContentPanel.tag)).toHaveSize(1);
				});
			});

			describe('and topics should NOT be visible', () => {

				it('adds the \'invisible\' class', async () => {
					spyOn(topicsServiceMock, 'all').and.returnValue([
						topic0,
						topic1
					]);

					const element = await setup({
						topics: {
							ready: true,
							current: topic0.id
						},
						topicsContentPanel: {
							index: TopicsContentPanelIndex.CATALOG_0
						}
					});

					expect(element.shadowRoot.querySelectorAll('.topics-content-panel')).toHaveSize(1);
					expect(element.shadowRoot.querySelector('.topics-content-panel').classList.contains('invisible')).toBeTrue();
					expect(element.shadowRoot.querySelectorAll('.topic')).toHaveSize(2);
					expect(element.shadowRoot.querySelectorAll('.topic')[0].classList.contains('active')).toBeTrue();
					expect(element.shadowRoot.querySelectorAll('.topic')[0].getAttribute('tabindex')).toBe('-1');
					expect(element.shadowRoot.querySelectorAll('.topic')[1].classList.contains('active')).toBeFalse();
					expect(element.shadowRoot.querySelectorAll('.topic')[1].getAttribute('tabindex')).toBe('-1');
					expect(element.shadowRoot.querySelectorAll(CatalogContentPanel.tag)).toHaveSize(1);
				});
			});
		});
	});

	describe('when topic element clicked', () => {

		it('changes the current topic and updates the content panel index', async () => {
			spyOn(topicsServiceMock, 'all').and.returnValue([
				topic0,
				topic1
			]);

			const element = await setup({
				topics: {
					ready: true,
					current: topic0.id
				},
				topicsContentPanel: {
					index: TopicsContentPanelIndex.CATALOG_0
				}
			});

			//click on the second topics element
			element.shadowRoot.querySelectorAll('.topic')[1].click();
			expect(store.getState().topics.current).toBe(topic1.id);
			expect(store.getState().topicsContentPanel.index).toBe(TopicsContentPanelIndex.CATALOG_0);
		});
	});
});
