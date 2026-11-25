/**
 * Side-effect imports of stylesheets, e.g. import 'react-responsive-carousel/lib/styles/carousel.min.css'.
 * Webpack loads the CSS; this only tells TypeScript (noUncheckedSideEffectImports,
 * on by default since TS 6) that such modules exist. Copied from album-web's src/css.d.ts.
 *
 * Referenced by the sources importing a stylesheet (/// <reference path=...>), so that it comes
 * with them into an app compiling anreact's sources, e.g. album-web, semantic-doc.
 */
declare module '*.css';
