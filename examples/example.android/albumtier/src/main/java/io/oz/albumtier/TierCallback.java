package io.oz.albumtier;

import io.oz.album.client.AlbumClientier;

@FunctionalInterface
public interface TierCallback {
    void ok(AlbumClientier tier);
}
