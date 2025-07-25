export interface WallabagSettings {
  serverUrl: string;
  tag: string;
  folder: string;
  downloadAsPDF: string;
  articleTemplate: string;
  pdfFolder: string;
  createPDFNote: string;
  convertHtmlToMarkdown: string;
  idInTitle: string;
  archiveAfterSync: string;
  syncOnStartup: string;
  syncArchived: string;
  syncUnRead: string;
  tagFormat: string;
  unreadFolder: string;
  archivedFolder: string;
  syncedArticles: string;
  linkPublishedBy: string;
  wallabagIDFieldName: string;
 wallabagURLFieldName: string;
}

export const DEFAULT_SETTINGS: WallabagSettings = {
  serverUrl: 'https://app.wallabag.it',
  tag: '',
  folder: '',
  downloadAsPDF: 'false',
  articleTemplate: '',
  pdfFolder: '',
  createPDFNote: 'false',
  convertHtmlToMarkdown: 'false',
  idInTitle: 'false',
  archiveAfterSync: 'false',
  syncOnStartup: 'false',
  syncArchived: 'false',
  syncUnRead: 'true',
  tagFormat: 'csv',
  unreadFolder: '',
  archivedFolder: '',
  syncedArticles: '[]',
  linkPublishedBy: 'true',
  wallabagIDFieldName: 'wallabag_id',
  wallabagURLFieldName: 'wallabag_url'
};
