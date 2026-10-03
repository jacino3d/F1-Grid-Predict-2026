const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const racesDeclaration = source.match(/const RACES = \[[\s\S]*?\n\];/)[0];
const nextRaceHelper = source.match(/function getNextOpenRace\(now = new Date\(\)\) \{[\s\S]*?\n\}/)[0];
const context = { Date, allResults: {} };
vm.createContext(context);
vm.runInContext(`${racesDeclaration}\n${nextRaceHelper}\nglobalThis.RACES = RACES; globalThis.getNextOpenRace = getNextOpenRace;`, context);

test('2026 calendar contains the verified post-Baku sequence', () => {
  const remaining = context.RACES.filter(race => race.raceTime >= '2026-09-26T00:00:00' && !race.canceled);
  assert.deepEqual(JSON.parse(JSON.stringify(remaining.map(({ round, name, track, raceTime }) => ({ round, name, track, raceTime })))), [
    { round: 15, name: 'GP do Azerbaijão', track: 'Baku', raceTime: '2026-09-26T08:00:00' },
    { round: 16, name: 'GP do Bahrein na Malásia', track: 'Sepang International Circuit', raceTime: '2026-10-04T04:00:00' },
    { round: 17, name: 'GP de Singapura', track: 'Marina Bay', raceTime: '2026-10-11T09:00:00' },
    { round: 18, name: 'GP dos EUA', track: 'Austin', raceTime: '2026-10-25T17:00:00' },
    { round: 19, name: 'GP da Cid. do México', track: 'México City', raceTime: '2026-11-01T17:00:00' },
    { round: 20, name: 'GP de São Paulo', track: 'Interlagos', raceTime: '2026-11-08T14:00:00' },
    { round: 21, name: 'GP de Las Vegas', track: 'Las Vegas Strip', raceTime: '2026-11-22T00:00:00' },
    { round: 22, name: 'GP do Catar', track: 'Losail', raceTime: '2026-11-29T13:00:00' },
    { round: 23, name: 'GP de Abu Dhabi', track: 'Yas Marina', raceTime: '2026-12-06T10:00:00' }
  ]);
});

test('next-race selection prefers Bahrain in Malaysia before Singapore', () => {
  context.allResults = {};
  assert.equal(context.getNextOpenRace(new Date('2026-10-03T12:00:00')).id, 25);
});

test('next-race selection skips an old event that has no stored result', () => {
  context.allResults = { 17: ['result'] };
  assert.equal(context.getNextOpenRace(new Date('2026-10-04T05:00:00')).id, 18);
});
