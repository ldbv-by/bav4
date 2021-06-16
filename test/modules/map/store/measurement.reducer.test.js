import { measurementReducer } from '../../../../src/modules/map/store/measurement.reducer';
import { activate, deactivate, setStatistic, reset, remove, setLatestStoreId, setFileSaveResult } from '../../../../src/modules/map/store/measurement.action';
import { TestUtils } from '../../../test-utils.js';
import { EventLike } from '../../../../src/utils/storeUtils';



describe('measurementReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().measurement.active).toBeFalse();
		expect(store.getState().measurement.statistic).toEqual({ length: 0, area: 0 });
		expect(store.getState().measurement.reset).toBeNull();
		expect(store.getState().measurement.fileSaveResult).toBeNull();
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
		const fileSaveResult = { adminId: 'fooBarId', fileId: 'barBazId' };

		setFileSaveResult(fileSaveResult);

		expect(store.getState().measurement.fileSaveResult).toEqual({ adminId: 'fooBarId', fileId: 'barBazId' });
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
});