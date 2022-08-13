import { Client } from "../../Client";
import { Chat } from "../../Menu/Chat";
import { Reader } from "../../Network/Reader";
import { Ogario } from "./Ogario";
import { Socket } from "./Socket";

export class Receiver {

	public socket: Socket;

	public constructor(socket: Socket) {
		this.socket = socket;
	}

	public getChatMessage(buf: Reader) {
		const messageType = buf.readUInt8();
		const playerID = buf.readUInt32();
		buf.index += 4;
		const str = buf.readUTF16string();
		const author = str.split(": ")[0];
		let message = str.split(": ")[1];
		let type = 2;
		if (author === "[SERVER]" && message.startsWith("Welcome!")) {
			message = "Connected to OGARio servers!";
			type = 1;
		}
		if (this.socket.type === Socket.Type.MAIN) {
			Chat.addChatMessage(author, message, type);
		}
	}

	public updateTeamPlayer(buf: Reader) {
		const id = buf.readUInt32();
		const player = this.socket.getOrCreate(id);
		player.nick = buf.readUTF16string();
		player.skin = buf.readUTF16string();
		player.color = {
			custom: buf.readUTF16string(),
			cell: buf.readUTF16string(),
		};
	}

	public updateTeamPlayerPosition(buf: Reader) {
		const id = buf.readUInt32();
		const player = this.socket.getOrCreate(id);
		player.position = {
			x: buf.readInt32(),
			y: buf.readInt32(),
		};
		player.mass = buf.readUInt32();
		if (player.alive === false && this.socket.player.alive === true && this.socket.ogario.game.mgxn3bx.options.settings.obj.teamCircleOnSpawn) {
			this.socket.ogario.game.mgxn3bx.renderer.drawCommander(player.position.x, player.position.y, Client.Type.PLAYER_1, true);
		}
		player.alive = true;
		player.updateTime = Date.now();
	}

}
