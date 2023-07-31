import {
	activate,
	deactivate,
	setStatistic,
	reset,
	remove,
	setFileSaveResult,
	setSelection,
	finish,
	setMode
} from '../../../src/store/measurement/measurement.action';
import { TestUtils } from '../../test-utils.js';
import { EventLike } from '../../../src/utils/storeUtils';
import { measurementReducer } from '../../../src/store/measurement/measurement.reducer';

describe('measurementReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().measurement.active).toBeFalse();
		expect(store.getState().measurement.statistic).toEqual({ length: null, area: null });
		expect(store.getState().measurement.reset).toBeNull();
		expect(store.getState().measurement.finish).toBeNull();
		expect(store.getState().measurement.fileSaveResult.payload).toBeNull();
		expect(store.getState().measurement.mode).toBeNull();
		expect(store.getState().measurement.selection).toEqual([]);
	});

	it('updates the active property', () => {
		const store = setup();

		activate();

		expect(store.getState().measurement.active).toBeTrue();

		deactivate();

		expect(store.getState().measurement.active).toBeFalse();
	});

	it('updates the statistic property', () => {
		const store = setup();
		const statistic = { length: 42, area: 2 };

		setStatistic(statistic);

		expect(store.getState().measurement.statistic).toEqual({ length: 42, area: 2 });
	});

	it('updates the fileSaveResult property', () => {
		const store = setup();
		const measurementFileSaveResult = { content: 'content', fileSaveResult: { adminId: 'fooBarId', fileId: 'barBazId' } };

		setFileSaveResult(measurementFileSaveResult);

		expect(store.getState().measurement.fileSaveResult.payload).toEqual(measurementFileSaveResult);
	});

	it('updates the reset property', () => {
		const store = setup();

		reset();

		expect(store.getState().measurement.reset).toBeInstanceOf(EventLike);
	});

	it('updates the remove property', () => {
		const store = setup();

		remove();

		expect(store.getState().measurement.remove).toBeInstanceOf(EventLike);
	});

	it('updates the finish property', () => {
		const store = setup();

		finish();

		expect(store.getState().measurement.finish).toBeInstanceOf(EventLike);
	});

	it('updates the selection property', () => {
		const store = setup();
		const selection = ['42', 'foo', 'bar'];
		setSelection(selection);

		expect(store.getState().measurement.selection).not.toBe(selection);
		expect(store.getState().measurement.selection).toEqual(selection);
	});

	it('updates the mode property', () => {
		const store = setup();

		setMode('foo');

		expect(store.getState().measurement.mode).toBe('foo');
	});
});
