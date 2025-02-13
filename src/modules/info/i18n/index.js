import { $injector } from '../../../injection';
import { provide as coordinateInfoProvider } from './coordinateInfo.provider';
import { provide as geometryInfoProvider } from './geometryInfo.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateInfoProvider', coordinateInfoProvider);
translationService.register('geometryInfoProvider', geometryInfoProvider);
