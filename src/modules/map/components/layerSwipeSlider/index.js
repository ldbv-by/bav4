import { LayerSwipeModal } from './LayerSwipeModal';
import { LayerSwipeSlider } from './LayerSwipeSlider';

if (!window.customElements.get(LayerSwipeSlider.tag)) {
	window.customElements.define(LayerSwipeSlider.tag, LayerSwipeSlider);
}
if (!window.customElements.get(LayerSwipeModal.tag)) {
	window.customElements.define(LayerSwipeModal.tag, LayerSwipeModal);
}
