import { TestUtils } from '@test/test-utils.js';
import { MediaPlugin } from '@src/plugins/MediaPlugin';
import {
	createMediaReducer,
	MIN_WIDTH_MEDIA_QUERY,
	ORIENTATION_MEDIA_QUERY,
	PREFERS_COLOR_SCHEMA_QUERY,
	FORCED_COLORS_QUERY,
	PRINT_MEDIA_QUERY
} from '@src/store/media/media.reducer.js';
import { $injector } from '@src/injection/index.js';

describe('MediaPlugin', () => {
	const reducerWindowMock = {
		matchMedia() {}
	};
	const environmentServiceWindowMock = {
		matchMedia() {}
	};

	const setup = (mediaReducer) => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				media: mediaReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', { getWindow: () => environmentServiceWindowMock });
		return store;
	};

	it('registers media query change listeners ORIENTATION', async () => {
		vi.spyOn(reducerWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		vi.spyOn(environmentServiceWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(true);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PRINT_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		const store = setup(createMediaReducer(reducerWindowMock));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.portrait).toBe(true);
		expect(store.getState().media.minWidth).toBe(false);
		expect(store.getState().media.darkSchema).toBe(false);
		expect(store.getState().media.highContrast).toBe(false);
	});

	it('registers media query change listeners for MIN_WIDTH', async () => {
		vi.spyOn(reducerWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		vi.spyOn(environmentServiceWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(true);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PRINT_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		const store = setup(createMediaReducer(reducerWindowMock));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.portrait).toBe(false);
		expect(store.getState().media.minWidth).toBe(true);
		expect(store.getState().media.darkSchema).toBe(false);
		expect(store.getState().media.highContrast).toBe(false);
	});

	it('registers media query change listeners for FORCED_COLORS_QUERY', async () => {
		vi.spyOn(reducerWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		vi.spyOn(environmentServiceWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(true);
				case PRINT_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		const store = setup(createMediaReducer(reducerWindowMock));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.portrait).toBe(false);
		expect(store.getState().media.minWidth).toBe(false);
		expect(store.getState().media.darkSchema).toBe(false);
		expect(store.getState().media.highContrast).toBe(true);
	});

	it('registers media query change listeners for PREFERS_COLOR_SCHEMA', async () => {
		vi.spyOn(reducerWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		vi.spyOn(environmentServiceWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(true);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PRINT_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		const store = setup(createMediaReducer(reducerWindowMock));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.portrait).toBe(false);
		expect(store.getState().media.minWidth).toBe(false);
		expect(store.getState().media.darkSchema).toBe(true);
		expect(store.getState().media.highContrast).toBe(false);
	});

	it('keeps COLOR_SCHEMA during print', async () => {
		vi.spyOn(reducerWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		vi.spyOn(environmentServiceWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(true);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PRINT_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(true);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		const store = setup(createMediaReducer(reducerWindowMock));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.darkSchema).toBe(false);
	});

	it('it keeps ORIENTATION during print', async () => {
		vi.spyOn(reducerWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		vi.spyOn(environmentServiceWindowMock, 'matchMedia').mockImplementation((arg) => {
			switch (arg) {
				case ORIENTATION_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(true);
				case MIN_WIDTH_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PREFERS_COLOR_SCHEMA_QUERY:
					return TestUtils.newMediaQueryList(false);
				case FORCED_COLORS_QUERY:
					return TestUtils.newMediaQueryList(false);
				case PRINT_MEDIA_QUERY:
					return TestUtils.newMediaQueryList(true);
				default:
					throw new Error('Media Query not implemented for spy');
			}
		});

		const store = setup(createMediaReducer(reducerWindowMock));
		const instanceUnderTest = new MediaPlugin();

		await instanceUnderTest.register(store);

		expect(store.getState().media.portrait).toBe(false);
	});
});
