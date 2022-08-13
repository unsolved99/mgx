import * as PIXI from "pixi.js";
import { MGxN3Bx } from "../../Init";

export class Sectors {

	public texture: PIXI.Texture;
	public container: PIXI.ParticleContainer;

	constructor() {
		this.texture = PIXI.Texture.WHITE;
		this.container = new PIXI.ParticleContainer();
	}

	public init(mgxn3bx: MGxN3Bx) {
		this.createtexture(mgxn3bx);
	}

	public createtexture(mgxn3bx: MGxN3Bx) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const scale = 0.14;

		canvas.width = canvas.height = 14142 * scale;

		const x = 0;
		const y = 0;
		const second = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
		const barWidth = canvas.width / 5;
		const h = canvas.height / 5;
		ctx.save();
		ctx.beginPath();
		ctx.lineWidth = 0.05;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = barWidth * 0.6 + "px Product Sans";
		ctx.fillStyle = mgxn3bx.options.theming.obj.sectorFontColor;
		let j = 0;
		for (; 5 > j; j++) {
			let i = 0;
			for (; 5 > i; i++) {
				ctx.fillText(second[j] + (i + 1), x + barWidth * i + barWidth / 2, y + h * j + h / 2);
			}
		}
		ctx.lineWidth = 100 * scale;
		ctx.strokeStyle = mgxn3bx.options.theming.obj.sectorStrokeColor;
		j = 0;
		for (; 5 > j; j++) {
			let i = 0;
			for (; 5 > i; i++) {
				ctx.strokeRect(x + barWidth * i, y + h * j, barWidth, h);
			}
		}
		ctx.stroke();
		ctx.restore();
		this.texture = PIXI.Texture.from(canvas);
	}

}
