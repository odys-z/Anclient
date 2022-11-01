package io.oz.albumtier;

import io.odysz.jclient.tier.Semantier;

/**
 * @author odys-z@github.com
 */
@FunctionalInterface
public interface TierCallback {
    void ok(Semantier tier);
}
