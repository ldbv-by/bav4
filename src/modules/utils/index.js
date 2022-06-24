import './components/showCase';
import { DevInfo } from './components/devInfo/DevInfo';
if (!window.customElements.get(DevInfo.tag)) {
	window.customElements.define(DevInfo.tag, DevInfo);
}
