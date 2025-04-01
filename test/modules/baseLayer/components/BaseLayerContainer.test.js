import { Topic } from '../../../../src/domain/topic';
import { $injector } from '../../../../src/injection';
import { BaseLayerContainer } from '../../../../src/modules/baseLayer/components/container/BaseLayerContainer';
import { BaseLayerSwitcher } from '../../../../src/modules/baseLayer/components/switcher/BaseLayerSwitcher';
import { setCurrent } from '../../../../src/store/topics/topics.action';
import { topicsReducer } from '../../../../src/store/topics/topics.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(BaseLayerContainer.tag, BaseLayerContainer);

describe('BaseLayerContainer', () => {
	const topicsServiceMock = {
		byId() {},
		default() {}
	};
	const environmentService = {
		getWindow: () => {},
		isEmbedded: () => {}
	};

	const baseGeoRs = {
		raster: ['atkis', 'luftbild_labels', 'tk', 'historisch', 'atkis_sw'],
		vector: ['by_style_standard', 'by_style_luftbild', 'by_style_grau', 'by_style_nacht']
	};
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, { topics: topicsReducer });

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('TopicsService', topicsServiceMock)
			.registerSingleton('EnvironmentService', environmentService);

		return TestUtils.render(BaseLayerContainer.tag);
	};

	describe('class', () => {
		it('defines constant values', async () => {
			expect(BaseLayerContainer.THROTTLE_DELAY_MS).toBe(100);
			expect(BaseLayerContainer.INITIAL_SCROLL_INTO_VIEW_DELAY_MS).toBe(500);
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new BaseLayerContainer().getModel();

			expect(model).toEqual({
				categories: {},
				activeCategory: null
			});
		});
	});

	describe('when initialized ', () => {
		describe('and no current topic available ', () => {
			it('renders nothing', async () => {
				const element = await setup();

				expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(0);
				expect(element.shadowRoot.querySelector('.title').innerText).toBe('baseLayer_switcher_header');
			});
		});

		describe('and a current topic is available ', () => {
			describe('and the current topic contains a baseGeoRs definition', () => {
				describe('with more than one category', () => {
					it('renders the UI', async () => {
						const topicId = 'topicId';
						spyOn(topicsServiceMock, 'byId')
							.withArgs(topicId)
							.and.returnValue(new Topic(topicId, 'label', 'description', baseGeoRs));
						const element = await setup({ topics: { current: topicId } });
						const scrollToActiveButtonSpy = spyOn(element, '_scrollToActiveButton');

						expect(element.shadowRoot.querySelectorAll('.button-group')).toHaveSize(1);
						expect(element.shadowRoot.querySelectorAll('.scroll-left-button')).toHaveSize(1);
						expect(element.shadowRoot.querySelectorAll('.scroll-right-button')).toHaveSize(1);

						expect(element.shadowRoot.querySelectorAll('.section.scroll-snap-x')).toHaveSize(1);
						expect(element.shadowRoot.querySelector('.section.scroll-snap-x').getAttribute('part')).toBe('section');
						expect(element.shadowRoot.querySelector('.container').getAttribute('part')).toBe('container');

						const baseLayerSwitcher = element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag);
						expect(baseLayerSwitcher).toHaveSize(2);
						expect(baseLayerSwitcher[0].getAttribute('exportparts')).toBe(
							'container:base-layer-switcher-container,button:base-layer-switcher-button,label:base-layer-switcher-label'
						);
						expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[0].configuration).toEqual({
							managed: baseGeoRs.raster,
							all: [...baseGeoRs.raster, ...baseGeoRs.vector]
						});
						expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[1].configuration).toEqual({
							managed: baseGeoRs.vector,
							all: [...baseGeoRs.raster, ...baseGeoRs.vector]
						});
						expect(element.shadowRoot.querySelector('.title').innerText).toContain('baseLayer_switcher_header');
						expect(element.shadowRoot.querySelector('.title').getAttribute('part')).toBe('title');
						expect(element.shadowRoot.querySelectorAll('button')[0].innerText).toBe('baseLayer_container_category_raster');
						expect(element.shadowRoot.querySelectorAll('button')[1].innerText).toBe('baseLayer_container_category_vector');

						await TestUtils.timeout(BaseLayerContainer.INITIAL_SCROLL_INTO_VIEW_DELAY_MS + 100);
						// Note: Unfortunately #scrollIntoView() seem not to work in this test setup.
						// We can't trigger real scroll events, so we manually dispatch the event
						element.shadowRoot.querySelector('#section').dispatchEvent(new Event('scroll'));

						expect(element.shadowRoot.querySelectorAll('button')[0].classList.contains('is-active')).toBeTrue();
						expect(element.shadowRoot.querySelectorAll('button')[1].classList.contains('is-active')).toBeFalse();
						expect(scrollToActiveButtonSpy).toHaveBeenCalled();
					});
				});

				describe('with exactly one category', () => {
					it('renders the UI', async () => {
						const topicId = 'topicId';
						spyOn(topicsServiceMock, 'byId')
							.withArgs(topicId)
							.and.returnValue(new Topic(topicId, 'label', 'description', { raster: baseGeoRs.raster }));
						const element = await setup({ topics: { current: topicId } });

						expect(element.shadowRoot.querySelectorAll('.button-group')).toHaveSize(0);
						expect(element.shadowRoot.querySelectorAll('.scroll-left-button')).toHaveSize(0);
						expect(element.shadowRoot.querySelectorAll('.scroll-right-button')).toHaveSize(0);
						expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(1);
						expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[0].configuration).toEqual({
							managed: baseGeoRs.raster,
							all: [...baseGeoRs.raster]
						});

						expect(element.shadowRoot.querySelector('.title').innerText).toBe('baseLayer_switcher_header');
					});
				});
			});

			describe('the current topic does NOT contain a baseGeoRs definition', () => {
				it('renders two BaseLayerSwitcher instances', async () => {
					const topicId = 'topicId';
					const defaultTopic = new Topic('default', 'label', 'description', baseGeoRs);
					spyOn(topicsServiceMock, 'byId').and.callFake((topicId) => {
						switch (topicId) {
							case 'default':
								return defaultTopic;
							default:
								return new Topic('default', 'label', 'description');
						}
					});
					spyOn(topicsServiceMock, 'default').and.returnValue(defaultTopic);
					const element = await setup({ topics: { current: topicId } });

					expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(2);
				});
			});
		});
	});

	describe('when the user changes the category', () => {
		it('updates the layout', async () => {
			const topicId = 'topicId';

			const container0 = document.createElement('div');
			const container1 = document.createElement('div');

			const mock = () => {
				const mock = document.createElement('div');
				container0.setAttribute('id', 'vector');
				container1.setAttribute('id', 'vector');
				const button0 = document.createElement('div');
				const button1 = document.createElement('div');
				button0.setAttribute('id', topicId);
				button1.setAttribute('id', topicId);
				mock.appendChild(button0);
				mock.appendChild(button1);
				mock.appendChild(container0);
				mock.appendChild(container1);
				return mock;
			};

			const mockWindow = {
				document: mock()
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

			spyOn(topicsServiceMock, 'byId')
				.withArgs(topicId)
				.and.returnValue(new Topic(topicId, 'label', 'description', baseGeoRs));
			const element = await setup({ topics: { current: topicId } });
			const scrollIntoViewSpy0 = spyOn(container0, 'scrollIntoView');
			const scrollIntoViewSpy1 = spyOn(container1, 'scrollIntoView');

			const calculateActiveCategorySpy = spyOn(element, '_calculateActiveCategory');
			element.shadowRoot.querySelectorAll('button')[1].click();
			// Note: Unfortunately #scrollIntoView() seem not to work in this test setup.
			// We can't trigger real scroll events, so we manually dispatch the event
			element.shadowRoot.querySelector('#section').dispatchEvent(new Event('scroll'));

			expect(scrollIntoViewSpy0).toHaveBeenCalled();
			expect(scrollIntoViewSpy1).toHaveBeenCalled();
			expect(calculateActiveCategorySpy).toHaveBeenCalled();
		});

		it('scrolls via right scroll button click', async () => {
			const topicId = 'topicId';

			const container0 = document.createElement('div');

			const mock = () => {
				const mock = document.createElement('div');
				container0.setAttribute('id', 'vector');
				const button0 = document.createElement('div');
				button0.setAttribute('id', topicId);
				mock.appendChild(button0);
				mock.appendChild(container0);
				return mock;
			};

			const mockWindow = {
				document: mock()
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

			spyOn(topicsServiceMock, 'byId')
				.withArgs(topicId)
				.and.returnValue(new Topic(topicId, 'label', 'description', baseGeoRs));
			const element = await setup({ topics: { current: topicId } });

			const baseLayerSwitcher = element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag);
			expect(baseLayerSwitcher).toHaveSize(2);

			expect(element.shadowRoot.querySelectorAll('.scroll-left-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.scroll-right-button')).toHaveSize(1);

			const scrollIntoViewSpy0 = spyOn(container0, 'scrollIntoView');

			element.shadowRoot.querySelectorAll('.scroll-right-button')[0].click();

			expect(scrollIntoViewSpy0).toHaveBeenCalled();
		});

		it('scrolls via left scroll button click', async () => {
			const topicId2 = 'topicId2';
			const container1 = document.createElement('div');

			const mock = () => {
				const mock = document.createElement('div');
				container1.setAttribute('id', 'raster');
				const button1 = document.createElement('div');
				button1.setAttribute('id', topicId2);
				mock.appendChild(button1);
				mock.appendChild(container1);
				return mock;
			};

			const mockWindow = {
				document: mock()
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

			spyOn(topicsServiceMock, 'byId')
				.withArgs(topicId2)
				.and.returnValue(new Topic(topicId2, 'label', 'description', baseGeoRs));
			const element = await setup({ topics: { current: topicId2 } });

			const baseLayerSwitcher = element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag);
			expect(baseLayerSwitcher).toHaveSize(2);

			expect(element.shadowRoot.querySelectorAll('.scroll-left-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.scroll-right-button')).toHaveSize(1);

			const scrollIntoViewSpy0 = spyOn(container1, 'scrollIntoView');

			element.shadowRoot.querySelectorAll('.scroll-left-button')[0].click();

			expect(scrollIntoViewSpy0).toHaveBeenCalled();
		});
	});

	describe('when topic changes', () => {
		it('updates the view', async () => {
			const rasterTopic = new Topic('raster', 'label', 'description', { raster: baseGeoRs.raster });
			const vectorTopic = new Topic('vector', 'label', 'description', { vector: baseGeoRs.vector });
			spyOn(topicsServiceMock, 'byId').and.callFake((topicId) => {
				switch (topicId) {
					case 'raster':
						return rasterTopic;
					case 'vector':
						return vectorTopic;
				}
			});
			const element = await setup({ topics: { current: rasterTopic.id } });

			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[0].configuration).toEqual({
				managed: baseGeoRs.raster,
				all: baseGeoRs.raster
			});

			setCurrent(vectorTopic.id);

			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[0].configuration).toEqual({
				managed: baseGeoRs.vector,
				all: baseGeoRs.vector
			});
		});
	});

	describe('_scrollToActiveButton', () => {
		it('selects the correct element', async () => {
			const element = await setup();
			const parentElement = document.createElement('div');
			const spy = spyOn(parentElement, 'scrollIntoView');
			const buttonElement = document.createElement('button');
			parentElement.append(buttonElement);
			buttonElement.type = 'primary';
			element.shadowRoot.append(parentElement);

			element._scrollToActiveButton();

			expect(spy).toHaveBeenCalled();
		});
	});
});
