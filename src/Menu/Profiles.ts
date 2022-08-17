import { Client } from "../Client";
import { Storage } from "../Utils/Storage";
import { Menu } from "./Menu";

export class Profiles {

	public static readonly group: Storage.Group = "profiles";

	public currentProfile: number;

	private menu: Menu;

	public constructor(menu: Menu) {
		this.menu = menu;
		this.currentProfile = Number(Storage.get("selected", Profiles.group)) || 1;
		this.setValues();
	}

	public getTag() {
		let profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		return profile.tag;
	}

	public get(str: string) {
		let profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		return profile[str] ? profile[str] : "";
	}

	public setValues() {
		let profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		$("#tag").val(profile.tag);
		$("#user-name-1").val(profile.nick1);
		$("#user-name-2").val(profile.nick2);
		$("#user-skin-1").val(profile.skin1);
		$("#user-skin-2").val(profile.skin2);
		$("#skin-img-1").attr("src", profile.skin1);
		$("#skin-img-2").attr("src", profile.skin2);
	}

	public switch(n: number) {
		n > 10 ? n = 1 : void (0);
		n < 1 ? n = 10 : void (0);
		this.currentProfile = n;
		let profile: Profiles.Profile = Storage.get("profile" + n, Profiles.group);
		profile || (profile = Profiles.getDefault(n));
		$("#tag").val(profile.tag);
		$("#user-name-1").val(profile.nick1);
		$("#user-name-2").val(profile.nick2);
		$("#user-skin-1").val(profile.skin1);
		$("#user-skin-2").val(profile.skin2);
		$("#skin-img-1").attr("src", profile.skin1);
		$("#skin-img-2").attr("src", profile.skin2);
		Storage.set("profile" + n, profile, Profiles.group);
		Storage.set("selected", String(n), Profiles.group);
		this.menu.app.game.ogario.setTag(profile.tag);
		this.menu.app.game.ogario.setNick(profile.nick1, Client.Type.PLAYER_1);
		this.menu.app.game.ogario.setNick(profile.nick2, Client.Type.PLAYER_2);
		this.menu.app.game.ogario.setSkin(profile.skin1, Client.Type.PLAYER_1);
		this.menu.app.game.ogario.setSkin(profile.skin2, Client.Type.PLAYER_2);
	}

	public setNick1(nick: string) {
		let profile: Profiles.Profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		profile.nick1 = nick;
		Storage.set("profile" + this.currentProfile, profile, Profiles.group);
		this.menu.app.game.ogario.setNick(nick, Client.Type.PLAYER_1);
		if (this.menu.app.clients.has(Client.Type.PLAYER_1)) {
			this.menu.app.clients.get(Client.Type.PLAYER_1).world.player.nick = nick;
		}
	}

	public setNick2(nick: string) {
		let profile: Profiles.Profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		profile.nick2 = nick;
		Storage.set("profile" + this.currentProfile, profile, Profiles.group);
		this.menu.app.game.ogario.setNick(nick, Client.Type.PLAYER_2);
		if (this.menu.app.clients.has(Client.Type.PLAYER_2)) {
			this.menu.app.clients.get(Client.Type.PLAYER_2).world.player.nick = nick;
		}
	}

	public setSkin1(skin: string) {
		let profile: Profiles.Profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		profile.skin1 = skin;
		Storage.set("profile" + this.currentProfile, profile, Profiles.group);
		this.menu.app.game.ogario.setSkin(skin, Client.Type.PLAYER_1);
		if (this.menu.app.clients.has(Client.Type.PLAYER_1)) {
			this.menu.app.clients.get(Client.Type.PLAYER_1).world.player.skin = skin;
		}
	}

	public setSkin2(skin: string) {
		let profile: Profiles.Profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		profile.skin2 = skin;
		Storage.set("profile" + this.currentProfile, profile, Profiles.group);
		this.menu.app.game.ogario.setSkin(skin, Client.Type.PLAYER_2);
		if (this.menu.app.clients.has(Client.Type.PLAYER_2)) {
			this.menu.app.clients.get(Client.Type.PLAYER_2).world.player.skin = skin;
		}
	}

	public setTag(tag: string) {
		let profile: Profiles.Profile = Storage.get("profile" + this.currentProfile, Profiles.group);
		profile || (profile = Profiles.getDefault(this.currentProfile));
		profile.tag = tag;
		Storage.set("profile" + this.currentProfile, profile, Profiles.group);
		this.menu.app.game.ogario.setTag(tag);
	}

}

export namespace Profiles {

	export interface Profile {
		nick1: string;
		nick2: string;
		skin1: string;
		skin2: string;
		tag: string;
	}

	export function getDefault(n: number): Profiles.Profile {
		return {
			nick1: "profile " + n,
			nick2: "profile " + n,
			skin1: "https://i.imgur.com/WaiqY0C.png",
			skin2: "https://i.imgur.com/6V66q6x.png",
			tag: "",
		};
	}

}
