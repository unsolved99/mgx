import { Client } from "../Client";
import { Menu } from "../Menu/Menu";
import { PacketEncoder } from "../Network/PacketEncoder";
import { Player } from "../World/Player";
import { Game } from "./Game";

export class Multibox {

	public activeTab: 1 | 2;
	public x: number;
	public y: number;

	private game: Game;
	private ejectInterval: NodeJS.Timeout;

	public constructor(game: Game) {
		this.game = game;
		this.activeTab = 1;
		this.x = this.y = 0;
	}

	public death(type: Client.Type) {
		const cli = this.game.app.clients.get(Client.Type.PLAYER_1);
		const cli2 = this.game.app.clients.get(Client.Type.PLAYER_2);
		if (type === Client.Type.PLAYER_1) {
			if (cli2) {
				switch (true) {
					case cli.world.player.state === Player.State.DEAD && cli2.world.player.state === Player.State.DEAD:
						Menu.showMenu();
						this.activeTab = 1;
						break;
					case cli.world.player.state === Player.State.DEAD && cli2.world.player.state === Player.State.ALIVE:
						this.activeTab = 2;
						break;
				}
			} else {
				Menu.showMenu();
				this.activeTab = 1;
			}
		} else if (type === Client.Type.PLAYER_2) {
			switch (true) {
				case cli.world.player.state === Player.State.DEAD && cli2.world.player.state === Player.State.DEAD:
					Menu.showMenu();
					this.activeTab = 1;
					break;
				case cli.world.player.state === Player.State.ALIVE && cli2.world.player.state === Player.State.DEAD:
					this.activeTab = 1;
					break;
			}
		}
	}

	public update() {

		let x = 0;
		let y = 0;
		const client = this.game.app.clients.get(Client.Type.PLAYER_1);
		const client2 = this.game.app.clients.get(Client.Type.PLAYER_2);
		let cells;
		if (client && client2) {
			cells = new Map([...client2.world.player.myCells, ...client.world.player.myCells]);
		} else if (client && !client2) {
			cells = client.world.player.myCells;
		}

		if (cells) {
			for (const ce of cells.values()) {
				x += ce.animX / cells.size;
				y += ce.animY / cells.size;
			}

			this.x = x;
			this.y = y;
		}

	}

	public mouseMove(x: number, y: number) {
		const client = this.game.app.clients.get(Client.Type.PLAYER_1);
		const client2 = this.game.app.clients.get(Client.Type.PLAYER_2);
		if (this.activeTab === 1 && client) {
			PacketEncoder.sendMouseMove(client, x, y);
		} else if (client2) {
			PacketEncoder.sendMouseMove(client2,
				x + client2.world.cellOffset.x, y + client2.world.cellOffset.y);
		}
	}

	public spawnTab(tab: 1 | 2) {
		if (this.game.app.clients.has((Client as any).Type["PLAYER_" + tab])) {
			const nick = $("#user-name-" + tab).val();
			this.game.app.spawn(tab, String(nick));
		}
	}

	public switch() {
		const cli = this.game.app.clients.get(Client.Type.PLAYER_1);
		const cli2 = this.game.app.clients.get(Client.Type.PLAYER_2);

		if (cli && cli2) {
			if (cli.world.player.state === Player.State.DEAD && cli2.world.player.state === Player.State.DEAD) {
				console.log("h");
				return;
			}
			switch (this.activeTab) {
				case 1:
					this.activeTab = 2;
					if (cli2.world.player.state === Player.State.DEAD) {
						this.spawnTab(2);
					}
					break;
				case 2:
					this.activeTab = 1;
					if (cli.world.player.state === Player.State.DEAD) {
						this.spawnTab(1);
					}
					break;
			}
		}
	}

	public feed(cli: Client = this.activeClient) {
		if (cli) {
			PacketEncoder.sendFeed(cli);
		}
	}

	public split(cli: Client = this.activeClient) {
		if (cli) {
			PacketEncoder.sendSplit(cli);
		}
	}

	public macroFeed(on: boolean) {
		if (on) {
			const client = this.activeClient;
			if (this.ejectInterval) { return; }
			this.feed(client), this.ejectInterval = setInterval(() => {
				this.feed(client);
			}, 80);
		} else { this.ejectInterval && (clearInterval(this.ejectInterval), this.ejectInterval = null); }
	}

	public doubleSplit() {
		const client = this.activeClient;
		this.split(client);
		setTimeout(() => {
			this.split(client);
		}, 40);
	}

	public split16() {
		const client = this.activeClient;
		this.split(client);
		setTimeout(() => {
			this.split(client);
		}, 40), setTimeout(() => {
			this.split(client);
		}, 80), setTimeout(() => {
			this.split(client);
		}, 120);
	}

	private get activeClient() {
		let client: Client;

		switch (this.activeTab) {
			case 1:
				client = this.game.app.clients.get(Client.Type.PLAYER_1);
				break;
			case 2:
				client = this.game.app.clients.get(Client.Type.PLAYER_2);
				break;
			default:
				client = null;
				break;
		}
		return client;
	}

}
