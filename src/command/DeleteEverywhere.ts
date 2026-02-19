import WallabagPlugin from 'main';
import { Command, Notice, parseFrontMatterEntry, TFile } from 'obsidian';
import { removeSyncedArticle } from './utils';


export default class DeleteEverywhereCommand implements Command {
  id = 'delete-article-and-note';
  name = 'Delete note and article';

  private plugin: WallabagPlugin;

  constructor(plugin: WallabagPlugin) {
    this.plugin = plugin;
  }

  async callback() {
    const notice = new Notice('Delete note and article.');
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
        new Notice(`The ${wallabagIDFieldName} in this note's frontmatter isn't a valid number.`);
        notice.hide();
        return;
      }

      try {
        await this.plugin.api.deleteArticle(wallabag_id);
        new Notice('The article has been deleted from Wallabag.');
        await removeSyncedArticle(wallabag_id, this.plugin);
        await this.plugin.app.fileManager.trashFile(currentNote);
        new Notice('Note is deleted from Obsidian');
      } catch (err) {
        console.error(err);
        new Notice(`Article was not deleted. Could not find article ${wallabag_id}`, 5000);
      }

    } else {
      new Notice('The currently selected item is not a note.');
    }
    notice.hide();
  }
}
