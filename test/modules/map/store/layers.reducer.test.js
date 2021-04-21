import { layersReducer, index, sort, defaultLayerProperties } from '../../../../src/modules/map/store/layers.reducer';
import { addLayer, removeLayer, modifyLayer } from '../../../../src/modules/map/store/layers.action';
import { TestUtils } from '../../../test-utils.js';

describe('defaultLayerProperties', () => {

	it('returns a layer object with default settings', () => {
	
		expect(Object.isFrozen(defaultLayerProperties)).toBeTrue();
		expect(defaultLayerProperties.visible).toBeTrue();
		expect(defaultLayerProperties.label).toBe('');
		expect(defaultLayerProperties.opacity).toBe(1);
		expect(defaultLayerProperties.zIndex).toBe(-1);
		expect(defaultLayerProperties.constraints.alwaysTop).toBeFalse();
		expect(defaultLayerProperties.constraints.hidden).toBeFalse();
	});
});

describe('layersReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().layers.active.length).toBe(0);
	});

	it('it sets the \'zIndex\' property based on an array', () => {
		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2' };

		const array = index([layer0, layer1, layer2]);

		expect(array[0].zIndex).toBe(0);
		expect(array[1].zIndex).toBe(1);
		expect(array[2].zIndex).toBe(2);
	});

	it('it sorts an array based on the the \'zIndex\' property', () => {
		const layer0 = { ...defaultLayerProperties, label: 'label0', zIndex: 2 };
		const layer1 = { ...defaultLayerProperties, label: 'label1', zIndex: 0 };
		const layer2 = { ...defaultLayerProperties, label: 'label2', zIndex: 1 };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label1');
		expect(array[1].label).toBe('label2');
		expect(array[2].label).toBe('label0');
	});

	it('it sorts an array based on the the \'zIndex\' property and the \'alwaysTop\' constraint', () => {
		const layer0 = { ...defaultLayerProperties, label: 'label0', zIndex: 2 };
		const layer1 = { ...defaultLayerProperties, label: 'label1', zIndex: 0, constraints: { alwaysTop: true } };
		const layer2 = { ...defaultLayerProperties, label: 'label2', zIndex: 1 };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label2');
		expect(array[1].label).toBe('label0');
		expect(array[2].label).toBe('label1');
	});

	it('it sorts an array based on the \'alwaysTop\' constraint', () => {
		const layer0 = { ...defaultLayerProperties, label: 'label0', constraints: { alwaysTop: true } };
		const layer1 = { ...defaultLayerProperties, label: 'label1', constraints: { alwaysTop: true } };
		const layer2 = { ...defaultLayerProperties, label: 'label2', constraints: { alwaysTop: true } };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label0');
		expect(array[1].label).toBe('label1');
		expect(array[2].label).toBe('label2');
	});

	it('it adds layers', () => {
		const store = setup();

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

	it('it adds layers regarding a \'z-index\' property of 0', () => {
		const store = setup();
		expect(store.getState().layers.active.length).toBe(0);

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1', zIndex: 0 };

		addLayer('id0', layer0);
		addLayer('id1', layer1);

		expect(store.getState().layers.active.length).toBe(2);
		expect(store.getState().layers.active[0].id).toBe('id1');
		expect(store.getState().layers.active[0].label).toBe('label1');
		expect(store.getState().layers.active[0].zIndex).toBe(0);

		expect(store.getState().layers.active[1].id).toBe('id0');
		expect(store.getState().layers.active[1].label).toBe('label0');
		expect(store.getState().layers.active[1].zIndex).toBe(1);
	});

	it('it adds layers regarding a \'z-index\' property of > 0', () => {
		const store = setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2', zIndex: 1 };

		addLayer('id0', layer0);
		addLayer('id1', layer1);
		addLayer('id2', layer2);

		expect(store.getState().layers.active.length).toBe(3);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');
		expect(store.getState().layers.active[0].zIndex).toBe(0);

		expect(store.getState().layers.active[1].id).toBe('id2');
		expect(store.getState().layers.active[1].label).toBe('label2');
		expect(store.getState().layers.active[1].zIndex).toBe(1);

		expect(store.getState().layers.active[2].id).toBe('id1');
		expect(store.getState().layers.active[2].label).toBe('label1');
		expect(store.getState().layers.active[2].zIndex).toBe(2);
	});

	it('it adds layers ignoring a negative \'z-index\' property', () => {
		const store = setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2', zIndex: -1 };

		addLayer('id0', layer0);
		addLayer('id1', layer1);
		addLayer('id2', layer2);

		expect(store.getState().layers.active.length).toBe(3);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');
		expect(store.getState().layers.active[0].zIndex).toBe(0);

		expect(store.getState().layers.active[1].id).toBe('id1');
		expect(store.getState().layers.active[1].label).toBe('label1');
		expect(store.getState().layers.active[1].zIndex).toBe(1);

		expect(store.getState().layers.active[2].id).toBe('id2');
		expect(store.getState().layers.active[2].label).toBe('label2');
		expect(store.getState().layers.active[2].zIndex).toBe(2);
	});


	it('it adds layers regarding \'alwaysTop\' constraint', () => {
		const store = setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2', zIndex: 1, constraints: { alwaysTop: true } };

		addLayer('id0', layer0);
		addLayer('id1', layer1);
		addLayer('id2', layer2);

		expect(store.getState().layers.active.length).toBe(3);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');
		expect(store.getState().layers.active[0].zIndex).toBe(0);

		expect(store.getState().layers.active[1].id).toBe('id1');
		expect(store.getState().layers.active[1].label).toBe('label1');
		expect(store.getState().layers.active[1].zIndex).toBe(1);

		expect(store.getState().layers.active[2].id).toBe('id2');
		expect(store.getState().layers.active[2].label).toBe('label2');
		expect(store.getState().layers.active[2].zIndex).toBe(2);
	});

	it('it does nothing when layer is already present', () => {
		const store = setup();
		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };

		addLayer('id0', layer0);
		addLayer('id0', layer1);

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');

	});

	it('it removes a layer', () => {
		const layer0 = { id: 'id0', label: 'label0' };
		const layer1 = { id: 'id1', label: 'label1' };
		const store = setup({
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

	it('it modifies the \'label\' property of a layer', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0', visible: true };
		const store = setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].label).toBe('label0');

		modifyLayer('id0', { label: 'label0Modified' });

		expect(store.getState().layers.active[0].label).toBe('label0Modified');
	});

	it('it modifies the \'visible\' property of a layer', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0', visible: true };
		const store = setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].visible).toBe(true);

		modifyLayer('id0', { visible: false });

		expect(store.getState().layers.active[0].visible).toBe(false);
	});

	it('it modifies the \'zIndex\' property of a layer', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0' };
		const layer1 = { ...defaultLayerProperties, id: 'id1', label: 'label1' };
		const layer2 = { ...defaultLayerProperties, id: 'id2', label: 'label2' };
		const store = setup({
			layers: {
				active: index([layer0, layer1, layer2])
			}
		});

		modifyLayer('id0', { zIndex: 1 });

		expect(store.getState().layers.active[0].id).toBe('id1');
		expect(store.getState().layers.active[1].id).toBe('id0');
		expect(store.getState().layers.active[2].id).toBe('id2');
	});

	it('it modifies the \'zIndex\' property of a layer, to become lowermost', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0' };
		const layer1 = { ...defaultLayerProperties, id: 'id1', label: 'label1' };
		const layer2 = { ...defaultLayerProperties, id: 'id2', label: 'label2' };
		const store = setup({
			layers: {
				active: index([layer0, layer1, layer2])
			}
		});

		modifyLayer('id1', { zIndex: 0 });

		expect(store.getState().layers.active[0].id).toBe('id1');
		expect(store.getState().layers.active[1].id).toBe('id0');
		expect(store.getState().layers.active[2].id).toBe('id2');
	});

	it('it modifies the \'zIndex\' property of a layer regarding the \'alwaysTop\' constraint', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0' };
		const layer1 = { ...defaultLayerProperties, id: 'id1', label: 'label1', constraints: { alwaysTop: true } };
		const layer2 = { ...defaultLayerProperties, id: 'id2', label: 'label2' };
		const store = setup({
			layers: {
				active: sort(index([layer0, layer1, layer2]))
			}
		});

		modifyLayer('id0', { zIndex: 1 });

		expect(store.getState().layers.active[0].id).toBe('id2');
		expect(store.getState().layers.active[1].id).toBe('id0');
		expect(store.getState().layers.active[2].id).toBe('id1');
	});

	it('it does nothing when modified layer is not present', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0', visible: true };
		const store = setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].visible).toBe(true);

		modifyLayer('id1', { visible: false });

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].visible).toBe(true);
	});

	it('it does nothing when LayerProperties are empty', () => {
		const layer0 = { ...defaultLayerProperties, id: 'id0', label: 'label0', visible: true };
		const store = setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].visible).toBe(true);

		modifyLayer('id0');

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].visible).toBe(true);
	});

});