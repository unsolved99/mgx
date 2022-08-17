import * as PIXI from "pixi.js";
import { application } from "../../Init";

export class Border {

	public texture: PIXI.Texture;
	public canvas: HTMLCanvasElement;

	public init(app: application) {
		this.createTexture(app);
	}

	public createTexture(app: application) {
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
		}
		if (this.texture) {
			PIXI.Texture.removeFromCache(this.texture);
		}

		const canvas = this.canvas;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const glow = app.options.settings.obj.borderGlow && !app.options.settings.obj.rainbowBorder;
		const scale = 0.14;
		const shadowBlur = app.options.sliders.obj.borderGlowSize * scale;
		const lineWidth = app.options.sliders.obj.borderWidth * scale;
		const size = 14142 * scale;
		let offset = (lineWidth);
		if (glow) { offset += shadowBlur; }

		canvas.width = canvas.height = size + offset * 2;

		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = app.options.theming.obj.borderColor;
		if (glow) {
			ctx.shadowBlur = shadowBlur;
			ctx.shadowColor = app.options.theming.obj.borderGlowColor;
		}
		ctx.rect(0 + offset, 0 + offset, size, size);
		for (let i = 0; i < app.options.sliders.obj.borderGlowStrength; i++) {
			ctx.stroke();
		}

		this.canvas = canvas;
		this.texture = PIXI.Texture.from(canvas);
	}

}
