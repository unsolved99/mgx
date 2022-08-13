import { Client } from "../Client";
import { Cell } from "../World/Cell/Cell";
import { Renderer } from "./Renderer";
import { MassText } from "./Sprites/MassText";
import { Viewport } from "./Viewport";

export class Cells {

	public static draw(renderer: Renderer) {
		const cli = renderer.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const cli2 = renderer.mgxn3bx.clients.get(Client.Type.PLAYER_2);
		const spectate = renderer.mgxn3bx.clients.get(Client.Type.SPECTATE);
		if (!cli) {
			return;
		}
		const cells: Cell[] = [];

		renderer.mgxn3bx.clients.forEach((client) => {
			cells.push(...client.world.sortedCells);
		});

		cells.forEach((cell: Cell) => {
			const delay = renderer.mgxn3bx.options.sliders.obj.animationDelay;
			cell.animate();
			const visible = Viewport.checkViewport(cell, renderer.mgxn3bx);
			const alpha = cell.fadeStartTime ? Math.max(1 - (renderer.mgxn3bx.time - cell.fadeStartTime) / delay, 0.01) : 1;
			if (cell.cellRender.destroyed === false) {
				if (cell.cellRender.containers.circle === null) {
					renderer.cells.addChild(cell.cellRender.initialRender(renderer));
					if (cell.type === Cell.Type.PLAYER) {
						this.drawText(cell, renderer);
					}
				}
				cell.cellRender.update(renderer, alpha, visible);

				cell.cellRender.containers.circle.zIndex = cell.animRadius;
			}
		});

	}

	public static drawText(cell: Cell, renderer: Renderer): void {
		if (cell.cellRender.destroyed === false) {
			cell.client.mgxn3bx.options.settings.obj.massText ? this.drawMass(cell, renderer) : void (0);
			cell.client.mgxn3bx.options.settings.obj.nickText ? this.drawNick(cell, renderer) : void (0);
		}
	}

	public static drawMass(cell: Cell, renderer: Renderer): void {
		if (!cell.cellRender.massText) {
			cell.cellRender.massText = new MassText(Math.round(Math.pow(cell.animRadius / 10, 2)));
		}
		const massText = cell.cellRender.massText;

		if (massText) {
			if (cell.isMe && cell.client.mgxn3bx.options.settings.obj.hideOwnMass) {
				return;
			}
			const bitmapText = massText.text;
			const scale = (cell.initialRadius / (80 / 1)) * (32 / 10);
			let y = cell.animY;

			if (cell.client.mgxn3bx.options.settings.obj.nickText && !(cell.isMe && cell.client.mgxn3bx.options.settings.obj.hideOwnNick)) {
				y += cell.initialRadius / 3;
			}

			bitmapText.position.set(cell.animX, y);
			bitmapText.scale.set(scale);
			bitmapText.zIndex = cell.initialRadius + 1;
			cell.cellRender.sprites.mass = bitmapText;
			renderer.cells.addChild(bitmapText);
		}

	}
	public static drawNick(cell: Cell, renderer: Renderer): void {
		if (cell.cellRender.nickText) {
			if (cell.isMe && cell.client.mgxn3bx.options.settings.obj.hideOwnNick) {
				return;
			}
			const nickText = cell.cellRender.nickText;

			const scale = (cell.initialRadius / (80 / 1)) * (32 / 96);
			const sprite = new PIXI.Sprite(nickText.texture);
			sprite.position.set(cell.animX, cell.animY);
			sprite.scale.set(scale);
			sprite.anchor.set(.5);
			sprite.zIndex = cell.initialRadius + 1;
			cell.cellRender.sprites.nick = sprite;
			renderer.cells.addChild(sprite);
		}

	}

}
