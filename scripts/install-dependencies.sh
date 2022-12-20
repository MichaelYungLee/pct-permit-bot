#!/bin/bash
while read line; do
	sudo yum install -y "$line"
done <dependencies.txt
