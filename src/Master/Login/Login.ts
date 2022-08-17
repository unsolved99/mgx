import { Client } from "../../Client";
import { PacketEncoder } from "../../Network/PacketEncoder";
import { Master } from "../Master";
import { Facebook } from "./Facebook";
import { Google } from "./Google";

export class Login {

	public master: Master;

	public facebook: Facebook;
	public google: Google;
	public sides: Login.Sides;

	public constructor(master: Master) {
		this.master = master;
		this.sides = {
			tab1: "facebook",
			tab2: "google",
		};
		this.facebook = new Facebook(this);
		this.google = new Google(this);
	}

	public sendTab1() {
		const cli = this.master.app.clients.get(Client.Type.PLAYER_1);
		const info = this.master.app.info;
		switch (this.sides.tab1) {
			case "google":
				if (this.google.loggedIn) { PacketEncoder.login(cli, this.google.token, info, 4); }
				break;

			case "facebook":
				if (this.facebook.loggedIn) { PacketEncoder.login(cli, this.facebook.token, info, 2); }
				break;
		}
	}
	public sendTab2() {
		const cli = this.master.app.clients.get(Client.Type.PLAYER_2);
		const info = this.master.app.info;
		switch (this.sides.tab2) {
			case "google":
				if (this.google.loggedIn) { PacketEncoder.login(cli, this.google.token, info, 4); }
				break;

			case "facebook":
				if (this.facebook.loggedIn) { PacketEncoder.login(cli, this.facebook.token, info, 2); }
				break;
		}
	}

	public swapSides() {
		const tab1 = this.sides.tab1;
		const tab2 = this.sides.tab2;

		this.sides.tab1 = tab2;
		this.sides.tab2 = tab1;
	}

}

export namespace Login {

	export interface Sides {
		tab1: Login.Side;
		tab2: Login.Side;
	}

	export type Side = "facebook" | "google";

}
