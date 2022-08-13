import * as PIXI from "pixi.js";
import { MGxN3Bx } from "../../Init";

export class Border {

	public texture: PIXI.Texture;
	public canvas: HTMLCanvasElement;

	public init(mgxn3bx: MGxN3Bx) {
		this.createTexture(mgxn3bx);
	}

	public createTexture(mgxn3bx: MGxN3Bx) {
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
		}
		if (this.texture) {
			PIXI.Texture.removeFromCache(this.texture);
		}

		const canvas = this.canvas;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const glow = mgxn3bx.options.settings.obj.borderGlow && !mgxn3bx.options.settings.obj.rainbowBorder;
		const scale = 0.14;
		const shadowBlur = mgxn3bx.options.sliders.obj.borderGlowSize * scale;
		const lineWidth = mgxn3bx.options.sliders.obj.borderWidth * scale;
		const size = 14142 * scale;
		let offset = (lineWidth);
		if (glow) { offset += shadowBlur; }

		canvas.width = canvas.height = size + offset * 2;

		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = mgxn3bx.options.theming.obj.borderColor;
		if (glow) {
			ctx.shadowBlur = shadowBlur;
			ctx.shadowColor = mgxn3bx.options.theming.obj.borderGlowColor;
		}
		ctx.rect(0 + offset, 0 + offset, size, size);
		for (let i = 0; i < mgxn3bx.options.sliders.obj.borderGlowStrength; i++) {
			ctx.stroke();
		}

		this.canvas = canvas;
		this.texture = PIXI.Texture.from(canvas);
	}

}
