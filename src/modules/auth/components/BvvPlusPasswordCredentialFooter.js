/**
 * @module modules/auth/components/BvvPlusPasswordCredentialFooter
 */
import { $injector } from '../../../injection/index';
import { MvuElement } from '../../MvuElement';
import css from './bvvpluspasswordcredentialfooter.css';
import { html } from 'lit-html';

/**
 * BVV specific footer component to provide information for login and registration
 * @class
 * @author thiloSchlemmer
 */
export class BvvPlusPasswordCredentialFooter extends MvuElement {
	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	createView() {
		const translate = (key, params = []) => this._translationService.translate(key, params);
		const badgeForRoles = html`<ba-badge .color=${'var(--text3)'} .background=${'var(--roles-color)'} .label=${'Plus'}></ba-badge>`;
		return html`<style>
				${css}
			</style>
			<div class="footer_register">
				${translate('auth_passwordCredentialPanel_footer_register_for_role', [badgeForRoles])}
				${translate('auth_passwordCredentialPanel_footer_register_information', ['https://www.ldbv.bayern.de/produkte/dienste/bayernatlas.html'])}
			</div>
			<div class="footer_forgot_login">
				<div>
					<a target="_blank" href="https://geodatenonline.bayern.de/geodatenonline/anwendungen4/kontakt"
						>${translate('auth_passwordCredentialPanel_footer_forgot_login')}</a
					>
				</div>
				<div>
					<a target="_blank" href="https://geodatenonline.bayern.de/geodatenonline/anwendungen4/passwortvergessen"
						>${translate('auth_passwordCredentialPanel_footer_forgot_password')}</a
					>
				</div>
			</div>`;
	}

	static get tag() {
		return 'ba-auth-password-credential-bvv-footer';
	}
}
