import fs from 'fs';
const API_KEY = 'f864a9dfab7a485491b3c07959415400';
async function test() {
  const r = await fetch(`https://api.football-data.org/v4/competitions/PD/teams`, { headers: { 'X-Auth-Token': API_KEY } });
  const data = await r.json();
  data.teams.forEach(t => console.log(t.address));
}
test();
