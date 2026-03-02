import WallabagPlugin from 'main';
import { Command, Notice, parseFrontMatterEntry, TFile } from 'obsidian';
import { removeSyncedArticle } from './utils';


export default class DeleteWallabagArticleCommand implements Command {
  id = 'delete-article-from-wallabag';
  name = 'Delete article from Wallabag';

  private plugin: WallabagPlugin;

  constructor(plugin: WallabagPlugin) {
    this.plugin = plugin;
  }

  async callback() {
    const notice = new Notice('The selected article will be deleted.');
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
        new Notice('The article has been deleted from wallabag.');
        await removeSyncedArticle(wallabag_id, this.plugin);
        const wallabagURLFieldName = this.plugin.settings.wallabagURLFieldName;
        void this.plugin.app.fileManager.processFrontMatter(currentNote, (frontmatter) => {
          delete frontmatter[wallabagIDFieldName];
          delete frontmatter[wallabagURLFieldName];
        });
      } catch (err) {
        console.error(err);
        new Notice(`The article was not deleted as I could not find article ${wallabag_id}`, 5000);
      }

    } else {
      new Notice('The currently selected item is not a note.');
    }
    notice.hide();
  }
}
