
const aq = require('arquero');
const fs = require('fs');
const path = require('path');


const text = fs.readFileSync(path.join(__dirname, '..', 'data', 'HSall_members.csv'), 'utf-8');
const df = aq.fromCSV(text)

const currentClass = df.filter(d => d.congress === 116);
const currentHouse = currentClass.filter(d => d.chamber === 'House');


const lookupSet = new Set(currentHouse.array('icpsr'));

console.log(lookupSet.size);

console.log(df.size);

const currentClassWithHistory = df.filter(d => d.chamber === 'House').filter(aq.escape(d => {
    return lookupSet.has(d.icpsr);
}));

// const currentClassWithHistory = df.filter(aq.escape(d => {
//     return aq.op.includes(currentClass.select('icpsr'), d.icpsr);
// }))


console.log(currentClassWithHistory.array('icpsr').length);


fs.writeFileSync(path.join(__dirname, '..', 'data', 'members-clean-116.json'), JSON.stringify(currentClassWithHistory.objects()));

