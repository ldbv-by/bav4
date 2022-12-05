import { html, nothing } from 'lit-html';
import css from './bottomSheet.css';
import { MvuElement } from '../../MvuElement';




const Update = 'update';

/**
 * Element to display a bottom sheet
 * @class
 * @author thiloSchlemmer
 */
export class BottomSheet extends MvuElement {
	constructor() {
		super({
			content: null
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					content: data
				};
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { content } = model;
		return content ? html`
		<style>${css}</style>
		<div class='bottom-sheet' data-test-id>
        	${content}
		</div>` : nothing;
	}

	static get tag() {
		return 'ba-bottom-sheet';
	}

	set content(value) {
		this.signal(Update, value);
	}
}
