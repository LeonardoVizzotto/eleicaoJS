#!/bin/bash

max=5
for i in `seq 1 $max`
do
    fuser -n tcp -k 300$i &
done