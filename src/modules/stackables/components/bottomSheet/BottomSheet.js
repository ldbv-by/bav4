/**
 * @module modules/stackables/components/bottomSheet/BottomSheet
 */
import { html, nothing } from 'lit-html';
import css from './bottomSheet.css';
import { MvuElement } from '../../../MvuElement';
import { closeBottomSheet } from '../../../../store/bottomSheet/bottomSheet.action';
import closeIcon from '../assets/x-square.svg';
import { classMap } from 'lit-html/directives/class-map.js';

const Update = 'update';
const Update_Main_Menu = 'update_main_menu';
const Update_Media = 'update_media';
const Update_IsOpen_NavigationRail = 'update_isOpen_NavigationRail';

/**
 * Element to display a bottom sheet
 * @class
 * @author thiloSchlemmer
 */
export class BottomSheet extends MvuElement {
	constructor() {
		super({
			content: null,
			isOpen: false,
			isOpenNavigationRail: false,
			isPortrait: false
		});

		this.observe(
			(state) => state.mainMenu,
			(data) => this.signal(Update_Main_Menu, data),
			true
		),
			this.observe(
				(state) => state.media,
				(data) => this.signal(Update_Media, data),
				true
			),
			this.observe(
				(state) => state.navigationRail,
				(navigationRail) => this.signal(Update_IsOpen_NavigationRail, { isOpenNavigationRail: navigationRail.open })
			);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Main_Menu:
				return {
					...model,
					isOpen: data.open
				};
			case Update:
				return {
					...model,
					content: data
				};
			case Update_Media:
				return {
					...model,
					isPortrait: data.portrait
				};
			case Update_IsOpen_NavigationRail:
				return { ...model, ...data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { content, isOpen, isOpenNavigationRail, isPortrait } = model;

		const onDismiss = () => {
			const elementModal = this.shadowRoot.querySelector('.bottom-sheet');
			elementModal.classList.add('fade-out');
			elementModal.addEventListener('animationend', () => {
				closeBottomSheet();
			});
		};

		const classes = {
			'is-open': isOpen && !isPortrait,
			'is-open-navigationRail': isOpenNavigationRail && !isPortrait,
			'is-portrait': isPortrait,
			'is-landscape': !isPortrait
		};

		return content
			? html` <style>
						${css}
					</style>
					<div class="bottom-sheet ${classMap(classes)}" data-test-id>
						${content}
						<ba-icon
							id="close-icon"
							class="tool-container__close-button"
							.icon="${closeIcon}"
							.size=${1.6}
							.color=${'var(--text2)'}
							.color_hover=${'var(--text2)'}
							@click=${onDismiss}
						></ba-icon>
					</div>`
			: nothing;
	}

	static get tag() {
		return 'ba-bottom-sheet';
	}

	set content(value) {
		this.signal(Update, value);
	}
}
