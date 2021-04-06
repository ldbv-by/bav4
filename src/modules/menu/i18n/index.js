import { provide as toolboxProvicer } from './toolbox.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('toolboxProvider', toolboxProvicer);
