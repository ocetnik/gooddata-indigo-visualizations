# Indigo Visualizations in React
> Visualization library for GoodData visualizations built using React.js and HighCharts

## Development

This repository uses [Storybook for React](https://github.com/storybooks/storybook/tree/master/app/react)

* Run `yarn storybook` and see the examples

## Testing

### Unit tests

* Run `yarn test`

### Screenshots tests

This repository uses [Gemini](https://github.com/gemini-testing/gemini)

* Run screenshots tests only on CI to ensure the same environment (platform, browser, display pixel density, etc.)
* To run screenshots tests you should type `extended test - gemini` into GitHub PR comment
* The link to CI html report appears in GitHub PR comment
* If you want to change some reference screenshot:
    * download new reference screenshot from CI html report
    * replace old reference screenshot in `./gemini/screens/` repository folder with new one
    * commit changes

#### Local screenshot tests

_Runnning gemini locally is optional. Both commands `yarn storybook` and `yarn build-storybook` work with gemini installed in node_modules folder thanks to `package.json`._

Build storybook

    yarn build-storybook

Run tests

    ./test-gemini.sh

_Be aware that local screenshots look differently than CI screenshots. See above for more info._

To cleanup files after finishing tests run

    rm -rf gemini/reports dist-storybook

## Release

  1. Switch to master branch `git checkout master`
  2. Synchronize from upstream `git tag -l | xargs git tag -d; git fetch upstream; git reset --hard upstream/master`
  3. Create new version `npm version [major|minor|patch] -m "Release v%s"`
  4. Release `npm publish --access=restricted`
  5. Push to upstream `git push --tags upstream master`

## Contributing
Report bugs and features on our [issues page](https://github.com/gooddata/gooddata-indigo-visualizations/issues).

## License
Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-indigo-visualizations/blob/master/LICENSE)
