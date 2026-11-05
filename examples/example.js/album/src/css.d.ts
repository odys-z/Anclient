/**
 * Side-effect imports of stylesheets, e.g. import 'katex/dist/katex.min.css'.
 * Webpack loads the CSS; this only tells TypeScript (noUncheckedSideEffectImports,
 * on by default since TS 6) that such modules exist.
 */
declare module '*.css';
