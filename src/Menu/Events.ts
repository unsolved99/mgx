import { Client } from "../Client";
import { MGxN3Bx } from "../Init";
import { Request } from "../Master/Request";
import { PacketEncoder } from "../Network/PacketEncoder";
import { Chat } from "./Chat";
import { Menu } from "./Menu";

export class Events {

	private menu: Menu;

	public constructor(menu: Menu) {
		this.menu = menu;
	}

	public init() {
		this.onChange();
		this.onClick();
	}

	private onChange(): void {
		$("#user-skin-1").change(() => {
			let img = String($("#user-skin-1").val());
			if (img === "") { img = "https://i.imgur.com/WaiqY0C.png", $("#user-skin-1").val(img); }
			$("#skin-img-1").attr("src", img);
			this.menu.profiles.setSkin1(img);
		});
		$("#user-skin-2").change(() => {
			let img = String($("#user-skin-2").val());
			if (img === "") { img = "https://i.imgur.com/6V66q6x.png", $("#user-skin-2").val(img); }
			$("#skin-img-2").attr("src", img);
			this.menu.profiles.setSkin2(img);
		});

		$("#user-name-1").change(() => {
			const nick = String($("#user-name-1").val());
			this.menu.profiles.setNick1(nick);
		});

		$("#user-name-2").change(() => {
			const nick = String($("#user-name-2").val());
			this.menu.profiles.setNick2(nick);
		});

		$("#tag").change(() => {
			const tag = String($("#tag").val());
			this.menu.profiles.setTag(tag);
		});

		$("#audioInput").change(() => {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (typeof reader.result === "string") {
					this.menu.mgxn3bx.renderer.spectrum.loadSong(reader.result);
				}
			};
			const file = (document.getElementById("audioInput") as HTMLInputElement).files[0];
			Chat.addChatMessage("", `Now playing: ${file.name}`, 1);
			Chat.addChatMessage("", `Size: ${(file.size / 1000000).toFixed(2)}mb`, 1);
			reader.readAsDataURL(file);
		});

	}

	private onClick(): void {

		$("#profile-right").click(() => {
			this.menu.profiles.switch(this.menu.profiles.currentProfile + 1);
		});
		$("#profile-left").click(() => {
			this.menu.profiles.switch(this.menu.profiles.currentProfile - 1);
		});

		$("#GODMODE-switch").click(() => {
			this.menu.mgxn3bx.toggleFullMap();
		});

		$("#load-url-button").click(() => {
			const src = $("#audioVisualiserURL").val();
			this.menu.mgxn3bx.renderer.spectrum.loadSong(String(src));
			Chat.addChatMessage("", `Now playing: ${src}`, 1);
		});

		$("#play-pause-button").click(() => {
			const audio = this.menu.mgxn3bx.renderer.spectrum.audio;
			const paused = audio.paused;
			if (paused) {
				audio.play();
				$("#play-pause-button").html(`<i class="material-icons">pause</i>`);
			} else if (!paused) {
				audio.pause();
				$("#play-pause-button").html(`<i class="material-icons">play_arrow</i>`);
			}
		});
		$("#load-button").click(() => {
			$("#audioInput").click();
		});

		// tslint:disable-next-line: only-arrow-functions
		$(".audio-track").click((e) => {
			const width = e.pageX - $(".audio-track").offset().left;
			const factor = (width / $(".audio-track").width());
			const audio = this.menu.mgxn3bx.renderer.spectrum.audio;
			audio.currentTime = audio.duration * factor;
		});

		$("#spectate-button").click(() => {
			Menu.hideMenu();
			if (this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_1)) {
				PacketEncoder.sendSpectate((this.menu.mgxn3bx.clients.get(Client.Type.PLAYER_1)));
			}
			this.menu.mgxn3bx.game.ogario.joinServer(this.menu.mgxn3bx.serverToken, String($("#party").val()));
		});
		$("#play-button").click(() => {
			Menu.hideMenu();
			if (this.menu.mgxn3bx.clients.has(Client.Type.PLAYER_1)) {
				const nick = $("#user-name-1").val();
				this.menu.mgxn3bx.spawn(1, String(nick));
			}
			this.menu.mgxn3bx.game.ogario.joinServer(this.menu.mgxn3bx.serverToken, String($("#party").val()));
		});
		$("#settings-button").click(() => {
			Menu.openSettingsMenu();
		});
		$("#hotkeys-button").click(() => {
			Menu.openHotkeysMenu();
		});
		$("#theme-button").click(() => {
			Menu.openThemeMenu();
		});
		$(".options-panel-close-button").click(() => {
			Menu.closeOptionsMenu();
		});

		$("#region2").hide();

		$("#gamemode").click(() => {
			const gamemode = $("#gamemode").val();
			if (gamemode === ":party") { 
				$("#region").show();
				$("#region2").hide(); 
			}
			if (gamemode === ":private") { 
				$("#region2").show(); 
				$("#region").hide(); 
			}
		});

		$("#create").click(() => {
			const region = $("#region").val();
			const region2 = $("#region2").val();
			const gamemode = $("#gamemode").val();

			if (gamemode === ":party") {
				Request.getServer(String(region), String(gamemode), this.menu.mgxn3bx.info, (res: any) => {
					let token = res.endpoints.https;
					token = res.token;
					$("#party").val(token);
					this.menu.mgxn3bx.connect(`wss://${res.endpoints.https}`);
					location.hash = token;
				});
			 };

			 if (gamemode === ":private") { 
				this.menu.mgxn3bx.connect(`${region2}`);
			 };

		});

		$("#join").click(() => {

			const region = $("#region").val();
			const region2 = $("#region2").val();
			const token = $("#party").val();
			const gamemode = $("#gamemode").val();
			if (gamemode === ":party") {
				Request.joinParty(String(region), String(token), this.menu.mgxn3bx.info, (res: any) => {
					this.menu.mgxn3bx.connect(`wss://${res.endpoints.https}`);
					location.hash = String(token);
				});
			};
			if (gamemode === ":private") { 
				// Will later fix to translate token to wss
				//this.menu.mgxn3bx.connect(`${region2}`);
			};

		});
		$("#send-button").click(() => {

		});

		$("#facebook-button").click(() => {
			if (this.menu.mgxn3bx.master.login.facebook.loggedIn === false) {
				this.menu.mgxn3bx.master.login.facebook.login();
			}
		});
	}

}
