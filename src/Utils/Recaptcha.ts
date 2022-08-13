import { Client } from "../Client";

declare var grecaptcha: any;
declare var $: any;

export class Recaptcha {

	public static recaptchaWidget: any = null;
	public static recaptchaWidgetOLD: any = null;
	public static recaptchaWidgetOLD2: any = null;

	public static oldRecaptcha(client: Client): void {
		$("#Recaptcha-container").fadeIn(450);
		if (this.recaptchaWidgetOLD !== null) {
			grecaptcha.reset(this.recaptchaWidgetOLD);
		} else {
			this.recaptchaWidgetOLD = grecaptcha.render("Recaptcha", {
				"sitekey": "6LfjUBcUAAAAAF6y2yIZHgHIOO5Y3cU5osS2gbMl",
				"data-theme": "dark",
				"callback": (packet: any) => {
					$("#Recaptcha-container").fadeOut(450);
					grecaptcha.reset(this.recaptchaWidgetOLD);
					const view = new DataView(new ArrayBuffer(2 + packet.length));
					view.setUint8(0, 86);
					for (let i = 0; i < packet.length; i++) {
						view.setUint8(1 + i, packet.charCodeAt(i));
					}
					view.setUint8(packet.length + 1, 0), client.socket.send(view.buffer);

				},
			});
		}
	}
	public static oldRecaptcha2(client: Client): void {
		$("#Recaptcha2-container").fadeIn(450);
		if (this.recaptchaWidgetOLD2 !== null) {
			grecaptcha.reset(this.recaptchaWidgetOLD2);
		} else {
			this.recaptchaWidgetOLD2 = grecaptcha.render("Recaptcha2", {
				sitekey: "6LfjUBcUAAAAAF6y2yIZHgHIOO5Y3cU5osS2gbMl",
				callback: (packet: any) => {
					$("#Recaptcha2-container").fadeOut(450);
					grecaptcha.reset(this.recaptchaWidgetOLD2);
					const view = new DataView(new ArrayBuffer(2 + packet.length));
					view.setUint8(0, 86);
					for (let i = 0; i < packet.length; i++) {
						view.setUint8(1 + i, packet.charCodeAt(i));
					}
					view.setUint8(packet.length + 1, 0), client.socket.send(view.buffer);

				},
			});
		}
	}

	public static getToken(callback: (token: string) => void) {
		if (this.recaptchaWidget === null) {
			this.recaptchaWidget = grecaptcha.render(document.getElementById("recaptchaV3-screen"), {
				sitekey: "6LcEt74UAAAAAIc_T6dWpsRufGCvvau5Fd7_G1tY",
				badge: "inline",
				size: "invisible",
			});
		}
		$("#recaptchaV3-screen").fadeIn(450);
		grecaptcha.execute(this.recaptchaWidget, {
			action: "play",
		}).then((token: string) => {
			callback(token);
			$("#recaptchaV3-screen").fadeOut(450);
		});
	}

}
