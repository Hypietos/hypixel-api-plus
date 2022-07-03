const fs = require("fs")
const express = require('express')

module.exports = {
  path: '*',
  method: 'GET',
  
  /**
   * @param {express.Request} req 
   * @param {express.Response} res 
   * @returns 
   */
  async run(req, res) {
    const directory = fs.readdirSync('./src/routes/')
    const routes = []

    for (const file of directory) {
        const route = require(`../routes/${file}`)
        routes.push(route)
    }

    res.status(200).send(routes.map(route => `[${route.method}] ${route.path}`).join('\n'))

  }
}