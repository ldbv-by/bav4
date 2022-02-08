import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import css from './dndImportPanel.css';

const Update_Drag_Active = 'update_drag_active';

/**
 * @class
 * @author thiloSchlemmer
 */
export class DndImportPanel extends MvuElement {

	constructor() {
		super({
			isDragActive: false
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
 * @override
 */
	update(type, data, model) {
		switch (type) {
			case Update_Drag_Active:
				return { ...model, isDragActive: data };
		}
	}

	/**
 *@override
 */
	createView(model) {

		const getActiveClass = () => {
			return model.isDragActive ? 'is-active' : 'is-hidden';
		};
		return html`<style>${css}</style>
		<div class='dropzone ${getActiveClass()}' ></div>`;
	}
}
