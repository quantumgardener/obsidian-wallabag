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
    const notice = new Notice('Delete article from Wallabag.');
    const currentNote = this.plugin.app.workspace.getActiveFile();
    if (currentNote instanceof TFile) {
      // Get Wallabag ID from frontmatter in file.
      const cmeta = this.plugin.app.metadataCache.getFileCache(currentNote);
      const wallabagIDFieldName = this.plugin.settings.wallabagIDFieldName;
      let wallabag_id = parseFrontMatterEntry(cmeta?.frontmatter, wallabagIDFieldName);
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

      try {
        await this.plugin.api.deleteArticle(wallabag_id);
        new Notice('Article has been deleted from Wallabag');
        await removeSyncedArticle(wallabag_id, this.plugin);
        const wallabagURLFieldName = this.plugin.settings.wallabagURLFieldName;
        this.plugin.app.fileManager.processFrontMatter(currentNote, (frontmatter) => {
          delete frontmatter[wallabagIDFieldName];
          delete frontmatter[wallabagURLFieldName];
        });
      } catch (err) {
        console.log(err);
        new Notice(`Article was not deleted. Could not find article ${wallabag_id}`, 5000);
      }

    } else {
      new Notice('Error: Current item is not a note.');
    }
    notice.hide();
  }
}
