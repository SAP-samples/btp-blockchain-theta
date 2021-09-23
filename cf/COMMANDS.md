```
cd cf ; mkdir -p mta_archives ; mbt build -p=cf -t=mta_archives --mtar=theta.mtar
```

# Deploy Command:
```
cf deploy mta_archives/theta.mtar -f
```

# Initial Deploy One Time:
```
source ./inital_deploy
```

# Subsequent Build+Deploy Commands:
```
mbt build -p=cf -t=mta_archives --mtar=theta.mtar ; cf deploy mta_archives/theta.mtar -f
```

# Undeploy Command:
```
cf undeploy theta -f --delete-services
```
