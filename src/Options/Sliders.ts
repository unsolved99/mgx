import { application } from "../Init";
import { Defaults } from "../Utils/Defaults";
import { Storage } from "../Utils/Storage";
import { Options } from "./Options";

export class Sliders {

	public obj: Sliders.Obj;
	private storageGroup: Storage.Group = "settings";
	private options: Options;

	public constructor(options: Options) {
		this.options = options;
		this.obj = {
			animationDelay: this.get("animationDelay"),
			rainbowBorderSpeed: this.get("rainbowBorderSpeed"),
			zoomSpeed: this.get("zoomSpeed"),
			cameraSpeed: this.get("cameraSpeed"),
			audioVisualiserSize: this.get("audioVisualiserSize"),
			audioVolume: this.get("audioVolume"),
			foodSize: this.get("foodSize"),
			foodGlowSize: this.get("foodGlowSize"),
			foodGlowStrength: this.get("foodGlowStrength"),
			virusGlowSize: this.get("virusGlowSize"),
			virusStrokeSize: this.get("virusStrokeSize"),
			virusGlowStrength: this.get("virusGlowStrength"),
			virusOpacity: this.get("virusOpacity"),
			borderGlowSize: this.get("borderGlowSize"),
			borderGlowStrength: this.get("borderGlowStrength"),
			borderWidth: this.get("borderWidth"),
			menuBG1Opacity: this.get("menuBG1Opacity"),
			menuBG2Opacity: this.get("menuBG2Opacity"),
			hudBlur: this.get("hudBlur"),
			hudSaturation: this.get("hudSaturation"),
			menuImageOpacity: this.get("menuImageOpacity"),
			player1CircleHue: this.get("player1CircleHue"),
			player2CircleHue: this.get("player2CircleHue"),
			teammateCircleHue: this.get("teammateCircleHue"),
			multiboxRingSize: this.get("multiboxRingSize"),

		};
	}

	public init() {
		this.addSliders();
		this.setValues();
	}

	public addSliders() {
		for (const slider in this.obj) {
			if (false) { continue; }
			const value = (this.obj as any)[slider];
			const element = $(`#${slider}`);
			element.val(value);
			element.change(() => {
				(this.obj as any)[slider] = Number(element.val());
				Storage.set(slider, (this.obj as any)[slider], this.storageGroup);
				this.onChange(slider);
			});
		}
	}

	private get(option: string) {
		if (Storage.get(option, this.storageGroup) === undefined || Storage.get(option, this.storageGroup) === null) {
			return (Defaults.sliders as any)[option];
		} else {
			return Number(Storage.get(option, this.storageGroup));
		}
	}

	private onChange(option: string) {
		switch (option) {
			case "audioVolume":
				this.app.renderer.spectrum.audio.volume = (this.obj.audioVolume / 100);
				break;
			case "foodGlowSize":
			case "foodGlowStrength":
			case "foodSize":
				this.app.renderer.sprites.food.createtexture(this.app);
				this.app.renderer.foodColorChange();
				break;
			case "virusStrokeSize":
			case "virusGlowSize":
			case "virusGlowStrength":
			case "virusOpacity":
				this.app.renderer.sprites.virus.createtexture(this.app);
				this.app.renderer.virusColorChange();
				break;
			case "borderWidth":
			case "borderGlowSize":
			case "borderGlowStrength":
				this.app.renderer.sprites.border.createTexture(this.app);
				this.app.renderer.drawBorder();
				break;
			case "menuBG1Opacity":
			case "MenuBG2Opacity":
				this.setOpacity();
				break;
			case "hudSaturation":
			case "hudBlur":
			case "menuImageOpacity":
				this.setMenu();
				break;
			case "multiboxRingSize":
				this.app.renderer.sprites.ring.init(this.app);
				this.app.renderer.ringChange();
				break;
			default:
				break;
		}
	}

	private setValues() {
		this.setMenu();
		this.setOpacity();
	}

	private setMenu() {
		document.documentElement.style.setProperty("--filter", `blur(${this.obj.hudBlur}vw) saturate(${this.obj.hudSaturation})`);
		$(".main-menu-background").css("opacity", this.obj.menuImageOpacity);
	}

	private setOpacity() {
		const rgb = this.options.theming.hexToRgb(this.options.theming.obj.menuBGMainColor);
		const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.obj.menuBG1Opacity})`;
		const rgb2 = this.options.theming.hexToRgb(this.options.theming.obj.menuBGSecondColor);
		const color2 = `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${this.obj.menuBG2Opacity})`;
		document.documentElement.style.setProperty("--main-bg-color", color);
		document.documentElement.style.setProperty("--second-bg-color", color2);
	}

	private get app(): application {
		return this.options.app;
	}

}

export namespace Sliders {

	export interface Obj {
		zoomSpeed: number;
		cameraSpeed: number;
		animationDelay: number;
		rainbowBorderSpeed: number;
		audioVisualiserSize: number;
		audioVolume: number;
		foodSize: number;
		foodGlowSize: number;
		foodGlowStrength: number;
		virusGlowSize: number;
		virusStrokeSize: number;
		virusGlowStrength: number;
		virusOpacity: number;
		borderWidth: number;
		borderGlowSize: number;
		borderGlowStrength: number;
		menuBG1Opacity: number;
		menuBG2Opacity: number;
		hudSaturation: number;
		hudBlur: number;
		menuImageOpacity: number;
		player1CircleHue: number;
		player2CircleHue: number;
		teammateCircleHue: number;
		multiboxRingSize: number;
	}

}
