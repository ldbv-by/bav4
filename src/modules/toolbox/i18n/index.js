import { $injector } from '../../../injection';
import { provide as toolboxProvider } from './toolbox.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('toolboxProvider', toolboxProvider);
