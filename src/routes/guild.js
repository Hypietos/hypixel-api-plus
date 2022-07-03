const axios = require('axios').default
const express = require('express')

module.exports = {
  path: '/guild',
  method: 'GET',
  
  /**
   * @param {express.Request} req 
   * @param {express.Response} res 
   * @returns 
   */
  async run(req, res) {
    if (!req.query || !req.query.key || !req.query.player) return res.status(400).send({ success: false, error: 'Missing query parameters' });

    let response = await axios.get(`https://api.hypixel.net/guild?key=${req.query.key}&player=${req.query.player}`).catch(err => {
      console.log(err)
      return res.status(err?.response?.status || 500).send({ success: false, error: err })
    });

    if (res.headersSent) return; //if the response has already been sent, don't continue

    delete response.data.guild.name_lower
    delete response.data.guild.coins
    delete response.data.guild.coinsEver
    response.data.guild.id = response.data.guild._id
    delete response.data.guild._id

    res.status(200).send(response.data)
  }
}