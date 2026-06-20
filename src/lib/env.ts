/**
 * Whether we're running in a development build. The production bundle
 * (`build.ts`) hard-defines `process.env.NODE_ENV` to `"production"`; the dev
 * server (`bun --hot`) leaves it as `"development"`. Dev-only tooling gates on
 * this so it never ships in the built game.
 */
export const IS_DEV = process.env.NODE_ENV !== "production";
