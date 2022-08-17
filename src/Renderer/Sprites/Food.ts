import * as PIXI from "pixi.js";
import { application } from "../../Init";
import { Cell } from "../../World/Cell/Cell";

export class Food {
	public texture: PIXI.Texture;
	public container: PIXI.Container;
	public canvas: HTMLCanvasElement;
	public constructor() {
		this.texture = PIXI.Texture.WHITE;
	}

	public init(app: application) {
		this.createtexture(app);
	}
	public createtexture(app: application) {
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
		}
		if (this.texture !== PIXI.Texture.WHITE) {
			PIXI.Texture.removeFromCache(this.texture);
		}

		const canvas = this.canvas;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		canvas.width = canvas.height = 256;
		ctx.beginPath();

		if (app.options.settings.obj.foodGlow) {
			ctx.shadowBlur = app.options.sliders.obj.foodGlowSize;
			ctx.shadowColor = app.options.theming.obj.foodGlowColor;
		}

		ctx.arc(canvas.width / 2, canvas.height / 2, 10 + app.options.sliders.obj.foodSize, 0, Math.TAU, true);
		ctx.closePath();
		ctx.fillStyle = app.options.theming.obj.foodColor;
		if (app.options.settings.obj.foodGlow && app.options.settings.obj.hideFood === false) {
			for (let i = 0; i < app.options.sliders.obj.foodGlowStrength; i++) {
				ctx.fill();
			}
		} else if (app.options.settings.obj.hideFood === false) {
			ctx.fill();
		}
		this.texture = PIXI.Texture.from(canvas);
	}
}
