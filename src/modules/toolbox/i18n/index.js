import { provide as toolboxProvider } from './toolbox.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('toolboxProvider', toolboxProvider);
