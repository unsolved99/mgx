import * as PIXI from "pixi.js";
import { Client } from "../../Client";
import { NickCache } from "../../Renderer/NickCache";
import { MassText } from "../../Renderer/Sprites/MassText";
import { CellRender } from "./CellRender";
export class Cell {

	public hiddenX: number;
	public hiddenY: number;
	public animX: number;
	public animY: number;

	public initialRadius: number;
	public radius: number;
	public animRadius: number;

	public nick: string;
	public skin: string;
	public customSkin: string;

	public color: {
		r: number;
		g: number;
		b: number;
		hex: string;
	};

	public lastUpdateTime: number;
	public fadeStartTime: number;
	public fadeTimeout: NodeJS.Timeout;

	public type: Cell.Type;

	public cellRender: CellRender;

	public shotSize: number;
	public animShotSize: number;

	public isMe: boolean;

	public constructor(public id: number, public client: Client) {
		this.isMe = false;
		this.cellRender = new CellRender(this);
		this.animX = 0;
		this.animY = 0;
		this.animRadius = 0;
		this.initialRadius = 0;
		this.lastUpdateTime = 0;
		this.color = {
			r: 255,
			g: 255,
			b: 255,
			hex: "#fff",
		};
		this.shotSize = 0;
		this.animShotSize = 0;
	}

	public get x(): number {
		return this.hiddenX - this.client.world.cellOffset.x;
	}

	public set x(x: number) {
		this.hiddenX = x;
	}

	public get y(): number {
		return this.hiddenY - this.client.world.cellOffset.y;
	}

	public set y(y: number) {
		this.hiddenY = y;
	}

	public get mass(): number {
		return Math.round(Math.pow(this.radius / 10, 2));
	}

	public setSkin(skin: string) {
		skin = skin.replace("%", "skin_");
		let url = "";
		if (skin.includes("custom") && !skin.includes("level")) {
			url = `${this.client.app.info.EnvConfig.custom_skins_url}${skin}.png`;
		} else if (!skin.includes("custom") && !skin.includes("level")) {
			url = this.client.app.info.skins.get(skin).url;
		}
		if (url !== "") {
			this.skin = url;
		}
		this.client.app.options.settings.obj.vanillaSkins ? this.client.app.renderer.sprites.skin.get(url) : void (0);
	}

	public setColor(r: number, g: number, b: number) {
		this.color = {
			r,
			g,
			b,
			hex: rgbToHex(~~(r * 0.9), ~~(g * 0.9), ~~(b * 0.9)),
		};
	}

	public setSize(size: number) {
		if (!this.radius) {
			this.initialRadius = size;
			this.cellRender.massText = new MassText(Math.round(Math.pow(size / 10, 2)));
		}
		this.radius = size;
		this.shotSize = this.radius * ((7 - ~~((200 - (this.radius * this.radius / 100)) / 14)) / 7);
	}

	public setNick(nick: string) {
		this.nick = nick;
		this.client.app.options.settings.obj.nickText ? this.cellRender.nickText = NickCache.get(nick, this.client.app.renderer.app) : void (0);
	}

	public animate(): void {
		const loop = this.client.app.renderer.loop;
		let animationDelay = (loop.lastFrameTime - this.lastUpdateTime) / this.client.app.options.sliders.obj.animationDelay;
		animationDelay = animationDelay < 0 ? 0 : animationDelay > 1 ? 1 : animationDelay;
		this.animX = animationDelay * (this.x - this.animX) + this.animX;
		this.animY = animationDelay * (this.y - this.animY) + this.animY;
		this.animRadius = animationDelay * (this.radius - this.animRadius) + this.animRadius;
		this.animShotSize = animationDelay * (this.shotSize - this.animShotSize) + this.animShotSize;
		this.lastUpdateTime = loop.lastFrameTime;
	}

	public get isTeam(): boolean {
		let isTeam = false;

		this.client.app.game.ogario.mainSocket.teamPlayers.forEach((player) => {
			if (player.nick === this.nick && player.color.cell === this.color.hex) {
				isTeam = true;
				this.customSkin = player.skin;
			}
		});

		return isTeam;
	}

	public isMeOtherTab(cell: Cell) {
		if (this.type !== Cell.Type.PLAYER) { return false; }
		if (this.color.hex === cell.color.hex && this.nick === cell.nick) {
			return true;
		} else {
			return false;
		}
	}

}

export namespace Cell {

	export enum Type {
		PLAYER,
		EJECTED,
		FOOD,
		VIRUS,
	}

	export interface Offset {
		x: number;
		y: number;
	}

}

function componentToHex(c: any) {
	const hex = c.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
