/*
 Project: 
 Created by: Lightnet
 License: MIT
 Information: Work in progres.
 */
localStorage.clear();

//import {setGun} from './mjs';
//import App from './App01.svelte';
//import App from './App02.svelte';
//import App from './App03.svelte';
//import App from './App04.svelte';
//import App from './App05.svelte';
//import { sAmmo } from "./g";
import App from './AppECSY01.svelte';

function init(){
	const app = new App({
		target: document.body,
		props: {
			//name: 'MJS'
		}
	});
}

window.addEventListener('load', (event) => {
	init();	
});
