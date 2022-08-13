import { MGxN3Bx } from "../Init";
import { Login } from "./Login/Login";

export class Master {

	public mgxn3bx: MGxN3Bx;
	public login: Login;

	public constructor(mgxn3bx: MGxN3Bx) {
		this.mgxn3bx = mgxn3bx;
		this.login = new Login(this);
	}

}
