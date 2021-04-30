#!/bin/bash
#
# run netcat listening on 16888 to simulate a TCP/IP based server
# exec nc -l 16888 &>/dev/null &
#
mkdir -p /root/go/src/github.com/thetatoken/theta
git clone --branch release https://github.com/thetatoken/theta-protocol-ledger.git /root/go/src/github.com/thetatoken/theta
cp -r /root/go/src/github.com/thetatoken/theta/integration/privatenet /root/go/src/github.com/thetatoken/privatenet
# https://github.com/thetatoken/theta-mainnet-integration-guide/blob/master/docs/config.md
# Override default port 16888
echo '  port: 8080'  >> /root/go/src/github.com/thetatoken/privatenet/node/config.yaml
echo 'log:' >> /root/go/src/github.com/thetatoken/privatenet/node/config.yaml
echo '  levels: "*:info"'  >> /root/go/src/github.com/thetatoken/privatenet/node/config.yaml
mkdir -p /root/.thetacli
cp -r /root/go/src/github.com/thetatoken/theta/integration/privatenet/thetacli/* /root/.thetacli
chmod 700 /root/.thetacli/keys/encrypted

#/bin/bash -c "cd /root/go/src/github.com/thetatoken/theta ; make install"

/bin/bash -c "source /root/.bashrc ; echo \$THETA_HOME ; cd \$THETA_HOME ; make install ; start_theta.sh"

#sudo -u root 'echo $THETA_HOME ; cd $THETA_HOME ; make install ; exit'
#cd /root/go/src/github.com/thetatoken/theta
#make install

# exec /usr/local/bin/start_theta.sh &>/dev/null &

exec /bin/bash
