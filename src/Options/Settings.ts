declare var $: any;

import { application } from "../Init";
import { Defaults } from "../Utils/Defaults";
import { Storage } from "../Utils/Storage";

export class Settings {

	public obj: Settings.Obj;
	private storageGroup: Storage.Group = "settings";
	private app: application;

	public constructor(app: application) {
		this.app = app;
		this.obj = {
			cellSuckAnimation: this.get("cellSuckAnimation"),
			nickText: this.get("nickText"),
			hideOwnNick: this.get("hideOwnNick"),
			massText: this.get("massText"),
			hideOwnMass: this.get("hideOwnMass"),
			customSkins: this.get("customSkins"),
			vanillaSkins: this.get("vanillaSkins"),
			cellShield: this.get("cellShield"),
			hideFood: this.get("hideFood"),
			foodGlow: this.get("foodGlow"),
			virusGlow: this.get("virusGlow"),
			sectors: this.get("sectors"),
			audioVisualiser: this.get("audioVisualiser"),
			borderGlow: this.get("borderGlow"),
			rainbowBorder: this.get("rainbowBorder"),
			switchLogins: this.get("switchLogins"),
			audioVisualiserURL: this.get("audioVisualiserURL"),
			backgroundImage: this.get("backgroundImage"),
			backgroundImageURL: this.get("backgroundImageURL"),
			menuImageURL: this.get("menuImageURL"),
			circleOnSpawn: this.get("circleOnSpawn"),
			minimapGhostCells: this.get("minimapGhostCells"),
			multiboxRings: this.get("multiboxRings"),
			teamCircleOnSpawn: this.get("teamCircleOnSpawn"),
		};
	}

	public init() {
		this.addSettings();
		this.setDomValues();
	}

	public addSettings() {
		for (const option in this.obj) {
			if (false) { continue; }
			const value = (this.obj as any)[option];
			if (typeof value === "boolean") {
				$(`#${option}`).prop("checked", value);
			} else if (typeof value === "string") {
				$(`#${option}`).val(value);
			}
			$(`#${option}`).change(() => {
				if (typeof value === "boolean") {
					(this.obj as any)[option] = $(`#${option}`).prop("checked");
				} else if (typeof value === "string") {
					(this.obj as any)[option] = $(`#${option}`).val();
				}
				Storage.set(option, (this.obj as any)[option], this.storageGroup);
				this.onChange(option);
			});
		}
	}

	private onChange(option: string) {
		switch (option) {
			case "massText":
				this.app.renderer.massChange();
				break;
			case "nickText":
				this.app.renderer.nickChange();
				break;
			case "switchLogins":
				this.handleSwitch();
				break;
			case "sectors":
				this.app.renderer.toggleSectors(this.obj[option]);
				break;
			case "rainbowBorder":
				this.app.renderer.drawRainbow();
				if (this.obj.borderGlow) {
					this.app.renderer.sprites.border.createTexture(this.app);
					this.app.renderer.drawBorder();
				}
				this.app.renderer.statics.sortChildren();
				break;
			case "borderGlow":
				this.app.renderer.sprites.border.createTexture(this.app);
				this.app.renderer.drawBorder();
				break;
			case "backgroundImage":
				this.app.renderer.drawBackgroundImage();
				this.app.renderer.statics.sortChildren();
				break;
			case "hideFood":
			case "foodGlow":
				this.app.renderer.sprites.food.createtexture(this.app);
				this.app.renderer.foodColorChange();
				break;
			case "virusGlow":
				this.app.renderer.sprites.virus.createtexture(this.app);
				this.app.renderer.virusColorChange();
				break;
			case "menuImageURL":
				this.setMenuImage();
				break;
			case "multiboxRings":
				this.app.renderer.ringChange();
				break;
			default:
				break;
		}
	}

	private get(option: string) {
		if (Storage.get(option, this.storageGroup) === undefined || Storage.get(option, this.storageGroup) === null) {
			return (Defaults.settings as any)[option];
		} else {
			return Storage.get(option, this.storageGroup);
		}
	}

	private setDomValues() {
		this.handleSwitch();
		this.setMenuImage();
	}

	private setMenuImage() {
		$(".main-menu-background").css("background", `url(${this.obj.menuImageURL})`);
	}

	private handleSwitch() {
		const fb = $(".facebook-overlay");
		const gp = $(".google-overlay");
		if (this.obj.switchLogins === true) {
			gp.detach().prependTo("#skin-1");
			fb.detach().prependTo("#skin-2");
			if (this.app.master.login.sides.tab1 !== "google") { this.app.master.login.swapSides(); }
		} else if (this.obj.switchLogins === false) {
			gp.detach().prependTo("#skin-2");
			fb.detach().prependTo("#skin-1");
			if (this.app.master.login.sides.tab1 !== "facebook") { this.app.master.login.swapSides(); }
		}
		if (this.app.url) {
			this.app.connect(this.app.url);
		}
	}

}

export namespace Settings {

	export interface Obj {
		cellSuckAnimation: boolean;
		nickText: boolean;
		hideOwnNick: boolean;
		massText: boolean;
		hideOwnMass: boolean;
		customSkins: boolean;
		vanillaSkins: boolean;
		cellShield: boolean;
		hideFood: boolean;
		foodGlow: boolean;
		virusGlow: boolean;
		sectors: boolean;
		audioVisualiser: boolean;
		borderGlow: boolean;
		rainbowBorder: boolean;
		switchLogins: boolean;
		audioVisualiserURL: string;
		backgroundImage: boolean;
		backgroundImageURL: string;
		menuImageURL: string;
		circleOnSpawn: boolean;
		minimapGhostCells: boolean;
		multiboxRings: boolean;
		teamCircleOnSpawn: boolean;
	}

}
