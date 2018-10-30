#!/bin/bash

max=4
for i in `seq 0 $max`
do
    node index.js $i $max &
done