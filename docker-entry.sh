#!/bin/bash

# Functions for dependencies health-check
function fail {
  echo $1 >&2
  exit 1
}

function retry {
  local n=1
  local max=10
  local delay=3
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        echo "Command failed. Attempt $n/$max:"
        sleep $delay;
      else
        fail "The command has failed after $n attempts."
      fi
    }
  done
}


# Try connections to OrientDB and Redis.
retry curl -s --fail -s cl-orientdb:2424 > /dev/null
retry curl -s --fail -s cl-orientdb:2480 > /dev/null
sleep 2
retry exec 6<>/dev/tcp/cl-redis/6379
sleep 2

# Execute the index_service process.
cd lib
node main.js
