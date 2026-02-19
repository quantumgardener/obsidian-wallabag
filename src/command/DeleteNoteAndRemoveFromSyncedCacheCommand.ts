import WallabagPlugin from 'main';
import { Command, Notice, parseFrontMatterEntry, TFile } from 'obsidian';
import { removeSyncedArticle } from './utils';


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
      const wallabagIDFieldName = this.plugin.settings.wallabagIDFieldName;
      let wallabag_id = parseFrontMatterEntry(cmeta?.frontmatter, wallabagIDFieldName);
      if (wallabag_id === null) {
        new Notice(`The ${wallabagIDFieldName} in this note's frontmatter is missing.`);
        notice.hide();
        return;
      }
      wallabag_id = Number(wallabag_id);
      if (isNaN(wallabag_id) || wallabag_id === 0) {
        new Notice(`The ${wallabagIDFieldName} in this note's frontmatter is missing.`);
        notice.hide();
        return;
      }

      await removeSyncedArticle(wallabag_id, this.plugin);

      await this.plugin.app.fileManager.trashFile(currentNote);
      new Notice('Note is moved to trash and removed from synced articles cache.');
    } else {
      new Notice('The currently selected item is not a note.');
    }
    notice.hide();
  }
}
