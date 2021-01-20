import { layersReducer, index, sort } from '../../../../src/modules/map/store/layers/layers.reducer';
import { addLayer, removeLayer, modifyLayer, changeBackground } from '../../../../src/modules/map/store/layers/layers.action';
import { TestUtils } from '../../../test-utils.js';

describe('layersReducer', () => {
	
	let store;
	const setup = (state = {}) => {
		store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
	};

	it('initiales the store with default values', () => {
		setup();
		expect(store.getState().layers.active.length).toBe(0);
		expect(store.getState().layers.background).toBeNull();
	});

	it('it sets the zIndex property based on an array', () => {
		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2' };

		const array = index([layer0, layer1, layer2]);

		expect(array[0].zIndex).toBe(0);
		expect(array[1].zIndex).toBe(1);
		expect(array[2].zIndex).toBe(2);
	});

	it('it sorts an array based on the the zIndex property', () => {
		const layer0 = { label: 'label0', zIndex: 2 };
		const layer1 = { label: 'label1', zIndex: 0 };
		const layer2 = { label: 'label2', zIndex: 1 };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label1');
		expect(array[1].label).toBe('label2');
		expect(array[2].label).toBe('label0');
	});

	it('it adds a layerConfig instance', () => {

		setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };

		addLayer('id0', layer0);
		addLayer('id1', layer1);

		expect(store.getState().layers.active.length).toBe(2);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');
		expect(store.getState().layers.active[0].zIndex).toBe(0);
		expect(store.getState().layers.active[1].id).toBe('id1');
		expect(store.getState().layers.active[1].label).toBe('label1');
		expect(store.getState().layers.active[1].zIndex).toBe(1);
	});

	it('it throws an error a layer is already present', () => {

		setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };

		addLayer('id0', layer0);

		expect(() => {
			addLayer('id0', layer1);

		}).toThrowError(/Id id0 already present/);

	});

	it('it removes a layer', () => {

		const layer0 = { id: 'id0', label: 'label0' };
		const layer1 = { id: 'id1', label: 'label1' };
		setup({
			layers: {
				active: [layer0, layer1]
			}
		});

		expect(store.getState().layers.active.length).toBe(2);

		removeLayer('id0');

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].id).toBe('id1');
		expect(store.getState().layers.active[0].zIndex).toBe(0);
	});

	it('it modifies the \'visible\' property of a layer', () => {

		const layer0 = { id: 'id0', label: 'label0', visible: true };
		setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].visible).toBe(true);

		modifyLayer('id0', { visible: false });


		expect(store.getState().layers.active[0].visible).toBe(false);
	});

	it('it modifies the \'zIndex\' property of a layer', () => {

		const layer0 = { id: 'id0', label: 'label0' };
		const layer1 = { id: 'id1', label: 'label1' };
		const layer2 = { id: 'id2', label: 'label2' };
		setup({
			layers: {
				active: index([layer0, layer1, layer2])
			}
		});

		modifyLayer('id0', { zIndex: 1 });

		expect(store.getState().layers.active[0].id).toBe('id1');
		expect(store.getState().layers.active[1].id).toBe('id0');
		expect(store.getState().layers.active[2].id).toBe('id2');
	});

	it('it does nothing when modified layer is not present', () => {

		const layer0 = { id: 'id0', label: 'label0', visible: true };
		setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].visible).toBe(true);

		modifyLayer('id1', { visible: false });

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].visible).toBe(true);
	});

	it('changes the background', () => {
		setup({ background: null });

		changeBackground('bg0');

		expect(store.getState().layers.background).toBe('bg0');
	});
});