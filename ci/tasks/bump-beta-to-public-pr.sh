#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

pushd deployments

cat ../beta-version/version > public-version

OLD_PUBLIC_VERSION=$(cat ../public-version/version)
NEW_PUBLIC_VERSION=$(cat public-version)

pushd ../repo
git cliff --config ../pipeline-tasks/ci/config/git-cliff-release.toml $OLD_PUBLIC_VERSION..$NEW_PUBLIC_VERSION > ../changelog
export CHANGELOG=$(cat ../changelog)
popd

BRANCH_NAME="public-$NEW_PUBLIC_VERSION"

(
  cd $(git rev-parse --show-toplevel)
  git checkout -b $BRANCH_NAME
  git add public-version
  git status
  git commit -m "release(public): v$NEW_PUBLIC_VERSION"
  git remote remove origin
  git remote add origin https://$GH_TOKEN@github.com/GaloyMoney/galoy-mobile-deployments
  git push -u origin $BRANCH_NAME --force
)


export CUSTOM_RELEASE_NOTES=$(get_custom_release_notes public $NEW_PUBLIC_VERSION open)
export CLOSES=$(get_closes public $NEW_PUBLIC_VERSION)
export TRACK="Public Track (phased release)"
export OLD_VERSION="$OLD_PUBLIC_VERSION"
export NEW_VERSION="$NEW_PUBLIC_VERSION"

envsubst < ../pipeline-tasks/ci/templates/deployments-pr-body.md > ../body.md

echo "PR Body:"
echo "----------------------------------------------------------------------"
cat ../body.md
echo "----------------------------------------------------------------------"

gh pr close ${BRANCH_NAME} || true
gh pr create \
  --title "release(public): v$NEW_PUBLIC_VERSION" \
  --body-file ../body.md \
  --base main \
  --head ${BRANCH_NAME} \
  --label galoybot \
  --label public \
  --reviewer GaloyMoney/galoy-mobile-devs
