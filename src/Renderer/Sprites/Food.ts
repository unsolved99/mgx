import * as PIXI from "pixi.js";
import { MGxN3Bx } from "../../Init";
import { Cell } from "../../World/Cell/Cell";

export class Food {
	public texture: PIXI.Texture;
	public container: PIXI.Container;
	public canvas: HTMLCanvasElement;
	public constructor() {
		this.texture = PIXI.Texture.WHITE;
	}

	public init(mgxn3bx: MGxN3Bx) {
		this.createtexture(mgxn3bx);
	}
	public createtexture(mgxn3bx: MGxN3Bx) {
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

		if (mgxn3bx.options.settings.obj.foodGlow) {
			ctx.shadowBlur = mgxn3bx.options.sliders.obj.foodGlowSize;
			ctx.shadowColor = mgxn3bx.options.theming.obj.foodGlowColor;
		}

		ctx.arc(canvas.width / 2, canvas.height / 2, 10 + mgxn3bx.options.sliders.obj.foodSize, 0, Math.TAU, true);
		ctx.closePath();
		ctx.fillStyle = mgxn3bx.options.theming.obj.foodColor;
		if (mgxn3bx.options.settings.obj.foodGlow && mgxn3bx.options.settings.obj.hideFood === false) {
			for (let i = 0; i < mgxn3bx.options.sliders.obj.foodGlowStrength; i++) {
				ctx.fill();
			}
		} else if (mgxn3bx.options.settings.obj.hideFood === false) {
			ctx.fill();
		}
		this.texture = PIXI.Texture.from(canvas);
	}
}
