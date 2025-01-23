import { CoordinateInfo } from './CoordinateInfo';
if (!window.customElements.get(CoordinateInfo.tag)) {
	window.customElements.define(CoordinateInfo.tag, CoordinateInfo);
}
