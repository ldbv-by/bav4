import { TestUtils } from '@test/test-utils.js';
import { addLegends, removeLegend, clearLegends } from '@src/store/legends/legends.action';
import { legendsReducer } from '@src/store/legends/legends.reducer';

describe('legendsReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			legends: legendsReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();

		expect(store.getState().legends.active).toEqual([]);
	});

	it('adds geoResourceIds to active property uniquely', () => {
		const store = setup();

		addLegends('foo');
		addLegends('foo');
		addLegends(['bar', 'baz', 'bar']);

		expect(store.getState().legends.active).toEqual(['foo', 'bar', 'baz']);
	});

	it('removes a geoResourceId from active property', () => {
		const store = setup({ legends: { active: ['foo', 'bar', 'foo'] } });

		removeLegend('foo');
		expect(store.getState().legends.active).toEqual(['bar', 'foo']);

		removeLegend('unknown');
		expect(store.getState().legends.active).toEqual(['bar', 'foo']);
	});

	it('clears active property', () => {
		const store = setup({ legends: { active: ['foo', 'bar', 'foo'] } });

		clearLegends();
		expect(store.getState().legends.active).toEqual([]);
	});
});
