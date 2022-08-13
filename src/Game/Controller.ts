import { Game } from "./Game";

export class Controller {
	public game: Game;

	public constructor(game: Game) {
		this.game = game;
		this.init();
	}

	private init() {
		window.addEventListener("gamepadconnected", (e) => {
			console.log(e);
		});
	}

}
