// initialize DI
import '../injection/config';
// register global i18n
import '../i18n';

// register required modules (same as in embed.js)
import '../modules/footer';
import '../modules/map';
import '../modules/olMap';
import '../modules/commons';
import '../modules/utils';
import '../modules/iframe';
import '../modules/uiTheme';
import '../modules/stackables';
import '../modules/featureInfo';

import { PublicComponent } from '../modules/public/components/PublicComponent';

if (!customElements.get(PublicComponent.tag)) {
	window.customElements.define(PublicComponent.tag, PublicComponent);
}
