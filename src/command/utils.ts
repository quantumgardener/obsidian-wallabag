import WallabagPlugin from 'main';

export async function removeSyncedArticle(wallabag_id: number, plugin: WallabagPlugin): Promise<void> {
  const syncedIds = JSON.parse(plugin.settings.syncedArticles);
  const filteredIds = syncedIds.filter((id: number) => id !== wallabag_id);
  plugin.settings.syncedArticles = JSON.stringify(filteredIds);
  await plugin.saveSettings();
}