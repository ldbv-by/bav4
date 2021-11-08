import { TestUtils } from '../../test-utils.js';
import { featureInfoReducer } from '../../../src/store/featureInfo/featureInfo.reducer';
import { addFeatureInfoItems, clearFeatureInfoItems, updateCoordinate } from '../../../src/store/featureInfo/featureInfo.action.js';


describe('featureInfoReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			featureInfo: featureInfoReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().featureInfo.current).toEqual([]);
		expect(store.getState().featureInfo.coordinate).toBeNull();
	});

	it('add FeatureInfo items object as argument', () => {
		const store = setup();

		addFeatureInfoItems({ title: 'title0', content: 'content0' });
		addFeatureInfoItems({ title: 'title1', content: 'content1' });

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title1', content: 'content1' }, { title: 'title0', content: 'content0' }]);

		clearFeatureInfoItems();

		expect(store.getState().featureInfo.current).toEqual([]);
	});

	it('add FeatureInfo items array as argument', () => {
		const store = setup();

		addFeatureInfoItems([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		clearFeatureInfoItems();

		expect(store.getState().featureInfo.current).toEqual([]);
	});

	it('updates the \'coordinate}\' property', () => {
		const store = setup();

		updateCoordinate([21, 42]);

		expect(store.getState().featureInfo.coordinate.payload).toEqual([21, 42]);
	});
});
