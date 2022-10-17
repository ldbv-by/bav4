import { activate, cancelJob, deactivate, requestJob, setCurrent, setId, setScale, startJob } from '../../../src/store/mfp/mfp.action';
import { mfpReducer } from '../../../src/store/mfp/mfp.reducer';
import { EventLike } from '../../../src/utils/storeUtils';
import { TestUtils } from '../../test-utils';

describe('mfpReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			mfp: mfpReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().mfp.active).toBeFalse();
		expect(store.getState().mfp.current.id).toBeNull();
		expect(store.getState().mfp.current.scale).toBeNull();
		expect(store.getState().mfp.jobRequest).toBeNull();
		expect(store.getState().mfp.jobSpec).toBeNull();
	});

	it('updates the active property', () => {
		const store = setup();

		activate();

		expect(store.getState().mfp.active).toBeTrue();

		deactivate();

		expect(store.getState().mfp.active).toBeFalse();
	});

	it('updates the current.id property', () => {
		const store = setup();

		setId('foo');

		expect(store.getState().mfp.current.id).toBe('foo');
	});

	it('updates the current.scale property', () => {
		const store = setup();

		setScale(42);

		expect(store.getState().mfp.current.scale).toBe(42);
	});

	it('updates the current property', () => {
		const store = setup();

		setCurrent({ scale: 5, dpi: 128, mapSize: { width: 21, height: 42 } });

		expect(store.getState().mfp.current.scale).toBe(5);
		expect(store.getState().mfp.current.dpi).toBe(128);
		expect(store.getState().mfp.current.mapSize).toEqual({ width: 21, height: 42 });
	});

	it('places a new request for an mfp job', () => {
		const store = setup();

		requestJob();

		expect(store.getState().mfp.jobRequest).not.toBeNull();
		expect(store.getState().mfp.jobRequest).toBeInstanceOf(EventLike);
	});

	it('starts an mfp job by adding an mfp spec', () => {
		const store = setup();
		const spec = { foo: 'bar' };

		startJob(spec);

		expect(store.getState().mfp.jobSpec.payload).toEqual(spec);
	});

	it('cancel an existing an mfp job', () => {
		const store = setup({
			mfp: {
				jobSpec: new EventLike({ foo: 'bar' })
			}
		});

		expect(store.getState().mfp.jobSpec.payload).not.toBeNull();

		cancelJob();

		expect(store.getState().mfp.jobSpec.payload).toBeNull();
	});
});
