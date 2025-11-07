import WallabagPlugin from 'main';
import { WallabagArticle } from 'wallabag/WallabagAPI';
import { htmlToMarkdown } from 'obsidian';

export default class NoteTemplate {
  content: string;
  plugin: WallabagPlugin;

  constructor(content: string, plugin:WallabagPlugin) {
    this.content = content;
    this.plugin = plugin;
  }

  fill(wallabagArticle: WallabagArticle, serverBaseUrl: string, convertHtmlToMarkdown: string, tagFormat: string, pdfLink = ''): string {
    const content = wallabagArticle.content !== null ? wallabagArticle.content : '';
    let annotations = '';
    const single_annotation_marker = this.plugin.settings.single_annotation_marker;
    annotations = wallabagArticle.annotations.map((a) => '> ' + a.quote + (a.text ? '\n\n' + a.text : '') + (single_annotation_marker ? ' ' + single_annotation_marker : '')).join('\n\n');
    if (wallabagArticle.annotations.length > 0) {
      annotations = `${annotations}\n\n${this.plugin.settings.all_annotations_marker}`;
    }

    let publishedBy = '';
    let publishedByList = '';
    try {
      publishedBy = wallabagArticle.publishedBy // string property
        .filter(pb => pb !== '') // Filter out unknown or unspecified authors
        .map(pb => this.plugin.settings.linkPublishedBy === 'true' ? `"[[${pb}]]"` : `${pb}`)
        .join(',');
    } catch (error) {
      publishedBy = '';
    }
    try {
      publishedByList = wallabagArticle.publishedBy // list property
        .filter(pb => pb !== '') // Filter out unknown or unspecified authors
        .map(pb => this.plugin.settings.linkPublishedBy === 'true' ? `  - "[[${pb}]]"` : `  - ${pb}`)
        .join('\n');
    } catch (error) {
      publishedByList = '';
    }
    const variables: { [key: string]: string } = {
      '{{id}}': wallabagArticle.id.toString(),
      '{{article_title}}': wallabagArticle.title,
      '{{original_link}}': wallabagArticle.url,
      '{{given_url}}': wallabagArticle.givenUrl,
      '{{created_at}}': wallabagArticle.createdAt,
      '{{published_at}}': wallabagArticle.publishedAt,
      '{{updated_at}}': wallabagArticle.updatedAt,
      '{{wallabag_link}}': `${serverBaseUrl}/view/${wallabagArticle.id}`,
      '{{content}}': convertHtmlToMarkdown === 'true' ? htmlToMarkdown(content) : content,
      '{{pdf_link}}': pdfLink,
      '{{tags}}': this.formatTags(wallabagArticle.tags, tagFormat),
      '{{reading_time}}': wallabagArticle.readingTime,
      '{{preview_picture}}': wallabagArticle.previewPicture,
      '{{domain_name}}': wallabagArticle.domainName,
      '{{annotations}}': annotations,
      '{{is_archived}}': wallabagArticle.isArchived ? 'true' : 'false',
      '{{is_starred}}': wallabagArticle.isStarred ? 'true' : 'false',
      '{{published_by}}': publishedBy,
      '{{published_by_list}}' : publishedByList,
      '{{authors}}' : publishedBy,
      '{{authors_list}}' : publishedByList
    };
    let noteContent = this.content;
    Object.keys(variables).forEach((key) => {
      noteContent = noteContent.replaceAll(key, variables[key]);
    });
    return noteContent;
  }

  private formatTags(tags: string[], tagFormat: string): string {
    switch (tagFormat) {
    case 'list':
      return tags.map((tag) => `\n  - ${tag}`).join(' ');
    case 'csv':
      return tags.join(', ');
    case 'hashtag':
      return tags.map((tag) => `#${tag}`).join(' ');
    default:
      return '';
    }
  }
}

export function DefaultTemplate(plugin: WallabagPlugin): NoteTemplate {
  return new NoteTemplate(
    '---\nwallabag_id: {{id}}\ntags: {{tags}}\n---\n ## {{article_title}} [original]({{original_link}}), [wallabag]({{wallabag_link}})\n{{content}}',
    plugin
  );
}
export function PDFTemplate(plugin: WallabagPlugin): NoteTemplate {
  return new NoteTemplate(
    '---\nwallabag_id: {{id}}\ntags: {{tags}}\n---\n ## {{article_title}} [original]({{original_link}}), [wallabag]({{wallabag_link}})\nPDF: [[{{pdf_link}}]]',
    plugin
  );
}