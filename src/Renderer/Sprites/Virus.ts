import * as PIXI from "pixi.js";
import { application } from "../../Init";
import { Cell } from "../../World/Cell/Cell";

export class Virus {

	public texture: PIXI.Texture;
	public canvas: HTMLCanvasElement;
	public readonly size: number = 512;

	constructor(public app: PIXI.Application) {
	}

	public init(app: application) {
		this.createtexture(app);
	}

	public createtexture(app: application) {
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
		}
		if (this.texture) {
			PIXI.Texture.removeFromCache(this.texture);
		}
		const glow = app.options.settings.obj.virusGlow;
		const strength = app.options.sliders.obj.virusGlowStrength;
		const canvas = this.canvas;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const size = this.size;
		canvas.width = this.size;
		canvas.height = this.size;

		ctx.beginPath();
		ctx.globalAlpha = app.options.sliders.obj.virusOpacity;
		ctx.arc(size / 2, size / 2, 100, 0, Math.TAU, true);
		ctx.closePath();
		ctx.fillStyle = app.options.theming.obj.virusColor;
		ctx.fill();

		ctx.beginPath();
		ctx.globalAlpha = 1;
		ctx.lineWidth = app.options.sliders.obj.virusStrokeSize;
		if (glow) {
			ctx.shadowBlur = app.options.sliders.obj.virusGlowSize;
			ctx.shadowColor = app.options.theming.obj.virusGlowColor;
		}
		ctx.arc(size / 2, size / 2, 100, 0, Math.TAU, true);
		ctx.closePath();
		ctx.strokeStyle = app.options.theming.obj.virusStrokeColor;
		if (glow) {
			for (let i = 0; i < strength; i++) {
				ctx.stroke();
			}
		} else {
			ctx.stroke();
		}
		this.texture = PIXI.Texture.from(canvas);

	}

}
