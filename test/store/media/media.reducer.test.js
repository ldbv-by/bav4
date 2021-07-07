import { TestUtils } from '../../test-utils.js';
import { createMediaReducer, createNoInitialStateMediaReducer, MIN_WIDTH_MEDIA_QUERY, ORIENTATION_MEDIA_QUERY } from '../../../src/store/media/media.reducer';
import { setIsMinWidth, setIsPortrait } from '../../../src/store/media/media.action.js';


describe('mediaReducer', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = (mediaReducer) => {
		return TestUtils.setupStoreAndDi({}, {
			media: mediaReducer
		});
	};

	it('defines media queries', () => {

		expect(ORIENTATION_MEDIA_QUERY).toBe('(orientation: portrait)');
		expect(MIN_WIDTH_MEDIA_QUERY).toBe('(min-width: 80em)');
	});

	describe('createNoInitialStateMediaReducer', () => {

		describe('returns a reducer function', () => {

			it('initiales the store by null', () => {
				const store = setup(createNoInitialStateMediaReducer());

				expect(store.getState().media).toBeNull();
			});
		});
	});

	describe('createMediaReducer', () => {

		describe('returns a reducer function', () => {

			it('initiales the store by media queries (1)', () => {
				spyOn(windowMock, 'matchMedia')
					.withArgs(ORIENTATION_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(true))
					.withArgs(MIN_WIDTH_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(false));

				const store = setup(createMediaReducer(windowMock));
				
				expect(store.getState().media.portrait).toBeTrue();
				expect(store.getState().media.minWidth).toBeFalse();
			});

			it('initiales the store by media queries (2)', () => {
				spyOn(windowMock, 'matchMedia')
					.withArgs(ORIENTATION_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(false))
					.withArgs(MIN_WIDTH_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(true));

				const store = setup(createMediaReducer(windowMock));
				
				expect(store.getState().media.portrait).toBeFalse();
				expect(store.getState().media.minWidth).toBeTrue();
			});

			it('uses the real window as default argument', () => {

				const store = setup(createMediaReducer());
				
				expect(store.getState().media.portrait).toMatch(/true|false/);
				expect(store.getState().media.minWidth).toMatch(/true|false/);
			});
		});
	});

	it('changes the \'portrait\' property', () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		setIsPortrait(true);

		expect(store.getState().media.portrait).toBeTrue();

		setIsPortrait(false);

		expect(store.getState().media.portrait).toBeFalse();
	});

	it('changes the \'minWidth\' property', () => {
		spyOn(windowMock, 'matchMedia')
			.withArgs(ORIENTATION_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(false))
			.withArgs(MIN_WIDTH_MEDIA_QUERY).and.returnValue(TestUtils.newMediaQueryList(false));
		const store = setup(createMediaReducer(windowMock));

		setIsMinWidth(true);

		expect(store.getState().media.minWidth).toBeTrue();

		setIsMinWidth(false);

		expect(store.getState().media.minWidth).toBeFalse();
	});
});
