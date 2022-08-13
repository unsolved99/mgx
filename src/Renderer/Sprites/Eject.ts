import * as PIXI from "pixi.js";
import { Cell } from "../../World/Cell/Cell";

export class Eject {
	public texture: PIXI.Texture;
	public constructor() {
		this.texture = PIXI.Texture.WHITE;
	}
	public init() {
		this.createtexture();
	}
	public createtexture() {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width = 64;
		canvas.height = 64;
		ctx.beginPath();
		ctx.arc(32, 32, 32, 0, Math.TAU, true);
		ctx.closePath();
		ctx.fillStyle = `#ffffff`;
		ctx.fill();
		this.texture = PIXI.Texture.from(canvas);
	}
}
