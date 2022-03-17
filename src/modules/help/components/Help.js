import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './help.css';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { clearFixedNotification } from '../../../store/notifications/notifications.action';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { openModal } from '../../../store/modal/modal.action';

export const HELP_NOTIFICATION_DELAY_TIME = 3000;

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_HasBeenVisible = 'update_hasBeenVisible';
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
			hasBeenVisible: false
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
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(state => state.media, media => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth }));
		this.observe(state => state.mainMenu, mainMenu => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open, tabIndex: mainMenu.tab }));

		this.signal(Update_HasBeenVisible, this._environmentService.getUrlParams().get(QueryParameters.T_DISABLE_INITIAL_UI_HINTS) === 'true');
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isPortrait, hasMinWidth, isOpen, hasBeenVisible } = model;


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


		const showNotification = () => {
			const getContent = () => {
				const onOpen = () => {
					openModal(translate('help_notification_open'), html`<div>firstSteps</div>`);
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
		if (!hasBeenVisible) {
			window.setTimeout(() => showNotification(), HELP_NOTIFICATION_DELAY_TIME);
			this.signal(Update_HasBeenVisible, true);
		}
		const onOpenFirstSteps = () => {
			openModal(translate('help_notification_open'), html`<div>firstSteps</div>`);
		};
		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  			
				<div class='help__button ${getOverlayClass()}'>				
					<i class='help__button-icon'></i>
					<span class="help__button-text" @click=${onOpenFirstSteps}>${translate('help_button')}</span>					
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
