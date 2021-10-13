import { TestUtils } from '../../test-utils.js';
import { featureInfoReducer } from '../../../src/store/featureInfo/featureInfo.reducer';
import { add, clear } from '../../../src/store/featureInfo/featureInfo.action.js';


describe('featureInfoReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			featureInfo: featureInfoReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().featureInfo.current).toEqual([]);
	});

	it('updates the stores properties', () => {
		const store = setup();

		add({ title: 'title0', content: 'content0' });
		add({ title: 'title1', content: 'content1' });

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title1', content: 'content1' }, { title: 'title0', content: 'content0' }]);

		clear();

		expect(store.getState().featureInfo.current).toEqual([]);
	});
});
