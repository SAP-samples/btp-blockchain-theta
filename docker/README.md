## Ubuntu Dockerfile


This repository contains **Dockerfile** of [Ubuntu](http://www.ubuntu.com/) for [Docker](https://www.docker.com/)'s [automated build](https://registry.hub.docker.com/u/dockerfile/ubuntu/) published to the public [Docker Hub Registry](https://registry.hub.docker.com/).


### Base Docker Image

* [ubuntu:14.04](https://registry.hub.docker.com/u/library/ubuntu/)


### Installation

1. Install [Docker](https://www.docker.com/).

2. Download [automated build](https://registry.hub.docker.com/u/dockerfile/ubuntu/) from public [Docker Hub Registry](https://registry.hub.docker.com/): `docker pull dockerfile/ubuntu`

   (alternatively, you can build an image from Dockerfile: `docker build -t="dockerfile/ubuntu" github.com/dockerfile/ubuntu`)


### Usage

    docker run -it --rm dockerfile/ubuntu

```
docker build -t alunde/theta_ubuntu:latest .
docker run -ti -p 22:22 alunde/theta_ubuntu:latest
docker run -ti alunde/theta_ubuntu:latest

cd /Users/i830671/git/btp-blockchain-theta/docker
docker build --no-cache -t alunde/theta_ubuntu:latest .
docker build -t alunde/theta_ubuntu:latest .
echo "docker run -ti -p 12000:12000 -p 16888:16888 alunde/theta_ubuntu:latest"
echo "docker run -ti -p 16888:16888 alunde/theta_ubuntu:latest"
docker push alunde/theta_ubuntu:latest
cf delete theta.dkr -f -r
cf push theta.dkr --docker-image alunde/theta_ubuntu:latest -m 1024M -k 2G -n theta -d cfapps.us21.hana.ondemand.com -u none
cf enable-ssh theta.dkr
cf restart theta.dkr
cf ssh theta.dkr
```

