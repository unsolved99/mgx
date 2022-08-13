import { Defaults } from "../Utils/Defaults";

export class Chat {

	public static addChatMessage(author: string, message: string, type: number) {
		const icon = type === 1 ? "extension" : "face";
		type === 1 ? author = Defaults.title : void (0);

		const html = `<div style="display: none" class="chat-message">
			<div class="chat-icon">
			<i class="material-icons">${icon}</i>
			</div>
			<div class="chat-user">
			<div class="chat-user-name">${author}</div>
			<div class="chat-user-message">${message}</div>
			</div>
		</div>`;
		const el = $(html);
		$("#chat-messages").append(el);
		el.fadeIn(450);
		el.delay(3500).fadeOut(450, () => {
			el.remove();
		});
	}

}
