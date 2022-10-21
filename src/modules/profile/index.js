import { Profile } from './components/Profile';
if (!window.customElements.get(Profile.tag)) {
	window.customElements.define(Profile.tag, Profile);
}
