import './i18n';
import { Modal } from './components/Modal';
if (!window.customElements.get(Modal.tag)) {
	window.customElements.define(Modal.tag, Modal);
}