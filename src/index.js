const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const config = require('../config.json')

let app = express()
.use(express.json())
.use(express.urlencoded({ extended: true }));

let method_colors = {
  get: chalk.green,
  post: chalk.keyword('orange'),
  delete: chalk.red,
  put: chalk.keyword('yellow'),
  patch: chalk.keyword('cyan'),
};

(async () => {
  let routes = fs.readdirSync('./src/routes', { withFileTypes: true }).filter(route => route.isFile() && route.name.endsWith('.js')).map(route => route.name);
  for await (let route of routes) {
    let routeModule = require(`./routes/${route}`);
    app[routeModule.method.toLowerCase()](routeModule.path, routeModule.run);
    console.log(chalk.blue(`Registered route: ${method_colors[routeModule.method.toLowerCase()](routeModule.method.toUpperCase())} | ${chalk.white(routeModule.path)}`));
  }

  app.listen(config.port, () => {
    console.log(`\n${chalk.green(`Server listening on port ${config.port}`)}`);
  })
})()