import * as PIXI from "pixi.js";
import { application } from "../../Init";

export class Ring {

	public canvas: HTMLCanvasElement;
	public texture: PIXI.Texture;

	public init(app: application) {
		this.createTexture(app);
	}

	private createTexture(app: application): void {
		if (this.canvas === undefined) {
			this.canvas = document.createElement("canvas");
		} else {
			this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
		if (this.texture) {
			PIXI.Texture.removeFromCache(this.texture);
		}
		const cellSize = 150;
		this.canvas.height = this.canvas.width = cellSize * 2;
		const ctx = this.canvas.getContext("2d");
		ctx.globalAlpha = 1;
		ctx.strokeStyle = "#fff";
		const lw = cellSize * app.options.sliders.obj.multiboxRingSize / 10;
		ctx.lineWidth = lw;
		ctx.beginPath();
		ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, cellSize - lw / 2, 0, Math.PI * 2, !0);
		ctx.stroke();
		this.texture = PIXI.Texture.from(this.canvas);
	}

}
