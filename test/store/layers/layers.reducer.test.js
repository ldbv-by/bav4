import { layersReducer, index, sort, createDefaultLayerProperties, createDefaultLayer } from '../../../src/store/layers/layers.reducer';
import { addLayer, removeLayer, modifyLayer, setReady } from '../../../src/store/layers/layers.action';
import { TestUtils } from '../../test-utils.js';

describe('defaultLayerProperties', () => {

	it('returns a object containing default layer properties', () => {

		const defaultLayerProperties = createDefaultLayerProperties();
		expect(defaultLayerProperties.visible).toBeTrue();
		expect(defaultLayerProperties.label).toBe('');
		expect(defaultLayerProperties.opacity).toBe(1);
		expect(defaultLayerProperties.zIndex).toBe(-1);
		expect(defaultLayerProperties.constraints.alwaysTop).toBeFalse();
		expect(defaultLayerProperties.constraints.hidden).toBeFalse();
	});
});

describe('createDefaultLayer', () => {

	it('returns a layer object with default properties and values for a given id', () => {

		const layer = createDefaultLayer('foo');

		expect(layer.id).toBe('foo');
		expect(layer.geoResourceId).toBe('foo');
		expect(layer.visible).toBeTrue();
		expect(layer.label).toBe('');
		expect(layer.opacity).toBe(1);
		expect(layer.zIndex).toBe(-1);
		expect(layer.constraints.alwaysTop).toBeFalse();
		expect(layer.constraints.hidden).toBeFalse();
	});

	it('returns a layer object with default properties and values for giveb id and geoResourceId', () => {

		const layer = createDefaultLayer('foo', 'bar');

		expect(layer.id).toBe('foo');
		expect(layer.geoResourceId).toBe('bar');
		expect(layer.visible).toBeTrue();
		expect(layer.label).toBe('');
		expect(layer.opacity).toBe(1);
		expect(layer.zIndex).toBe(-1);
		expect(layer.constraints.alwaysTop).toBeFalse();
		expect(layer.constraints.hidden).toBeFalse();
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
		expect(store.getState().layers.ready).toBeFalse();
	});

	it('sets the \'zIndex\' property based on an array', () => {
		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2' };

		const array = index([layer0, layer1, layer2]);

		expect(array[0].zIndex).toBe(0);
		expect(array[1].zIndex).toBe(1);
		expect(array[2].zIndex).toBe(2);
	});

	it('sorts an array based on the the \'zIndex\' property', () => {
		const layer0 = { ...createDefaultLayerProperties(), label: 'label0', zIndex: 2 };
		const layer1 = { ...createDefaultLayerProperties(), label: 'label1', zIndex: 0 };
		const layer2 = { ...createDefaultLayerProperties(), label: 'label2', zIndex: 1 };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label1');
		expect(array[1].label).toBe('label2');
		expect(array[2].label).toBe('label0');
	});

	it('sorts an array based on the the \'zIndex\' property and the \'alwaysTop\' constraint', () => {
		const layer0 = { ...createDefaultLayerProperties(), label: 'label0', zIndex: 2 };
		const layer1 = { ...createDefaultLayerProperties(), label: 'label1', zIndex: 0, constraints: { alwaysTop: true } };
		const layer2 = { ...createDefaultLayerProperties(), label: 'label2', zIndex: 1 };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label2');
		expect(array[1].label).toBe('label0');
		expect(array[2].label).toBe('label1');
	});

	it('sorts an array based on the \'alwaysTop\' constraint', () => {
		const layer0 = { ...createDefaultLayerProperties(), label: 'label0', constraints: { alwaysTop: true } };
		const layer1 = { ...createDefaultLayerProperties(), label: 'label1', constraints: { alwaysTop: true } };
		const layer2 = { ...createDefaultLayerProperties(), label: 'label2', constraints: { alwaysTop: true } };

		const array = sort([layer0, layer1, layer2]);

		expect(array[0].label).toBe('label0');
		expect(array[1].label).toBe('label1');
		expect(array[2].label).toBe('label2');
	});

	it('adds layers', () => {
		const store = setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1', geoResourceId: 'geoResourceId1' };

		addLayer('id0', layer0);
		addLayer('id1', layer1);

		expect(store.getState().layers.active.length).toBe(2);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].geoResourceId).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');
		expect(store.getState().layers.active[0].zIndex).toBe(0);
		expect(store.getState().layers.active[1].id).toBe('id1');
		expect(store.getState().layers.active[1].geoResourceId).toBe('geoResourceId1');
		expect(store.getState().layers.active[1].label).toBe('label1');
		expect(store.getState().layers.active[1].zIndex).toBe(1);
	});

	it('adds layers regarding a \'z-index\' property of 0', () => {
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

	it('adds layers regarding a \'z-index\' property of > 0', () => {
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

	it('adds layers ignoring a negative \'z-index\' property', () => {
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


	it('adds layers regarding \'alwaysTop\' constraint', () => {
		const store = setup();

		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };
		const layer2 = { label: 'label2', zIndex: 1, constraints: { alwaysTop: true } };

		addLayer('id2', layer2);
		addLayer('id0', layer0);
		addLayer('id1', layer1);

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

	it('does nothing when layer is already present', () => {
		const store = setup();
		const layer0 = { label: 'label0' };
		const layer1 = { label: 'label1' };

		addLayer('id0', layer0);
		addLayer('id0', layer1);

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].label).toBe('label0');

	});

	it('removes a layer', () => {
		const layer0 = { id: 'id0', label: 'label0' };
		const layer1 = { id: 'id1', label: 'label1', geoResourceId: 'geoResourceId1' };
		const store = setup({
			layers: {
				active: [layer0, layer1]
			}
		});

		expect(store.getState().layers.active.length).toBe(2);

		removeLayer('id0');

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].id).toBe('id1');
		expect(store.getState().layers.active[0].geoResourceId).toBe('geoResourceId1');
		expect(store.getState().layers.active[0].zIndex).toBe(0);
	});

	it('modifies the \'label\' property of a layer', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', visible: true };
		const store = setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].label).toBe('label0');

		modifyLayer('id0', { label: 'label0Modified' });

		expect(store.getState().layers.active[0].label).toBe('label0Modified');
	});

	it('modifies the \'visible\' property of a layer', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', visible: true };
		const store = setup({
			layers: {
				active: index([layer0])
			}
		});

		expect(store.getState().layers.active[0].visible).toBe(true);

		modifyLayer('id0', { visible: false });

		expect(store.getState().layers.active[0].visible).toBe(false);
	});

	it('modifies the \'zIndex\' property of a layer', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
		const layer1 = { ...createDefaultLayerProperties(), id: 'id1', label: 'label1' };
		const layer2 = { ...createDefaultLayerProperties(), id: 'id2', label: 'label2' };
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

	it('modifies the \'zIndex\' property of a layer, to become lowermost', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
		const layer1 = { ...createDefaultLayerProperties(), id: 'id1', label: 'label1' };
		const layer2 = { ...createDefaultLayerProperties(), id: 'id2', label: 'label2' };
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

	it('modifies the \'zIndex\' property of a layer regarding the \'alwaysTop\' constraint', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0' };
		const layer1 = { ...createDefaultLayerProperties(), id: 'id1', label: 'label1', constraints: { alwaysTop: true } };
		const layer2 = { ...createDefaultLayerProperties(), id: 'id2', label: 'label2' };
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

	it('does nothing when modified layer is not present', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', visible: true };
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

	it('does nothing when LayerProperties are empty', () => {
		const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'label0', visible: true };
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

	it('marks the state as ready', () => {
		const store = setup();

		expect(store.getState().layers.ready).toBeFalse();

		setReady();

		expect(store.getState().layers.ready).toBeTrue();
	});

});
