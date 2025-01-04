import WallabagPlugin from 'main';
import { Command, Notice } from 'obsidian';

export default class ClearSyncedArticlesCacheCommand implements Command {
  id = 'clear-synced-articles-cache';
  name = 'Clear synced articles cache';

  private plugin: WallabagPlugin;

  constructor(plugin: WallabagPlugin) {
    this.plugin = plugin;
  }

  async callback() {
    const notice = new Notice('Clearing synced articles cache.');
    this.plugin.settings.syncedArticles = '[]';
    await this.plugin.saveSettings();
    notice.hide();
    new Notice('Synced articles cache is cleared.');
  }
}
