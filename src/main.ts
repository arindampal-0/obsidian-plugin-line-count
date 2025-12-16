import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	lineCountEl: HTMLElement | null;
	spanEl: HTMLSpanElement | null;

	async onload() {
		// await this.loadSettings();

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

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
