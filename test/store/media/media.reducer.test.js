import { TestUtils } from '../../test-utils.js';
import {
	createMediaReducer,
	createNoInitialStateMediaReducer,
	MIN_WIDTH_MEDIA_QUERY,
	ORIENTATION_MEDIA_QUERY,
	PREFERS_COLOR_SCHEMA_QUERY
} from '../../../src/store/media/media.reducer';
import {
	disableResponsiveParameterObservation,
	enableResponsiveParameterObservation,
	setIsDarkSchema,
	setIsMinWidth,
	setIsPortrait,
	toggleSchema
} from '../../../src/store/media/media.action.js';

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
				spyOn(windowMock, 'matchMedia')
					.withArgs(ORIENTATION_MEDIA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(true))
					.withArgs(MIN_WIDTH_MEDIA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(false))
					.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(false));

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBeTrue();
				expect(store.getState().media.minWidth).toBeFalse();
				expect(store.getState().media.darkSchema).toBeFalse();
				expect(store.getState().media.observeResponsiveParameter).toBeTrue();
			});

			it('initializes the store by media query for MIN_WIDTH', () => {
				spyOn(windowMock, 'matchMedia')
					.withArgs(ORIENTATION_MEDIA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(false))
					.withArgs(MIN_WIDTH_MEDIA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(true))
					.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(false));

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBeFalse();
				expect(store.getState().media.minWidth).toBeTrue();
				expect(store.getState().media.darkSchema).toBeFalse();
				expect(store.getState().media.observeResponsiveParameter).toBeTrue();
			});

			it('initializes the store by media query for PREFERS_COLOR_SCHEMA', () => {
				spyOn(windowMock, 'matchMedia')
					.withArgs(ORIENTATION_MEDIA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(false))
					.withArgs(MIN_WIDTH_MEDIA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(false))
					.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
					.and.returnValue(TestUtils.newMediaQueryList(true));

				const store = setup(createMediaReducer(windowMock));

				expect(store.getState().media.portrait).toBeFalse();
				expect(store.getState().media.minWidth).toBeFalse();
				expect(store.getState().media.darkSchema).toBeTrue();
				expect(store.getState().media.observeResponsiveParameter).toBeTrue();
			});

			it('uses the real window as default argument', () => {
				const store = setup(createMediaReducer());

				expect(store.getState().media.portrait).toMatch(/true|false/);
				expect(store.getState().media.minWidth).toMatch(/true|false/);
				expect(store.getState().media.darkSchema).toMatch(/true|false/);
				expect(store.getState().media.observeResponsiveParameter).toBeTrue();
			});
		});
	});

	it("changes the 'portrait' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		setIsPortrait(true);

		expect(store.getState().media.portrait).toBeTrue();

		setIsPortrait(false);

		expect(store.getState().media.portrait).toBeFalse();
	});

	it("should NOT chenge the 'portrait' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));
		disableResponsiveParameterObservation();

		setIsPortrait(true);

		expect(store.getState().media.portrait).toBeFalse();
	});

	it("changes the 'minWidth' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		setIsMinWidth(true);

		expect(store.getState().media.minWidth).toBeTrue();

		setIsMinWidth(false);

		expect(store.getState().media.minWidth).toBeFalse();
	});

	it("should NOT change the 'minWidth' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));
		disableResponsiveParameterObservation();

		setIsMinWidth(true);

		expect(store.getState().media.minWidth).toBeFalse();
	});

	it("changes the 'darkSchema' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		setIsDarkSchema(true);

		expect(store.getState().media.darkSchema).toBeTrue();

		setIsDarkSchema(false);

		expect(store.getState().media.darkSchema).toBeFalse();
	});

	it("toggles the 'darkSchema' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		expect(store.getState().media.darkSchema).toBeFalse();

		toggleSchema();

		expect(store.getState().media.darkSchema).toBeTrue();

		toggleSchema();

		expect(store.getState().media.darkSchema).toBeFalse();
	});

	it("changes the 'observeResponsiveParameter' property", () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(PREFERS_COLOR_SCHEMA_QUERY)
			.and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		expect(store.getState().media.observeResponsiveParameter).toBeTrue();

		disableResponsiveParameterObservation();

		expect(store.getState().media.observeResponsiveParameter).toBeFalse();

		enableResponsiveParameterObservation();

		expect(store.getState().media.observeResponsiveParameter).toBeTrue();
	});
});
