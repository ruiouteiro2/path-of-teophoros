import test from 'node:test';
import assert from 'node:assert/strict';
import { readSavedJourney, writeSavedJourney, BACKUP_KEY } from '../src/saveStorage.ts';
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
