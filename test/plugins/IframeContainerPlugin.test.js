import { TestUtils } from '../test-utils.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { abortOrReset, registerQuery, resolveQuery } from '../../src/store/featureInfo/featureInfo.action.js';
import { iframeContainerReducer, initialState as iframeContainerInitialState } from '../../src/store/iframeContainer/iframeContainer.reducer.js';
import { IframeContainerPlugin } from '../../src/plugins/IframeContainerPlugin.js';

describe('IframeContainerPlugin', () => {
	const setup = (state) => {
		const initialState = {
			iframeContainer: iframeContainerInitialState,
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			iframeContainer: iframeContainerReducer,
			featureInfo: featureInfoReducer
		});
		return store;
	};

	describe('when featureInfo.querying property changes', () => {
		it('does nothing when query is running', async () => {
			const queryId = 'foo';
			const store = setup({
				featureInfo: {
					queries: [],
					querying: false,
					current: [{ title: 'title', content: 'content' }]
				}
			});
			const instanceUnderTest = new IframeContainerPlugin();
			await instanceUnderTest.register(store);

			registerQuery(queryId);

			expect(store.getState().iframeContainer.active).toBeFalse();
			expect(store.getState().featureInfo.current).toHaveSize(1);
		});

		describe('and we have FeatureInfo items', () => {
			it('opens the FeatureInfo panel', async () => {
				const queryId = 'foo';
				const store = setup({
					featureInfo: {
						queries: [queryId],
						querying: true,
						current: [{ title: 'title', content: 'content' }]
					}
				});
				const instanceUnderTest = new IframeContainerPlugin();
				await instanceUnderTest.register(store);

				resolveQuery(queryId);

				const contentElement = TestUtils.renderTemplateResult(store.getState().iframeContainer.content);
				expect(contentElement.querySelectorAll('ba-feature-info-iframe-panel')).toHaveSize(1);
				expect(store.getState().iframeContainer.active).toBeTrue();
				expect(store.getState().featureInfo.current).toHaveSize(1);
			});

			describe('and we have NO FeatureInfo items', () => {
				describe('and MainMenu is initially closed', () => {
					it('restores the previous panel and closes the menu', async () => {
						const queryId = 'foo';
						const store = setup({
							featureInfo: {
								queries: [queryId],
								querying: true,
								current: [{ title: 'title', content: 'content' }]
							}
						});
						const instanceUnderTest = new IframeContainerPlugin();
						await instanceUnderTest.register(store);

						abortOrReset();

						expect(store.getState().iframeContainer.active).toBeFalse();
					});
				});
			});
		});
	});
});
