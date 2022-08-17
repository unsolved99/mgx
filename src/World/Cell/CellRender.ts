import * as PIXI from "pixi.js";
import { Client } from "../../Client";
const img = new Image();
img.crossOrigin = "Anonymous";
img.src = "https://i.imgur.com/o2lh1Xh.png";
import { Renderer } from "../../Renderer/Renderer";
import { MassText } from "../../Renderer/Sprites/MassText";
import { NickText } from "../../Renderer/Sprites/NickText";
import { Cell } from "./Cell";
export class CellRender {

	public sprites: CellRender.Sprites;
	public containers: CellRender.Containers;
	public destroyed: boolean;
	public massText: MassText;
	public nickText: NickText;

	private cell: Cell;

	public constructor(cell: Cell) {
		this.cell = cell;
		this.destroyed = false;
		this.sprites = { cell: null, skin: null, nick: null, mass: null, virusShots: null, ring: null };
		this.containers = { circle: null };
	}

	public setRingColor() {
		const active = this.cell.client.app.game.multibox.activeTab;
		let color: number;
		switch (true) {
			case this.cell.client.type === Client.Type.PLAYER_1:
				if (active === 1) {
					color = PIXI.utils.string2hex(this.cell.client.app.options.theming.obj.player1ActiveColor);
				} else {
					color = PIXI.utils.string2hex(this.cell.client.app.options.theming.obj.player1InactiveColor);
				}
				break;
			case this.cell.client.type === Client.Type.PLAYER_2:
				if (active === 2) {
					color = PIXI.utils.string2hex(this.cell.client.app.options.theming.obj.player2ActiveColor);
				} else {
					color = PIXI.utils.string2hex(this.cell.client.app.options.theming.obj.player2InactiveColor);
				}
				break;
		}
		if (this.sprites.ring) {
			this.sprites.ring.tint = color;
		}
	}

	public drawRing() {
		if (this.cell.client.app.options.settings.obj.multiboxRings) {
			const cell = this.cell;
			const sprite = new PIXI.Sprite(cell.client.app.renderer.sprites.ring.texture);
			sprite.anchor.set(0.5);
			sprite.position.set(0, 0);
			sprite.width = sprite.height = cell.initialRadius * 2;
			sprite.zIndex = 2;
			this.sprites.ring = sprite;
			this.containers.circle.addChild(sprite);
		}
	}

	public initialRender(renderer: Renderer): PIXI.Container {
		const cell = this.cell;
		const texture = renderer.sprites.getTexture(cell);
		const sprite = new PIXI.Sprite(texture);

		sprite.position.set(0, 0);
		if (cell.type !== Cell.Type.FOOD && cell.type !== Cell.Type.VIRUS) {
			sprite.width = sprite.height = cell.initialRadius * 2;
		} else if (cell.type === Cell.Type.VIRUS) {
			sprite.width = sprite.height = (256 * cell.initialRadius / 100) * 2;
		}
		if (cell.type !== Cell.Type.VIRUS && cell.type !== Cell.Type.FOOD) {
			sprite.tint = PIXI.utils.string2hex(cell.color.hex);
		}
		sprite.anchor.set(.5);
		sprite.zIndex = 0;
		const container = new PIXI.Container();
		container.addChild(sprite);
		container.position.set(cell.animX, cell.animY);
		this.sprites.cell = sprite;
		this.containers.circle = container;
		cell.isTeam;
		if (cell.customSkin) {
			cell.client.app.options.settings.obj.customSkins ? this.drawSkin(renderer, cell.customSkin) : void (0);
		}
		if (cell.skin && !cell.customSkin) {
			cell.client.app.options.settings.obj.vanillaSkins ? this.drawSkin(renderer, cell.skin) : void (0);
		}
		if (cell.isMe) {
			this.drawRing();
		}
		return this.containers.circle;

	}

	public drawSkin(renderer: Renderer, url: string) {
		const cell = this.cell;
		const sprite = renderer.sprites.getSkin(url);
		if (sprite instanceof PIXI.Sprite) {
			sprite.anchor.set(0.5);
			sprite.position.set(0, 0);
			sprite.width = sprite.height = cell.initialRadius * 2;
			sprite.zIndex = 1;
			this.sprites.skin = sprite;
			this.containers.circle.addChild(sprite);
		}
	}

	public update(renderer: Renderer, alpha: number, visible: boolean): void {
		const cell = this.cell;
		const container = this.containers.circle;
		if (container instanceof PIXI.Container) {
			container.sortChildren();
			container.visible = visible;
			const scaleFactor = cell.animRadius / cell.initialRadius;
			container.position.set(cell.animX, cell.animY);
			if (cell.type !== Cell.Type.FOOD) {
				container.scale.set(scaleFactor, scaleFactor);
			}
			container.alpha = alpha;
			cell.isTeam;
			if (this.sprites.skin === null && cell.customSkin) {
				cell.client.app.options.settings.obj.customSkins ? this.drawSkin(renderer, cell.customSkin) : void (0);
			}
			if (this.sprites.skin === null && cell.skin && !cell.customSkin) {
				cell.client.app.options.settings.obj.vanillaSkins ? this.drawSkin(renderer, cell.skin) : void (0);
			}
			this.setRingColor();
		}

		const virusShots = this.sprites.virusShots;

		if (virusShots instanceof PIXI.Sprite && cell.type === Cell.Type.VIRUS) {
			virusShots.visible = visible;
			virusShots.alpha = alpha;
			virusShots.position.set(cell.animX, cell.animY);
			virusShots.width = virusShots.height = cell.animShotSize;
			virusShots.zIndex = cell.animRadius + 1;
		}

		const mass = this.sprites.mass;

		if (mass instanceof PIXI.BitmapText) {
			const scale = (cell.animRadius / (80 / 1)) * (32 / 10);
			let y = cell.animY;
			if (cell.client.app.options.settings.obj.nickText && !(cell.isMe && cell.client.app.options.settings.obj.hideOwnNick)) {
				y += cell.animRadius / 3;
			}

			mass.visible = visible;
			mass.text = String(this.cell.mass);
			mass.position.set(cell.animX, y);
			mass.scale.set(scale);
			mass.zIndex = cell.animRadius + 1;
		}

		const nick = this.sprites.nick;

		if (nick instanceof PIXI.Sprite) {
			const scale = (cell.animRadius / (80 / 1)) * (32 / 96);

			nick.visible = visible;
			nick.zIndex = cell.animRadius + 1;
			nick.position.set(cell.animX, cell.animY);
			nick.scale.set(scale);
		}
	}

	public destroy(soft: boolean = false) {
		const renderer = this.cell.client.app.renderer;
		this.destroyed = !soft;

		for (const id in this.sprites) {
			if ((this.sprites as any)[id] === null) {
				continue;
			}
			const sprite = (this.sprites as any)[id];
			if (sprite instanceof PIXI.Sprite || sprite instanceof PIXI.BitmapText) {
				sprite.parent.removeChild(sprite);
				sprite.destroy();
				(this.sprites as any)[id] = null;
			}
		}
		for (const id in this.containers) {
			if ((this.containers as any)[id] === null) {
				continue;
			}
			const container = (this.containers as any)[id];
			if (container instanceof PIXI.Container) {
				container.removeChildren();
				container.destroy();
				renderer.cells.removeChild(container);
				(this.containers as any)[id] = null;
			}
		}
	}

}

export namespace CellRender {
	export interface Sprites {
		cell: PIXI.Sprite;
		skin: PIXI.Sprite;
		nick: PIXI.Sprite;
		mass: PIXI.BitmapText;
		virusShots: PIXI.Sprite;
		ring: PIXI.Sprite;
	}

	export interface Containers {
		circle: PIXI.Container;
	}
}
