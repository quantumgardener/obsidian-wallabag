# Obsidian Wallabag Plugin

This plugin for [Obsidian](https://obsidian.md) allows you to sync [Wallabag](https://www.wallabag.it/en) items into Obsidian notes in various ways.

Read the [full documentation](https://quantumgardener.info/notes/obsidian-wallabag-(plugin))

>[!note] 
>
> Important details:
>
> There is a note template file provided that provides a wide range of Properties metadata for synced articles.
> 
> The sync process from Wallabag can take a few minutes. If your Wallabag account has a lot saved, (both read and unread) this will also mean a lot of notes filling your vault.


> [!tip]
>
>  KNOWN ISSUES:
>
> Many blogs and articles use a colon in their titles. When passed to the 'title' property in the metadata, this will cause an error for the metadata section entirely. The colon will need to be removed for the metadata in that article note to be usable.
> 
> To quickly find files experiencing this error, create an Obsidian Base with the columns: file name, Title, and a Formula column that uses title.isEmpty() in the formula box. This will give you a table that you can sort according to those articles where the title property is 'empty' because it is experiencing this error.