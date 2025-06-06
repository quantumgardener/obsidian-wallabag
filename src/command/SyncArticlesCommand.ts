import WallabagPlugin from 'main';
import NoteTemplate, { DefaultTemplate, PDFTemplate } from 'note/NoteTemplate';
import { Command, Notice, sanitizeHTMLToDom, normalizePath } from 'obsidian';
import { WallabagArticle } from 'wallabag/WallabagAPI';

export default class SyncArticlesCommand implements Command {
  id = 'sync-articles';
  name = 'Sync Wallabag Articles';

  private plugin: WallabagPlugin;
  private syncedFilePath: string;

  constructor(plugin: WallabagPlugin) {
    this.plugin = plugin;
    this.syncedFilePath = `${this.plugin.manifest.dir}/.synced`;
  }

  private async readSynced(): Promise<number[]> {
    // Force a reading of the settings file again. It will have been read when the plugin
    // first loaded. But the sync of data.json from Obsidian sync is likely to occur after that.
    await this.plugin.loadSettings();
    let syncedArticles = JSON.parse(this.plugin.settings.syncedArticles);

    // Check if the old file containing a list of synced article IDs still exists. We need to integrate
    // it into the new plugin settings value and clean up.
    const exists = await this.plugin.app.vault.adapter.exists(this.syncedFilePath);
    if (exists) {
      // Read the contents of the file. The form is [id,id,id,...]
      console.log(`[Wallabag] ${this.syncedFilePath} found. Embedding into data.json and deleting.`);
      const previouslySynced = await this.plugin.app.vault.adapter.read(this.syncedFilePath).then(JSON.parse);

      // Add each id from the old file to the current list of synced articles. Use a set to ensure uniqueness
      const uniqueids = new Set(syncedArticles);
      previouslySynced.forEach((id:string) => {
        uniqueids.add(id);
      });
      syncedArticles = Array.from(uniqueids); //convert Set back to Array

      // Remove the file as it is no longer required
      await this.plugin.app.vault.adapter.remove(normalizePath(this.syncedFilePath));
    }
    return syncedArticles;
  }

  private async writeSynced(ids: number[]): Promise<void> {
    this.plugin.settings.syncedArticles = JSON.stringify(ids);
    return await this.plugin.saveSettings();
  }

  private async getUserTemplate(): Promise<NoteTemplate> {
    try {
      const template = await this.plugin.app.vault.adapter.read(`${this.plugin.settings.articleTemplate}.md`);
      return new NoteTemplate(template);
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      throw new Error(`Error reading file: ${error.message}`);
    }
  }

  private getFolder(wallabagArticle: WallabagArticle): string {
    if (wallabagArticle.isArchived && this.plugin.settings.archivedFolder !== '') {
      return this.plugin.settings.archivedFolder;
    } else if (!wallabagArticle.isArchived && this.plugin.settings.unreadFolder !== '') {
      return this.plugin.settings.unreadFolder;
    } else {
      return this.plugin.settings.folder;
    }
  }

  private getFilename(wallabagArticle: WallabagArticle): string {
    const filename = wallabagArticle.title.replaceAll(/[\\,#%&{}/*<>$"@.?]/g, ' ').replaceAll(/[:|]/g, ' ');
    if (this.plugin.settings.idInTitle === 'true') {
      return `${filename}-${wallabagArticle.id}`;
    } else {
      return filename;
    }
  }

  private async createNoteIfNotExists(filename: string, content: string) {
    const exists = await this.plugin.app.vault.adapter.exists(filename);
    if (exists) {
      new Notice(`File ${filename} already exists. Skipping..`);
    } else {
      this.plugin.app.vault.create(filename, content);
    }
  }

  async callback() {
    if (!this.plugin.authenticated) {
      new Notice('Please authenticate with Wallabag first.');
      return;
    } else if (this.plugin.settings.syncUnRead === 'false' && this.plugin.settings.syncArchived === 'false') {
      new Notice('Please select at least one type of article to sync.');
      return;
    }

    const previouslySynced = await this.readSynced();

    const fetchNotice = new Notice('Syncing from Wallabag..');

    const articles = await this.plugin.api.fetchArticles(
      this.plugin.settings.syncUnRead === 'true' ? true : false,
      this.plugin.settings.syncArchived === 'true' ? true : false
    );
    const newIds = await Promise.all(
      articles
        .filter((article) => !previouslySynced.contains(article.id))
        .map(async (article) => {
          const folder = this.getFolder(article);
          if (this.plugin.settings.downloadAsPDF !== 'true') {
            try {
              const template = this.plugin.settings.articleTemplate === '' ? DefaultTemplate : await this.getUserTemplate();
              const filename = normalizePath(`${folder}/${this.getFilename(article)}.md`);
              const content = template.fill(
                article,
                this.plugin.settings.serverUrl,
                this.plugin.settings.convertHtmlToMarkdown,
                this.plugin.settings.tagFormat
              );
              await this.createNoteIfNotExists(filename, content);
            } catch (error) {
              new Notice('Sync failed.\n\nTemplate can not be found. Check filename and folder. Do not include ".md" at end of filename.', 3000);
              throw new Error('');
            }
          } else {
            const pdfFilename = normalizePath(`${this.plugin.settings.pdfFolder}/${this.getFilename(article)}.pdf`);
            const pdf = await this.plugin.api.exportArticle(article.id);
            await this.plugin.app.vault.adapter.writeBinary(pdfFilename, pdf);
            if (this.plugin.settings.createPDFNote) {
              try {
                const template = this.plugin.settings.articleTemplate === '' ? PDFTemplate : await this.getUserTemplate();
                const filename = normalizePath(`${folder}/${this.getFilename(article)}.md`);
                const content = template.fill(article, this.plugin.settings.serverUrl, this.plugin.settings.tagFormat, pdfFilename);
                await this.createNoteIfNotExists(filename, content);
              } catch (error) {
                new Notice('Sync failed.\n\nTemplate can not be found. Check filename and folder. Do not include ".md" at end of filename.', 3000);
                throw new Error('');
              }
            }
          }
          if (this.plugin.settings.archiveAfterSync === 'true') {
            await this.plugin.api.archiveArticle(article.id);
          }
          return article.id;
        })
    );
    await this.writeSynced([...newIds, ...previouslySynced]);
    fetchNotice.setMessage(sanitizeHTMLToDom(`Sync from Wallabag is now completed. <br> ${newIds.length} new article(s) has been synced.`));
  }
}
