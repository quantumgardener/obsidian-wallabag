import WallabagPlugin from 'main';
import { Command, Notice, parseFrontMatterEntry, TFile } from 'obsidian';

export default class DeleteNoteAndRemoveFromSyncedCacheCommand implements Command {
  id = 'delete-and-remove-from-synced-articles-cache';
  name = 'Delete note and remove it from synced articles cache';

  private plugin: WallabagPlugin;

  constructor(plugin: WallabagPlugin) {
    this.plugin = plugin;
  }

  async callback() {
    const notice = new Notice('Delete note and remove it from synced articles cache.');
    const currentNote = this.plugin.app.workspace.getActiveFile();
    if (currentNote instanceof TFile) {
      // Get Wallabag ID from frontmatter in file.
      const cmeta = this.plugin.app.metadataCache.getFileCache(currentNote);
      let wallabag_id = parseFrontMatterEntry(cmeta?.frontmatter, 'wallabag_id');
      if (wallabag_id === null) {
        new Notice('Error: Wallabag ID not found in frontmatter. Please see plugin docs.');
        notice.hide();
        return;
      }
      wallabag_id = Number(wallabag_id);
      if (isNaN(wallabag_id) || wallabag_id === 0) {
        new Notice('Error: Wallabag ID frontmatter doesn\'t seem to be a valid number.');
        notice.hide();
        return;
      }

      // Remove current ID from .synced file.
      const syncedIds = JSON.parse(this.plugin.settings.syncedArticles);
      syncedIds.forEach((item: number, index: number) => {
        if (item === wallabag_id) {
          syncedIds.splice(index, 1);
        }
      });
      this.plugin.settings.syncedArticles = JSON.stringify(syncedIds);
      await this.plugin.saveSettings();
      await this.plugin.app.vault.trash(currentNote, false);
      new Notice('Note is moved to trash and removed from synced articles cache.');
    } else {
      new Notice('Error: Current item is not a note.');
    }
    notice.hide();
  }
}
