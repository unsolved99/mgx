export class MassText {

	public mass: number;
	public text: PIXI.BitmapText;

	public constructor(mass: number) {
		this.mass = mass;
		this.newText();
	}

	public newText() {
		const bitmapText = new PIXI.BitmapText(String(this.mass),
			{
				font: {
					name: "Google Sans",
					size: 10,
				},
				align: "center",
				tint: 0xffffff,
			});
		bitmapText.anchor = new PIXI.Point(0.5, 0.5);
		this.text = bitmapText;
	}

}
