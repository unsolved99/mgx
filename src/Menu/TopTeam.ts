declare var $: any;

import { Client } from "../Client";
import { Ogario } from "../Game/Ogario/Ogario";
import { Menu } from "./Menu";

export class TopTeam {

	public totalMass: number;
	private menu: Menu;
	private arr: Ogario.TeamPlayer[];
	private html: string;
	private div: HTMLElement;

	public constructor(menu: Menu) {
		this.menu = menu;
		this.div = document.getElementById("team-players");
		this.reset();
	}

	public update() {
		this.getTop(5);
		this.div.innerHTML = this.html;
	}
	public reset() {
		this.totalMass = 0;
		this.arr = [];
		this.html = "";
	}

	private getTop(amount: number) {
		const ogario = this.menu.mgxn3bx.game.ogario;

		ogario.mainSocket.teamPlayers.forEach((player: Ogario.TeamPlayer) => {
			if (player.alive) {
				this.totalMass += player.mass;
				this.arr.push(player);
			}
		});
		if (ogario.mainSocket.player.alive) {
			this.totalMass += ogario.mainSocket.player.mass;
		}
		this.arr.sort((player: Ogario.TeamPlayer, player2: Ogario.TeamPlayer) => {
			return player2.mass - player.mass;
		});
		this.arr.splice(amount);
		this.arr.forEach((player: Ogario.TeamPlayer) => {
			this.addPlayer(player);
		});
		if (this.arr.length === 0) {
			$(this.div).hide();
		} else {
			$(this.div).show();
		}
	}

	private addPlayer(player: Ogario.TeamPlayer) {
		const nick = player.nick === "" ? "unnamed" : player.nick;
		const skin = player.skin === "" ? "https://i.imgur.com/WaiqY0C.png" : player.skin;

		this.html += `
		<div class="player">
          <img class="player-skin" src="${skin}" alt="">
          <div class="player-name"> ${nick}</div>
          <div class="team-player-stats">
            <div class="player-mass">
            <i class="material-icons">data_usage</i>
            <div class="player-mass-count">${player.mass}</div>
            </div>
            <div class="player-location">
            <i class="material-icons">place</i>
            <div class="player-location-count">${this.getLocation(player)}</div>
            </div>
          </div>
        </div>
		`;
	}

	private getLocation(player: Ogario.TeamPlayer): string {
		const cli = this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		if (cli) {
			return cli.world.getLocation(player.position.x, player.position.y);
		} else {
			return "??";
		}
	}

}
