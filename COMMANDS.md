mkdir -p $THETA_HOME
git clone --branch release https://github.com/thetatoken/theta-protocol-ledger.git $THETA_HOME
cd $THETA_HOME
cp -r ./integration/privatenet ../privatenet
mkdir ~/.thetacli
cp -r ./integration/privatenet/thetacli/* ~/.thetacli/
chmod 700 ~/.thetacli/keys/encrypted
theta start --config=../privatenet/node
thetacli tx send --chain="privatenet" --from=2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=9F1233798E905E173560071255140b4A8aBd3Ec6 --theta=10 --tfuel=20 --seq=1
thetacli query account --address=9F1233798E905E173560071255140b4A8aBd3Ec6

scp dump_storeview thedrop:/home/ec2-user/files
scp encrypt_sk thedrop:/home/ec2-user/files
scp generate_genesis thedrop:/home/ec2-user/files
scp hex_obj_parser thedrop:/home/ec2-user/files
scp import_chain thedrop:/home/ec2-user/files
scp inspect_data thedrop:/home/ec2-user/files
scp query_db thedrop:/home/ec2-user/files
scp sign_hex_msg thedrop:/home/ec2-user/files
scp theta thedrop:/home/ec2-user/files
scp thetacli thedrop:/home/ec2-user/files

mkdir -p $GOPATH/bin
cd $GOPATH/bin

curl -LO http://thedrop.partner-eng.com/files/dump_storeview
curl -LO http://thedrop.partner-eng.com/files/encrypt_sk
curl -LO http://thedrop.partner-eng.com/files/generate_genesis
curl -LO http://thedrop.partner-eng.com/files/hex_obj_parser
curl -LO http://thedrop.partner-eng.com/files/import_chain
curl -LO http://thedrop.partner-eng.com/files/inspect_data
curl -LO http://thedrop.partner-eng.com/files/query_db
curl -LO http://thedrop.partner-eng.com/files/sign_hex_msg
curl -LO http://thedrop.partner-eng.com/files/theta
curl -LO http://thedrop.partner-eng.com/files/thetacli

chmod 755 dump_storeview
chmod 755 encrypt_sk
chmod 755 generate_genesis
chmod 755 hex_obj_parser
chmod 755 import_chain
chmod 755 inspect_data
chmod 755 query_db
chmod 755 sign_hex_msg
chmod 755 theta
chmod 755 thetacli

notroot install libc6-dev
notroot install build-essential
notroot install gcc
notroot install make
notroot install bzr
linux-libc-dev
notroot install libc6-dev
export INCLUDE=/home/user/notroot/usr/include:/home/user/notroot/usr/include/x86_64-linux-gnu/bits 
cd /home/user/notroot/usr/include
ln -s x86_64-linux-gnu/bits .
ln -s x86_64-linux-gnu/sys .
ln -s x86_64-linux-gnu/gnu .
ln -s x86_64-linux-gnu/asm .
LD_LIBRARY_PATH=/home/user/notroot/usr/=

LD_LIBRARY_PATH=/home/user/notroot/deb/usr/lib:/home/user/notroot/deb/lib:/home/user/notroot/deb/usr/lib/x86_64-linux-gnu:/home/user/notroot/deb/lib/x86_64-linux-gnu:/home/user/notroot/usr/lib:/home/user/notroot/lib:/home/user/notroot/usr/lib/x86_64-linux-gnu:/home/user/notroot/lib/x86_64-linux-gnu:
LD_LIBRARY_PATH=/home/user/notroot/usr/lib/x86_64-linux-gnu:/home/user/notroot/deb/usr/lib:/home/user/notroot/deb/lib:/home/user/notroot/deb/usr/lib/x86_64-linux-gnu:/home/user/notroot/deb/lib/x86_64-linux-gnu:/home/user/notroot/usr/lib:/home/user/notroot/lib:/home/user/notroot/usr/lib/x86_64-linux-gnu


notroot install tree
notroot install libc6-dev
notroot install build-essential

# build-essential from /home/user/notroot/usr/share/build-essential/essential-packages-list
notroot install base-files
notroot install base-passwd
notroot install bash
notroot install bsdutils
notroot install dash
notroot install coreutils
notroot install debianutils
notroot install diffutils
notroot install dpkg
notroot install findutils
notroot install gzip
notroot install grep
notroot install hostname
notroot install init-system-helpers
notroot install libc-bin
notroot install login
notroot install ncurses-bin
notroot install ncurses-base
notroot install perl-base
notroot install sed
notroot install sysvinit-utils
notroot install tar
notroot install util-linux

notroot install gcc
notroot install make
notroot install python
notroot install bzr

# Install GO via View->Find Command... 

7ba6c84a1a20432d688b54c0931c092310ecae2f

notroot install gcc-multilib
notroot install gcc-multilib
notroot install libc++-dev
notroot install libc6-dev


kubectl -n dev apply -f mongo-deployment.yaml
kubectl -n dev apply -f mongo-service-no-istio.yaml 

kubectl get services mongo  -n dev
nc -z 40.76.133.159 27317

cd /Users/i830671/git/btp-blockchain-theta

kubectl --kubeconfig=./kyma/kubeconfig.yml version
kubectl --kubeconfig=./kyma/kubeconfig.yml -n theta apply -f ./kyma/pvc.yaml
kubectl --kubeconfig=./kyma/kubeconfig.yml -n theta apply -f ./kyma/secret.yaml
kubectl --kubeconfig=./kyma/kubeconfig.yml -n theta apply -f ./kyma/theta-deployment.yaml

cf ssh theta-privatenet

$ thetacli key list
0x0d2fD67d573c8ecB4161510fc00754d64B401F86 -
0x21cA457E6E34162654aDEe28bcf235ebE5eee5De
0x2E833968E5bB786Ae419c4d13189fB081Cc43bab + 
0x70f587259738cB626A1720Af7038B8DcDb6a42a0
0xa5cdB2B0306518fb37b28bb63A1B2590FdE9b747
0xcd56123D0c5D6C1Ba4D39367b88cba61D93F5405

0x9F1233798E905E173560071255140b4A8aBd3Ec6 == Valid address but we don't have a key for it!


thetacli key password 2E833968E5bB786Ae419c4d13189fB081Cc43bab // None

thetacli tx send --chain="privatenet" --from=2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=9F1233798E905E173560071255140b4A8aBd3Ec6 --theta=10 --seq=1
"hash": "0x6646022223a3ff564cd05c3f516203cb65e449eb38b8e7187b2da6b255ff4513"

thetacli query account --address=9F1233798E905E173560071255140b4A8aBd3Ec6
        "tfuelwei": "312500000000000000000000000",
        "thetawei": "62500010000000000000000000"

thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab
        "tfuelwei": "312499999999999000000000000",
        "thetawei": "12499990000000000000000000"
 
thetacli tx send --chain="privatenet" --from=2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=0d2fD67d573c8ecB4161510fc00754d64B401F8 --theta=1 --tfuel=1 --seq=2
"hash": "0x5201804862763d4ae58da6f568f54ec874f54c9868c17b195448fc23a91b661a"

thetacli tx send --chain="privatenet" --from=2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=21cA457E6E34162654aDEe28bcf235ebE5eee5De --theta=1 --tfuel=1 --seq=3
"hash": "0x785ed633edc090e22e6f1d814f985db06c52db6a2119e08faab97249f029dee2"

thetacli query account --address=21cA457E6E34162654aDEe28bcf235ebE5eee5De
        "tfuelwei": "000,000,001.000000000000000000",
        "thetawei": "000,000,001.000000000000000000"

thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab
        "tfuelwei": "312,499,997.999997000000000000",
        "thetawei": "012,499,988.000000000000000000"

thetacli query account --address=9F1233798E905E173560071255140b4A8aBd3Ec6
        "tfuelwei": "312,500,000.000000000000000000",
        "thetawei": "062,500,010.000000000000000000"

thetacli tx send --chain="privatenet" --from=2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=70f587259738cB626A1720Af7038B8DcDb6a42a06 --theta=1000000 --tfuel=1000000 --seq=4
"hash": "0x7cf3ad156e46bc98e4821e3683ba94b9f68bfb788bd6acc1bb5023e74e005d46"

thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab
        "tfuelwei": "311,499,997.999996000000000000",
        "thetawei": "011,499,988.000000000000000000"

thetacli query account --address=70f587259738cB626A1720Af7038B8DcDb6a42a06
        "tfuelwei": "001,000,000.000000000000000000",
        "thetawei": "001,000,000.000000000000000000"

thetacli query tx --hash=0x7cf3ad156e46bc98e4821e3683ba94b9f68bfb788bd6acc1bb5023e74e005d46 | jq .transaction
{
  "fee": {
    "tfuelwei": "1000000000000",
    "thetawei": "0"
  },
  "inputs": [
    {
      "address": "0x2e833968e5bb786ae419c4d13189fb081cc43bab",
      "coins": {
        "tfuelwei": "1000000000001000000000000",
        "thetawei": "1000000000000000000000000"
      },
      "sequence": "4",
      "signature": "0xee6a81bcfe12429781a108890eb15a6ec20dd5c213a1d385dd6af59b1286c55540b040b60491e212f26679f9464807dafdcc7961b1c096d0ef5cfb2776cc29d401"
    }
  ],
  "outputs": [
    {
      "address": "0x0f587259738cb626a1720af7038b8dcdb6a42a06",
      "coins": {
        "tfuelwei": "1000000000000000000000000",
        "thetawei": "1000000000000000000000000"
      }
    }
  ]
}

cf api https://api.cf.us21.hana.ondemand.com
cf login -u andrew.lunde@sap.com
cf ssh theta-privatenet -L 16888:localhost:16888
screen -x theta

thetacli key list
