import { EventEmitter } from "events";
import { Client } from "../Client";
import { Recaptcha } from "../Utils/Recaptcha";
import { Cell } from "../World/Cell/Cell";
import { Player } from "../World/Player";
import { World } from "../World/World";
import { PacketEncoder } from "./PacketEncoder";
import { Reader } from "./Reader";
import { Writer } from "./Writer";

export class PacketDecoder extends EventEmitter {

	public static decode(client: Client, ab: ArrayBuffer) {
		const buf = new Reader(ab);
		const opCode = buf.readUInt8();
		switch (opCode) {

			case 16:
				this.worldUpdate(client, buf);
				break;

			case 17:
				client.world.player.state = Player.State.SPECTATING;
				const spectateX = buf.readFloat32();
				const spectateY = buf.readFloat32();
				if (client.type === Client.Type.PLAYER_1) {
					client.mgxn3bx.game.camera.spectatePoint = {
						x: spectateX,
						y: spectateY,
					};
				}
				client.world.spectatePos.x = spectateX;
				client.world.spectatePos.y = spectateY;
				break;
			case 32:
				if (client.world.player.myCellIDS.size === 0) {
					client.mgxn3bx.game.ogario.spawn(client.type);
					client.world.player.topMass = 0;
				}
				client.world.player.myCellIDS.add(buf.readUInt32());
				client.world.player.state = Player.State.ALIVE;
				break;
			case 53:
			case 54:
				if (client.type === Client.Type.PLAYER_1) {
					opCode === 54 ? buf.readUInt16() : void (0);
					this.leaderboardUpdate(client, buf);
				}
				break;
			case 64:
				if (!client.world.border) {
					this.borderUpdate(client, buf);
				}
				break;
			case 69:
				const count = buf.readUInt16();
				for (let i = 0; i < count; i++) {
					const ghostCell = new World.GhostCell(i);
					ghostCell.position = {
						x: buf.readInt32(),
						y: buf.readInt32(),
					};
					ghostCell.mass = buf.readUInt32();
					ghostCell.size = ~~Math.sqrt(100 * ghostCell.mass);
					buf.readUInt8();
					client.world.ghostCells.set(i, ghostCell);
				}
				break;
			case 85:
				if (client.type === Client.Type.PLAYER_1) {
					Recaptcha.oldRecaptcha(client);
				} else if (client.type === Client.Type.PLAYER_2) {
					Recaptcha.oldRecaptcha2(client);
				}
				break;
			case 102:
				client.world.account.readMobileData(buf.dataView);
				break;
			case 103:
				PacketEncoder.freeCoins(client);
				break;
			case 128:
				console.log("[MGxN3Bx] Kicked from server.");
				break;

			case 241:
				client.socket.decryptionKey = buf.readUInt32();
				client.socket.encryptionKey = this.generateEncryptKey(client.mgxn3bx.url, new Uint8Array(buf.dataView.buffer, buf.index));
				if (client.type === Client.Type.SPECTATE) {
					PacketEncoder.sendSpectate(client);
				}
				break;
			case 242:
				if (client.type === Client.Type.PLAYER_1) {
					client.mgxn3bx.master.login.sendTab1();
				} else if (client.type === Client.Type.PLAYER_2) {
					client.mgxn3bx.master.login.sendTab2();
				}
				break;
			case 255:
				buf.decompress();
				this.decode(client, buf.dataView.buffer);
				break;

		}

	}

	private static leaderboardUpdate(client: Client, buf: Reader) {
		client.world.leaderBoard.list.clear();
		let place = 0;
		for (; place++ , !buf.endOfBuffer();) {
			const flags = buf.readUInt8();
			let account: number = null;
			let nick: string = "unnamed cell";
			let isMe: boolean = false;
			let isFriend: boolean = false;
			1 & flags ? place = buf.readUInt16() : void (0);
			2 & flags ? nick = buf.readEscapedUTF8string() : void (0);
			4 & flags ? account = buf.readUInt32() : void (0);
			8 & flags ? isMe = true : void (0);
			16 & flags ? isFriend = true : void (0);
			isMe === true ? nick = client.world.player.nick : void (0);
			client.world.leaderBoard.list.set(place, { place, nick, isMe, isFriend, account });
		}
		client.world.leaderBoard.update(client);
	}

	private static borderUpdate(client: Client, buf: Reader) {
		const left = buf.readFloat64();
		const top = buf.readFloat64();
		const right = buf.readFloat64();
		const bottom = buf.readFloat64();

		if (client.world.border) {
			return;
		}
		const width = (right - left) | 0;
		const height = (bottom - top) | 0;

		client.world.border = { left, top, right, bottom, width, height };

		const centerX = right + left >> 1;
		const centerY = bottom + top >> 1;

		const offsetX = 7071 + left;
		const offsetY = 7071 + top;
		client.world.offset = { x: offsetX, y: offsetY };
		client.world.center = { x: centerX, y: centerY };
		if (client.type === Client.Type.PLAYER_1) {
			client.mgxn3bx.game.camera.spectatePoint.x = client.world.spectatePos.x = client.mgxn3bx.game.camera.x = centerX;
			client.mgxn3bx.game.camera.spectatePoint.y = client.world.spectatePos.y = client.mgxn3bx.game.camera.y = centerY;
			client.world.focusedAtCenter = true;
			client.mgxn3bx.renderer.positionBorder();
		}

	}

	private static worldUpdate(client: Client, buf: Reader) {

		let eatLength = buf.readUInt16();
		for (; eatLength--;) {
			const eater = client.world.cells.get(buf.readUInt32());
			const victim = client.world.cells.get(buf.readUInt32());
			client.world.eatCell(victim, eater, client);
		}
		for (; ;) {
			const id = buf.readUInt32();
			if (id === 0) { break; }
			const cell = client.world.getOrCreate(id, client);
			cell.fadeStartTime = null;
			cell.x = buf.readInt32();
			cell.y = buf.readInt32();
			cell.setSize(buf.readUInt16());

			const flags = buf.readUInt8();
			const flags2 = flags & 128 ? buf.readUInt8() : 0; // Flags 2 present?

			flags & 1 ? cell.type = Cell.Type.VIRUS : void 0; // Is virus?
			flags & 2 ? cell.setColor(buf.readUInt8(), buf.readUInt8(), buf.readUInt8()) : void 0; // Has color?
			flags & 4 ? cell.setSkin(buf.readUTF8string()) : void 0; // Has skin ?
			flags & 8 ? cell.setNick(buf.readEscapedUTF8string()) : void 0; // Has nick?
			flags & 16 ? void 0 : void 0; // Is agitated?
			flags & 32 ? cell.type = Cell.Type.EJECTED : void 0; // Is ejected?
			flags & 64 ? void 0 : void 0; // Is own ejected?

			flags2 & 1 ? cell.type = Cell.Type.FOOD : void 0; // Is food?
			flags2 & 2 ? void 0 : void 0; // Is Friend?
			flags2 & 4 ? buf.readUInt32() : void 0; // Has account?

			if (cell.type !== Cell.Type.EJECTED && cell.type !== Cell.Type.VIRUS && cell.type !== Cell.Type.FOOD) {
				cell.type = Cell.Type.PLAYER; // Must be player
			}
			if (client.world.player.myCellIDS.has(cell.id)) {
				if (client.world.player.myCells.size === 0) {
					if (client.mgxn3bx.options.settings.obj.circleOnSpawn) {
						client.mgxn3bx.renderer.drawCommander(cell.x, cell.y, client.type);
					}
				}
				cell.isMe = true;
				cell.customSkin = client.world.player.skin;
				cell.setNick(client.world.player.nick);
				client.mgxn3bx.game.ogario.setColor(cell.color.hex, client.type);
				client.world.player.myCells.set(cell.id, cell);
			}
			client.world.cells.set(cell.id, cell);
		}

		let deleteLength = buf.readUInt16();
		for (; deleteLength--;) {
			const id = buf.readUInt32();
			client.world.removeCell(client.world.cells.get(id), client);
		}

		if (client.world.cellOffset.x === 0 && client.world.cellOffset.y === 0 && client.mgxn3bx.clients.has(Client.Type.PLAYER_1)) {
			if (client.type !== Client.Type.PLAYER_1 && client.world.offset) {
				const PLAYER1: Client = client.mgxn3bx.clients.get(Client.Type.PLAYER_1);
				if (PLAYER1.world.offset) {
					client.world.cellOffset = {
						x: (client.world.offset.x - PLAYER1.world.offset.x),
						y: (client.world.offset.y - PLAYER1.world.offset.y),
					};
				}
			}
		}
		if (client.type === Client.Type.PLAYER_1 || client.type === Client.Type.PLAYER_2 || client.type === Client.Type.SPECTATE) {
			client.world.viewBounds = this.getmxmy([...client.world.cells.values()]);
		}
	}

	private static getmxmy(arr: any): any {
		if (!arr.length) {
			return {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			};
		}
		const bigX = arr.slice();
		const bigY = arr.slice();

		bigX.sort((a: Cell, b: Cell) => a.x - b.x);
		bigY.sort((a: Cell, b: Cell) => a.y - b.y);

		return {
			left: bigX[0].x,
			top: bigY[0].y,

			right: bigX[bigX.length - 1].x,
			bottom: bigY[bigY.length - 1].y,
		};
	}

	private static generateEncryptKey(socketUrl: string, arr: Uint8Array) {
		if (!socketUrl.length || !arr.byteLength) {
			return null;
		}
		let key = null;
		const suggestedValue = 1540483477;
		const constraints = socketUrl.match(/(wss+:\/\/)([^:]*)(:\d+)/)[2];
		const framesize = constraints.length + arr.byteLength;
		const data = new Uint8Array(framesize);
		let value = 0;
		for (; value < constraints.length; value++) {
			data[value] = constraints.charCodeAt(value);
		}
		data.set(arr, constraints.length);
		const view = new DataView(data.buffer);
		let maxTextureAvailableSpace = framesize - 1;
		const type = (maxTextureAvailableSpace - 4 & -4) + 4 | 0;
		let imulkeyValue = maxTextureAvailableSpace ^ 255;
		let offset = 0;
		for (; maxTextureAvailableSpace > 3;) {
			key = Math.imul(view.getInt32(offset, true), suggestedValue) | 0;
			imulkeyValue = (Math.imul(key >>> 24 ^ key, suggestedValue) | 0) ^ (Math.imul(imulkeyValue, suggestedValue) | 0);
			maxTextureAvailableSpace = maxTextureAvailableSpace - 4;
			offset = offset + 4;
		}
		switch (maxTextureAvailableSpace) {
			case 3:
				imulkeyValue = data[type + 2] << 16 ^ imulkeyValue;
				imulkeyValue = data[type + 1] << 8 ^ imulkeyValue;
				break;
			case 2:
				imulkeyValue = data[type + 1] << 8 ^ imulkeyValue;
				break;
			case 1:
				break;
			default:
				key = imulkeyValue;
				break;
		}
		if (key !== imulkeyValue) {
			key = Math.imul(data[type] ^ imulkeyValue, suggestedValue) | 0;
		}
		imulkeyValue = key >>> 13;
		key = imulkeyValue ^ key;
		key = Math.imul(key, suggestedValue) | 0;
		imulkeyValue = key >>> 15;
		key = imulkeyValue ^ key;
		return key;
	}

}
