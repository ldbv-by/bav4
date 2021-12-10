import { LayerItem } from '../../../../src/modules/layerManager/components/LayerItem';
import { Checkbox } from '../../../../src/modules/commons/components/checkbox/Checkbox';
import { Icon } from '../../../../src/modules/commons/components/icon/Icon';
import { layersReducer, createDefaultLayerProperties } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';


window.customElements.define(LayerItem.tag, LayerItem);
window.customElements.define(Checkbox.tag, Checkbox);
window.customElements.define(Icon.tag, Icon);



describe('LayerItem', () => {
	const createNewDataTransfer = () => {
		let data = {};
		return {
			clearData: function (key) {
				if (key === undefined) {
					data = {};
				}
				else {
					delete data[key];
				}
			},
			getData: function (key) {
				return data[key];
			},
			setData: function (key, value) {
				data[key] = value;
			},
			setDragImage: function () { },
			dropEffect: 'none',
			files: [],
			items: [],
			types: []
			// also effectAllowed
		};
	};

	describe('when layer item is rendered', () => {

		const setup = async (layer) => {
			TestUtils.setupStoreAndDi({}, { layers: layersReducer });
			$injector.registerSingleton('TranslationService', { translate: (key) => key });
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = layer;
			return element;
		};

		it('displays label-property in label', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1, collapsed: true });
			const label = element.shadowRoot.querySelector('.ba-list-item__text');

			expect(label.innerText).toBe('label0');
		});

		it('displays id-property when label is empty in label', async () => {
			const element = await setup({ id: 'id0', label: '', visible: true, zIndex: 0, opacity: 1, collapsed: true });
			const label = element.shadowRoot.querySelector('.ba-list-item__text');

			expect(label.innerText).toBe('id0');
		});

		it('use layer.label property in checkbox-title ', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1, collapsed: true });
			const toggle = element.shadowRoot.querySelector('ba-checkbox');

			expect(toggle.title).toBe('label0 - layerManager_change_visibility');
		});

		it('use layer.opacity-property in slider ', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 0.55, collapsed: true });

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			expect(slider.value).toBe('55');
		});

		it('use layer.visible-property in checkbox ', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: false, zIndex: 0, opacity: 1, collapsed: true });
			const toggle = element.shadowRoot.querySelector('ba-checkbox');

			expect(toggle.checked).toBe(false);
		});

		it('use layer.collapsed-property in element style ', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1, collapsed: false });
			const layerBody = element.shadowRoot.querySelector('.collapse-content');
			const collapseButton = element.shadowRoot.querySelector('.ba-list-item button');


			expect(layerBody.classList.contains('iscollapse')).toBeFalse();

			element.layer = { ...element.layer, collapsed: true };
			expect(layerBody.classList.contains('iscollapse')).toBeTrue();
			expect(collapseButton.classList.contains('iconexpand')).toBeFalse();
		});

		it('slider-elements stops dragstart-event propagation ', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1, collapsed: false });

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			const sliderContainer = element.shadowRoot.querySelector('.slider-container');
			const dragstartContainerSpy = jasmine.createSpy();
			const dragstartSliderSpy = jasmine.createSpy();
			slider.addEventListener('dragstart', dragstartSliderSpy);
			sliderContainer.addEventListener('dragstart', dragstartContainerSpy);


			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, slider);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			slider.dispatchEvent(dragstartEvt);


			expect(dragstartSliderSpy).toHaveBeenCalled();
			expect(dragstartContainerSpy).not.toHaveBeenCalled();
		});

		it('displays info button', async () => {
			const element = await setup({ id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1, collapsed: true });
			expect(element.shadowRoot.querySelector('#info')).toBeTruthy();
		});

	});

	describe('when user interacts with layer item', () => {
		const layer = {
			...createDefaultLayerProperties(),
			id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1
		};

		const setup = () => {
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				}
			};
			const store = TestUtils.setupStoreAndDi(state, { layers: layersReducer, modal: modalReducer });
			$injector.registerSingleton('TranslationService', { translate: (key) => key });
			return store;
		};


		it('click on layer toggle change state in store', async () => {
			const store = setup();
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer, collapsed: true };

			const checkbox = element.shadowRoot.querySelector('ba-checkbox');

			checkbox.click();
			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.visible).toBeFalse();
		});

		it('click on opacity slider change state in store', async () => {
			const store = setup();
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			const slider = element.shadowRoot.querySelector('.opacity-slider');
			slider.value = 66;
			slider.dispatchEvent(new Event('input'));

			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.opacity).toBe(0.66);
		});

		it('click on layer colapse button change collapsed property', async () => {
			setup();
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer, collapsed: true };

			const collapseButton = element.shadowRoot.querySelector('button');
			collapseButton.click();

			expect(element._layer.collapsed).toBeFalse();
		});

		it('click on info icon show georesourceinfo panel as modal', async () => {
			const store = setup();
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer };

			const infoButton = element.shadowRoot.querySelector('#info');

			infoButton.click();

			expect(store.getState().modal.data.title).toBe('label0');
			expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();
		});
	});


	describe('when user change order of layer in group', () => {

		let store;
		const setup = (state) => {
			store = TestUtils.setupStoreAndDi(state, { layers: layersReducer });
			$injector.registerSingleton('TranslationService', { translate: (key) => key });
			return store;
		};

		it('click on increase-button change state in store', async () => {
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1', label: 'label1', visible: true, zIndex: 1, opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2', label: 'label2', visible: true, zIndex: 2, opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const increaseButton = element.shadowRoot.querySelector('#increase');
			increaseButton.click();

			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it('click on decrease-button change state in store', async () => {
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1', label: 'label1', visible: true, zIndex: 1, opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2', label: 'label2', visible: true, zIndex: 2, opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer2 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('#decrease');
			decreaseButton.click();
			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id2');
			expect(store.getState().layers.active[2].id).toBe('id1');
		});

		it('click on decrease-button for first layer change not state in store', async () => {
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1', label: 'label1', visible: true, zIndex: 1, opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2', label: 'label2', visible: true, zIndex: 2, opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('#decrease');
			decreaseButton.click();
			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it('click on remove-button change state in store', async () => {
			const layer0 = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: true, zIndex: 0, opacity: 1
			};
			const layer1 = {
				...createDefaultLayerProperties(),
				id: 'id1', label: 'label1', visible: true, zIndex: 1, opacity: 1
			};
			const layer2 = {
				...createDefaultLayerProperties(),
				id: 'id2', label: 'label2', visible: true, zIndex: 2, opacity: 1
			};
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			const store = setup(state);
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('#remove');
			decreaseButton.click();
			expect(store.getState().layers.active.length).toBe(2);
			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id2');
		});
	});
});
