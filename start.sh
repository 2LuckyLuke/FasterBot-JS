#! /bin/bash
tsc
screen -L -Logfile fasterBot.log -dmS FasterBot node build/index.js