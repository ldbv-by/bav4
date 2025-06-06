import { provide as oafProvider } from './oaf.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('oafProvider', oafProvider);
