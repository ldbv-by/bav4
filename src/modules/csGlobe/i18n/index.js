import { $injector } from '../../../injection';
import { provide as csGlobeProvide } from '../../csGlobe/i18n/csGlobe.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('globeProvider', csGlobeProvide);
