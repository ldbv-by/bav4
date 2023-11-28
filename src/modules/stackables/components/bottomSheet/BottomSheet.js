/**
 * @module modules/stackables/components/bottomSheet/BottomSheet
 */
import { html, nothing } from 'lit-html';
import css from './bottomSheet.css';
import { MvuElement } from '../../../MvuElement';
import { closeBottomSheet } from '../../../../store/bottomSheet/bottomSheet.action';
import closeIcon from '../assets/x-square.svg';

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
			open: false,
			openNav: false,
			portrait: false
		});

		this._subscriptions = [
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
				(navigationRail) => this.signal(Update_IsOpen_NavigationRail, { openNav: navigationRail.openNav })
			)
		];
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
			case Update_IsOpen_NavigationRail:
				return { ...model, ...data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { content, open, openNav, portrait } = model;

		const getOverlayClass = () => (open && !portrait ? 'is-open' : '');

		const getOverlayNavClass = () => (openNav ? 'is-open-nav' : '');

		const onDismiss = () => {
			const elementModal = this.shadowRoot.querySelector('.bottom-sheet');
			elementModal.classList.add('fade-out');
			elementModal.addEventListener('animationend', () => {
				closeBottomSheet();
			});
		};

		const getOrientationClass = () => {
			return portrait ? 'is-portrait' : 'is-landscape';
		};

		return content
			? html`
		<style>${css}</style>
		<div class='bottom-sheet ${getOverlayClass()} ${getOverlayNavClass()} ${getOrientationClass()}' data-test-id>
        	${content}
			<ba-icon id="close-icon" class='tool-container__close-button' .icon='${closeIcon}' .size=${1.6} .color=${'var(--text2)'} .color_hover=${'var(--text2)'} @click=${onDismiss}>
		</div>`
			: nothing;
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._subscriptions.forEach((unsubscribe) => unsubscribe());
	}

	static get tag() {
		return 'ba-bottom-sheet';
	}

	set content(value) {
		this.signal(Update, value);
	}
}
