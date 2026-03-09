import { TestUtils } from '@test/test-utils.js';
import {
	createMediaReducer,
	createNoInitialStateMediaReducer,
	MIN_WIDTH_MEDIA_QUERY,
	ORIENTATION_MEDIA_QUERY,
	PREFERS_COLOR_SCHEMA_QUERY,
	FORCED_COLORS_QUERY
} from '@src/store/media/media.reducer';
import {
	disableResponsiveParameterObservation,
	enableResponsiveParameterObservation,
	setIsDarkSchema,
	setIsHighContrast,
	setIsMinWidth,
	setIsPortrait,
	toggleSchema,
	toggleHighContrast
} from '@src/store/media/media.action.js';

describe('mediaReducer', () => {
	const windowMock = {
		matchMedia() {}
	};

	const setup = (mediaReducer) => {
		return TestUtils.setupStoreAndDi(
			{},
			{
				media: mediaReducer
			}
		);
	};

	it('defines media queries', () => {
		expect(ORIENTATION_MEDIA_QUERY).toBe('(orientation: portrait)');
		expect(MIN_WIDTH_MEDIA_QUERY).toBe('(min-width: 80em)');
		expect(FORCED_COLORS_QUERY).toBe('(forced-colors: active)');
	});

	describe('createNoInitialStateMediaReducer', () => {
		describe('returns a reducer function', () => {
			it('initializes the store by null', () => {
				const store = setup(createNoInitialStateMediaReducer());

				expect(store.getState().media).toBeNull();
			});
		});
	});

	describe('createMediaReducer', () => {
		describe('returns a reducer function', () => {
			it('initializes the store by media query for ORIENTATION', () => {
				vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
					switch (arg) {
						case ORIENTATION_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(true);
						case MIN_WIDTH_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case PREFERS_COLOR_SCHEMA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case FORCED_COLORS_QUERY:
							return TestUtils.newMediaQueryList(false);
						default:
							throw new Error('Invalid Argument for media spy.');
					}
				});

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBe(true);
				expect(store.getState().media.minWidth).toBe(false);
				expect(store.getState().media.darkSchema).toBe(false);
				expect(store.getState().media.highContrast).toBe(false);
				expect(store.getState().media.observeResponsiveParameter).toBe(true);
			});

			it('initializes the store by media query for MIN_WIDTH', () => {
				vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
					switch (arg) {
						case ORIENTATION_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case MIN_WIDTH_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(true);
						case PREFERS_COLOR_SCHEMA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case FORCED_COLORS_QUERY:
							return TestUtils.newMediaQueryList(false);
						default:
							throw new Error('Invalid Argument for media spy.');
					}
				});

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBe(false);
				expect(store.getState().media.minWidth).toBe(true);
				expect(store.getState().media.darkSchema).toBe(false);
				expect(store.getState().media.highContrast).toBe(false);
				expect(store.getState().media.observeResponsiveParameter).toBe(true);
			});

			it('initializes the store by media query for PREFERS_COLOR_SCHEMA', () => {
				vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
					switch (arg) {
						case ORIENTATION_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case MIN_WIDTH_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case PREFERS_COLOR_SCHEMA_QUERY:
							return TestUtils.newMediaQueryList(true);
						case FORCED_COLORS_QUERY:
							return TestUtils.newMediaQueryList(false);
						default:
							throw new Error('Invalid Argument for media spy.');
					}
				});

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBe(false);
				expect(store.getState().media.minWidth).toBe(false);
				expect(store.getState().media.darkSchema).toBe(true);
				expect(store.getState().media.highContrast).toBe(false);
				expect(store.getState().media.observeResponsiveParameter).toBe(true);
			});

			it('initializes the store by media query for FORCED_COLORS_QUERY', () => {
				vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
					switch (arg) {
						case ORIENTATION_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case MIN_WIDTH_MEDIA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case PREFERS_COLOR_SCHEMA_QUERY:
							return TestUtils.newMediaQueryList(false);
						case FORCED_COLORS_QUERY:
							return TestUtils.newMediaQueryList(true);
						default:
							throw new Error('Invalid Argument for media spy.');
					}
				});

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBe(false);
				expect(store.getState().media.minWidth).toBe(false);
				expect(store.getState().media.darkSchema).toBe(false);
				expect(store.getState().media.highContrast).toBe(true);
				expect(store.getState().media.observeResponsiveParameter).toBe(true);
			});

			it('uses the real window as default argument', () => {
				const store = setup(createMediaReducer());

				expect(store.getState().media.portrait).toBeTypeOf('boolean');
				expect(store.getState().media.minWidth).toBeTypeOf('boolean');
				expect(store.getState().media.darkSchema).toBeTypeOf('boolean');
				expect(store.getState().media.observeResponsiveParameter).toBe(true);
			});
		});
	});

	it("changes the 'portrait' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		setIsPortrait(true);

		expect(store.getState().media.portrait).toBe(true);

		setIsPortrait(false);

		expect(store.getState().media.portrait).toBe(false);
	});

	it("should NOT change the 'portrait' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));
		disableResponsiveParameterObservation();

		setIsPortrait(true);

		expect(store.getState().media.portrait).toBe(false);
	});

	it("changes the 'minWidth' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		setIsMinWidth(true);

		expect(store.getState().media.minWidth).toBe(true);

		setIsMinWidth(false);

		expect(store.getState().media.minWidth).toBe(false);
	});

	it("should NOT change the 'minWidth' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));
		disableResponsiveParameterObservation();

		setIsMinWidth(true);

		expect(store.getState().media.minWidth).toBe(false);
	});

	it("changes the 'darkSchema' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		setIsDarkSchema(true);

		expect(store.getState().media.darkSchema).toBe(true);

		setIsDarkSchema(false);

		expect(store.getState().media.darkSchema).toBe(false);
	});

	it("changes the 'highContrast' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		setIsHighContrast(true);

		expect(store.getState().media.highContrast).toBe(true);

		setIsHighContrast(false);

		expect(store.getState().media.highContrast).toBe(false);
	});

	it("toggles the 'highContrast' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		expect(store.getState().media.highContrast).toBe(false);

		toggleHighContrast();

		expect(store.getState().media.highContrast).toBe(true);

		toggleHighContrast();

		expect(store.getState().media.highContrast).toBe(false);
	});

	it("toggles the 'darkSchema' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		expect(store.getState().media.darkSchema).toBe(false);

		toggleSchema();

		expect(store.getState().media.darkSchema).toBe(true);

		toggleSchema();

		expect(store.getState().media.darkSchema).toBe(false);
	});

	it("changes the 'observeResponsiveParameter' property", () => {
		vi.spyOn(windowMock, 'matchMedia').mockImplementation((arg) => {
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
					throw new Error('Invalid Argument for media spy.');
			}
		});
		const store = setup(createMediaReducer(windowMock));

		expect(store.getState().media.observeResponsiveParameter).toBe(true);

		disableResponsiveParameterObservation();

		expect(store.getState().media.observeResponsiveParameter).toBe(false);

		enableResponsiveParameterObservation();

		expect(store.getState().media.observeResponsiveParameter).toBe(true);
	});
});
