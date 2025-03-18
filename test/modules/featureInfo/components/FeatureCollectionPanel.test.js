/* eslint-disable no-undef */
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection/index.js';
import { FeatureCollectionPanel } from '../../../../src/modules/featureInfo/components/collection/FeatureCollectionPanel.js';
import { BaGeometry } from '../../../../src/domain/geometry.js';
import { featureCollectionReducer } from '../../../../src/store/featureCollection/featureCollection.reducer.js';
import { BaFeature } from '../../../../src/domain/feature.js';
import { featureInfoReducer } from '../../../../src/store/featureInfo/featureInfo.reducer.js';
import { highlightReducer } from '../../../../src/store/highlight/highlight.reducer.js';
import { SourceType, SourceTypeName } from '../../../../src/domain/sourceType.js';
import { FEATURE_COLLECTION_GEORESOURCE_ID } from '../../../../src/plugins/FeatureCollectionPlugin.js';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';

window.customElements.define(FeatureCollectionPanel.tag, FeatureCollectionPanel);

describe('FeatureCollectionPanel', () => {
	let store;
	const setup = (state) => {
		store = TestUtils.setupStoreAndDi(state, {
			featureCollection: featureCollectionReducer,
			featureInfo: featureInfoReducer,
			highlight: highlightReducer,
			notifications: notificationReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(FeatureCollectionPanel.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new FeatureCollectionPanel().getModel();

			expect(model).toEqual({
				configuration: null
			});
		});
	});

	describe('when initialized', () => {
		describe('and no configuration is available', () => {
			it('renders nothing', async () => {
				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and a configuration is available', () => {
			describe('containing feature that is not part of the feature collection', () => {
				it('renders an ADD button', async () => {
					const element = await setup({});
					const feature = new BaFeature(new BaGeometry('data', new SourceType(SourceTypeName.EWKT)), 'id');

					element.configuration = { feature, geoResourceId: null };

					expect(element.shadowRoot.querySelectorAll('.chips__button.add')).toHaveSize(1);
					const button = element.shadowRoot.querySelector('.chips__button.add');
					expect(button.title).toBe('featureInfo_featureCollection_add_feature_title');
					expect(element.shadowRoot.querySelectorAll('.chips__button.add .chips__icon')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('.chips__button.add .chips__button-text')).toHaveSize(1);
				});
			});

			describe('containing feature that is already a part of the feature collection and its corresponding GeoResource is NOT the FEATURE_COLLECTION_GEORESOURCE', () => {
				it('renders nothing', async () => {
					const feature = new BaFeature(new BaGeometry('data', new SourceType(SourceTypeName.EWKT)), 'id');
					const element = await setup({
						featureCollection: {
							entries: [feature]
						}
					});

					element.configuration = { feature, geoResourceId: null };

					expect(element.shadowRoot.children.length).toBe(0);
				});
			});

			describe('containing feature that is already a part of the feature collection and its corresponding GeoResource is the FEATURE_COLLECTION_GEORESOURCE', () => {
				it('renders a REMOVE button', async () => {
					const feature = new BaFeature(new BaGeometry('data', new SourceType(SourceTypeName.EWKT)), 'id');
					const element = await setup({
						featureCollection: {
							entries: [feature]
						}
					});

					element.configuration = { feature, geoResourceId: FEATURE_COLLECTION_GEORESOURCE_ID };

					expect(element.shadowRoot.querySelectorAll('.chips__button.remove')).toHaveSize(1);
					const button = element.shadowRoot.querySelector('.chips__button.remove');
					expect(button.title).toBe('featureInfo_featureCollection_remove_feature_title');
					expect(element.shadowRoot.querySelectorAll('.chips__button.remove .chips__icon')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('.chips__button.remove .chips__button-text')).toHaveSize(1);
				});
			});
		});
	});

	describe('ADD button is clicked', () => {
		it('adds the feature to the featureCollection s-o-s and resets the highlight and featureInfo s-o-s', async () => {
			const element = await setup({
				featureInfo: {
					querying: true
				},
				highlight: {
					features: [{ foo: 'bar' }]
				}
			});
			const feature = new BaFeature(new BaGeometry('data', new SourceType(SourceTypeName.EWKT)), 'id');

			element.configuration = { feature };
			const button = element.shadowRoot.querySelector('.chips__button.add');

			button.click();

			expect(store.getState().notifications.latest.payload.content).toBe('featureInfo_featureCollection_add_feature_notification');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);

			expect(store.getState().featureCollection.entries).toHaveSize(1);
			expect(store.getState().featureCollection.entries[0]).toEqual(feature);
			expect(store.getState().featureInfo.querying).toBeFalse();
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});

	describe('REMOVE button is clicked', () => {
		it('removes the feature from the featureCollection s-o-s and resets the highlight and featureInfo s-o-s', async () => {
			const featureId = 'featureId0';
			const feature = new BaFeature(new BaGeometry('data', new SourceType(SourceTypeName.EWKT)), featureId);
			const element = await setup({
				featureCollection: {
					entries: [feature]
				},
				featureInfo: {
					querying: true
				},
				highlight: {
					features: [{ foo: 'bar' }]
				}
			});
			element.configuration = { feature, geoResourceId: FEATURE_COLLECTION_GEORESOURCE_ID };
			const button = element.shadowRoot.querySelector('.chips__button.remove');

			button.click();

			expect(store.getState().notifications.latest.payload.content).toBe('featureInfo_featureCollection_remove_feature_notification');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);

			expect(store.getState().featureCollection.entries).toHaveSize(0);
			expect(store.getState().featureInfo.querying).toBeFalse();
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});
});
