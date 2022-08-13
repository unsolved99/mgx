import * as PIXI from "pixi.js";
import { Client } from "../Client";
import { MGxN3Bx } from "../Init";
import { Cell } from "../World/Cell/Cell";
import { Loop } from "./Loop";
import { Minimap } from "./Minimap/Minimap";
import { Spectrum } from "./Spectrum";
import { Sprites } from "./Sprites/Sprites";

PIXI.utils.skipHello();

export class Renderer {

	public readonly mgxn3bx: MGxN3Bx;
	public readonly loop: Loop;
	public readonly sprites: Sprites;

	public readonly app: PIXI.Application;
	public readonly engine: PIXI.Renderer;
	public readonly world: PIXI.Container;
	public readonly cells: PIXI.Container;
	public readonly extras: PIXI.Container;
	public readonly statics: PIXI.Container;

	public spriteCache: Renderer.SpriteCache;
	public textureCache: Renderer.TextureCache;

	public colorMatrix: PIXI.filters.ColorMatrixFilter;
	public hueCounter: number = 0;
	public rainbowContainer: PIXI.Container;

	public minimap: Minimap;
	public spectrum: Spectrum;

	public constructor(mgxn3bx: MGxN3Bx) {
		this.mgxn3bx = mgxn3bx;
		this.spriteCache = {};
		this.textureCache = {};
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			antialias: true,
			transparent: true,
		});

		const options = {
			crossOrigin: true,
		};
		this.app.loader.add(`ubuntu-font`, "./assets/fonts/ubuntuBold.fnt", options);
		this.app.loader.add(`ubuntu-font-stroke`, "./assets/fonts/ubuntuBoldStroked.fnt", options);
		this.app.loader.add(`google-sans`, "./assets/fonts/google-sans.fnt", options);
		this.app.loader.add(`google-sans-stroke`, "./assets/fonts/google-sans-stroked.fnt", options);
		this.app.loader.load();

		this.engine = this.app.renderer;
		const graphics = new PIXI.Graphics();
		this.world = new PIXI.Container();
		this.cells = new PIXI.Container();
		this.statics = new PIXI.Container();
		this.extras = new PIXI.Container();
		this.world.addChild(this.statics);
		this.world.addChild(graphics);
		this.world.addChild(this.extras);
		this.world.addChild(this.cells);
		this.engine.view.id = "gamecanvas";
		document.body.appendChild(this.engine.view);
		window.addEventListener("resize", () => this.engine.resize(window.innerWidth, window.innerHeight));

		this.minimap = new Minimap(this);
		this.sprites = new Sprites(this);
		this.spectrum = new Spectrum(this, graphics);
		this.loop = new Loop(this);
		this.setCommanderTextures();
		this.drawBackgroundImage();
		this.drawSectors();
		this.drawRainbow();
		this.drawBorder();
	}

	public setCommanderTextures() {
		this.textureCache.commander1 = PIXI.Texture.from("./assets/images/MGxCircle0.png");
		this.textureCache.commander2 = PIXI.Texture.from("./assets/images/MGxCircle1.png");
		this.textureCache.commander3 = PIXI.Texture.from("./assets/images/MGxCircle2.png");
	}

	public ringChange() {
		const cells: Cell[] = [];

		this.mgxn3bx.clients.forEach((client) => {
			cells.push(...client.world.sortedCells);
		});
		cells.forEach((cell: Cell) => {
			if (cell.type === Cell.Type.PLAYER && cell.isMe) {
				if (cell.cellRender.sprites.ring) {
					cell.cellRender.sprites.ring.destroy();
					cell.cellRender.sprites.ring = null;
				}
				if (this.mgxn3bx.options.settings.obj.multiboxRings) {
					cell.cellRender.drawRing();
				}
			}
		});
	}

	public drawCommander(x: number, y: number, type: Client.Type, isTeam: boolean = false) {
		let hue;
		switch (true) {
			case type === Client.Type.PLAYER_1 && !isTeam:
				hue = this.mgxn3bx.options.sliders.obj.player1CircleHue;
				break;
			case type === Client.Type.PLAYER_2 && !isTeam:
				hue = this.mgxn3bx.options.sliders.obj.player2CircleHue;
				break;
			case type === Client.Type.PLAYER_1 && isTeam:
				hue = this.mgxn3bx.options.sliders.obj.teammateCircleHue;
				if (this.mgxn3bx.clients.get(Client.Type.PLAYER_1)) {
					x += this.mgxn3bx.clients.get(Client.Type.PLAYER_1).world.offset.x;
					y += this.mgxn3bx.clients.get(Client.Type.PLAYER_1).world.offset.y;
				}
				break;
		}

		const maxSize = 2048;
		const sprite1 = new PIXI.Sprite(this.textureCache.commander1);
		const sprite2 = new PIXI.Sprite(this.textureCache.commander2);
		const sprite3 = new PIXI.Sprite(this.textureCache.commander3);
		sprite1.position.set(x, y), sprite2.position.set(x, y), sprite3.position.set(x, y);
		sprite1.width = sprite1.height = sprite2.width = sprite2.height = sprite3.width = sprite3.height = 50;
		sprite1.anchor.set(0.5), sprite2.anchor.set(0.5), sprite3.anchor.set(0.5);
		const container = new PIXI.Container();
		const filter = new PIXI.filters.ColorMatrixFilter();
		filter.hue(hue, false);
		container.addChild(sprite1, sprite2, sprite3);
		container.filters = [filter];
		this.extras.addChild(container);

		this.app.ticker.add((delta: number) => {
			if (sprite1.alpha <= 0) {
				sprite1.visible = false;
			} else {
				if (sprite1.width >= maxSize) { sprite1.alpha -= 0.008; }
				sprite1.height = sprite1.width += 16;
				sprite1.rotation += 0.005;
			}
			if (sprite2.alpha <= 0) {
				sprite2.visible = false;
			} else {
				if (sprite2.width >= maxSize) { sprite2.alpha -= 0.008; }
				sprite2.height = sprite2.width += 16;
				sprite2.rotation -= 0.005;
			}
			if (sprite3.alpha <= 0) {
				sprite3.visible = false;
			} else {
				if (sprite3.width >= maxSize) { sprite3.alpha -= 0.008; }
				sprite3.height = sprite3.width += 16;
				sprite3.rotation += 0.005;
			}

			if (sprite1.visible === false && sprite2.visible === false && sprite3.visible === false) {
				container.destroy({
					children: true,
				});
				this.extras.removeChild(container);
			}

		});
	}

	public virusColorChange() {
		const cells: Cell[] = [];

		this.mgxn3bx.clients.forEach((client) => {
			cells.push(...client.world.sortedCells);
		});
		cells.forEach((cell: Cell) => {
			if (cell.type === Cell.Type.VIRUS) {
				cell.cellRender.destroy(true);
			}
		});

	}

	public foodColorChange() {
		const cells: Cell[] = [];

		this.mgxn3bx.clients.forEach((client) => {
			cells.push(...client.world.sortedCells);
		});
		cells.forEach((cell: Cell) => {
			if (cell.type === Cell.Type.FOOD) {
				cell.cellRender.destroy(true);
			}
		});
	}

	public massChange() {
		const cells: Cell[] = [];

		this.mgxn3bx.clients.forEach((client) => {
			cells.push(...client.world.sortedCells);
		});
		cells.forEach((cell: Cell) => {
			if (cell.cellRender.sprites.mass) {
				cell.cellRender.destroy(true);
			}
		});

	}

	public nickChange() {
		const cells: Cell[] = [];

		this.mgxn3bx.clients.forEach((client) => {
			cells.push(...client.world.sortedCells);
		});
		cells.forEach((cell: Cell) => {
			if (cell.cellRender.sprites.nick) {
				cell.cellRender.destroy(true);
			}
		});

	}

	public toggleSectors(on: boolean) {
		switch (true) {
			case this.spriteCache.sectors && on:
				this.spriteCache.sectors.visible = true;
				break;
			case this.spriteCache.sectors && !on:
				this.spriteCache.sectors.visible = false;
				break;
			case !this.spriteCache.sectors && on:
				this.drawSectors();
				this.statics.sortChildren();
				break;
		}
	}

	public drawBackgroundImage() {
		const on = this.mgxn3bx.options.settings.obj.backgroundImage;
		const url = this.mgxn3bx.options.settings.obj.backgroundImageURL;
		const color = PIXI.utils.string2hex(this.mgxn3bx.options.theming.obj.backgroundImageColor);
		if (this.spriteCache.backgroundImage instanceof PIXI.Sprite) {
			this.statics.removeChild(this.spriteCache.backgroundImage);
			this.spriteCache.backgroundImage.destroy();
			this.spriteCache.backgroundImage = null;
		}
		if (on) {
			const sprite = PIXI.Sprite.from(url);
			sprite.width = sprite.height = 14142;
			const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
			const x = client ? client.world.center.x : 0;
			const y = client ? client.world.center.y : 0;
			sprite.position.set(x, y);
			sprite.anchor.set(0.5);
			sprite.tint = color;
			this.statics.addChild(sprite);
			this.spriteCache.backgroundImage = sprite;
		}
	}

	public drawBorder() {
		if (this.spriteCache.border) {
			this.world.removeChild(this.spriteCache.border);
			this.spriteCache.border.destroy();
		}
		let offset = this.mgxn3bx.options.sliders.obj.borderWidth; // Width
		if (this.mgxn3bx.options.settings.obj.borderGlow && !this.mgxn3bx.options.settings.obj.rainbowBorder) {
			offset += this.mgxn3bx.options.sliders.obj.borderGlowSize;
		} // Shadowblur
		const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const border = new PIXI.Sprite(this.sprites.border.texture);
		let x = client ? client.world.border.left : -7071;
		let y = client ? client.world.border.top : -7071;
		x -= offset; y -= offset;
		border.position.set(x, y);
		border.width = border.height = 14142 + (offset * 2);  // Size + offset
		border.zIndex = 3;
		this.statics.addChild(border);
		this.spriteCache.border = border;

	}

	public drawSectors() {
		const obj = this.mgxn3bx.options.settings.obj;
		if (this.spriteCache.sectors instanceof PIXI.Sprite) {
			this.statics.removeChild(this.spriteCache.sectors);
			this.spriteCache.sectors.destroy();
			this.spriteCache.sectors = null;
		}
		if (obj.sectors) {
			const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
			const x = client ? client.world.border.left : -7071;
			const y = client ? client.world.border.top : -7071;
			const sectors = PIXI.Sprite.from(this.sprites.sectors.texture);
			sectors.width = sectors.height = 14142;
			sectors.position.set(x, y);
			sectors.zIndex = 1;
			this.statics.addChild(sectors);
			this.spriteCache.sectors = sectors;
		}
	}

	public drawRainbow() {
		if (this.mgxn3bx.options.settings.obj.rainbowBorder === true) {
			this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
			const sprite = PIXI.Sprite.from("assets/images/border_blur_rgb.png");
			sprite.width = 14142 + 1050;
			sprite.height = 14142 + 1050;
			sprite.anchor.set(0.5);
			const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
			const x = client ? client.world.center.x : 0;
			const y = client ? client.world.center.y : 0;
			const container = new PIXI.Container();
			container.filters = [this.colorMatrix];
			container.zIndex = 2;
			container.position.set(x, y);
			container.addChild(sprite);

			this.rainbowContainer = container;
			this.statics.addChild(container);
		} else {
			if (this.rainbowContainer instanceof PIXI.Container) {
				this.statics.removeChild(this.rainbowContainer);
				this.rainbowContainer.destroy({
					children: true,
				});
				this.rainbowContainer = null;
			}
		}

	}

	public positionBorder() {
		let offset = this.mgxn3bx.options.sliders.obj.borderWidth; // Width
		if (this.mgxn3bx.options.settings.obj.borderGlow && !this.mgxn3bx.options.settings.obj.rainbowBorder) {
			offset += this.mgxn3bx.options.sliders.obj.borderGlowSize;
		}
		const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		let x = client ? client.world.border.left : -7071;
		let y = client ? client.world.border.top : -7071;
		if (this.spriteCache.sectors) {
			const sectors = this.spriteCache.sectors;
			sectors.position.set(x, y);
		}
		x -= offset; y -= offset;
		const border = this.spriteCache.border;
		border.position.set(x, y);
		if (this.mgxn3bx.options.settings.obj.rainbowBorder === true) {
			this.rainbowContainer.position.set(client.world.center.x, client.world.center.y);
		}
		if (this.spriteCache.backgroundImage instanceof PIXI.Sprite && this.mgxn3bx.options.settings.obj.backgroundImage === true) {
			this.spriteCache.backgroundImage.position.set(client.world.center.x, client.world.center.y);
		}
	}

}

export namespace Renderer {
	export interface SpriteCache {
		[key: string]: PIXI.Sprite;
	}
	export interface TextureCache {
		[key: string]: PIXI.Texture;
	}
}
