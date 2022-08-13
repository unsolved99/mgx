import * as PIXI from "pixi.js";
export class Skin {
	public skins: Map<any, any>;
	public downloaded: Map<any, any>;
	public maxlife: number;
	constructor() {
		this.skins = new Map();
		this.downloaded = new Map();
		this.maxlife = 2000;
	}
	public reset() {
		const time = Date.now();
		for (const value of this.skins) {
			const element = value[0];
			const data = value[1];
			time - data.lastUsed < this.maxlife ? data.reset() : (data.destroy(), this.skins.delete(element));
		}
	}
	public get(url: string) {
		const skin = this.skins.get(url);
		return skin ? skin.getSprite() : (this.downloaded.has(url) || this.download(url), false);
	}
	public download(url: string) {
		const img = new Image();
		img.crossOrigin = `Anonymous`;
		img.onload = () => {
			const canvas = document.createElement(`canvas`);
			const ctx = canvas.getContext("2d");
			canvas.width = 512;
			canvas.height = 512;
			ctx.beginPath();
			ctx.arc(256, 256, 256, 0, Math.TAU, true);
			ctx.closePath();
			ctx.clip();
			if (img.width && img.height) {
				ctx.drawImage(img, 0, 0, 512, 512);
			}
			const organize = new SkinOrganize(canvas);
			this.downloaded.delete(url);
			this.skins.set(url, organize);
			img.onload = null;
			img.onerror = null;
		};
		img.src = url;
		this.downloaded.set(url, true);
	}
}
class SkinOrganize {
	public pool: any[];
	public index: number;
	public texture: PIXI.Texture;
	public lastUsed: number;
	constructor(canvas: HTMLCanvasElement) {
		this.pool = [];
		this.index = 0;
		this.texture = PIXI.Texture.from(canvas);
		this.lastUsed = Date.now();
	}
	public getSprite() {
		return this.lastUsed = Date.now(), this.pool[this.index++] || this.newSprite();
	}
	public newSprite() {
		const sprite = new PIXI.Sprite(this.texture);
		return sprite.anchor.set(0.5, 0.5), this.pool.push(sprite), sprite;
	}
	public reset() {
		this.index = 0;
	}
	public destroy() {
		// tslint:disable-next-line: forin
		for (const value in this.pool) {
			const current = this.pool[value];
			current.destroy(false);
		}
		this.texture.destroy(true);
	}
}
