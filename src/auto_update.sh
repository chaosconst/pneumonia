#!/bin/bash
git pull
python3 ./src/legacy_fetch_data.py
python3 ./src/pts_city_detail.py
yarn install
yarn webpack
cp ./docs/* ../chaosconst.github.io/pneumonia/
cd ../chaosconst.github.io/
git commit -am "update data"
git push

