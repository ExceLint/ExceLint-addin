# Diagnostic Channel Publishers
Provides a set of patches for common Node.js modules to publish instrumentation
data to the [diagnostic-channel](https://github.com/Microsoft/node-diagnostic-channel) channel.

## Currently-supported modules
* [`redis`](https://github.com/NodeRedis/node_redis) v2.x
* [`mysql`](https://github.com/mysqljs/mysql) v2.0.0 -> v2.16.x
* [`mongodb`](https://github.com/mongodb/node-mongodb-native) v2.x, v3.x
* [`pg`](https://github.com/brianc/node-postgres) v6.x, v7.x
* [`pg-pool`](https://github.com/brianc/node-pg-pool) v1.x, v2.x
* [`bunyan`](https://github.com/trentm/node-bunyan) v1.x
* [`winston`](https://github.com/winstonjs/winston) v2.x, v3.x

## Release notes
### 0.3.0 - February 19th, 2019
* Added patching for `pg@7.x`, `pg-pool@2.x`
* Added patching for `mysql@2.16.x`
* Added patching for `winston@3.x`
* Added patching for `mongodb@3.x`

### 0.2.0 - August 18th, 2017
* Added patching for `pg`, `pg-pool`, and `winston` modules
* Updated build output to use `dist/` folder instead of `.dist/`
(fixes [#256](https://github.com/Microsoft/ApplicationInsights-node.js/issues/256))