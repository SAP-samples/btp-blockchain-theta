#!/bin/bash
#
# run netcat listening on 1234 to simulate a TCP/IP based server
# exec nc -l 1234 &>/dev/null &
#
#
#echo "Sleepy..."
#sleep 10
# Start the MySQL Server
#
echo "THETA Private Network Start."
cd $THETA_HOME ; screen -S theta theta start --config=../privatenet/node

