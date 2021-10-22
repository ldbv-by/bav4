import { TestUtils } from '../../test-utils.js';
import { featureInfoReducer } from '../../../src/store/featureInfo/featureInfo.reducer';
import { add, clear, updateCoordinate } from '../../../src/store/featureInfo/featureInfo.action.js';


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

	it('updates the \'current}\' property with object as argument', () => {
		const store = setup();

		add({ title: 'title0', content: 'content0' });
		add({ title: 'title1', content: 'content1' });

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title1', content: 'content1' }, { title: 'title0', content: 'content0' }]);

		clear();

		expect(store.getState().featureInfo.current).toEqual([]);
	});

	it('updates the \'current}\' property with array as argument', () => {
		const store = setup();

		add([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		clear();

		expect(store.getState().featureInfo.current).toEqual([]);
	});

	it('updates the \'current}\' property with empty array as argument', () => {
		const store = setup();

		add([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		add([]);

		expect(store.getState().featureInfo.current).toEqual([]);
	});

	it('updates the \'coordinate}\' property', () => {
		const store = setup();

		updateCoordinate([21, 42]);

		expect(store.getState().featureInfo.coordinate.payload).toEqual([21, 42]);
	});
});
