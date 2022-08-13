export class NickText {
	public nick: string;
	public text: PIXI.Text;
	public texture: PIXI.Texture;

	private size: number = 96;

	public constructor(nick: string, app: PIXI.Application) {
		this.nick = nick;
		this.newText(app);
	}

	private newText(app: PIXI.Application) {
		const style = new PIXI.TextStyle({
			fontFamily: "Google Sans",
			fontWeight: "bold",
			fontSize: this.size,
			fill: "#ffffff",
			/*stroke: "#000",
			strokeThickness: this.size / 8,*/
		});
		const text = new PIXI.Text(this.nick, style);
		text.anchor.set(0.5);
		this.text = text;
		const rtA = PIXI.RenderTexture.create({
			width: this.size * 2,
			height: this.size * 2,
		});
		app.renderer.render(text, rtA, false);
		this.texture = text.texture;
	}
}
