const axios = require('axios').default
const express = require('express')
const { getWoolWarsLevel } = require('../modules/util')
const fs = require('fs')

module.exports = {
  path: '/stats',
  method: 'GET',

  /**
   * 
   * @param {express.Request} req 
   * @param {express.Response} res 
   * @returns 
   */
  async run(req, res) {
    if (!req.query || !req.query.key || !req.query.uuid) return res.status(400).send({ success: false, error: 'Missing query parameters' });

    let hypixel_result = await axios.get(`https://api.hypixel.net/player?key=${req.query.key}&uuid=${req.query.uuid}`).catch(err => {
      console.log(err)
      return res.status(err?.response?.status || 500).send({ success: false, error: err })
    });

    if (res.headersSent) return; //if the response has already been sent, don't continue

    let stats = hypixel_result.data.player.stats,
      response = {}

    fs.writeFileSync('./hypixel_stats_sb.json', JSON.stringify(stats.SkyBlock, null, 2))

    // Wool Wars
    if (stats.WoolGames && stats.WoolGames.wool_wars) {
      response.woolwars = { combat: {}, games: {}, misc: { blocks: {} } }

      response.woolwars.wool = stats.WoolGames.coins || 0
      response.woolwars.level = await getWoolWarsLevel(stats.WoolGames.progression.experience || 0)
      response.woolwars.experience = (stats.WoolGames.progression.experience || 0).toFixed(1)

      // 4v4 stats.WoolGames.wool_wars.stats.kills
      response.woolwars.combat.kills = stats.WoolGames.wool_wars.stats.kills || 0
      response.woolwars.combat.deaths = stats.WoolGames.wool_wars.stats.deaths || 0
      response.woolwars.combat.kdr = (response.woolwars.combat.kills / response.woolwars.combat.deaths).toFixed(1)
      response.woolwars.games.wins = stats.WoolGames.wool_wars.stats.wins || 0
      response.woolwars.games.played = stats.WoolGames.wool_wars.stats.games_played || 0
      response.woolwars.games.losses = (response.woolwars.games.played - response.woolwars.games.wins)
      response.woolwars.games.wlr = (response.woolwars.games.wins / response.woolwars.games.losses).toFixed(1)
      response.woolwars.misc.blocks.placed = stats.WoolGames.wool_wars.stats.wool_placed || 0
      response.woolwars.misc.blocks.broken = stats.WoolGames.wool_wars.stats.blocks_broken || 0
      response.woolwars.misc.powerups = stats.WoolGames.wool_wars.stats.powerups_gotten || 0
    }

    // Bedwars
    if (stats.Bedwars) {
      response.bedwars = {
        overall: { combat: {}, games: {}, beds: {}, finals: {} },
        solo: { combat: {}, games: {}, beds: {}, finals: {} },
        doubles: { combat: {}, games: {}, beds: {}, finals: {} },
        threes: { combat: {}, games: {}, beds: {}, finals: {} },
        fours: { combat: {}, games: {}, beds: {}, finals: {} },
      }

      response.bedwars.level = hypixel_result.data.player.achievements.bedwars_level || 0
      response.bedwars.experience = stats.Bedwars.Experience || 0
      response.bedwars.coins = stats.Bedwars.coins

      // Overall stats.Bedwars.final_kills_bedwars
      response.bedwars.overall.combat.kills = stats.Bedwars.kills_bedwars || 0
      response.bedwars.overall.combat.deaths = stats.Bedwars.deaths_bedwars || 0
      response.bedwars.overall.combat.kdr = (response.bedwars.overall.combat.kills / response.bedwars.overall.combat.deaths).toFixed(1)
      response.bedwars.overall.games.wins = stats.Bedwars.wins_bedwars || 0
      response.bedwars.overall.games.losses = stats.Bedwars.losses_bedwars || 0
      response.bedwars.overall.games.wlr = (response.bedwars.overall.games.wins / response.bedwars.overall.games.losses).toFixed(1)
      response.bedwars.overall.beds.broken = stats.Bedwars.beds_broken_bedwars || 0
      response.bedwars.overall.beds.lost = stats.Bedwars.beds_lost_bedwars || 0
      response.bedwars.overall.beds.bblr = (response.bedwars.overall.beds.broken / response.bedwars.overall.beds.lost).toFixed(1)
      response.bedwars.overall.finals.kills = stats.Bedwars.final_kills_bedwars || 0
      response.bedwars.overall.finals.deaths = stats.Bedwars.final_deaths_bedwars || 0
      response.bedwars.overall.finals.fkdr = (response.bedwars.overall.finals.kills / response.bedwars.overall.finals.deaths).toFixed(1)

      // Solo stats.Bedwars.eight_one_final_kills_bedwars
      response.bedwars.solo.combat.kills = stats.Bedwars.eight_one_kills_bedwars || 0
      response.bedwars.solo.combat.deaths = stats.Bedwars.eight_one_deaths_bedwars || 0
      response.bedwars.solo.combat.kdr = (response.bedwars.solo.combat.kills / response.bedwars.solo.combat.deaths).toFixed(1)
      response.bedwars.solo.games.wins = stats.Bedwars.eight_one_wins_bedwars || 0
      response.bedwars.solo.games.losses = stats.Bedwars.eight_one_losses_bedwars || 0
      response.bedwars.solo.games.wlr = (response.bedwars.solo.games.wins / response.bedwars.solo.games.losses).toFixed(1)
      response.bedwars.solo.beds.broken = stats.Bedwars.eight_one_beds_broken_bedwars || 0
      response.bedwars.solo.beds.lost = stats.Bedwars.eight_one_beds_lost_bedwars || 0
      response.bedwars.solo.beds.bblr = (response.bedwars.solo.beds.broken / response.bedwars.solo.beds.lost).toFixed(1)
      response.bedwars.solo.finals.kills = stats.Bedwars.eight_one_final_kills_bedwars || 0
      response.bedwars.solo.finals.deaths = stats.Bedwars.eight_one_final_deaths_bedwars || 0
      response.bedwars.solo.finals.fkdr = (response.bedwars.solo.finals.kills / response.bedwars.solo.finals.deaths).toFixed(1)

      // Doubles stats.Bedwars.eight_two_final_kills_bedwars
      response.bedwars.doubles.combat.kills = stats.Bedwars.eight_two_kills_bedwars || 0
      response.bedwars.doubles.combat.deaths = stats.Bedwars.eight_two_deaths_bedwars || 0
      response.bedwars.doubles.combat.kdr = (response.bedwars.doubles.combat.kills / response.bedwars.doubles.combat.deaths).toFixed(1)
      response.bedwars.doubles.games.wins = stats.Bedwars.eight_two_wins_bedwars || 0
      response.bedwars.doubles.games.losses = stats.Bedwars.eight_two_losses_bedwars || 0
      response.bedwars.doubles.games.wlr = (response.bedwars.doubles.games.wins / response.bedwars.doubles.games.losses).toFixed(1)
      response.bedwars.doubles.beds.broken = stats.Bedwars.eight_two_beds_broken_bedwars || 0
      response.bedwars.doubles.beds.lost = stats.Bedwars.eight_two_beds_lost_bedwars || 0
      response.bedwars.doubles.beds.bblr = (response.bedwars.doubles.beds.broken / response.bedwars.doubles.beds.lost).toFixed(1)
      response.bedwars.doubles.finals.kills = stats.Bedwars.eight_two_final_kills_bedwars || 0
      response.bedwars.doubles.finals.deaths = stats.Bedwars.eight_two_final_deaths_bedwars || 0
      response.bedwars.doubles.finals.fkdr = (response.bedwars.doubles.finals.kills / response.bedwars.doubles.finals.deaths).toFixed(1)

      // Threes stats.Bedwars.four_three_final_kills_bedwars
      response.bedwars.threes.combat.kills = stats.Bedwars.four_three_kills_bedwars || 0
      response.bedwars.threes.combat.deaths = stats.Bedwars.four_three_deaths_bedwars || 0
      response.bedwars.threes.combat.kdr = (response.bedwars.threes.combat.kills / response.bedwars.threes.combat.deaths).toFixed(1)
      response.bedwars.threes.games.wins = stats.Bedwars.four_three_wins_bedwars || 0
      response.bedwars.threes.games.losses = stats.Bedwars.four_three_losses_bedwars || 0
      response.bedwars.threes.games.wlr = (response.bedwars.threes.games.wins / response.bedwars.threes.games.losses).toFixed(1)
      response.bedwars.threes.beds.broken = stats.Bedwars.four_three_beds_broken_bedwars || 0
      response.bedwars.threes.beds.lost = stats.Bedwars.four_three_beds_lost_bedwars || 0
      response.bedwars.threes.beds.bblr = (response.bedwars.threes.beds.broken / response.bedwars.threes.beds.lost).toFixed(1)
      response.bedwars.threes.finals.kills = stats.Bedwars.four_three_final_kills_bedwars || 0
      response.bedwars.threes.finals.deaths = stats.Bedwars.four_three_final_deaths_bedwars || 0
      response.bedwars.threes.finals.fkdr = (response.bedwars.threes.finals.kills / response.bedwars.threes.finals.deaths).toFixed(1)

      // Fours stats.Bedwars.four_four_final_kills_bedwars
      response.bedwars.fours.combat.kills = stats.Bedwars.four_four_kills_bedwars || 0
      response.bedwars.fours.combat.deaths = stats.Bedwars.four_four_deaths_bedwars || 0
      response.bedwars.fours.combat.kdr = (response.bedwars.fours.combat.kills / response.bedwars.fours.combat.deaths).toFixed(1)
      response.bedwars.fours.games.wins = stats.Bedwars.four_four_wins_bedwars || 0
      response.bedwars.fours.games.losses = stats.Bedwars.four_four_losses_bedwars || 0
      response.bedwars.fours.games.wlr = (response.bedwars.fours.games.wins / response.bedwars.fours.games.losses).toFixed(1)
      response.bedwars.fours.beds.broken = stats.Bedwars.four_four_beds_broken_bedwars || 0
      response.bedwars.fours.beds.lost = stats.Bedwars.four_four_beds_lost_bedwars || 0
      response.bedwars.fours.beds.bblr = (response.bedwars.fours.beds.broken / response.bedwars.fours.beds.lost).toFixed(1)
      response.bedwars.fours.finals.kills = stats.Bedwars.four_four_final_kills_bedwars || 0
      response.bedwars.fours.finals.deaths = stats.Bedwars.four_four_final_deaths_bedwars || 0
      response.bedwars.fours.finals.fkdr = (response.bedwars.fours.finals.kills / response.bedwars.fours.finals.deaths).toFixed(1)
    }

    if (stats.SkyWars) {
      response.skywars = {
        overall: { combat: {}, games: {} },
        solo: { normal: { combat: {}, games: {} }, insane: { combat: {}, games: {} }, overall: { combat: {}, games: {} } },
        teams: { normal: { combat: {}, games: {} }, insane: { combat: {}, games: {} }, overall: { combat: {}, games: {} } },
      }

      // Overall stats.SkyWars.kills
      response.skywars.overall.combat.kills = stats.SkyWars.kills || 0
      response.skywars.overall.combat.assists = stats.SkyWars.assists || 0
      response.skywars.overall.combat.deaths = stats.SkyWars.deaths || 0
      response.skywars.overall.combat.kdr = (response.skywars.overall.combat.kills / response.skywars.overall.combat.deaths).toFixed(1)
      response.skywars.overall.games.wins = stats.SkyWars.wins || 0
      response.skywars.overall.games.played = stats.SkyWars.games_played_skywars || 0
      response.skywars.overall.games.losses = stats.SkyWars.losses || 0
      response.skywars.overall.games.wlr = (response.skywars.overall.games.wins / response.skywars.overall.games.losses).toFixed(1)

      // Solo Overall stats.SkyWars.kills_solo
      response.skywars.solo.overall.combat.kills = stats.SkyWars.kills_solo || 0
      response.skywars.solo.overall.combat.assists = stats.SkyWars.assists_solo || 0
      response.skywars.solo.overall.combat.deaths = stats.SkyWars.deaths_solo || 0
      response.skywars.solo.overall.combat.kdr = (response.skywars.solo.overall.combat.kills / response.skywars.solo.overall.combat.deaths).toFixed(1)
      response.skywars.solo.overall.games.wins = stats.SkyWars.wins_solo || 0
      response.skywars.solo.overall.games.played = stats.SkyWars.games_played_solo_skywars || 0
      response.skywars.solo.overall.games.losses = stats.SkyWars.losses_solo || 0
      response.skywars.solo.overall.games.wlr = (response.skywars.solo.overall.games.wins / response.skywars.solo.overall.games.losses).toFixed(1)

      // Solo Normal stats.SkyWars.kills_solo_normal
      response.skywars.solo.normal.combat.kills = stats.SkyWars.kills_solo_normal || 0
      //response.skywars.solo.normal.combat.assists = stats.SkyWars.assists_solo_normal || 0
      response.skywars.solo.normal.combat.deaths = stats.SkyWars.deaths_solo_normal || 0
      response.skywars.solo.normal.combat.kdr = (response.skywars.solo.normal.combat.kills / response.skywars.solo.normal.combat.deaths).toFixed(1)
      response.skywars.solo.normal.games.wins = stats.SkyWars.wins_solo_normal || 0
      response.skywars.solo.normal.games.played = stats.SkyWars.games_played_solo_normal_skywars || 0
      response.skywars.solo.normal.games.losses = stats.SkyWars.losses_solo_normal || 0
      response.skywars.solo.normal.games.wlr = (response.skywars.solo.normal.games.wins / response.skywars.solo.normal.games.losses).toFixed(1)

      // Solo Insane stats.SkyWars.kills_solo_insane
      response.skywars.solo.insane.combat.kills = stats.SkyWars.kills_solo_insane || 0
      //response.skywars.solo.insane.combat.assists = stats.SkyWars.assists_solo_insane || 0
      response.skywars.solo.insane.combat.deaths = stats.SkyWars.deaths_solo_insane || 0
      response.skywars.solo.insane.combat.kdr = (response.skywars.solo.insane.combat.kills / response.skywars.solo.insane.combat.deaths).toFixed(1)
      response.skywars.solo.insane.games.wins = stats.SkyWars.wins_solo_insane || 0
      response.skywars.solo.insane.games.played = stats.SkyWars.games_played_solo_insane || 0
      response.skywars.solo.insane.games.losses = stats.SkyWars.losses_solo_insane || 0
      response.skywars.solo.insane.games.wlr = (response.skywars.solo.insane.games.wins / response.skywars.solo.insane.games.losses).toFixed(1)

      // Teams Overall stats.SkyWars.kills_team
      response.skywars.teams.overall.combat.kills = stats.SkyWars.kills_team || 0
      response.skywars.teams.overall.combat.assists = stats.SkyWars.assists_team || 0
      response.skywars.teams.overall.combat.deaths = stats.SkyWars.deaths_team || 0
      response.skywars.teams.overall.combat.kdr = (response.skywars.teams.overall.combat.kills / response.skywars.teams.overall.combat.deaths).toFixed(1)
      response.skywars.teams.overall.games.wins = stats.SkyWars.wins_team || 0
      response.skywars.teams.overall.games.played = stats.SkyWars.games_played_team_skywars || 0
      response.skywars.teams.overall.games.losses = stats.SkyWars.losses_team || 0
      response.skywars.teams.overall.games.wlr = (response.skywars.teams.overall.games.wins / response.skywars.teams.overall.games.losses).toFixed(1)

      // Teams Normal stats.SkyWars.kills_team_normal
      response.skywars.teams.normal.combat.kills = stats.SkyWars.kills_team_normal || 0
      //response.skywars.teams.normal.combat.assists = stats.SkyWars.assists_team_normal || 0
      response.skywars.teams.normal.combat.deaths = stats.SkyWars.deaths_team_normal || 0
      response.skywars.teams.normal.combat.kdr = (response.skywars.teams.normal.combat.kills / response.skywars.teams.normal.combat.deaths).toFixed(1)
      response.skywars.teams.normal.games.wins = stats.SkyWars.wins_team_normal || 0
      response.skywars.teams.normal.games.played = stats.SkyWars.games_played_team_normal || 0
      response.skywars.teams.normal.games.losses = stats.SkyWars.losses_team_normal || 0
      response.skywars.teams.normal.games.wlr = (response.skywars.teams.normal.games.wins / response.skywars.teams.normal.games.losses).toFixed(1)

      // Teams Insane stats.SkyWars.kills_team_insane
      response.skywars.teams.insane.combat.kills = stats.SkyWars.kills_team_insane || 0
      //response.skywars.teams.insane.combat.assists = stats.SkyWars.assists_team_insane || 0
      response.skywars.teams.insane.combat.deaths = stats.SkyWars.deaths_team_insane || 0
      response.skywars.teams.insane.combat.kdr = (response.skywars.teams.insane.combat.kills / response.skywars.teams.insane.combat.deaths).toFixed(1)
      response.skywars.teams.insane.games.wins = stats.SkyWars.wins_team_insane || 0
      response.skywars.teams.insane.games.played = stats.SkyWars.games_played_team_insane || 0
      response.skywars.teams.insane.games.losses = stats.SkyWars.losses_team_insane || 0
      response.skywars.teams.insane.games.wlr = (response.skywars.teams.insane.games.wins / response.skywars.teams.insane.games.losses).toFixed(1)
    }

    if (stats.Duels) {
      response.duels = {
        overall: { combat: {}, games: {} },
        classic: { combat: {}, games: {} },
        sumo: { combat: {}, games: {} },
        uhc: { combat: {}, games: {} },
        bridge: { combat: {}, games: {} },
        skywars: { combat: {}, games: {} },

        combo: { combat: {}, games: {} },
        no_debuff: { combat: {}, games: {} },
        bow: { combat: {}, games: {} },
        bow_spleef: { combat: {}, games: {} },
        op: { combat: {}, games: {} },
        blitz_sg: { combat: {}, games: {} },
        mega_walls: { combat: {}, games: {} },

        arena: { combat: {}, games: {} },
        boxing: { combat: {}, games: {} },
        parkour: { combat: {}, games: {} },
      }

      // Overall stats.Duels.kills
      response.duels.overall.combat.kills = stats.Duels.kills || 0
      response.duels.overall.combat.deaths = stats.Duels.deaths || 0
      response.duels.overall.combat.kdr = (response.duels.overall.combat.kills / response.duels.overall.combat.deaths).toFixed(1)
      response.duels.overall.games.wins = stats.Duels.wins || 0
      response.duels.overall.games.played = stats.Duels.rounds_played || 0
      response.duels.overall.games.losses = stats.Duels.losses || 0
      response.duels.overall.games.wlr = (response.duels.overall.games.wins / response.duels.overall.games.losses).toFixed(1)

      // Classic stats.Duels.classic_duel_kills
      response.duels.classic.combat.kills = stats.Duels.classic_duel_kills || 0
      response.duels.classic.combat.deaths = stats.Duels.classic_duel_deaths || 0
      response.duels.classic.combat.kdr = (response.duels.classic.combat.kills / response.duels.classic.combat.deaths).toFixed(1)
      response.duels.classic.games.wins = stats.Duels.classic_duel_wins || 0
      response.duels.classic.games.played = stats.Duels.classic_duel_rounds_played || 0
      response.duels.classic.games.losses = stats.Duels.classic_duel_losses || 0
      response.duels.classic.games.wlr = (response.duels.classic.games.wins / response.duels.classic.games.losses).toFixed(1)

      // Sumo stats.Duels.sumo_duel_kills
      response.duels.sumo.combat.kills = stats.Duels.sumo_duel_kills || 0
      response.duels.sumo.combat.deaths = stats.Duels.sumo_duel_deaths || 0
      response.duels.sumo.combat.kdr = (response.duels.sumo.combat.kills / response.duels.sumo.combat.deaths).toFixed(1)
      response.duels.sumo.games.wins = stats.Duels.sumo_duel_wins || 0
      response.duels.sumo.games.played = stats.Duels.sumo_duel_rounds_played || 0
      response.duels.sumo.games.losses = stats.Duels.sumo_duel_losses || 0
      response.duels.sumo.games.wlr = (response.duels.sumo.games.wins / response.duels.sumo.games.losses).toFixed(1)

      // UHC stats.Duels.uhc_duel_kills
      response.duels.uhc.combat.kills = stats.Duels.uhc_duel_kills || 0
      response.duels.uhc.combat.deaths = stats.Duels.uhc_duel_deaths || 0
      response.duels.uhc.combat.kdr = (response.duels.uhc.combat.kills / response.duels.uhc.combat.deaths).toFixed(1)
      response.duels.uhc.games.wins = stats.Duels.uhc_duel_wins || 0
      response.duels.uhc.games.played = stats.Duels.uhc_duel_rounds_played || 0
      response.duels.uhc.games.losses = stats.Duels.uhc_duel_losses || 0
      response.duels.uhc.games.wlr = (response.duels.uhc.games.wins / response.duels.uhc.games.losses).toFixed(1)

      // Bridge stats.Duels.bridge_kills
      response.duels.bridge.combat.kills = stats.Duels.bridge_kills || 0
      response.duels.bridge.combat.deaths = stats.Duels.bridge_deaths || 0
      response.duels.bridge.combat.kdr = (response.duels.bridge.combat.kills / response.duels.bridge.combat.deaths).toFixed(1)
      response.duels.bridge.games.wins = stats.Duels.bridge_duel_wins || 0
      response.duels.bridge.games.played = stats.Duels.bridge_duel_rounds_played || 0
      response.duels.bridge.games.losses = stats.Duels.bridge_duel_losses || 0
      response.duels.bridge.games.wlr = (response.duels.bridge.games.wins / response.duels.bridge.games.losses).toFixed(1)

      // Skywars stats.Duels.sw_duel_kills
      response.duels.skywars.combat.kills = stats.Duels.sw_duel_kills || 0
      response.duels.skywars.combat.deaths = stats.Duels.sw_duel_deaths || 0
      response.duels.skywars.combat.kdr = (response.duels.skywars.combat.kills / response.duels.skywars.combat.deaths).toFixed(1)
      response.duels.skywars.games.wins = stats.Duels.sw_duel_wins || 0
      response.duels.skywars.games.played = stats.Duels.sw_duel_rounds_played || 0
      response.duels.skywars.games.losses = stats.Duels.sw_duel_losses || 0
      response.duels.skywars.games.wlr = (response.duels.skywars.games.wins / response.duels.skywars.games.losses).toFixed(1)

      // Combo stats.Duels.combo_duel_kills
      response.duels.combo.combat.kills = stats.Duels.combo_duel_kills || 0
      response.duels.combo.combat.deaths = stats.Duels.combo_duel_deaths || 0
      response.duels.combo.combat.kdr = (response.duels.combo.combat.kills / response.duels.combo.combat.deaths).toFixed(1)
      response.duels.combo.games.wins = stats.Duels.combo_duel_wins || 0
      response.duels.combo.games.played = stats.Duels.combo_duel_rounds_played || 0
      response.duels.combo.games.losses = stats.Duels.combo_duel_losses || 0
      response.duels.combo.games.wlr = (response.duels.combo.games.wins / response.duels.combo.games.losses).toFixed(1)

      // No Debuff stats.Duels.potion_duel_kills
      response.duels.no_debuff.combat.kills = stats.Duels.potion_duel_kills || 0
      response.duels.no_debuff.combat.deaths = stats.Duels.potion_duel_deaths || 0
      response.duels.no_debuff.combat.kdr = (response.duels.no_debuff.combat.kills / response.duels.no_debuff.combat.deaths).toFixed(1)
      response.duels.no_debuff.games.wins = stats.Duels.potion_duel_wins || 0
      response.duels.no_debuff.games.played = stats.Duels.potion_duel_rounds_played || 0
      response.duels.no_debuff.games.losses = stats.Duels.potion_duel_losses || 0
      response.duels.no_debuff.games.wlr = (response.duels.no_debuff.games.wins / response.duels.no_debuff.games.losses).toFixed(1)
      
      // Bow stats.Duels.bow_duel_kills
      response.duels.bow.combat.kills = stats.Duels.bow_duel_kills || 0
      response.duels.bow.combat.deaths = stats.Duels.bow_duel_deaths || 0
      response.duels.bow.combat.kdr = (response.duels.bow.combat.kills / response.duels.bow.combat.deaths).toFixed(1)
      response.duels.bow.games.wins = stats.Duels.bow_duel_wins || 0
      response.duels.bow.games.played = stats.Duels.bow_duel_rounds_played || 0
      response.duels.bow.games.losses = stats.Duels.bow_duel_losses || 0
      response.duels.bow.games.wlr = (response.duels.bow.games.wins / response.duels.bow.games.losses).toFixed(1)
      
      // Bow Spleef stats.Duels.bowspleef_duel_kills
      response.duels.bow_spleef.combat.kills = stats.Duels.bowspleef_duel_kills || 0
      response.duels.bow_spleef.combat.deaths = stats.Duels.bowspleef_duel_deaths || 0
      response.duels.bow_spleef.combat.kdr = (response.duels.bow_spleef.combat.kills / response.duels.bow_spleef.combat.deaths).toFixed(1)
      response.duels.bow_spleef.games.wins = stats.Duels.bowspleef_duel_wins || 0
      response.duels.bow_spleef.games.played = stats.Duels.bowspleef_duel_rounds_played || 0
      response.duels.bow_spleef.games.losses = stats.Duels.bowspleef_duel_losses || 0
      response.duels.bow_spleef.games.wlr = (response.duels.bow_spleef.games.wins / response.duels.bow_spleef.games.losses).toFixed(1)

      // OP stats.Duels.op_duel_kills
      response.duels.op.combat.kills = stats.Duels.op_duel_kills || 0
      response.duels.op.combat.deaths = stats.Duels.op_duel_deaths || 0
      response.duels.op.combat.kdr = (response.duels.op.combat.kills / response.duels.op.combat.deaths).toFixed(1)
      response.duels.op.games.wins = stats.Duels.op_duel_wins || 0
      response.duels.op.games.played = stats.Duels.op_duel_rounds_played || 0
      response.duels.op.games.losses = stats.Duels.op_duel_losses || 0
      response.duels.op.games.wlr = (response.duels.op.games.wins / response.duels.op.games.losses).toFixed(1)

      // Blitz SG stats.Duels.blitz_duel_kills
      response.duels.blitz_sg.combat.kills = stats.Duels.blitz_duel_kills || 0
      response.duels.blitz_sg.combat.deaths = stats.Duels.blitz_duel_deaths || 0
      response.duels.blitz_sg.combat.kdr = (response.duels.blitz_sg.combat.kills / response.duels.blitz_sg.combat.deaths).toFixed(1)
      response.duels.blitz_sg.games.wins = stats.Duels.blitz_duel_wins || 0
      response.duels.blitz_sg.games.played = stats.Duels.blitz_duel_rounds_played || 0
      response.duels.blitz_sg.games.losses = stats.Duels.blitz_duel_losses || 0
      response.duels.blitz_sg.games.wlr = (response.duels.blitz_sg.games.wins / response.duels.blitz_sg.games.losses).toFixed(1)

      // Mega Walls stats.Duels.mw_duel_kills
      response.duels.mega_walls.combat.kills = stats.Duels.mw_duel_kills || 0
      response.duels.mega_walls.combat.deaths = stats.Duels.mw_duel_deaths || 0
      response.duels.mega_walls.combat.kdr = (response.duels.mega_walls.combat.kills / response.duels.mega_walls.combat.deaths).toFixed(1)
      response.duels.mega_walls.games.wins = stats.Duels.mw_duel_wins || 0
      response.duels.mega_walls.games.played = stats.Duels.mw_duel_rounds_played || 0
      response.duels.mega_walls.games.losses = stats.Duels.mw_duel_losses || 0
      response.duels.mega_walls.games.wlr = (response.duels.mega_walls.games.wins / response.duels.mega_walls.games.losses).toFixed(1)

      // Arena stats.Duels.duel_arena_kills
      response.duels.arena.combat.kills = stats.Duels.duel_arena_kills || 0
      response.duels.arena.combat.deaths = stats.Duels.duel_arena_deaths || 0
      response.duels.arena.combat.kdr = (response.duels.arena.combat.kills / response.duels.arena.combat.deaths).toFixed(1)
      response.duels.arena.games.wins = stats.Duels.duel_arena_wins || 0
      response.duels.arena.games.played = stats.Duels.duel_arena_rounds_played || 0
      response.duels.arena.games.losses = stats.Duels.duel_arena_losses || 0
      response.duels.arena.games.wlr = (response.duels.arena.games.wins / response.duels.arena.games.losses).toFixed(1)

      // Boxing stats.Duels.boxing_duel_kills
      response.duels.boxing.combat.kills = stats.Duels.boxing_duel_kills || 0
      response.duels.boxing.combat.deaths = stats.Duels.boxing_duel_deaths || 0
      response.duels.boxing.combat.kdr = (response.duels.boxing.combat.kills / response.duels.boxing.combat.deaths).toFixed(1)
      response.duels.boxing.games.wins = stats.Duels.boxing_duel_wins || 0
      response.duels.boxing.games.played = stats.Duels.boxing_duel_rounds_played || 0
      response.duels.boxing.games.losses = stats.Duels.boxing_duel_losses || 0
      response.duels.boxing.games.wlr = (response.duels.boxing.games.wins / response.duels.boxing.games.losses).toFixed(1)

      // Parkour stats.Duels.parkour_eight.kills
      //response.duels.parkour.combat.kills = stats.Duels.parkour_eight_kills || 0
      response.duels.parkour.combat.deaths = stats.Duels.parkour_eight_deaths || 0
      //response.duels.parkour.combat.kdr = (response.duels.parkour.combat.kills / response.duels.parkour.combat.deaths).toFixed(1)
      response.duels.parkour.games.wins = stats.Duels.parkour_eight_wins || 0
      response.duels.parkour.games.played = stats.Duels.parkour_eight_rounds_played || 0
      response.duels.parkour.games.losses = stats.Duels.parkour_eight_losses || 0
      response.duels.parkour.games.wlr = (response.duels.parkour.games.wins / response.duels.parkour.games.losses).toFixed(1)
    }

    if (stats.MurderMystery) {
      response.murdermystery = {
        overall: { games: {}, combat: { kills: {} } },
        classic: { games: {}, combat: { kills: {} } },
        double_up: { games: {}, combat: { kills: {} } },
        assassins: { games: {}, combat: { kills: {} } },
        infection: { games: {}, combat: { kills: {} } }
      }

      // Overall stats.MurderMystery.kills
      response.murdermystery.overall.combat.kills.total = stats.MurderMystery.kills || 0
      response.murdermystery.overall.combat.kills.knife_melee = stats.MurderMystery.knife_kills || 0
      response.murdermystery.overall.combat.kills.knife_thrown = stats.MurderMystery.thrown_knife_kills || 0
      response.murdermystery.overall.combat.kills.bow = stats.MurderMystery.bow_kills || 0
      response.murdermystery.overall.combat.deaths = stats.MurderMystery.deaths || 0
      response.murdermystery.overall.combat.kdr = (response.murdermystery.overall.combat.kills.total / response.murdermystery.overall.combat.deaths).toFixed(1)
      response.murdermystery.overall.games.wins = stats.MurderMystery.wins || 0
      response.murdermystery.overall.games.played = stats.MurderMystery.games || 0
      response.murdermystery.overall.games.losses = (response.murdermystery.overall.games.played - response.murdermystery.overall.games.wins)
      response.murdermystery.overall.games.wlr = (response.murdermystery.overall.games.wins / response.murdermystery.overall.games.losses).toFixed(1)

      // Classic stats.MurderMystery.kills_MURDER_CLASSIC
      response.murdermystery.classic.combat.kills.total = stats.MurderMystery.kills_MURDER_CLASSIC
      response.murdermystery.classic.combat.kills.melee_knife = stats.MurderMystery.knife_kills_MURDER_CLASSIC || 0
      response.murdermystery.classic.combat.kills.knife_thrown = stats.MurderMystery.thrown_knife_kills_MURDER_CLASSIC || 0
      response.murdermystery.overall.combat.kills.bow = stats.MurderMystery.bow_kills_MURDER_CLASSIC || 0
      response.murdermystery.classic.combat.deaths = stats.MurderMystery.deaths_MURDER_CLASSIC || 0
      response.murdermystery.classic.combat.kdr = (response.murdermystery.classic.combat.kills.total / response.murdermystery.classic.combat.deaths).toFixed(1)
      response.murdermystery.classic.games.wins = stats.MurderMystery.wins_MURDER_CLASSIC || 0
      response.murdermystery.classic.games.played = stats.MurderMystery.games_MURDER_CLASSIC || 0
      response.murdermystery.classic.games.losses = (response.murdermystery.classic.games.played - response.murdermystery.classic.games.wins)
      response.murdermystery.classic.games.wlr = (response.murdermystery.classic.games.wins / response.murdermystery.classic.games.losses).toFixed(1)

      // Double Up stats.MurderMystery.kills_MURDER_DOUBLE_UP
      response.murdermystery.double_up.combat.kills.total = stats.MurderMystery.kills_MURDER_DOUBLE_UP
      response.murdermystery.double_up.combat.kills.melee_knife = stats.MurderMystery.knife_kills_MURDER_DOUBLE_UP || 0
      response.murdermystery.double_up.combat.kills.knife_thrown = stats.MurderMystery.thrown_knife_kills_MURDER_DOUBLE_UP || 0
      response.murdermystery.overall.combat.kills.bow = stats.MurderMystery.bow_kills_MURDER_DOUBLE_UP || 0
      response.murdermystery.double_up.combat.deaths = stats.MurderMystery.deaths_MURDER_DOUBLE_UP || 0
      response.murdermystery.double_up.combat.kdr = (response.murdermystery.double_up.combat.kills.total / response.murdermystery.double_up.combat.deaths).toFixed(1)
      response.murdermystery.double_up.games.wins = stats.MurderMystery.wins_MURDER_DOUBLE_UP || 0
      response.murdermystery.double_up.games.played = stats.MurderMystery.games_MURDER_DOUBLE_UP || 0
      response.murdermystery.double_up.games.losses = (response.murdermystery.double_up.games.played - response.murdermystery.double_up.games.wins)
      response.murdermystery.double_up.games.wlr = (response.murdermystery.double_up.games.wins / response.murdermystery.double_up.games.losses).toFixed(1)

      // Assassins stats.MurderMystery.kills_MURDER_ASSASSINS
      response.murdermystery.assassins.combat.kills.total = stats.MurderMystery.kills_MURDER_ASSASSINS
      response.murdermystery.assassins.combat.kills.melee_knife = stats.MurderMystery.knife_kills_MURDER_ASSASSINS || 0
      response.murdermystery.assassins.combat.kills.knife_thrown = stats.MurderMystery.thrown_knife_kills_MURDER_ASSASSINS || 0
      response.murdermystery.overall.combat.kills.bow = stats.MurderMystery.bow_kills_MURDER_ASSASSINS || 0
      response.murdermystery.assassins.combat.deaths = stats.MurderMystery.deaths_MURDER_ASSASSINS || 0
      response.murdermystery.assassins.combat.kdr = (response.murdermystery.assassins.combat.kills.total / response.murdermystery.assassins.combat.deaths).toFixed(1)
      response.murdermystery.assassins.games.wins = stats.MurderMystery.wins_MURDER_ASSASSINS || 0
      response.murdermystery.assassins.games.played = stats.MurderMystery.games_MURDER_ASSASSINS || 0
      response.murdermystery.assassins.games.losses = (response.murdermystery.assassins.games.played - response.murdermystery.assassins.games.wins)
      response.murdermystery.assassins.games.wlr = (response.murdermystery.assassins.games.wins / response.murdermystery.assassins.games.losses).toFixed(1)

      // Infection stats.MurderMystery.kills_MURDER_INFECTION
      response.murdermystery.infection.combat.kills.total = stats.MurderMystery.kills_MURDER_INFECTION
      response.murdermystery.infection.combat.kills.melee_knife = stats.MurderMystery.knife_kills_MURDER_INFECTION || 0
      response.murdermystery.infection.combat.kills.knife_thrown = stats.MurderMystery.thrown_knife_kills_MURDER_INFECTION || 0
      response.murdermystery.overall.combat.kills.bow = stats.MurderMystery.bow_kills_MURDER_INFECTION || 0
      response.murdermystery.infection.combat.deaths = stats.MurderMystery.deaths_MURDER_INFECTION || 0
      response.murdermystery.infection.combat.kdr = (response.murdermystery.infection.combat.kills.total / response.murdermystery.infection.combat.deaths).toFixed(1)
      response.murdermystery.infection.games.wins = stats.MurderMystery.wins_MURDER_INFECTION || 0
      response.murdermystery.infection.games.played = stats.MurderMystery.games_MURDER_INFECTION || 0
      response.murdermystery.infection.games.losses = (response.murdermystery.infection.games.played - response.murdermystery.infection.games.wins)
      response.murdermystery.infection.games.wlr = (response.murdermystery.infection.games.wins / response.murdermystery.infection.games.losses).toFixed(1)
    }



    res.status(200).send({ success: true, stats: response })
  }
}