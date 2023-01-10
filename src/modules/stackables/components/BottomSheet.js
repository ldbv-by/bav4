import { html, nothing } from 'lit-html';
import css from './bottomSheet.css';
import { MvuElement } from '../../MvuElement';

const Update = 'update';
const Update_Main_Menu = 'update_main_menu';
const Update_Media = 'update_media';

/**
 * Element to display a bottom sheet
 * @class
 * @author thiloSchlemmer
 */
export class BottomSheet extends MvuElement {
	constructor() {
		super({
			content: null,
			open: false,
			portrait: false
		});
	}

	onInitialize() {
		this.observe(state => state.mainMenu, data => this.signal(Update_Main_Menu, data), true);
		this.observe(state => state.media, data => this.signal(Update_Media, data), true);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Main_Menu:
				return {
					...model,
					open: data.open
				};
			case Update:
				return {
					...model,
					content: data
				};
			case Update_Media:
				return {
					...model,
					portrait: data.portrait
				};
		}
	}

	/**
	 * @override
	*/
	createView(model) {
		const { content, open, portrait } = model;

		const getOverlayClass = () => (open && !portrait) ? 'is-open' : '';

		return content ? html`
		<style>${css}</style>
		<div class='bottom-sheet ${getOverlayClass()}' data-test-id>
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
