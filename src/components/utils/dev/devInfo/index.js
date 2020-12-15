import { DevInfo } from './DevInfo';
if (!window.customElements.get(DevInfo.tag)) {
	window.customElements.define(DevInfo.tag, DevInfo);
}
