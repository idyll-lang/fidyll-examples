
const aq = require('arquero');
const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '..', 'data', 'H117_votes.csv'), 'utf-8');
const df = aq.fromCSV(text)

const currentClass = df.filter(d => d.congress === 117);
const filteredRollcalls = currentClass.filter(d => d.rollnumber <= 10);

fs.writeFileSync(path.join(__dirname, '..', 'data', 'member-votes-clean.json'), JSON.stringify(filteredRollcalls.objects()));

