import { createApp } from '../../lib/mini-vue.esm';
import { App } from './app';

const rootContainer = document.querySelector("#app");
createApp(App).mount(rootContainer);