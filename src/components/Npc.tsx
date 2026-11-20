import React from 'react';
import {View} from 'react-native';
import {AtlasFrame} from './AtlasFrame';
import type {Facing,Point} from '../game';
import priestAnchors from '../priest-anchors.json';
import keeperAnchors from '../keeper-anchors.json';

export type NpcKind='priest'|'keeper';
const art={priest:require('../../assets/world/npcs/priest-walk-v2.png'),keeper:require('../../assets/world/npcs/keeper-walk.png')};
const anchors={priest:priestAnchors,keeper:keeperAnchors};
const rows={front:0,back:1,left:2,right:3};
export function npcFacing(position:Point,hero?:Point):Facing{
 if(!hero||Math.hypot(hero.x-position.x,hero.y-position.y)>150)return 'front';
 const dx=hero.x-position.x,dy=hero.y-position.y;
 return Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'back':'front';
}
export function npcBaseline(kind:NpcKind,facing:Facing,frame=0){return anchors[kind][rows[facing]*8+frame%8];}
export function Npc({kind,facing='front',frame=0,size=76}:{kind:NpcKind;facing?:Facing;frame?:number;size?:number}){
 const baseline=npcBaseline(kind,facing,frame);
 return <View style={{width:size,height:size}}><View style={{position:'absolute',left:size*.39,top:size*baseline-2,width:size*.22,height:3,borderRadius:20,backgroundColor:'#172b2966'}}/><AtlasFrame source={art[kind]} cell={rows[facing]*8+frame%8} columns={8} rows={4} size={size}/></View>;
}
