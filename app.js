const express = require('express')
const path = require('path')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())
const dbpath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3002, () => console.log('success'))
  } catch (e) {
    console.log(`Db error ${e.message}`)
    process.exit(1)
  }
}
initialize()

app.get('/players/', async (request, response) => {
  const a = `SELECT player_id AS playerId,player_name AS playerName FROM player_details;`
  const b = await db.all(a)
  response.send(b)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const api3 = `SELECT player_id AS playerId,player_name AS playerName FROM player_details WHERE player_id=${playerId};`
  const db3 = await db.get(api3)
  response.send(db3)
})
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const api4 = `SELECT match_id AS matchId,match,year FROM player_match_score NATURAL JOIN match_details WHERE player_id=${playerId};`
  const db4 = await db.all(api4)
  response.send(db4)
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getDistrictQuery = `SELECT match_id AS matchId,match,year FROM match_details WHERE match_id=${matchId};`
  const district = await db.get(getDistrictQuery)
  response.send(district)
})
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const api5 = `
SELECT 
 player_match_score.player_id AS palyerId,
 player_name AS playerName 
FROM 
    player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id  
WHERE 
    match_id=${matchId};`
  const db5 = await db.all(api5)
  response.send(db5)
})
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const api8 = `
    SELECT
        player_details.player_id AS palyerId,
        player_details.player_name AS playerName,
        SUM(player_match_score.score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes 
    FROM 
        player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id 
    WHERE 
        player_details.player_id=${playerId};`
  const db8 = await db.get(api8)
  response.send(db8)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const details = request.body
  const {playerName} = details
  const api7 = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId};`
  await db.run(api7)
  response.send('Player Details Updated')
})

module.exports = app
