declare var gapi: any;
declare var $: any;

import { Client } from "../../Client";
import { Chat } from "../../Menu/Chat";
import { PacketEncoder } from "../../Network/PacketEncoder";
import { Notifications } from "../../Utils/Notifications";
import { Storage } from "../../Utils/Storage";
import { Login } from "./Login";

export class Google {

	public loggedIn: boolean;
	public token: string;
	private group: Storage.Group = "extras";

	public constructor(public loginParent: Login) {
		this.loggedIn = false;
		this.token = null;
		this.checkStorage();
		gapi ? this.initGapi() : Chat.addChatMessage("", Notifications.GP_SDK_ERROR, 1);
	}

	public logOut() {
		this.token = null;
		this.loggedIn = false;
		Storage.set("googleToken", "false", this.group);
	}

	public afterLogin(res: Google.Res) {
		const token = res.id_token;
		if (token) {
			this.token = token;
			Storage.set("googleToken", JSON.stringify({
				token: this.token,
				expiry: res.expires_at,
			}), "extras");
			this.loggedIn = true;
			Chat.addChatMessage("", Notifications.GP_LOGIN_SUCCESS, 1);
			this.sendToken();
		} else {
			Chat.addChatMessage("", Notifications.GP_LOGIN_ERROR, 1);
		}
	}

	public get mgxn3bx() {
		return this.loginParent.master.mgxn3bx;
	}

	public sendToken(): void {
		const client = this.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const client2 = this.mgxn3bx.clients.get(Client.Type.PLAYER_2);

		if (this.token && /\S/.test(this.token)) {

			if (this.loginParent.sides.tab1 === "google") {
				PacketEncoder.login(client, this.token, this.mgxn3bx.info, 2);
			} else if (this.loginParent.sides.tab2 === "google") {
				PacketEncoder.login(client2, this.token, this.mgxn3bx.info, 2);
			}
		}
	}

	private initGapi() {
		const GP = gapi.auth2.init({
			client_id: this.mgxn3bx.info.EnvConfig.google_client_id,
			cookie_policy: "single_host_origin",
			scope: "https://www.googleapis.com/auth/plus.login email",
			app_package_name: "com.miniclip.agar.io",
		});
		GP.attachClickHandler(document.getElementById("google-button"), {}, (res: any) => {
			if (this.loggedIn === false) {
				this.afterLogin(res.getAuthResponse(true));
			}
		});
	}

	private checkStorage() {
		const storage = Storage.get("googleToken", this.group);
		if (storage) {
			const gpl = JSON.parse(storage);
			if (gpl.expiry > Date.now()) {
				this.token = gpl.token;
				this.loggedIn = true;
				Chat.addChatMessage("", Notifications.GP_LOGIN_SUCCESS, 1);
			}
		}
	}
}

export namespace Google {

	export interface Res {
		access_token: string;
		expires_at: number;
		token_type: string;
		scope: string;
		login_hint: string;
		expires_in: number;
		id_token: string;
		session_state: { extraQueryParams: { authuser: string } };
		first_issued_at: number;
		idpId: string;
	}

}
