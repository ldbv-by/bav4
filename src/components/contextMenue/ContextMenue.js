import {
	html
} from 'lit-html';
import {
	BaElement
} from '../BaElement';
import css from './contextMenue.css';


/**
 * 
 * @class
 * @author schle_th
 */
export class ContextMenue extends BaElement {
	
    
	constructor() {
		super();
		this._menuState = 0;
	}

	_init(context) {
		const {
			commands
		} = this._state;

		const buildContextMenue = (e) => {
			const currentTarget = e.target;

			
			if (this._menuState !== 1) {
				return;
			}

			let menuItems = [];
			for (const {
				contextTarget,
				command
			} in commands) {
				if (currentTarget === contextTarget) {
					menuItems.push(command);
				}
			}

			if (menuItems.length < 1) {
				return;
			}

			const menuPosition = this._getPosition(e);
			const menuPositionX= menuPosition.x + 'px';
			const menuPositionY=menuPosition.y + 'px';

			context.style.left = menuPositionX;
			context.style.top = menuPositionY;

			let ulElement = document.createElement('ul');
			ulElement.setAttribute('id', 'context-menue__items');
			ulElement.setAttribute('class', 'context-menue__items');
			context.appendChild(ulElement);

			for (const command in menuItems) {
				let liElement = document.createElement('li');
				liElement.setAttribute('class', 'context-menu__item');
				liElement.setAttribute('id', 'context-menu__item');
				liElement.insertAdjacentText('beforeend', command.label);
				liElement.addEventListener('click', command.action);

				ulElement.appendChild(liElement);
			}

			context.classList.add('context-menu--active');
			this._menuState = 1;
		};

		const closeContextMenue = () => {
			if (this._menuState !== 0) {
				context.classList.remove('context-menu--active');
				const child = context.querySelector('.context-menue__items');
				context.removeChild(child);
				this._menuState = 0;
			}

		};

		document.addEventListener('contextmenu', (e) => {
			console.log(e);
			e.preventDefault();

			buildContextMenue(e);
		});
		document.addEventListener('click', (e) => {
			var button = e.which || e.button;
			if (button === 1) {
				closeContextMenue();
			}
		});
	}



	_getPosition(e) {
		let posX = 0;
		let posY = 0;

		if (!e) {
			e = window.event;
		}

		if (e.pageX || e.pageY) {
			posX = e.pageX;
			posY = e.pageY;
		}
		else if (e.clientX || e.clientY) {
			posX = e.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			posY = e.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
		}

		return {
			x: posX,
			y: posY
		};
	}

	/**
	 * @override
	 */
	onWindowLoad() {
		this._init(this._root.querySelector('.context-menu'));
	}

	/**
	 * @override
	 */
	createView() {
		return html`
        <style>${css}</style>
        <nav class="context-menu">
        </nav>`;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const {
			contextMenue: {
				commands
			}
		} = store;
		return {
			commands
		};
	}

	static get tag() {
		return 'ba-context-menue';
	}
}