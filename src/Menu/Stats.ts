import { Client } from "../Client";
import { Menu } from "./Menu";

declare var $: any;

export class Stats {

	private menu: Menu;

	public constructor(menu: Menu) {
		this.menu = menu;
	}

	public updateStats() {
		const time: string = new Date().toLocaleString();
		$("#player-count").text(this.playerCount);
		$("#mass-count").text(`${this.playerMass} / ${this.playerMass2}`);
		$("#top-mass-count").text(`${this.playerTopMass} / ${this.playerTopMass2}`);
		$("#team-mass-count").text(`${this.teamTotalMass}`);
		$("#time-count").text(time);
	}

	private get playerCount(): number {
		return this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_1) ? this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_1).world.leaderBoard.list.size : 0;
	}

	private get playerMass(): number {
		return this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_1) ? this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_1).world.player.mass : 0;
	}

	private get playerTopMass(): number {
		return this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_1) ? this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_1).world.player.topMass : 0;
	}

	private get playerMass2(): number {
		return this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_2) ? this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_2).world.player.mass : 0;
	}

	private get playerTopMass2(): number {
		return this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_2) ? this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_2).world.player.topMass : 0;
	}

	private get teamTotalMass(): number {
		return this.menu.topTeam.totalMass;
	}

}
