import { provide as oafProvider } from './oafUi.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('oafProvider', oafProvider);
