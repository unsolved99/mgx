import { Client } from "../../Client";
import { World } from "../../World/World";
import { Game } from "../Game";
import { Socket } from "./Socket";

export class Ogario {

	public game: Game;
	public mainSocket: Socket;
	public secSocket: Socket;

	public constructor(game: Game) {
		this.game = game;
		this.mainSocket = new Socket(this, Socket.Type.MAIN);
		// this.secSocket = new Socket(this, Socket.Type.SEC);

		this.setValues();

		setInterval(() => {
			this.mainSocket.updateInterval();
			// this.secSocket.updateInterval();
		}, 1000);
	}

	public setValues() {
		this.setTag(this.game.app.menu.profiles.getTag());
		this.setNick(this.game.app.menu.profiles.get("nick1"), Client.Type.PLAYER_1);
		this.setNick(this.game.app.menu.profiles.get("nick2"), Client.Type.PLAYER_2);
		this.setSkin(this.game.app.menu.profiles.get("skin1"), Client.Type.PLAYER_1);
		this.setSkin(this.game.app.menu.profiles.get("skin2"), Client.Type.PLAYER_2);
	}

	public sendChat(message: string, type: number = 101) {
		this.mainSocket.sendChat(message, type);
	}

	public joinServer(serverToken: string, partyToken: string) {
		this.mainSocket && this.mainSocket.isActive ? this.mainSocket.join(serverToken, partyToken) : void (0);
		this.secSocket && this.secSocket.isActive ? this.secSocket.join(serverToken, partyToken) : void (0);
	}

	public setTag(tag: string) {
		this.mainSocket ? this.mainSocket.tag = tag : void (0);
		this.secSocket ? this.secSocket.tag = tag : void (0);
	}

	public spawn(type: Client.Type) {
		if (type === Client.Type.PLAYER_1 && this.mainSocket) {
			this.mainSocket.spawn();
		} else if (type === Client.Type.PLAYER_2 && this.secSocket) {
			this.secSocket.spawn();
		}
	}

	public playerDeath(type: Client.Type) {
		if (type === Client.Type.PLAYER_1 && this.mainSocket) {
			this.mainSocket.death();
		} else if (type === Client.Type.PLAYER_2 && this.secSocket) {
			this.secSocket.death();
		}
	}

	public updatePosition(type: Client.Type, x: number, y: number, mass: number) {
		if (type === Client.Type.PLAYER_1 && this.mainSocket) {
			this.mainSocket.updatePosition(x, y, mass);
		} else if (type === Client.Type.PLAYER_2 && this.secSocket) {
			this.secSocket.updatePosition(x, y, mass);
		}
	}

	public setColor(color: string, type: Client.Type) {
		if (type === Client.Type.PLAYER_1 && this.mainSocket) {
			this.mainSocket.player.color.cell = this.mainSocket.player.color.custom = color;
		} else if (type === Client.Type.PLAYER_2 && this.secSocket) {
			this.secSocket.player.color.cell = this.secSocket.player.color.custom = color;
		}
	}

	public setNick(nick: string, type: Client.Type) {
		if (type === Client.Type.PLAYER_1 && this.mainSocket) {
			this.mainSocket.player.nick = nick;
		} else if (type === Client.Type.PLAYER_2 && this.secSocket) {
			this.secSocket.player.nick = nick;
		}
	}

	public setSkin(skin: string, type: Client.Type) {
		if (type === Client.Type.PLAYER_1 && this.mainSocket) {
			this.mainSocket.player.skin = skin;
		} else if (type === Client.Type.PLAYER_2 && this.secSocket) {
			this.secSocket.player.skin = skin;
		}
	}

}

export namespace Ogario {

	export interface TeamPlayerColor {
		cell: string;
		custom: string;
	}

	export class TeamPlayer {

		public id: number;
		public nick: string;
		public skin: string;
		public mass: number;
		public position: World.Vector;
		public animatedPos: World.Vector;
		public color: Ogario.TeamPlayerColor;
		public alive: boolean;
		public updateTime: number;
		public animTime: number;

		public constructor(id: number) {
			this.id = id;
			this.nick = "";
			this.skin = "";
			this.mass = 0;
			this.position = { x: 0, y: 0 };
			this.animatedPos = { x: 0, y: 0 };
			this.color = { custom: "#000", cell: "#000" };
			this.alive = false;
			this.updateTime = 0;
			this.animTime = 0;
		}

		public update() {
			this.animatedPos.x = (29 * this.animatedPos.x + this.position.x) / 30;
			this.animatedPos.y = (29 * this.animatedPos.y + this.position.y) / 30;
		}

	}

}
