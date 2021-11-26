import { TestUtils } from '../../test-utils.js';
import { featureInfoReducer } from '../../../src/store/featureInfo/featureInfo.reducer';
import { addFeatureInfoItems, startRequest, abortOrReset, registerQuery, resolveQuery } from '../../../src/store/featureInfo/featureInfo.action.js';


describe('featureInfoReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			featureInfo: featureInfoReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().featureInfo.current).toEqual([]);
		expect(store.getState().featureInfo.queries).toEqual([]);
		expect(store.getState().featureInfo.querying).toBeFalse();
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

	it('registers a query', () => {
		const store = setup();

		registerQuery('foo');

		expect(store.getState().featureInfo.queries).toEqual(['foo']);
		expect(store.getState().featureInfo.querying).toBeTrue();

		registerQuery('bar');

		expect(store.getState().featureInfo.queries).toEqual(['foo', 'bar']);
		expect(store.getState().featureInfo.querying).toBeTrue();
	});

	it('resolve a query', () => {
		const store = setup({
			featureInfo: {
				queries: ['foo', 'bar']
			}
		});

		resolveQuery('foo');

		expect(store.getState().featureInfo.queries).toEqual(['bar']);
		expect(store.getState().featureInfo.querying).toBeTrue();

		resolveQuery('bar');

		expect(store.getState().featureInfo.queries).toHaveSize(0);
		expect(store.getState().featureInfo.querying).toBeFalse();
	});

	it('aborts/resets a FeatureInfo request', () => {
		const store = setup({
			featureInfo: {
				queries: ['foo', 'bar'],
				current: ['some'],
				querying: true
			}
		});

		abortOrReset();

		expect(store.getState().featureInfo.aborted).not.toBeNull();
		expect(store.getState().featureInfo.queries).toHaveSize(0);
		expect(store.getState().featureInfo.querying).toBeFalse();
		expect(store.getState().featureInfo.current).toHaveSize(0);
	});
});
