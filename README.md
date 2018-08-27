# Quick start

## Supporting OS

macOS

## Dependencies

Please make sure you have all dependencies installed before proceeding:

Under root dir of the project folder:

```cli
npm install
```

## Configuration

Configuration is done through config.json under root dir.

At this moment, user has to figure out what phase/state of the microChain generation one starts out with to properly configure to have the process run successfully. E.g., after insufficient account balance happened, one finished funding enough moac and try to run the process from somewhere in the middle.

The current version is still alpha and only covers very basic features. Please let me know anything not working as expected.

### Network

"private_n_local_run": flag indicating if everything is local and run on local private network created on demand.

"sys_estimated_gas_index": index used to adjust gas used based on system estimated gas by multiplicaiton

"chain_id": when "private_n_local_run" set as true, this has to be the same as the chain id set in the genesis file located by "mac.genesis_dir_path"

### SCS node

"scs.create_new_use": true while local scs nodes need to be created

"scs.nodes": number of scs nodes

"scs.budget_in_moac": amount needed on each ssid

"scs.deposit_in_moac": amount needed to deposit when registering to pool

### Vnode

"vnode_name": datadir name for locally created vnode

### Account

"default_password": universal password to use for all account creation in the process

### VnodeProtocolBase

"vnode_protocol_base.create_new_use": true while deploying new one required

"vnode_protocol_base.addr": existing address of a deployed one, only works when "vnode_protocol_base.create_new_use" set as false

### SubChainProtocolBase

"subChain_protocol_base.create_new_use": true while deploying new one required

"subChain_protocol_base.addr": existing address of a deployed one, only works when "subChain_protocol_base.create_new_use" set as false

### SubChainBase

"subChain_base.create_new_use": true while deploying new one required

"subChain_base.addr": existing address of a deployed one, only works when "subChain_base.create_new_use" set as false

## CLI

Run under root dir of the project folder

### creating a new vnode with an account

```cli
node ./src/steps/new_vnode_n_coinbase
```

### existing vnode with an account

```cli
node ./src/steps/subchain_up_n_run
```

User can also run above cmd after modifying the config.json file to reflect the current state of process:

- when there is any interruption in the process and user manually sets process state meets requirements to proceed again

- when some resources for the process are available piror to the start of the process

# Output

## console

There are outputs in console to mark each step. Simply search word 'step' in output console to locate executed steps.

## log file

### moac

project_root/logs/moac.log

### scs

project_root/temp/scs_nodes/any_scs_node_name/bin/logs

### other

project_root/console.log

# Notes

## sync waiting time

It could take 20+ mins to start to sync. If it takes too long, you might want to stop and restart the process.
