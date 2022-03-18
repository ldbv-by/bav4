import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './help.css';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { clearFixedNotification } from '../../../store/notifications/notifications.action';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { openModal } from '../../../store/modal/modal.action';
import { isHttpUrl } from '../../../utils/checks';

export const HELP_NOTIFICATION_DELAY_TIME = 3000;

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_HasBeenVisible = 'update_hasBeenVisible';
const Update_HelpContentSource = 'update_helpContentSource';
/**
 * @class
 * @author alsturm
 */
export class Help extends MvuElement {

	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			isOpen: false,
			hasBeenVisible: false,
			helpContentSource: null
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
	}


	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
			case Update_HasBeenVisible:
				return { ...model, hasBeenVisible: data };
			case Update_HelpContentSource:
				return { ...model, helpContentSource: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		const { ConfigService: configService } = $injector.inject('ConfigService');

		this.observe(state => state.media, media => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth }));
		this.observe(state => state.mainMenu, mainMenu => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open, tabIndex: mainMenu.tab }));

		this.signal(Update_HasBeenVisible, this._environmentService.getUrlParams().get(QueryParameters.T_DISABLE_INITIAL_UI_HINTS) === 'true');

		if (configService.hasKey('HELP_URL')) {
			this.signal(Update_HelpContentSource, configService.getValue('HELP_URL'));
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isPortrait, hasMinWidth, isOpen, hasBeenVisible, helpContentSource } = model;


		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return (isOpen && !isPortrait) ? 'is-open' : '';
		};

		const translate = (key) => this._translationService.translate(key);


		const openModalFirstSteps = () => {
			openModal(translate('help_notification_first_steps'), html`<iframe title=${translate('help_notification_first_steps')} src=${helpContentSource} style="border:none;" width='100%' height='600px'></iframe`);
		};

		const openModalShowCase = () => {
			openModal('Showcase', html`<ba-showcase>`);
		};

		const showNotification = () => {
			const getContent = () => {
				const onOpen = () => {
					openModalFirstSteps();
					clearFixedNotification();
				};
				const onClose = () => {
					clearFixedNotification();
				};
				return html`
						<style>${css}</style>	
						<div class='help__notification'>					
							<div class='help__notification-section'>
								<i class='help__notification-icon'></i>
								<div>
									<div class='help__notification-primary-text' >${translate('help_notification_header')}</div>
									<div class='help__notification-secondary-text' >${translate('help_notification_text')}</div>
								</div>
							</div>
							<div class='help__notification-section space-evenly'>							
								<ba-button id='closeButton' .label=${translate('help_notification_close')} @click=${onClose}></ba-button>
								<ba-button id='firstSteps' .label=${translate('help_notification_first_steps')} @click=${onOpen}></ba-button>								
							</div>
						</div>`;
			};
			emitNotification(getContent(), LevelTypes.CUSTOM);
		};

		const helpAvailable = helpContentSource != null && isHttpUrl(helpContentSource);
		if (!hasBeenVisible && helpAvailable) {
			window.setTimeout(() => showNotification(), HELP_NOTIFICATION_DELAY_TIME);
			this.signal(Update_HasBeenVisible, true);
		}

		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  			
				<div class='help__button ${getOverlayClass()}'>				
					<i class='help__button-icon'></i>
					<span class="help__button-text" @click=${helpAvailable ? openModalFirstSteps : openModalShowCase}>${translate('help_button')}</span>					
				</div>		
			</div>		

		` ;

	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-initial-hints';
	}
}
