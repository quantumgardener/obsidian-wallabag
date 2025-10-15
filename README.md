# Obsidian Wallabag Plugin

This plugin for [Obsidian](https://obsidian.md) allows you to sync [Wallabag](https://www.wallabag.it/en) items into Obsidian notes in various ways. It works with the official [hosted Wallabag environment](https://wallabag.it/), or your self-hosted version. The plugin is hosted at https://github.com/quantumgardener/obsidian-wallabag.


>[!note] Note
>
> There is a note template file provided that provides a wide range of Properties metadata for synced articles.
> 
> The sync process from Wallabag can take a few minutes. If your Wallabag account has a lot saved, (both read and unread) this will also mean a lot of notes filling your vault.


> [!tip] Known Issues
>
> Many blogs and articles use a colon in their titles. When passed to the 'title' property in the metadata, this will cause an error for the metadata section entirely. The colon will need to be removed for the metadata in that article note to be usable.
> 
> To quickly find files experiencing this error, create an Obsidian Base with the columns: file name, Title, and a Formula column that uses title.isEmpty() in the formula box. This will give you a table that you can sort according to those articles where the title property is 'empty' because it is experiencing this error.

## Getting started

To get started with this plugin you will need to:

1. Install the plugin
2. Authenticate to your Wallabag server
3. Make some decisions about how you want to control the sync of articles

## 1. Installation

### Within Obsidian

~~Search for `Wallabag` in the list of Community Plugins and install as you would any of the [Community plugins](https://help.obsidian.md/community-plugins).~~

Awaiting community plugin approval.

### Manually

- You need Obsidian v1.0.0+ for latest version of plugin.
- Get the [Latest release of the plugin](https://github.com/huseyz/obsidian-wallabag/releases/latest).
- Create a directory for the plugin under you plugins folder, e.g. `[VAULT]/.obsidian/plugins/obsidian-wallabag`.
- Put the release files under that folder.
- Close and reopen [[Obsidian]].
- Make sure Safe Mode is off and the plugins is enabled.

## 2. Authentication

After installing and enabling the plugin first you need to authenticate yourself with your [[Wallabag]] instance. Authentication requires:

- `Client ID`
- `Client secret`
- `Your login username`
- `Your password`

The `Client ID` and `Client secret` come from your server account. Wallabag's [iOS Setup guide](https://doc.wallabag.org/en/apps/ios.html) will show you how. The process are the same for iOS or the desktop.

## 3. Setup and use

This plugin fulfills a quite straightforward purpose; it syncs [[Wallabag]] articles and creates notes from them in various possible formats.

Use the command "Sync Wallabag Articles" to sync new articles (ribbon icon, Ctrl-P (Windows) or Command-P (Mac)). This is the command that you will use most of the time. When you run it, the plugin:

- Connects to your Wallabag server
- Downloads all new articles and formats them using your template

The plugin keeps track of items synced so if you delete a created note, it won't be generated again unless you use the command "Clear synced articles cache" to reset the plugin cache. There is also a "Delete note and remove it from synced articles cache" command to remove an individual note from both the file system and synced article cache. This is useful to fetch any changes you made to the note in Wallabag (such as tags and annotations). More on commands below.

### Settings

There are various settings under the plugin settings you can use to personalize your workflow, here are some important ones:

| Setting                                                | Description                                                                                                                                                     | Default                                                                |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| Tag to sync                                            | Use this for syncing only the articles tagged with tag. If empty plugin will sync all the articles.                                                             | Blank, ignore tags as a sync filter.                                   |
| Article Notes Folder                                   | Select the folder you want synced notes will be created. notes will be created at the vault root.                                                               | Blank, save notes in root of your vault.                               |
| Article Note Template                                  | Use to pass a custom template for notes. See the [Templating](#templating) for more details.                                                                    |                                                                        |
| Sync on startup                                        | If enabled, articles will be synced on startup.                                                                                                                 | Disabled. Manually sync.                                               |
| Sync unread articles                                   | If enabled, unread articles will be synced.                                                                                                                     | True, all unread articles will be synced.                              |
| Wallabag unread article notes folder location          | Choose the location different from the `Article Notes Folder` where the unread synced article notes will be created.                                            | Blank, save in the `Article Notes Folder`.                             |
| Sync archived articles                                 | If enabled, archived articles will be synced.                                                                                                                   | False, no archived articles will be synced.                            |
| Wallabag archived article notes folder location        | Choose the location different from the `Article Notes Folder` where the archived synced article notes will be created.                                          | Blank, save in the `Article                                            |
| Export as PDF                                          | If enabled synced articles will be exported as PDFs.                                                                                                            | Disabled.                                                              |
| Convert HTML Content extracted by Wallabag to Markdown | If enabled the content of the Wallabag article will be converted to markdown before being used for the new article.                                             | Disabled.                                                              |
| Archive article after sync                             | If enabled the article will be archived after being synced.                                                                                                     | False. Articles are not moved to Wallabag's archive folder after sync. |
| Add article ID in the title                            | If enabled the article ID will be added to title.                                                                                                               | False.                                                                 |
| Tag format                                             | Determines how the tags will be populated in the created not. List(`each tag on a separate line as tag properties`)(default), CSV(`tag1, tag2`) or hashtags(`#tag1`)                                                            |                                                                        |
| Link Published By                                      | Determines if author names will be bracketed by `[[ ]]` and become Properties that will link to a note.                                                         | True                                                                   |
| Wallabag ID Property                                   | Allow you to specify the name of the Obsidian property where you are storing the article ID (See id in [Templating](#templating)).                              | wallabag_id                                                            |
| Wallabag URL Property                                  | Allow you to specify the name of the Obsidian property where you are storing a link to the Wallabag article (See `wallabag_link` in [Templating](#templating)). | wallabag_url                                                           |

### Templating

Templating defines how the Wallabag article displays as an Obsidian note. 

By default this plugin offers two builtin templates; one for inserting the content of the article as a note and one for creating a note with a link to the exported PDF, when the option is enabled. Both the templates include link to the original articles, a link to the Wallabag item and tags. 

#### Default note template

```
---
wallabag_id: {{id}}
tags: {{tags}}
---
## {{article_title}} [original]({{original_link}}), [wallabag]({{wallabag_link}})
{{content}}
```

This template displays any tags you have configured in the setup, the article title as a level 2 heading, with links to both the original article and Wallabag copy, followed by the content of the article itself.

#### Default PDF template

```
---
wallabag_id: {{id}}
tags: {{tags}}
---
## {{article_title}} [original]({{original_link}}), [wallabag]({{wallabag_link}})
PDF: [[{{pdf_link}}]]
```

The default PDF template is almost identical to the [[#Default note template]] except it has a link to the downloaded PDF instead of embedding the article content in the note.

#### Custom templates

You can use a custom template for greater control over your Obsidian note layout. Each of the variables listed below can occur anywhere in your template file, even more than once. The template is nothing more than a dedicated Markdown note in your Obsidian vault. For it to be used, you will need to set `Article Note Template` (see [[#Settings]] above).

You can use a custom template, in that case plugin will pass the following variables. Within your template, surround each variable with `{{` and `}}`, eg. `{{id}}` or `{{content}}`.

| Variable            | Description                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| `id`                | Wallabag ID of the article (see [[#ID is a special variable]])                                                     |
| `article_title`     | Title of the article                                                                                               |
| `authors`           | Display publishers/authors on a single line.                                                                       |
| `authors_list`      | Display publishers/authors as a list. Both options are the same.                                                   |
| `content`           | HTML content extracted by wallabag                                                                                 |
| `created_at`        | Creation date of the article in Wallabag                                                                           |
| `domain_name`       | Link to the source domain article                                                                                  |
| `given_url`         | Given link to the source page                                                                                      |
| `is_archived`       | Whether the article is archived or not                                                                             |
| `is_starred`        | Whether the article is starred or not                                                                              |
| `original_link`     | Link to the source article                                                                                         |
| `pdf_link`          | An Obsidian wikilink to the exported pdf file. <sub><br> Only populated if the PDF export option is choosen.</sub> |
| `preview_picture`   | link to preview picture of the article                                                                             |
| `published_at`      | When the article was originally published according to Wallabag                                                    |
| `published_by`      | Alternative to `authors`. Same result.                                                                             |
| `published_by_list` | Alternative to `authors_list`. Same result.                                                                        |
| `reading_time`      | Reading time of the article                                                                                        |
| `tags`              | Tags attached to the Wallabag article, format depends on the setting                                               |
| `updated_at`        | Last modification date of the article in Wallabag RemoveCurrentFromSyncedArticlesCacheCommand                      |
| `wallabag_link`     | Link to the article in Wallabag                                                                                    |

##### ID is a special variable

If you want to make use of any of the additional plugin [[#Commands]], you **must** have `{{id}}` in your template as an Obsidian property. The ID makes the connection between the Wallabag article and your Obsidian note.

Once synced, `https://app.wallabag.it/view/27659680` is linked to an Obsidian note with the same value.

```
---
wallabag_id: 27659680
---
```

> [!TIP] You're not stuck with `wallabag_id`
> The  `Wallabag ID Property` allows you to store your ID in a field called something different than `wallabag_id`. It allows you to have a property name consistent with your own naming conventions.

##### Article title and punctuation

Property values with `'`, `:` or `?` will confuse Obsidian's parsing of the YAML at the top of a note. Since titles often contain these characters you can avoid problems by wrapping your `article_title` with quotes.

```
---
title: "{{article_title}}"
---
```

##### Annotating PDFs

You can use the `pdf_link` tag with this plugin to export articles as pdfs and use [Annotator](https://github.com/elias-sundqvist/obsidian-annotator) to read using the following template.

```
---
annotation-target: {{pdf_link}}
---
```

##### Difference between *authors* and *authors_list*

`authors` will display all authors on a single line and `authors_list` displays them as a list. The list format is more suitable for links from the Properties panel when paired with the `Link Published By` setting.

If your template is:

```
---
author: {{authors}}
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
{{authors_list}}
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

#### Sample custom template

This is my template.

```
---
tags:
  - class/source
datetime: {{published_at}}
updated: 
title: "{{article_title}}"
author:
{{published_by_list}} 
year: 
recommender: 
url: {{given_url}}
wallabag_id: {{id}}
wallabag-link: {{wallabag_link}}
---

## Annotations

{{annotations}}

## Content

{{content}}
```

### Commands

You can give the plugin any of the following commands. All can be accessed via the Command Palette (CTRL-P (Windows) or Command-P (Mac)). 

#### Sync Wallabag Articles

This command retrieves all new articles from Wallabag and stores them according to your [[#Settings]] and [[#Templating]].

A list of previously synced files is kept so that they are not synced again.

#### Clear synced articles cache

This command clears the synced articles list. When [[#Sync Wallabag Articles]] is next run it will retrieve all your Wallabag articles as if for the first time. 

Clearing the cache is useful in the early days when you are first setting up your system and trialling new template designs.

#### Delete note and remove it from synced articles cache

This command deletes a single article and removes it from the synced articles cache. When [[#Sync Wallabag Articles]] is next run, and assuming the article is still present in your Wallabag list of articles, the article will be retrieved again.

> [!WARNING] 
> `{{id}}` must be present in your template for this command to work

#### Delete article from Wallabag

This command:

- Deletes the article from Wallabag
- Keeps your Obsidian Note
	- Removes any reference to ``wallabag_id`` and ``wallabag_url``[^1]

> [!WARNING] 
> `{{id}}` must be present in your template for this command to work

#### Delete note and article

This command:

- Deletes the article from Wallabag
- Deletes your note from Obsidian

> [!WARNING] 
> `{{id}}` must be present in your template for this command to work

## Development

### Workflow

- `npm install`.
- `npm run build`.
- Copy `main.js` and `manifest.json` (if changed) to your obsidian vault's plugin folder (e.g. `[VAULT]/.obsidian/plugins/obsidian-wallabag`).
- Disable and re-enable the plugin in Obsidian's settings to reload it.
  

### State

Relative to `[VAULT]/.obsidian/plugins/obsidian-wallabag`:

- `data.json`: List of all id's that have already been downloaded plus other configuration items. Syncs via [[Obsidian Sync]] if sync is enabled.
- `.__wallabag_token__`: Authentication credentials for Wallabag.

## Acknowledgements

The original developer of this plugin, [Huseyin Zengin](https://github.com/huseyz), archived the project on 7 February 2025. Several people, having seen that I contributed code asked if I was interested in picking up the project. For the sake of continuing it running, and having access to the plugin myself, I'm doing some **minimal** work on the project for now. Thank you to Huseyin Zengin and the other earlier contributors for the work done to date.

I have also included some code from [Liam Cain's obsidian-periodic-notes](https://github.com/liamcain/obsidian-periodic-notes) plugin

[^1]: Neither of these fields make sense once an article has been deleted from Wallabag. Re-adding the article will create a new URL.