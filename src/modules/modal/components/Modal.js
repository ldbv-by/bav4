import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import { modalClose } from '../store/modal.action';
import css from './modal.css';

export const NO_CONTENT = '';
/**
 * @class
 * @author thiloSchlemmer
 */
export class Modal extends BaElement {


	_buildModal(title, content) {
		if(title) {
			this._title.insertAdjacentText('beforeEnd',title);
		}		
		this._content.insertAdjacentHTML('beforeEnd',content);		
		this._view.classList.add('modal--active');
	}

	/**
	 * Tests whether or not, the context menu is open
	 * @private 
	 */
	_isOpen() {
		const { content }= this._state;
		return content !== false;
	}

	/**
	 * Closing the modal window by removing class-name and remove inner content 
	 * @private
	 */
	_closeModal() {
		this._view.classList.remove('modal--active');	
		this._clearContent();
		window.removeEventListener('click', () => this._closeModal());
		modalClose();
	}

	/**
	 * Removes the inner content (menu items)
	 * @private
	 */
	_clearContent() {
		this._content.textContent = NO_CONTENT;
		this._title.textContent = NO_CONTENT;
	}

	/**
     * @override
    */
	onWindowLoad() {
		this._view = this.shadowRoot.getElementById('modal');
		this._content = this.shadowRoot.getElementById('modal-body');
		this._title = this.shadowRoot.getElementById('modal-title');		
		this.shadowRoot.getElementById('modal-close').onClick = () => {
			this._closeModal();
		}; 		
	}

	/**
	 * @override
	 */
	createView() {
		return html`
        <style>${css}</style>
		<div id="modal" class="modal">
			<div id="modal-content" class="modal-content">
				<div class="modal-header">
					<h4 id="modal-title" class="modal-title"></h4>
				</div>
				<div id="modal-body" class="modal-body"></div>
				<div class="modal-footer">
					<ba-button id='modal-close' label='close'></ba-button>
				</div>
			</div>
        </div>`;
	}
    
	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { modal: payload } = store;
		return payload;
	}

	/**
	 * @override
	 */
	onStateChanged() {
		if (this._isOpen()) {
			const { title, content }= this._state;
			this._buildModal(title,content);					
		}
		else {			
			this._closeModal();		
		}
	}
    
	static get tag() {
		return 'ba-modal';
	}
}
