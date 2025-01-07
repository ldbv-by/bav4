/**
 * @module modules/menu/components/mainMenu/content/misc/BvvMiscContentPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './bvvMiscContentPanel.css';
import { $injector } from '../../../../../../injection';
import { closeModal, openModal } from '../../../../../../store/modal/modal.action';
import { toggleSchema } from '../../../../../../store/media/media.action';
const Update_Schema = 'update_schema';
const Update_Auth = 'update_auth';

/**
 * Container for more contents.
 * @class
 * @author costa_gi
 * @author alsturm
 * @author thiloSchlemmer
 */
export class BvvMiscContentPanel extends AbstractMvuContentPanel {
	#translationService;
	#authService;

	constructor() {
		super({ darkSchema: false, signedIn: false });

		const { TranslationService: translationService, AuthService: authService } = $injector.inject('TranslationService', 'AuthService');
		this.#translationService = translationService;
		this.#authService = authService;
	}

	onInitialize() {
		this.observe(
			(state) => state.media.darkSchema,
			(darkSchema) => this.signal(Update_Schema, darkSchema)
		);
		this.observe(
			(state) => state.auth.signedIn,
			(signedIn) => this.signal(Update_Auth, signedIn)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Schema:
				return { ...model, darkSchema: data };
			case Update_Auth:
				return { ...model, signedIn: data };
		}
	}

	createView(model) {
		const { darkSchema, signedIn } = model;
		const translate = (key) => this.#translationService.translate(key);

		const openFeedbackDialog = () => {
			const title = translate('menu_misc_content_panel_feedback_title');
			const content = html`<ba-mvu-togglefeedbackpanel .onSubmit=${closeModal}></ba-mvu-togglefeedbackpanel>`;
			openModal(title, content, { steps: 2 });
		};

		const onClickSignIn = async () => {
			this.#authService.signIn();
		};

		const onClickSignOut = () => {
			this.#authService.signOut();
		};

		return html`
			<style>
				${css}
			</style>
			<div class="ba-list">
				<button id="authButton" class="ba-list-item ${signedIn ? 'logout' : ''}" @click=${signedIn ? onClickSignOut : onClickSignIn}>
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon person"> </span>
					</span>
					<span class="ba-list-item__text vertical-center"
						>${translate(signedIn ? 'menu_misc_content_panel_logout' : 'menu_misc_content_panel_login')}</span
					>
				</button>
				<button id="feedback" class="ba-list-item divider" @click=${openFeedbackDialog}>
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon feedback"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_feedback_title')}</span>
				</button>
				<div class="ba-list-item  ba-list-item__header ">
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_settings')}</span>
					</span>
				</div>
				<div class="ba-list-item divider ">
					<ba-switch class="themeToggle" id="themeToggle" .checked=${darkSchema} @toggle=${toggleSchema}>
						<span slot="before" class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_dark_mode')}</span>
					</ba-switch>
				</div>
				<div class="ba-list-item  ba-list-item__header">
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_information')}</span>
					</span>
				</div>
				<a class="ba-list-item" href="https://www.ldbv.bayern.de/hilfe-v4.html" target="_blank">
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon help"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_help')}</span>
				</a>
				<button id="feedback" class="ba-list-item hide" @click=${openFeedbackDialog}>
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon feedback"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_feedback_title')}</span>
				</button>
				<a class="ba-list-item" href="https://www.ldbv.bayern.de/service/kontakt.html" target="_blank">
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon contact"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_Contact')}</span>
				</a>
				<a class="ba-list-item" href="${translate('global_terms_of_use')}" target="_blank">
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon checklist"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_terms_of_use')}</span>
				</a>
				<a class="ba-list-item" href="${translate('global_privacy_policy_url')}" target="_blank">
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon lock"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_privacy_policy')}</span>
				</a>
				<a class="ba-list-item" href="https://geoportal.bayern.de/geoportalbayern/seiten/impressum.html" target="_blank">
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon imprint"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_imprint')}</span>
				</a>
				<a
					class="ba-list-item divider"
					href="https://www.ldbv.bayern.de/digitalisierung/itdlz/barrierefreiheit/barrierefreiheit_ba.html"
					target="_blank"
				>
					<span class="ba-list-item__pre">
						<span class="ba-list-item__icon icon accessibility"> </span>
					</span>
					<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_accessibility')}</span>
				</a>
				<div class="ba-list-item  ba-list-item__header">
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_misc_links')}</span>
					</span>
				</div>
				<a class="ba-list-item" href="https://geodatenonline.bayern.de/geodatenonline" target="_blank">
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__image image gdo"> </span>
					</span>
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_gdo_header')}</span>
						<span class="ba-list-item__secondary-text">${translate('menu_misc_content_panel_gdo_text')}</span>
					</span>
				</a>
				<a class="ba-list-item" href="https://www.geoportal.bayern.de/geoportalbayern" target="_blank">
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__image image geoportal"> </span>
					</span>
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_gp_header')}</span>
						<span class="ba-list-item__secondary-text">${translate('menu_misc_content_panel_gp_text')}</span>
					</span>
				</a>
				<a class="ba-list-item" href="https://www.energieatlas.bayern.de/" target="_blank">
					<span class="ba-list-item__pre ">
						<span class="ba-list-item__image image ea"> </span>
					</span>
					<span class="ba-list-item__text ">
						<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_ea_header')}</span>
						<span class="ba-list-item__secondary-text">${translate('menu_misc_content_panel_ea_text')}</span>
					</span>
				</a>
			</div>
		`;
	}

	static get tag() {
		return 'ba-misc-content-panel';
	}
}
