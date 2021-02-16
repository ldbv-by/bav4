import { html, nothing } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';
import { BaElement } from '../../../../../BaElement';
import css from './mapContextMenue.css';

/**
 * 
 * @class
 */
export class MapContextMenue extends BaElement {


	_calculateParameter(eventCoordinate, element) {
		//alignment: location of the event coordinate relative to the menue
		const values = { left: 0, top: 0, vAlignment: 'left', hAlignment: 'top' };
		if (!element || !eventCoordinate) {
			return values;
		}

		//see: css classes
		const vOffset = 20;
		const offsetBorderInPercent = 0.2;
		const menuWidth = element.offsetWidth;
		const menuHeight = element.offsetHeight + vOffset;
		const windowWidth = window.innerWidth - (window.innerWidth * offsetBorderInPercent);
		const windowHeight = window.innerHeight - (window.innerHeight * offsetBorderInPercent);

		if ((windowWidth - eventCoordinate.x) < menuWidth) {
			values.vAlignment = 'right';
			values.left = eventCoordinate.x - menuWidth + 'px';
		}
		else {
			values.vAlignment = 'left';
			values.left = eventCoordinate.x + 'px';
		}
		if ((windowHeight - eventCoordinate.y) < menuHeight) {
			values.hAlignment = 'bottom';
			values.top = eventCoordinate.y - menuHeight + 'px';
		}
		else {
			values.hAlignment = 'top';
			values.top = eventCoordinate.y + vOffset + 'px';
		}
		return values;
	}

	/**
	 * @override
	 */
	createView() {
		const { eventCoordinate } = this._state;
		const parameters = this._calculateParameter(eventCoordinate, this._root.querySelector('.context-menue'));
		const style = { left: parameters.left, top: parameters.top };
		const getClasses = () => {
			const classes = [];
			if (eventCoordinate) {
				classes.push('active');
			}
			classes.push(parameters.hAlignment + '-' + parameters.vAlignment);
			return classes.join(' ');
		};
		return html`
        <style>${css}</style>
		<div  class='context-menue $ ${getClasses()}' style=${styleMap(style)} >
			${eventCoordinate ? html`content renders here...<br>and here...<br>and here...` : nothing}
        </div>`;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { mapContextMenue: { eventCoordinate, data } } = store;
		return { eventCoordinate, data };
	}


	static get tag() {
		return 'ba-map-context-menue';
	}
}