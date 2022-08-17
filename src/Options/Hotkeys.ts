declare var $: any;

import { HotKeys as HotKeysHandler } from "../Game/HotKeys";
import { application } from "../Init";
import { Defaults } from "../Utils/Defaults";
import { Storage } from "../Utils/Storage";

export class HotKeys {

	public obj: HotKeys.Obj;
	private storageGroup: Storage.Group = "hotkeys";
	private app: application;

	public constructor(app: application) {
		this.app = app;
		this.obj = {
			feed: this.get("feed"),
			macroFeed: this.get("macroFeed"),
			split: this.get("split"),
			doubleSplit: this.get("doubleSplit"),
			maxSplit: this.get("maxSplit"),
			freeSpectate: this.get("freeSpectate"),
			toggleMenu: this.get("toggleMenu"),
			chatInput: this.get("chatInput"),
			multiboxSwitch: this.get("multiboxSwitch"),
			command1: this.get("command1"),
			command2: this.get("command2"),
			command3: this.get("command3"),
			command4: this.get("command4"),
			command5: this.get("command5"),
			zoom1: this.get("zoom1"),
			zoom2: this.get("zoom2"),
			zoom3: this.get("zoom3"),
			zoom4: this.get("zoom4"),
			zoom5: this.get("zoom5"),
		};
		this.addHotKeys();
	}

	public addHotKeys() {
		for (const hotkey in this.obj) {
			if (false) { continue; }
			const value = (this.obj as any)[hotkey];
			$(`#${hotkey}`).val(value);
			$(`#${hotkey}`).keydown((evt: KeyboardEvent) => {
				evt.preventDefault();
				const key = HotKeysHandler.getKey(evt);
				if (key !== "") {
					this.alreadyBinded(key);
					$(`#${hotkey}`).val(key);
					(this.obj as any)[hotkey] = key;
					Storage.set(hotkey, (this.obj as any)[hotkey], this.storageGroup);
				}
			});
		}
	}

	private get(option: string) {
		if (Storage.get(option, this.storageGroup) === undefined || Storage.get(option, this.storageGroup) === null) {
			return (Defaults.hotkeys as any)[option];
		} else {
			return Storage.get(option, this.storageGroup);
		}
	}

	private alreadyBinded(key: string) {
		let binded: boolean | string = false;
		let bindedKey = "";
		for (const objKey in this.obj) {
			if (false) { continue; }
			const hotkey = (this.obj as any)[objKey];
			if (key === hotkey && objKey !== "freeSpectate") {
				bindedKey = objKey;
				binded = true;
			}

		}
		binded && ((this.obj as any)[bindedKey] = "", Storage.set(bindedKey, "", this.storageGroup), $(`#${bindedKey}`).val(""));
	}

}

export namespace HotKeys {

	export interface Obj {
		feed: string;
		macroFeed: string;
		split: string;
		doubleSplit: string;
		maxSplit: string;
		freeSpectate: string;
		toggleMenu: string;
		chatInput: string;
		multiboxSwitch: string;
		command1: string;
		command2: string;
		command3: string;
		command4: string;
		command5: string;
		zoom1: string;
		zoom2: string;
		zoom3: string;
		zoom4: string;
		zoom5: string;
	}

}
