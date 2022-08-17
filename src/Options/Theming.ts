declare var $: any;

import { application } from "../Init";
import { Defaults } from "../Utils/Defaults";
import { Storage } from "../Utils/Storage";
import { Options } from "./Options";

export class Theming {

	public obj: Theming.Obj;
	private storageGroup: Storage.Group = "theming";
	private options: Options;

	public constructor(options: Options) {
		this.options = options;
		this.obj = {
			backgroundColor: this.get("backgroundColor"),
			backgroundImageColor: this.get("backgroundImageColor"),
			borderColor: this.get("borderColor"),
			borderGlowColor: this.get("borderGlowColor"),
			foodColor: this.get("foodColor"),
			foodGlowColor: this.get("foodGlowColor"),
			sectorFontColor: this.get("sectorFontColor"),
			sectorStrokeColor: this.get("sectorStrokeColor"),
			virusColor: this.get("virusColor"),
			virusGlowColor: this.get("virusGlowColor"),
			virusStrokeColor: this.get("virusStrokeColor"),
			visualiserColor1: this.get("visualiserColor1"),
			visualiserColor2: this.get("visualiserColor2"),
			player1ActiveColor: this.get("player1ActiveColor"),
			player1InactiveColor: this.get("player1InactiveColor"),
			player2ActiveColor: this.get("player2ActiveColor"),
			player2InactiveColor: this.get("player2InactiveColor"),
			minimapSelfColor: this.get("minimapSelfColor"),
			minimapTeammateColor: this.get("minimapTeammateColor"),
			minimapGhostCellsColor: this.get("minimapGhostCellsColor"),
			minimapViewportColor: this.get("minimapViewportColor"),
			menuBGMainColor: this.get("menuBGMainColor"),
			menuBGSecondColor: this.get("menuBGSecondColor"),
			mainMenuColor: this.get("mainMenuColor"),
			secondMenuColor: this.get("secondMenuColor"),
		};
		$.minicolors = {
			defaults: {
				animationSpeed: 50,
				animationEasing: "swing",
				change: null,
				changeDelay: 0,
				control: "hue",
				defaultValue: "",
				format: "hex",
				hide: null,
				hideSpeed: 100,
				inline: false,
				keywords: "",
				letterCase: "lowercase",
				opacity: false,
				position: "bottom left",
				show: null,
				showSpeed: 100,
				theme: "default",
				swatches: [],
			},
		};
	}

	public init() {
		this.setValues();
		this.addTheme();
	}

	public hexToRgb(hex: string) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
		} : null;
	}

	public addTheme() {
		for (const theme in this.obj) {
			if (false) { continue; }
			const value = (this.obj as any)[theme];
			$(`#${theme}`).minicolors({
				defaultValue: value,
			});
			$(`#${theme}`).on("blur", () => {
				(this.obj as any)[theme] = $(`#${theme}`).minicolors("value");
				Storage.set(theme, (this.obj as any)[theme], this.storageGroup);
				this.onChange(theme);
			});
		}
	}

	private onChange(theme: string) {
		switch (theme) {
			case "backgroundColor":
				this.setBackground();
				break;
			case "virusColor":
			case "virusStrokeColor":
			case "virusGlowColor":
				this.app.renderer.sprites.virus.createtexture(this.app);
				this.app.renderer.virusColorChange();
				break;
			case "foodColor":
			case "foodGlowColor":
				this.app.renderer.sprites.food.createtexture(this.app);
				this.app.renderer.foodColorChange();
				break;
			case "borderColor":
			case "borderGlowColor":
				this.app.renderer.sprites.border.createTexture(this.app);
				this.app.renderer.drawBorder();
				break;
			case "sectorStrokeColor":
			case "sectorFontColor":
				this.app.renderer.sprites.sectors.init(this.app);
				this.app.renderer.drawSectors();
				break;
			case "backgroundImageColor":
				if (this.app.renderer.spriteCache.backgroundImage instanceof PIXI.Sprite) {
					this.app.renderer.spriteCache.backgroundImage.tint = PIXI.utils.string2hex(this.obj.backgroundImageColor);
				}
				break;
			case "mainMenuColor":
			case "secondMenuColor":
			case "menuBGMainColor":
			case "menuBGSecondColor":
				this.setMenuColors();
				break;
			default:
				break;
		}
	}

	private get(option: string) {
		if (Storage.get(option, this.storageGroup) === undefined || Storage.get(option, this.storageGroup) === null) {
			return (Defaults.theming as any)[option];
		} else {
			return Storage.get(option, this.storageGroup);
		}
	}

	private setValues() {
		this.setBackground();
		this.setMenuColors();
	}

	private setBackground() {
		$("body").css("background-color", this.obj.backgroundColor);
	}

	private setMenuColors() {
		document.documentElement.style.setProperty("--pink-color", this.obj.mainMenuColor);
		document.documentElement.style.setProperty("--purple-color", this.obj.secondMenuColor);

		const rgb = this.hexToRgb(this.obj.menuBGMainColor);
		const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.options.sliders.obj.menuBG1Opacity})`;
		const rgb2 = this.hexToRgb(this.obj.menuBGSecondColor);
		const color2 = `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${this.options.sliders.obj.menuBG2Opacity})`;
		document.documentElement.style.setProperty("--main-bg-color", color);
		document.documentElement.style.setProperty("--second-bg-color", color2);
	}

	private get app(): application {
		return this.options.app;
	}

}

export namespace Theming {

	export interface Obj {
		backgroundColor: string;
		backgroundImageColor: string;
		borderColor: string;
		borderGlowColor: string;
		foodColor: string;
		foodGlowColor: string;
		sectorFontColor: string;
		sectorStrokeColor: string;
		virusColor: string;
		virusGlowColor: string;
		virusStrokeColor: string;
		visualiserColor1: string;
		visualiserColor2: string;
		player1ActiveColor: string;
		player1InactiveColor: string;
		player2ActiveColor: string;
		player2InactiveColor: string;
		minimapSelfColor: string;
		minimapTeammateColor: string;
		minimapGhostCellsColor: string;
		minimapViewportColor: string;
		menuBGMainColor: string;
		menuBGSecondColor: string;
		mainMenuColor: string;
		secondMenuColor: string;
	}

}
