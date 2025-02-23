#!/usr/bin/env node

// mkjson.js
// job:   makes JSON data feed of baseball schedule
// git:   http://github.com/motetpaper/dbacks-json
// lic:   CC0

const fs = require('fs');

// place the team codes in a Map for easy access
const teamcodes = new Map();
fs.readFileSync('teams.csv', 'utf8')
  .trim().split(/\n/).map((a)=>a.split(',')).forEach((a)=>{
    teamcodes.set(a[1],a[0]);
  });

// convert the CSV into a JSON feed
fs.readFile('dbacks.csv','utf8', (err,data) => {
  
  const lines = data.trim().split(/\n/);
  const arr = lines.map((a)=>a.split(','));
  const schedule = [];

  headers = arr[0].join('\n')
  // let us detect the team
  subject = []
  arr.shift() // removes title row
  arr.forEach((a)=>{
    subject.push(a[3])
  })

  teams = subject.join(' ').trim().split(' ')
    .filter((a)=>a.length>2)

    const counts = {}
    for (const t of teams) {
      counts[t] = counts[t] ? counts[t] + 1 : 1;
    }

  const teamnames = Object.keys(counts)
  const max = Math.max(...Object.values(counts))

  // the apparent team
  const team = teamnames.find(key => counts[key] === max);

  arr.forEach((a)=>{
    // 0 start date
    // 1 start time (first pitch)
    // 3 subject
    dt = new Date(`${a[0]} 00:00:00 -0700`)
    fp = new Date(`${a[0]} ${a[1]}`)
    opendt = new Date('2025-03-27T00:00:00-0700')
    versus = a[3].replace(' at ','')
      .replace(team, '').trim()
    home = !!a[3].indexOf(team);
    schedule.push({
      openingdayts: +opendt,
      openingdayiso: opendt,
      openingday: opendt.toLocaleDateString('fr-CA'),
      datets: +dt,
      dateiso: dt,
      date: dt.toLocaleDateString('fr-CA'),
      firstpitchts: +fp,
      firstpitchiso: fp,
      firstpitch: fp.toLocaleTimeString('en-US',{
        timeStyle: 'short',
        timezone: 'America/Phoenix'
      }),
      team: versus,
      teamcode: teamcodes.get(versus),
      homegame: home,
    }) // push
  }) // foreach

  const outdata = JSON.stringify(schedule
    .filter((a)=>a.firstpitchts > a.openingdayts), null, 2)

  fs.writeFile('outputs/dbacks.json', outdata, 'utf8', (err)=>{
    if (err) throw err;
  });
});
