#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

if [[ $(version_part_from_build_url_apk $(cat ./built-prod-apk/url)) != $(version_part_from_build_url_ipa $(cat ./built-prod-ipa/url)) ]]; then
  echo "Version mismatch, one of the upload tasks must be running!"
  exit 1
fi

pushd deployments

cat ../version_part_from_build_url_ipa $(cat ../built-prod-ipa/url) > beta-version

OLD_BETA_VERSION=$(cat ../beta-version/version)
NEW_BETA_VERSION=$(cat beta-version)

pushd ../repo
cp ./app/graphql/generated.gql ../deployments/deployed-versions/v${NEW_BETA_VERSION}-$(cat .git/short_ref).gql
git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $OLD_BETA_VERSION..$NEW_BETA_VERSION > ../changelog
export CHANGELOG=$(cat ../changelog)
popd

BRANCH_NAME="beta-$NEW_BETA_VERSION"

(
  cd $(git rev-parse --show-toplevel)
  git checkout -b $BRANCH_NAME
  git add beta-version
  git add deployed-versions
  git status
  git commit -m "release(beta): v$NEW_BETA_VERSION"
  git remote remove origin
  git remote add origin https://$GH_TOKEN@github.com/GaloyMoney/galoy-mobile-deployments
  git push -u origin $BRANCH_NAME --force
)

export CUSTOM_RELEASE_NOTES=$(get_custom_release_notes beta $NEW_BETA_VERSION open)
export CLOSES=$(get_closes beta $NEW_BETA_VERSION)
export TRACK="Beta Track"
export OLD_VERSION="$OLD_BETA_VERSION"
export NEW_VERSION="$NEW_BETA_VERSION"

envsubst < ../pipeline-tasks/ci/templates/deployments-pr-body.md > ../body.md

echo "PR Body:"
echo "----------------------------------------------------------------------"
cat ../body.md
echo "----------------------------------------------------------------------"

gh pr close ${BRANCH_NAME} || true
gh pr create \
  --title "release(beta): v$NEW_BETA_VERSION" \
  --body-file ../body.md \
  --base main \
  --head ${BRANCH_NAME} \
  --label galoybot \
  --label beta \
  --reviewer GaloyMoney/galoy-mobile-devs
