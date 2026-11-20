import test from 'node:test';
import assert from 'node:assert/strict';
import { readSavedJourney, writeSavedJourney, createJourneyWriter, BACKUP_KEY } from '../src/saveStorage.ts';
import { SAVE_KEY } from '../src/game.ts';
import { newProgression } from '../src/progression.ts';
const journey = money => ({name:'Tester',petName:'Argos',pet:'Boxer',color:'#fff',region:'cabin',worldVersion:2,position:{x:450,y:490},gathered:[],inventory:0,visited:['temple','cabin'],progress:{...newProgression(),money}});
function storage(entries={}) {
  const data=new Map(Object.entries(entries));
  return {data,getItem:async k=>data.get(k)??null,setItem:async(k,v)=>{data.set(k,v);}};
}
test('save rotation retains previous valid journey and recovers corrupted primary',async()=>{
 const store=storage();await writeSavedJourney(store,journey(10));await writeSavedJourney(store,journey(20));
 assert.equal((await readSavedJourney(store)).save.progress.money,20);
 store.data.set(SAVE_KEY,'{broken');
 const recovered=await readSavedJourney(store);
 assert(recovered.recovered);assert.equal(recovered.save.progress.money,10);
 await writeSavedJourney(store,recovered.save);
 assert.equal(JSON.parse(store.data.get(BACKUP_KEY)).progress.money,10);
});
test('failed primary write leaves recoverable old data; invalid incoming save cannot overwrite it',async()=>{
 const store=storage({[SAVE_KEY]:JSON.stringify(journey(10))});
 const failing={...store,setItem:async(k,v)=>{if(k===SAVE_KEY)throw Error('disk full');store.data.set(k,v);}};
 await assert.rejects(writeSavedJourney(failing,journey(20)));
 assert.equal((await readSavedJourney(store)).save.progress.money,10);
 await assert.rejects(writeSavedJourney(store,{...journey(30),progress:{...newProgression(),money:-1}}));
 assert.equal((await readSavedJourney(store)).save.progress.money,10);
});
test('empty and wholly corrupt storage are distinguished',async()=>{
 assert.equal((await readSavedJourney(storage())).corrupt,false);
 const bad=await readSavedJourney(storage({[SAVE_KEY]:'null',[BACKUP_KEY]:'{}'}));
 assert.equal(bad.save,null);assert.equal(bad.corrupt,true);
});
test('invalid facing falls back to a valid backup instead of reaching the sprite renderer',async()=>{
 const good={...journey(50),facing:'left'};
 const store=storage({[SAVE_KEY]:JSON.stringify({...good,facing:'sideways'}),[BACKUP_KEY]:JSON.stringify(good)});
 const recovered=await readSavedJourney(store);
 assert.equal(recovered.recovered,true);
 assert.equal(recovered.save.facing,'left');
 assert.equal(recovered.save.progress.money,50);
});

test('rapid queued saves preserve order while the first storage write is delayed', async () => {
  const store = storage();
  let release, entered;
  const gate = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { entered = resolve; });
  let first = true;
  const delayed = { ...store, setItem: async (key, value) => {
    if (key === SAVE_KEY && first) { first = false; entered(); await gate; }
    await store.setItem(key, value);
  }};
  const write = createJourneyWriter(delayed);
  const writes = [write(journey(10)), write(journey(20)), write(journey(30))];
  await started;
  assert.equal(store.data.has(SAVE_KEY), false);
  release();
  await Promise.all(writes);
  assert.equal((await readSavedJourney(store)).save.progress.money, 30);
  assert.equal(JSON.parse(store.data.get(BACKUP_KEY)).progress.money, 20);
});

test('a failed queued write reports failure and later saves still succeed', async () => {
  const store = storage({ [SAVE_KEY]: JSON.stringify(journey(10)) });
  let fail = true;
  const unreliable = { ...store, setItem: async (key, value) => {
    if (key === SAVE_KEY && fail) { fail = false; throw new Error('temporary write failure'); }
    await store.setItem(key, value);
  }};
  const write = createJourneyWriter(unreliable);
  const failed = write(journey(20));
  const next = write(journey(30));
  await assert.rejects(failed, /temporary write failure/);
  await next;
  assert.equal((await readSavedJourney(store)).save.progress.money, 30);
  assert.equal(JSON.parse(store.data.get(BACKUP_KEY)).progress.money, 10);
});
