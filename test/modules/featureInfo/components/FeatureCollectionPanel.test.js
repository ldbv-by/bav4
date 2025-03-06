/* eslint-disable no-undef */
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection/index.js';
import { FeatureCollectionPanel } from '../../../../src/modules/featureInfo/components/collection/FeatureCollectionPanel.js';
import { Geometry } from '../../../../src/domain/geometry.js';
import { featureCollectionReducer } from '../../../../src/store/featureCollection/featureCollection.reducer.js';
import removeFromCollectionButton from '../../../../src/modules/featureInfo/components/assets/printer.svg';
import addToCollectionButton from '../../../../src/modules/featureInfo/components/assets/share.svg';
import { Feature } from '../../../../src/domain/feature.js';
import { featureInfoReducer } from '../../../../src/store/featureInfo/featureInfo.reducer.js';
import { highlightReducer } from '../../../../src/store/highlight/highlight.reducer.js';
import { SourceType, SourceTypeName } from '../../../../src/domain/sourceType.js';

window.customElements.define(FeatureCollectionPanel.tag, FeatureCollectionPanel);

describe('FeatureCollectionPanel', () => {
	let store;
	const setup = (state) => {
		store = TestUtils.setupStoreAndDi(state, {
			featureCollection: featureCollectionReducer,
			featureInfo: featureInfoReducer,
			highlight: highlightReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(FeatureCollectionPanel.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new FeatureCollectionPanel().getModel();

			expect(model).toEqual({
				featureId: null,
				feature: null
			});
		});
	});

	describe('when initialized', () => {
		describe('and no featureId or feature is available', () => {
			it('renders nothing', async () => {
				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and a feature is available', () => {
			it('renders a button', async () => {
				const element = await setup({});
				const feature = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)));

				element.feature = feature;

				expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
				const button = element.shadowRoot.querySelector('ba-icon');
				expect(button.title).toBe('featureInfo_featureCollection_add_feature');
				expect(button.icon).toBe(addToCollectionButton);
			});
		});

		describe('and featureId denotes a feature which is part of the collection', () => {
			it('renders a button', async () => {
				const featureId = 'featureId0';
				const element = await setup({
					featureCollection: {
						entries: [new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), featureId)]
					}
				});

				element.featureId = featureId;

				expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
				const button = element.shadowRoot.querySelector('ba-icon');
				expect(button.title).toBe('featureInfo_featureCollection_remove_feature');
				expect(button.icon).toBe(removeFromCollectionButton);
			});
		});
		describe('and featureId denotes a feature which is NOT part of the collection', () => {
			it('renders noting', async () => {
				const featureId = 'featureId0';
				const element = await setup({
					featureCollection: {
						entries: [new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'someFeatureId')]
					}
				});

				element.featureId = featureId;

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});
	});

	describe('feature add button is clicked', () => {
		it('adds the feature to the featureCollection s-o-s and resets the highlight and featureInfo s-o-s', async () => {
			const element = await setup({
				featureInfo: {
					querying: true
				},
				highlight: {
					features: [{ foo: 'bar' }]
				}
			});
			const feature = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)));

			element.feature = feature;
			const button = element.shadowRoot.querySelector('ba-icon');

			button.click();

			expect(store.getState().featureCollection.entries).toHaveSize(1);
			expect(store.getState().featureCollection.entries[0]).toEqual(feature);
			expect(store.getState().featureInfo.querying).toBeFalse();
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});

	describe('feature remove button is clicked', () => {
		it('removes the feature from the featureCollection s-o-s and resets the highlight and featureInfo s-o-s', async () => {
			const featureId = 'featureId0';
			const element = await setup({
				featureCollection: {
					entries: [new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), featureId)]
				},
				featureInfo: {
					querying: true
				},
				highlight: {
					features: [{ foo: 'bar' }]
				}
			});
			element.featureId = featureId;
			const button = element.shadowRoot.querySelector('ba-icon');

			button.click();

			expect(store.getState().featureCollection.entries).toHaveSize(0);
			expect(store.getState().featureInfo.querying).toBeFalse();
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});
});
