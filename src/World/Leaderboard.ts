import { Client } from "../Client";

declare var $: any;

export class Leaderboard {

	public list: Map<number, Leaderboard.Player>;

	public constructor() {
		this.list = new Map();
	}

	public update(client: Client) {
		$("#leaderboard-positions").empty();
		$("#leadboard-player-location").empty();
		let i = 0;
		this.list.forEach((player: Leaderboard.Player) => {
			if (i < 10 || player.isMe || player.isFriend) {
				$("#leaderboard-positions").append(`<li class="position"><div class="position-name">${player.nick} </div><div class="position-number">${player.place}</div></li>`);
				const ghost = client.world.ghostCells.get(player.place - 1);
				if (ghost) {
					$("#leadboard-player-location").append(`<div class="lb-player-location"> <i class="material-icons">place</i> <div class="lb-player-location-count">${client.world.getLocation(ghost.position.x, ghost.position.y)}</div> </div>`);
				}
				i++;
			}
		});
	}

}

export namespace Leaderboard {
	export interface Player {
		place: number;
		nick: string;
		isMe: boolean;
		isFriend: boolean;
		account: number;
	}
}
