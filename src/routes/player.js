const axios = require('axios').default
const express = require('express')
const getStats = require('../modules/stats')

module.exports = {
  path: '/player',
  method: 'GET',
  
  /**
   * @param {express.Request} req 
   * @param {express.Response} res 
   * @returns 
   */
  async run(req, res) {
    if (!req.query || !req.query.key || !req.query.uuid) return res.status(400).send({ success: false, error: 'Missing query parameters' });

    let response = await axios.get(`https://api.hypixel.net/key?key=${req.query.key}`).catch(err => {
      console.log(err)
      return res.status(err?.response?.status || 500).send({ success: false, error: err })
    });

    if (res.headersSent) return; //if the response has already been sent, don't continue

    res.status(200).send({
      success: true,
      player: {
        uuid: req.query.uuid,
        rank: response.data.player.rank, firstLogin:
        response.data.player.firstLogin, lastLogin:
        response.data.player.lastLogin,
        stats: await getStats(response)
      }
    })
  }
}