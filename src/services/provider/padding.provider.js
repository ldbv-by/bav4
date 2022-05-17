import { $injector } from '../../injection';

/**
 * Returns a padding for the map, to avoid the main menue overlapping important map-content.
 * @returns {Array<number>} the padding (in pixels);order of the values is top, right, bottom, left
*/
export const mainMenuLandscapePaddingProvider = () => {
	const no_padding = 0;
	const floatRegExp = /[^\d.]/g;
	const removeUnits = (raw) => raw.replace(floatRegExp, '');

	const { StoreService: storeService } = $injector.inject('StoreService');
	const isLandscape = !storeService.getStore().getState().media.portrait;
	const isMainMenuOpen = storeService.getStore().getState().mainMenu.open;

	const getLeft = () => {
		if (isLandscape && isMainMenuOpen) {
			const style = getComputedStyle(document.body);
			const fontSize = style.fontSize;
			const mainMenuWidth = style.getPropertyValue('--width-mainmenu');
			return Number(removeUnits(fontSize)) * Number(removeUnits(mainMenuWidth));
		}
		return no_padding;
	};


	return [no_padding, no_padding, no_padding, getLeft()];
};
