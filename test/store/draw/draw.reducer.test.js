import { activate, deactivate, reset, remove, setFileSaveResult, setMode, setType, finish, setStyle, setSelectedStyle, setDescription, clearDescription } from '../../../src/store/draw/draw.action';
import { TestUtils } from '../../test-utils.js';
import { EventLike } from '../../../src/utils/storeUtils';
import { StyleTypes } from '../../../src/modules/map/components/olMap/services/StyleService';
import { StyleSizeTypes } from '../../../src/services/domain/styles';
import { drawReducer, INITIAL_STYLE } from '../../../src/store/draw/draw.reducer';



describe('drawReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			draw: drawReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().draw.active).toBeFalse();
		expect(store.getState().draw.mode).toBeNull();
		expect(store.getState().draw.type).toBeNull();
		expect(store.getState().draw.style).toBe(INITIAL_STYLE);
		expect(store.getState().draw.selectedStyle).toBeNull();
		expect(store.getState().draw.description).toBeNull();
		expect(store.getState().draw.reset).toBeNull();
		expect(store.getState().draw.fileSaveResult).toBeNull();
	});


	it('updates the active property', () => {
		const store = setup();

		activate();

		expect(store.getState().draw.active).toBeTrue();

		deactivate();

		expect(store.getState().draw.active).toBeFalse();
	});

	it('updates the mode property', () => {
		const store = setup();

		const mode = 'active';

		setMode(mode);

		expect(store.getState().draw.mode).toBe('active');
	});

	it('updates the type property', () => {
		const store = setup();

		const type = 'point';

		setType(type);

		expect(store.getState().draw.type).toBe('point');
	});

	it('updates the style property', () => {
		const store = setup();

		const style = { symbolSrc: 'something', color: '#ff0000', scale: StyleSizeTypes.SMALL };

		setStyle(style);

		expect(store.getState().draw.style).toEqual({ symbolSrc: 'something', color: '#ff0000', scale: StyleSizeTypes.SMALL });
	});

	it('updates the selectedStyle property', () => {
		const store = setup();

		const style = { text: 'something', color: '#ff0000', scale: StyleSizeTypes.SMALL };
		const selectedStyle = { type: StyleTypes.TEXT, style: style };
		setSelectedStyle(selectedStyle);

		expect(store.getState().draw.selectedStyle).toEqual(selectedStyle);
	});

	it('updates the description property', () => {
		const store = setup();

		setDescription('some description');

		expect(store.getState().draw.description).toBe('some description');
	});

	it('clears the description property', () => {
		const store = setup();

		setDescription('some description');

		expect(store.getState().draw.description).toBe('some description');

		clearDescription();

		expect(store.getState().draw.description).toBeNull();
	});

	it('updates the fileSaveResult property', () => {
		const store = setup();
		const fileSaveResult = { adminId: 'fooBarId', fileId: 'barBazId' };

		setFileSaveResult(fileSaveResult);

		expect(store.getState().draw.fileSaveResult).toEqual({ adminId: 'fooBarId', fileId: 'barBazId' });
	});

	it('updates the reset property', () => {
		const store = setup();

		reset();

		expect(store.getState().draw.reset).toBeInstanceOf(EventLike);
	});

	it('updates the remove property', () => {
		const store = setup();

		remove();

		expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
	});

	it('updates the finish property', () => {
		const store = setup();

		finish();

		expect(store.getState().draw.finish).toBeInstanceOf(EventLike);
	});
});
