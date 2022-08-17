declare var $: any;

import * as 
PIXI from 'pixi.js';
import { Client } from "./Client";
import { Game } from "./Game/Game";
import { AutoUpdate } from "./Master/AutoUpdate";
import { Master } from "./Master/Master";
import { Request } from "./Master/Request";
import { Chat } from "./Menu/Chat";
import { Menu } from "./Menu/Menu";
import { PacketDecoder } from "./Network/PacketDecoder";
import { PacketEncoder } from "./Network/PacketEncoder";
import { Socket } from "./Network/Socket";
import { Options } from "./Options/Options";
import { Renderer } from "./Renderer/Renderer";
import { Loop } from "./Utils/Loop";
import { Recaptcha } from "./Utils/Recaptcha";
import { Player } from "./World/Player";

AutoUpdate.checkCache().then((info: AutoUpdate.Info) => {
	(window as any).application = new application(info);
	
});
window.PIXI = PIXI;
export class application {

	public static readonly PLAYER_1 = 1;
	public static readonly PLAYER_2 = 2;
	public static readonly SPECTATE = 4;

	public readonly renderer: Renderer;
	public readonly loop: Loop;
	public readonly game: Game;
	public readonly menu: Menu;
	public readonly options: Options;
	public readonly master: Master;

	public info: AutoUpdate.Info;
	public url: string;
	public clients: Map<Client.Type, Client>;
	public fullMapClients: Map<Client.Type, Client>;
	public time: number;

	public serverToken: string;
	public fullMapConnected: boolean;

	public constructor(info: AutoUpdate.Info) {
		$("#loading-screen").fadeOut(450);
		this.info = info;
		this.clients = new Map();
		this.fullMapClients = new Map();
		this.fullMapConnected = false;
		this.master = new Master(this);
		this.options = new Options(this);
		this.menu = new Menu(this);
		this.renderer = new Renderer(this);
		this.game = new Game(this);
		this.loop = new Loop(() => {
			this.run();
		});
		this.checkHash();
	}

	public spawn(tab: 1 | 2, name: string) {
		if (tab === 1) {
			if (this.clients.get(Client.Type.PLAYER_1)) {
				Recaptcha.getToken((token: string) => {
					PacketEncoder.sendSpawn(this.clients.get(Client.Type.PLAYER_1), name, token);
				});
			}
		} else if (tab === 2) {
			if (this.clients.get(Client.Type.PLAYER_2)) {
				Recaptcha.getToken((token: string) => {
					PacketEncoder.sendSpawn(this.clients.get(Client.Type.PLAYER_2), name, token);
				});
			}
		}
	}

	public connect(url: string, flags: number = application.PLAYER_1 | application.PLAYER_2 | application.SPECTATE): Promise<void> {
		this.clients.forEach((client) => {
			client.world.cells.forEach((cell) => {
				cell.cellRender.destroy();
			});
			client.socket.webSocket.close();
			client.socket.disconnect();
		});
		this.clients.clear();

		const clients: Client[] = [];
		const sockets: Array<Promise<void>> = [];

		if (flags & application.PLAYER_1) {
			clients.push(new Client(Client.Type.PLAYER_1, new Socket(this.info.clientVersionInt), this));
		}

		if (flags & application.PLAYER_2) {
			clients.push(new Client(Client.Type.PLAYER_2, new Socket(this.info.clientVersionInt), this));
		}

		if (flags & application.SPECTATE) {
			clients.push(new Client(Client.Type.SPECTATE, new Socket(this.info.clientVersionInt), this));
		}

		clients.forEach((client) => sockets.push(client.socket.connect(url)));

		// Made changes here for private modes
		const gamemode = $("#gamemode").val();
		const region2 = $("#region2").val();
		
		if (gamemode === ":private") {
			//Arctida
			if (region2 === "wss://imsolo.pro:2109/") {
				this.serverToken = "aW1zb2xvLnBybzoyMTA5Lw==";
			}
			//Rookery
			if (region2 === "wss://imsolo.pro:2104/") {
				this.serverToken = "aW1zb2xvLnBybzoyMTA0Lw==";
			}
		 } else {
			this.serverToken = url.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1];
		 }
		 //

		this.url = url;
		return Promise.all(sockets).then(() => { // allSettled | all
			clients.forEach((client) => {
				this.clients.set(client.type, client);
				PacketEncoder.sendHandshake(client, this.info);
				client.socket.on("message", (data: ArrayBuffer) => PacketDecoder.decode(client, data));
				client.socket.on("close", () => {
					client.world.cells.forEach((cell) => {
						cell.cellRender.destroy();
					});
					this.clients.delete(client.type);
				});
				if (client.type === Client.Type.PLAYER_1 || client.type === Client.Type.PLAYER_2) {
					this.game.ogario.joinServer(this.serverToken, $("#party").val());
				}
			});

			return Promise.resolve();
		});
	}

	public connectFullMap(url: string) {
		this.game.fullMap.reset();
		this.fullMapClients.clear();

		const clients: Client[] = [];
		const sockets: Array<Promise<void>> = [];

		for (let i = 1; i <= 15; i++) {
			clients.push(new Client((Client as any).Type["FULLMAP_" + i], new Socket(this.info.clientVersionInt), this));
		}

		clients.forEach((client) => sockets.push(client.socket.connect(url)));
		Promise.all(sockets).then(() => {
			clients.forEach((client) => {
				PacketEncoder.sendHandshake(client, this.info);
				this.clients.set(client.type, client);
				this.fullMapClients.set(client.type, client);
				setTimeout(() => {
					PacketEncoder.sendFreeSpectate(client);
					setTimeout(() => {
						PacketEncoder.sendSpectate(client);
						setTimeout(() => {
							this.game.fullMap.sendToLocation(client);
						}, 400);
					}, 500);
				}, 500);
				client.socket.on("message", (data: ArrayBuffer) => PacketDecoder.decode(client, data));
				client.socket.on("close", () => {
					this.fullMapConnected = false;
				});

				return Promise.resolve();
			});
			this.fullMapConnected = true;
		});
	}

	public toggleFullMap() {
		this.game.fullMap.inPosition = false;
		if (this.fullMapConnected) {
			this.fullMapClients.forEach((client) => {
				client.world.cells.forEach((cell) => {
					cell.cellRender.destroy();
				});
				client.socket.disconnect();
				this.clients.delete(client.type);
			});
			this.fullMapClients.clear();
			this.fullMapConnected = false;
			Chat.addChatMessage("", `Full map view disabled!`, 1);
		} else if (this.fullMapConnected === false && this.url && this.url !== "") {
			this.connectFullMap(this.url);
			Chat.addChatMessage("", `Full map view enabled!`, 1);
		}
	}

	private run() {
		this.time = Date.now();
		this.clients.forEach((client: Client) => {
			client.world.sort(client);
		});
		this.game.multibox.update();
		this.game.camera.update();
		this.game.mouse.send();
		this.renderer.loop.run();
		this.renderer.minimap.run();
	}

	private checkHash() {
		const hash = location.hash;
		if (hash.length === 7) {
			const token = hash.split("#")[1];
			Request.joinParty("", token, this.info, (res) => {
				this.connect(`wss://${res.endpoints.https}`);
				$("#party").val(token);
			});
		}
	}

}

declare global {
	interface Math {
		TAU: number;
	}
}
Math.TAU = Math.PI * 2;
