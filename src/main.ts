import { Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {
	lineCountEl: HTMLElement | null;
	spanEl: HTMLSpanElement | null;

	async onload() {
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const lineCountEl = this.addStatusBarItem();
		const spanEl = lineCountEl.createEl("span", {text: "0 lines"})
		this.updateLineCount();

		this.lineCountEl = lineCountEl;
		this.spanEl = spanEl;

		this.registerEvent(this.app.workspace.on("active-leaf-change", async () => {
			const file = this.app.workspace.getActiveFile()
			if (file) {
				const contents = await this.app.vault.read(file)
				await this.updateLineCount(contents);
			}
		}));

		this.registerEvent(this.app.workspace.on("editor-change", async (editor) => {
			const contents = editor.getDoc().getValue()
			await this.updateLineCount(contents)
		}))
	}

	private async updateLineCount(fileContents?: string) {
		 if (fileContents) {
			const linesCount = fileContents.split(/\r\n|\r|\n/).length | 0;
			// new Notice(`${linesCount} line${linesCount > 1 ? "s" : ""}`);
			if (this.spanEl) {
				this.spanEl.textContent = `${linesCount} line${linesCount > 1 ? "s" : ""}`;
			}
		} else {
			if (this.spanEl) {
				this.spanEl.textContent = "";
			}
		}
	}

	onunload() {
		if (this.lineCountEl) {
			this.lineCountEl.innerHTML = ""
		}
	}
}
