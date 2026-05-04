## [1.0.1](https://github.com/el-j/mark-your-picture/compare/v1.0.0...v1.0.1) (2026-05-04)


### Bug Fixes

* add peer dependencies to package-lock.json for improved compatibility ([ba9b792](https://github.com/el-j/mark-your-picture/commit/ba9b792cbee1a9eacaf445e63452d50ebb0e6fb0))

# 1.0.0 (2026-05-04)


### Bug Fixes

* correct install banner translation keys (pwa.* -> install.*) ([4c7fb22](https://github.com/el-j/mark-your-picture/commit/4c7fb2258f5373a54b3d154d2d4598882f254eab))
* correct spelling of 'licence' to 'license' ([303279d](https://github.com/el-j/mark-your-picture/commit/303279db8bc3818d5bc1b4efa05e85956a5f4c3b))
* extract BANNER_DELAY_MS constant and document i18n interpolation pattern ([df5f5bc](https://github.com/el-j/mark-your-picture/commit/df5f5bc5b6fdaa2830d2d7341e0e635cd82be974))
* remove dead btnShare refs, fix XSS on filenames, extract inline styles to classes, cache dlLabel ref ([5a0a1d8](https://github.com/el-j/mark-your-picture/commit/5a0a1d8f7ba0d72f3ec3c93856363a3cac6f478c))
* scope global select/input styles to [@layer](https://github.com/layer) base and add w-auto to LangSwitcher ([6d697d2](https://github.com/el-j/mark-your-picture/commit/6d697d23e2f5a1fd9eef4b60e8a1afabecfda3c1))
* switch to HashRouter and set absolute base for GitHub Pages hosting ([5fb8911](https://github.com/el-j/mark-your-picture/commit/5fb8911a8ab2b9c61d55bdf2a0b71945323cddf4))


### Features

* add coverage reporting, E2E testing with Playwright, and PR preview deployments ([cfabb5e](https://github.com/el-j/mark-your-picture/commit/cfabb5eb41ef22c136866139bc99a0bae73d52bd))
* add Google Ads script for monetization ([903f737](https://github.com/el-j/mark-your-picture/commit/903f7377b551c8c373a7712b78dd3f6a10098547))
* add hash router and mobile-first navigation ([654c4d8](https://github.com/el-j/mark-your-picture/commit/654c4d8421a6ead14d3d13fe2bf391ae8aac51f3))
* add hash router, mobile-first nav, About and Imprint pages ([af3d144](https://github.com/el-j/mark-your-picture/commit/af3d144894fdb7f1f34a33327577c0b409cd5434))
* add new image button and implement state persistence in watermark context ([aabaf7d](https://github.com/el-j/mark-your-picture/commit/aabaf7d033b96d6c8bbc36d844fac531c8745400))
* add open-source files and full i18n (EN/DE) system ([aa96fe8](https://github.com/el-j/mark-your-picture/commit/aa96fe80d9dccf27e93c4ebb9bbb75237ee727a7))
* add PWA support — installable as app with icon set ([ec51867](https://github.com/el-j/mark-your-picture/commit/ec51867d1c7bb15119ab92ce56d53a67d1cfeb13))
* add semver release system with CI, SBOM, and version display in About ([e8310c7](https://github.com/el-j/mark-your-picture/commit/e8310c73c00f7caa9318ad850296812df17a3814))
* implement mobile-responsive bottom sheet panels and toolbar for tool configuration ([7eb097e](https://github.com/el-j/mark-your-picture/commit/7eb097e690e38ba4e19a9eba7f95c8e0fc4be129))
* language switcher dropdown, Biome linting/formatting, comprehensive tests (59 passing) ([a069fb9](https://github.com/el-j/mark-your-picture/commit/a069fb9a6c39e31093ab897735bc3f173127d097))
* preserve image format, web share API, free drag watermark, dropzone-as-preview, 2026 mobile redesign ([5442bf8](https://github.com/el-j/mark-your-picture/commit/5442bf8faafcadbf0188de1deb5ce7bf0710f8cd))
