#!/bin/bash

max=5
for i in `seq 1 $max`
do
    node index.js 300$i &
done