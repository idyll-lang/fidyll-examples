#!/bin/sh

cd fast-kde/
cd output/
cd scroller/
echo "Buidling kde scroller"
idyll build
cd ../static
echo "Buidling kde static"
idyll build
cd ../presentation
echo "Buidling kde presentation"
idyll build
cd ../..
fidyll-deploy output/
cd ..

cd margo-climate-model/
cd output/
cd scroller/
echo "Buidling margo scroller"
idyll build
cd ../static
echo "Buidling margo static"
idyll build
cd ../presentation
echo "Buidling margo presentation"
idyll build
cd ../..
fidyll-deploy output/
cd ..

cd quantifying-political-ideology/
cd output/
cd scroller/
echo "Buidling qpi scroller"
idyll build
cd ../static
echo "Buidling qpi static"
idyll build
cd ../presentation
echo "Buidling qpi presentation"
idyll build
cd ../..
fidyll-deploy output/
cd ..