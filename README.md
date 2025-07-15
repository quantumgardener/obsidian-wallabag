# Obsidian Wallabag Plugin

This plugin for [Obsidian](https://obsidian.md) allows you to sync [Wallabag](https://www.wallabag.it/en) items into Obsidian notes in various ways.

The original developer of this plugin, [Huseyin Zengin](https://github.com/huseyz), archived the project on 7 February 2025. Several people, having seen that I contributed code asked if I was interested in picking up the project. For the sake of continuing it running, and having access to the plugin myself, I'm doing some **minimal** work on the project for now. Thank you to Huseyin Zengin and the other earlier contributors for the work done to date.

> **Please note**
> 
> Please understand that when I don't have the time to read all the articles I have saved myself, let alone process them in [Obsidian](https://obsidian.md), it's difficult to find time to code. I will only be making the changes I feel are necessary. Pull requests etc. will be ignored. If you have changes, please fork into your own instance.

## Authentication

After installing and enabling the plugin first you need to authenticate yourself with your Wallabag instance.

You can follow the Wallabag's [iOS Setup guide](https://doc.wallabag.org/en/apps/ios.html) for obtaining the client attributes.
## Usage

This plugin fulfills a quite straightforward purpose; it syncs Wallabag articles and creates notes from them in various possible formats.

Use the command "Sync Wallabag Articles" to sync new articles. Plugin will keep a track of items synced so if you delete a created note, it won't be generated again unless you use the command "Clear synced articles cache" to reset the plugin cache. There is also a "Delete note and remove it from synced articles cache" command to remove an individual note from both the file system and synced article cache. This is useful to fetch any changes you made to the note in Wallabag (such as tags and annotations).

There are various settings under the plugin settings you can use to personalize your workflow, here are some important ones:

| Setting                                                | Decsription                                                                                                         |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| Tag to sync                                            | Use this for syncing only the articles tagged with tag. If empty plugin will sync all the articles.                 |
| Article Notes Folder                                   | Define the folder you want synced notes will be created. If empty notes will be created at the vault root.          |
| Article Note Template                                  | Use to pass a custom template for notes. See the [Templating](#templating) for more details.                        |
| Sync on startup                                        | If enabled, articles will be synced on startup.                                                                     |
| Sync unread articles                                   | If enabled, unread articles will be synced.                                                                         |
| Wallabag unread article notes folder location          | (optional) Choose the location where the unread synced article notes will be created.                               |
| Sync archived articles                                 | If enabled, archived articles will be synced.                                                                       |
| Wallabag archived article notes folder location        | (optional) Choose the location where the archived synced article notes will be created.                             |
| Export as PDF                                          | If enabled synced articles will be exported as PDFs.                                                                |
| Convert HTML Content extracted by Wallabag to Markdown | If enabled the content of the Wallabag article will be converted to markdown before being used for the new article. |
| Archive article after sync                             | If enabled the article will be archived after being synced.                                                         |
| Add article ID in the title                            | If enabled the article ID will be added to title.                                                                   |
| Tag format                                             | Determines how the tags will be populated in the created not. CSV(tag1, tag2) or hashtags(#tag1 #tag2)              |
| Link Published By                                      | Determines if author names will be bracketed by `[[ ]]` and become Properties that will link to a note.              |

## Templating

By default this plugin offers two builtin templates; one for inserting the content of the article as a note and one for creating a note with a link to the exported PDF, when the option is enabled. Both the templates include link to the original articles, a link to the Wallabag item and tags. See the example below:

![](screenshots/ss1.png)

You can use a custom template, in that case plugin will pass the following variables. Within your template, surround each variable with `{{` and `}}`.
| Variable | Description |
|:----------------|:-------------------------------------------------------------------------------------------------------------------|
| `id` | Wallabag ID of the article <sub><br>Add this to your notes frontmatter properties using the `wallabag_id` key to make use of the 'Delete note and remove it from synced articles cache' command. The key defaults to `wallabag_id` but you can choose something else consistent with your property naming standard.</sub> |
| `article_title` | Title of the article |
| `original_link` | Link to the source article |
| `given_url` | Given link to the source page |
| `created_at` | Creation date of the article in Wallabag |
| `published_at` | When the article was originally published according to Wallabag |
| `updated_at` | Last modification date of the article in Wallabag RemoveCurrentFromSyncedArticlesCacheCommand |
| `wallabag_link` | Link to the article in Wallabag |
| `content` | HTML content extracted by wallabag |
| `pdf_link` | An Obsidian wikilink to the exported pdf file. <sub><br> Only populated if the PDF export option is choosen.</sub> |
| `tags` | Tags attached to the Wallabag article, format depends on the setting |
| `reading_time` | Reading time of the article |
| `preview_picture` | link to preview picture of the article |
| `domain_name` | Link to the source domain article |
| `is_archived` | Whether the article is archived or not |
| `is_starred` | Whether the article is starred or not |
| `published_by` or `authors`| Display publishers/authors on a single line. |
| `published_by_list` or `authors_list` | Display publishers/authors as a list. |

### Article title and punctuation
Property values with `'`, `:` or `?` will confuse Obsidian's parsing of the YAML at the top of a note. Since titles often contain these characters you can avoid problems by wrapping your `article_title` with quotes.

```
---
title: "{{article_title}}"
---
```

### Annotating PDFs

You can use the `pdf_link` tag with this plugin to export articles as pdfs and use [Annotator](https://github.com/elias-sundqvist/obsidian-annotator) to read using the following template.

```
---
annotation-target: {{pdf_link}}
---
```

### Difference between *published_by* and *published_by_list*
`published_by` will display all authors on a single line and `published_by_list` displays them as a list. The list format is more suitable for links from the Properties panel when paired with the `Link Published By` setting.

If your template is:

```
---
author: {{published_by}}
---
```

your note will show:

```
---
author: Stephen King, Brandon Sanderson
---
```

Compare this to the list version and note how the template field is on the next line.

```
---
author:
{{published_by_list}}
---
```

which generates

```
---
author:
  - Stephen King
  - Brandon Sanderson
---
```

The list format is best paired with `Link Published By` **enabled** to provide you with clickable links in the Properties tab.

```
---
author:
  - "[[Stephen King]]"
  - "[[Brandon Sanderson]]"
---
```



![](screenshots/ss2.png)

## Installation

### Within Obsidian
Search for `Wallabag` in the list of Community Plugins and install as you would any other plugin.

### Manually

- You need Obsidian v1.0.0+ for latest version of plugin.
- Get the [Latest release of the plugin](https://github.com/huseyz/obsidian-wallabag/releases/latest).
- Create a directory for the plugin under you plugins folder, e.g. `[VAULT]/.obsidian/plugins/obsidian-wallabag`.
- Put the release files under that folder.
- Reload Obsidian.
- Make sure Safe Mode is off and the plugins is enabled.

## Development

### Workflow

- `npm install`.
- `npm run build`.
- Copy `main.js` and `manifest.json` (if changed) to your obsidian vault's plugin folder (e.g. `[VAULT]/.obsidian/plugins/obsidian-wallabag`).
- Disable and re-enable the plugin in Obsidian's settings to reload it.

### State

Relative to `[VAULT]/.obsidian/plugins/obsidian-wallabag`:

- `data.json`: List of all id's that have already been downloaded plus other configuration items. Syncs via [Obisidan Sync](https://obsidian.md/sync) if sync is enabled.
- `.__wallabag_token__`: Authentication credentials for Wallabag.
