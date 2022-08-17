import { application } from "../Init";
import { Login } from "./Login/Login";

export class Master {

	public app: application;
	public login: Login;

	public constructor(app: application) {
		this.app = app;
		this.login = new Login(this);
	}

}
