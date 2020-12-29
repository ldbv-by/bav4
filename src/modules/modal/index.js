import { Modal } from './components/Modal';
if (!window.customElements.get(Modal.tag)) {
	window.customElements.define(Modal.tag, Modal);
}