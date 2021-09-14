```
cd cf ; mkdir -p mta_archives ; mbt build -p=cf -t=mta_archives --mtar=theta.mtar
```

# Deploy Command:
```
cf deploy mta_archives/theta.mtar -f
```

# Post Deploy One Time:
```
cf update-service THETA_PGSQL -t sbss
cf start theta-sbss ; sleep 60 ; cf stop theta-sbss
```

# Subsequent Build+Deploy Commands:
```
mbt build -p=cf -t=mta_archives --mtar=theta.mtar ; cf deploy mta_archives/theta.mtar -f
```

# Undeploy Command:
```
cf undeploy theta -f --delete-services
```
