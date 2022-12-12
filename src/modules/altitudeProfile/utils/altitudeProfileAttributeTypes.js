import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

export class AltitudeProfileAttributeType {
	constructor(attribute, name, lightColor, darkColor = null) {
		this._attribute = attribute;
		this._name = name;
		this._lightColor = lightColor;
		if (darkColor === null) {
			this._darkColor = lightColor;
		}
		else {
			this._darkColor = darkColor;
		}

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	get caption() {
		const translate = (key) => this._translationService.translate(key);

		const caption = translate('altitudeProfile_' + this._attribute);
		return caption;
	}

	get name() {
		return this._name;
	}

	get color() {
		const {
			media: { darkSchema }
		} = getStore().getState();

		if (darkSchema) {
			return this._darkColor;
		}
		return this._lightColor;
	}
}

export class SurfaceType extends AltitudeProfileAttributeType {
	constructor(name, lightColor, darkColor) {
		super('surface', name, lightColor, darkColor);
	}
}


export class AnotherType extends AltitudeProfileAttributeType {
	constructor(name, lightColor, darkColor) {
		super('anotherType', name, lightColor, darkColor);
	}
}

