import fs from 'fs';
import path from 'path';
const dir='/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const skip=['char:','story:','[','世界观','主要势力','写作风格','主要地点','新艾利都'];
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.yaml')&&!skip.some(s=>f.startsWith(s))).sort();
for(const f of files){
  const c=fs.readFileSync(path.join(dir,f),'utf8');
  const line1=c.split('\n')[0].substring(0,80);
  console.log(f+' | '+c.length+'B | '+line1);
}
console.log('---Total:'+files.length);
