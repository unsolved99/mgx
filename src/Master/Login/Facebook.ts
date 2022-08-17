import { Client } from "../../Client";
import { Chat } from "../../Menu/Chat";
import { PacketEncoder } from "../../Network/PacketEncoder";
import { Notifications } from "../../Utils/Notifications";
import { Storage } from "../../Utils/Storage";
import { Login } from "./Login";

declare var FB: any;
declare var $: any;

export class Facebook {

	public loggedIn: boolean;
	public token: string;

	private group: Storage.Group = "extras";

	public constructor(public loginParent: Login) {
		this.loggedIn = false;
		this.token = null;
		this.checkStorage();
		FB ? FB.init({
			appId: this.mgxn3bx.info.EnvConfig.fb_app_id,
			cookie: !0,
			xfbml: !0,
			status: !0,
			version: "v2.0",
		}) : Chat.addChatMessage("", Notifications.FB_SDK_ERROR, 1);
	}

	public login() {
		FB ? FB.login((res: Facebook.Res) => {
			this.afterLogin(res);
		}, {
			scope: "public_profile, email",
		}) : Chat.addChatMessage("", Notifications.FB_SDK_ERROR, 1);

	}

	public logOut() {
		this.token = null;
		this.loggedIn = false;
		Storage.set("fbToken", "false", this.group);
	}

	public sendToken(): void {
		const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const client2 = this.mgxn3bx.clients.get(Client.Type.PLAYER_2);
		if (this.token && /\S/.test(this.token)) {
			if (this.loginParent.sides.tab1 === "facebook") {
				PacketEncoder.login(client, this.token, this.mgxn3bx.info, 2);
			} else if (this.loginParent.sides.tab2 === "facebook") {
				PacketEncoder.login(client2, this.token, this.mgxn3bx.info, 2);
			}
		}
	}

	private afterLogin(res: Facebook.Res) {
		if (res.authResponse) {
			this.token = res.authResponse.accessToken;
			Storage.set("fbToken", JSON.stringify({
				token: this.token,
				expiry: Date.now() + 1e3 * res.authResponse.expiresIn,
			}), this.group);
			this.loggedIn = true;
			Chat.addChatMessage("", Notifications.FB_LOGIN_SUCCESS, 1);
			this.sendToken();
		} else {
			Chat.addChatMessage("", Notifications.FB_LOGIN_ERROR, 1);
		}
	}

	private checkStorage() {
		const storage = Storage.get("fbToken", this.group);
		if (storage) {
			const fbl = JSON.parse(storage);
			if (fbl.expiry > Date.now()) {
				this.token = fbl.token;
				this.loggedIn = true;
				Chat.addChatMessage("", Notifications.FB_LOGIN_SUCCESS, 1);
			}
		}
	}

	private get mgxn3bx() {
		return this.loginParent.master.app;
	}

}

export namespace Facebook {

	export interface AuthResponse {
		accessToken: string;
		userID: string;
		expiresIn: number;
		signedRequest: string;
		graphDomain: string;
		data_access_expiration_time: number;
	}

	export interface Res {
		authResponse: Facebook.AuthResponse;
		status: string;
	}

}
