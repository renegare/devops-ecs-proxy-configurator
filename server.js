const debug = require('debug')('app:consul')
const Promise = require('bluebird')
const getInstances = require('./src/get-instances')
const yaml = require('js-yaml')
const fs = require('fs')
const all = Promise.all
const Mustache = require('mustache')
const path = require('path')

const config = {
  CONSUL_HOST: process.env.CONSUL_HOST || '127.0.0.1',
  CONSUL_PORT: process.env.CONSUL_HOST || '8500',
  PROXY_CONFIG_PATH: process.env.PROXY_CONFIG_PATH || path.join(__dirname, 'proxies.yml'),
  NGINX_TMPL_PATH: process.env.NGINX_TMPL_PATH || path.join(__dirname, 'nginx.conf.mu'),
  NGINX_CONF_PATH: process.env.NGINX_CONF_PATH || path.join(__dirname, 'nginx.conf'),
  SERVICES_JSON_PATH: process.env.SERVICES_JSON_PATH || path.join(__dirname, 'services.json')
}

const consul = require('consul')({
  host: config.CONSUL_HOST,
  port: config.CONSUL_PORT,
  promisify (fn) {
    return new Promise((resolve, reject) => {
      try {
        fn((err, data, res) => {
          if (err) {
            err.res = res
            return reject(err)
          }
          resolve([data, res])
        })
      } catch (err) {
        reject(err)
      }
    })
  }
})

const proxies = yaml.safeLoad(fs.readFileSync(config.PROXY_CONFIG_PATH, 'utf8'))
const template = fs.readFileSync(config.NGINX_TMPL_PATH, 'utf8')
const watch = consul.watch({
  method: consul.catalog.service.list
})

watch.on('change', (services, res) => {
  all(Object.keys(services).map(name => getInstances(consul, name)))
  .then(services =>
    services.map(service =>
      Object.assign({}, service, {proxy: proxies[service.name]})))
  .filter(service => !!service.proxy && service.instances.length)
  .then(services => {
    fs.writeFile(config.SERVICES_JSON_PATH, JSON.stringify(services, null, '  '))
    return services
  })
  .then(services => Mustache.render(template, {services}))
  .then(conf => fs.writeFile(config.NGINX_CONF_PATH, conf))
})

watch.on('error', (err) => {
  debug('error', err)
})
