import { Client } from "../Client";
import { Menu } from "../Menu/Menu";
import { PacketEncoder } from "../Network/PacketEncoder";
import { Player } from "../World/Player";
import { Game } from "./Game";

export class HotKeys {

	public game: Game;
	public ejectInterval: NodeJS.Timeout;
	private activeKeys: Set<number>;
	private commands: Map<number, string>;

	public constructor(game: Game) {
		this.game = game;
		this.activeKeys = new Set();
		this.commands = new Map();
		this.setCommands();
		window.addEventListener("keyup", (e: KeyboardEvent) => this.onKeyUp(e));
		window.addEventListener("keydown", (e: KeyboardEvent) => this.onKeyDown(e));
	}

	private onKeyUp(e: KeyboardEvent) {
		const hkObj = this.game.app.options.hotkeys.obj;
		if (this.activeKeys.has(e.keyCode)) {
			const key = HotKeys.getKey(e);
			switch (key) {
				case hkObj.macroFeed:
					this.macroFeed(false);
					break;
			}
			this.activeKeys.delete(e.keyCode);
		}
	}

	private onKeyDown(e: KeyboardEvent) {
		const hkObj = this.game.app.options.hotkeys.obj;
		const key = HotKeys.getKey(e);
		if (key !== "" && !this.activeKeys.has(e.keyCode)) {
			if ($("input").is(":focus") && key !== hkObj.chatInput) {
				return;
			}
			switch (key) {
				case hkObj.toggleMenu:
					if (Menu.hidden) {
						Menu.showMenu();
					} else if (!Menu.hidden) {
						Menu.hideMenu();
						this.game.ogario.joinServer(this.game.app.serverToken, String($("#party").val()));
					}
					break;
				case hkObj.chatInput:
					if ($("#chat-input").is(":focus")) {
						$("#chat-input").blur();
						this.game.ogario.sendChat(String($("#chat-input").val()));
						$("#chat-input").val("");
					} else {
						$("#chat-input").focus();
					}
					break;
				case hkObj.command1:
					this.sendCommand(1);
					break;
				case hkObj.command2:
					this.sendCommand(2);
					break;
				case hkObj.command3:
					this.sendCommand(3);
					break;
				case hkObj.command4:
					this.sendCommand(4);
					break;
				case hkObj.command5:
					this.sendCommand(5);
					break;
				case hkObj.zoom1:
					this.setZoom(0.5);
					break;
				case hkObj.zoom2:
					this.setZoom(0.25);
					break;
				case hkObj.zoom3:
					this.setZoom(0.125);
					break;
				case hkObj.zoom4:
					this.setZoom(0.075);
					break;
				case hkObj.zoom5:
					this.setZoom(0.05);
					break;
			}
			const cli = this.game.app.clients.get(Client.Type.PLAYER_1);
			const cli2 = this.game.app.clients.get(Client.Type.PLAYER_2);
			if (cli || cli2) {
				if (cli.world.player.state === Player.State.SPECTATING) {
					switch (key) {
						case hkObj.freeSpectate:
							PacketEncoder.sendFreeSpectate(this.game.app.clients.get(Client.Type.PLAYER_1));
							break;
					}
				} else if (cli.world.player.state === Player.State.ALIVE || cli2.world.player.state === Player.State.ALIVE) {
					switch (key) {
						case hkObj.split:
							this.split();
							break;
						case hkObj.macroFeed:
							this.macroFeed(true);
							break;
						case hkObj.doubleSplit:
							this.doubleSplit();
							break;
						case hkObj.maxSplit:
							this.split16();
							break;
						case hkObj.feed:
							this.feed();
							break;
						case hkObj.multiboxSwitch:
							e.preventDefault();
							this.game.multibox.switch();
							break;
					}
				}
			}
			this.activeKeys.add(e.keyCode);
		}
	}

	private setCommands() {
		this.commands.set(1, "Feed me!");
		this.commands.set(2, "Split into me!");
		this.commands.set(3, "Need a teammate!");
		this.commands.set(4, "Tank the virus!");
		this.commands.set(5, "Tricksplit!");
	}

	private feed() {
		this.game.multibox.feed();
	}

	private split() {
		this.game.multibox.split();
	}

	private macroFeed(on: boolean) {
		this.game.multibox.macroFeed(on);
	}

	private doubleSplit() {
		this.game.multibox.doubleSplit();
	}

	private split16() {
		this.game.multibox.split16();
	}

	private setZoom(zoom: number) {
		this.game.camera.targetViewport = zoom;
	}

	private sendCommand(n: number) {
		this.game.ogario.sendChat(this.commands.get(n), 102);
	}
}

export namespace HotKeys {

	export function isValidKey(evt: KeyboardEvent) {
		const code = evt.keyCode || evt.which;
		return 64 < code && 91 > code || 47 < code && 58 > code || 13 === code || 27 === code ||
			32 === code || 16 === code || 46 === code || 192 === code || 9 === code;
	}

	export function getKey(evt: KeyboardEvent): string {
		if (!HotKeys.isValidKey(evt)) { return ""; }
		const code = evt.keyCode || evt.which;
		let prefix: any = !1;
		let specialKey: any = !1;
		return evt.ctrlKey ? prefix = "CTRL+" : evt.altKey && (prefix = "ALT+"), 64 < code && 91 > code ? specialKey = String.fromCharCode(code) :
			47 < code && 58 > code ? specialKey = "" + (code - 48) : prefix || (13 === code ? specialKey = "ENTER" : 27 === code ? specialKey = "ESC" :
				32 === code ? specialKey = "SPACE" : 16 === code ? specialKey = "SHIFT" : 9 === code ? specialKey = "TAB" :
					46 === code ? specialKey = "DEL" : 192 === code ? specialKey = "TILDE" : void 0), !!specialKey && (prefix ? prefix + specialKey : specialKey);
	}

}
