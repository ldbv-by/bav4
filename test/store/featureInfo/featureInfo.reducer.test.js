import { TestUtils } from '../../test-utils.js';
import { featureInfoReducer } from '../../../src/store/featureInfo/featureInfo.reducer';
import { addFeatureInfoItems, registerQueryFor, unregisterQueryFor, startRequest, abortOrReset } from '../../../src/store/featureInfo/featureInfo.action.js';


describe('featureInfoReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			featureInfo: featureInfoReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().featureInfo.current).toEqual([]);
		expect(store.getState().featureInfo.pending).toEqual([]);
		expect(store.getState().featureInfo.coordinate).toBeNull();
		expect(store.getState().featureInfo.aborted).toBeNull();
	});

	it('adds FeatureInfo items object as argument', () => {
		const store = setup();

		addFeatureInfoItems({ title: 'title0', content: 'content0' });
		addFeatureInfoItems({ title: 'title1', content: 'content1' });

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title1', content: 'content1' }, { title: 'title0', content: 'content0' }]);
	});

	it('adds FeatureInfo items array as argument', () => {
		const store = setup();

		addFeatureInfoItems([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);

		expect(store.getState().featureInfo.current).toEqual([{ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1' }]);
	});

	it('starts a FeatureInfo request', () => {
		const store = setup({
			featureInfo: {
				current: ['foo']
			}
		});

		startRequest([21, 42]);

		expect(store.getState().featureInfo.coordinate.payload).toEqual([21, 42]);
		expect(store.getState().featureInfo.current).toHaveSize(0);
	});

	it('registers a query for a GeoResource', () => {
		const store = setup();

		registerQueryFor('foo');
		registerQueryFor('bar');

		expect(store.getState().featureInfo.pending).toEqual(['foo', 'bar']);
	});

	it('unregisters a GeoResource', () => {
		const store = setup({
			featureInfo: {
				pending: ['foo', 'bar']
			}
		});

		unregisterQueryFor('foo');

		expect(store.getState().featureInfo.pending).toEqual(['bar']);
	});

	it('aborts/resets a FeatureInfo request', () => {
		const store = setup({
			featureInfo: {
				pending: ['foo', 'bar'],
				current: ['some']
			}
		});

		abortOrReset();

		expect(store.getState().featureInfo.aborted).not.toBeNull();
		expect(store.getState().featureInfo.pending).toHaveSize(0);
		expect(store.getState().featureInfo.current).toHaveSize(0);
	});
});
