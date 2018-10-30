#!/bin/bash

max=4
for i in `seq 0 $max`
do
    fuser -n tcp -k 300$i &
done