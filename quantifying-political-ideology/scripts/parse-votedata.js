
const aq = require('arquero');
const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '..', 'data', 'H116_votes.csv'), 'utf-8');
const df = aq.fromCSV(text)

const currentClass = df.filter(d => d.congress === 116);
const filteredRollcalls = currentClass.filter(aq.escape(d => {
  return [93, 691, 801, 807, 808].includes(d.rollnumber)
}));

console.log('currentClass.size', currentClass.size);
console.log('filteredRollcalls.size', filteredRollcalls.size);

fs.writeFileSync(path.join(__dirname, '..', 'data', 'member-votes-clean-116.json'), JSON.stringify(filteredRollcalls.objects()));

