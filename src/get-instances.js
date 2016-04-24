module.exports = (consul, name) => {
  return consul.health.service(name)
    .spread(ins => ins)
    .then(ins => ins.filter(i => !!i.Service.Address))
    .then(ins => ins.map(i => i.Service))
    .then(instances => ({name, instances}))
}
