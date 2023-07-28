import {
	activate,
	deactivate,
	reset,
	remove,
	setFileSaveResult,
	setMode,
	setType,
	finish,
	setStyle,
	setSelectedStyle,
	setDescription,
	clearDescription,
	clearText,
	setSelection,
	setGeometryIsValid
} from '../../../src/store/draw/draw.action';
import { TestUtils } from '../../test-utils.js';
import { EventLike } from '../../../src/utils/storeUtils';
import { StyleTypes } from '../../../src/modules/olMap/services/StyleService';
import { StyleSizeTypes } from '../../../src/domain/styles';
import { drawReducer, INITIAL_STYLE } from '../../../src/store/draw/draw.reducer';

describe('drawReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			draw: drawReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().draw.active).toBeFalse();
		expect(store.getState().draw.createPermanentLayer).toBeTrue();
		expect(store.getState().draw.mode).toBeNull();
		expect(store.getState().draw.type).toBeNull();
		expect(store.getState().draw.style).toBe(INITIAL_STYLE);
		expect(store.getState().draw.selectedStyle).toBeNull();
		expect(store.getState().draw.description).toBeNull();
		expect(store.getState().draw.reset).toBeNull();
		expect(store.getState().draw.selection).toEqual([]);
		expect(store.getState().draw.fileSaveResult.payload).toBeNull();
		expect(store.getState().draw.validGeometry).toBeFalse();
	});

	it('updates the active property', () => {
		const store = setup();

		activate();

		expect(store.getState().draw.active).toBeTrue();
		expect(store.getState().draw.createPermanentLayer).toBeTrue();

		deactivate();

		expect(store.getState().draw.active).toBeFalse();
		expect(store.getState().draw.createPermanentLayer).toBeTrue();

		activate(false);

		expect(store.getState().draw.active).toBeTrue();
		expect(store.getState().draw.createPermanentLayer).toBeFalse();

		deactivate();

		expect(store.getState().draw.active).toBeFalse();
		expect(store.getState().draw.createPermanentLayer).toBeTrue();
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

	it('updates the drawFileSaveResult property', () => {
		const store = setup();
		const drawFileSaveResult = { content: 'content', fileSaveResult: { adminId: 'fooBarId', fileId: 'barBazId' } };

		setFileSaveResult(drawFileSaveResult);

		expect(store.getState().draw.fileSaveResult.payload).toEqual(drawFileSaveResult);
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

	it('updates the style.text property', () => {
		const store = setup();

		clearText();

		expect(store.getState().draw.style).toEqual(jasmine.objectContaining({ text: null }));
		expect(store.getState().draw.selectedStyle).toBeNull();
	});

	it('updates the style.text and selectedStyle.text property', () => {
		const store = setup();

		const style = { text: 'something', color: '#ff0000', scale: StyleSizeTypes.SMALL };
		const selectedStyle = { type: StyleTypes.TEXT, style: style };
		setSelectedStyle(selectedStyle);

		expect(store.getState().draw.selectedStyle).toEqual(selectedStyle);

		clearText();

		expect(store.getState().draw.style).toEqual(jasmine.objectContaining({ text: null }));
		expect(store.getState().draw.selectedStyle.style).toEqual(jasmine.objectContaining({ text: null }));
	});

	it('updates the selection property', () => {
		const store = setup();
		const selection = ['42', 'foo', 'bar'];
		setSelection(selection);

		expect(store.getState().draw.selection).not.toBe(selection);
		expect(store.getState().draw.selection).toEqual(selection);
	});

	it('updates the validGeometry property', () => {
		const store = setup();

		setGeometryIsValid(true);

		expect(store.getState().draw.validGeometry).toBeTrue();
	});
});
