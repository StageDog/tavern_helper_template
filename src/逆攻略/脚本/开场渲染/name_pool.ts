type NameGender = '女' | '男' | '其他';

interface NameRegion {
  surnames: string[];
  names_female: string[];
  names_male: string[];
}

const NAME_REGIONS: Record<string, NameRegion> = {
  日系: {
    surnames: [
      '桐谷',
      '白石',
      '御坂',
      '远坂',
      '雪之下',
      '五条',
      '神代',
      '天羽生',
      '樱屋敷',
      '海老原',
      '八重垣',
      '春山',
      '鹭桥',
      '时女',
      '朝里',
      '雨濑',
    ],
    names_female: [
      '雪乃',
      '月',
      '美琴',
      '凛',
      '千早',
      '灯岭',
      '朱绘',
      '天凪',
      '爱惠',
      '真由',
      '朱鹭羽',
      '香遥',
    ],
    names_male: [
      '研',
      '真嗣',
      '悟',
      '圭',
      '绫一',
      '晓月',
      '透也',
      '怜真',
      '海兔',
      '透矢',
      '白透',
      '绫都',
    ],
  },
  中系: {
    surnames: [
      '林',
      '沈',
      '叶',
      '苏',
      '谢',
      '顾',
      '白',
      '邹',
      '喻',
      '柏',
      '云',
      '花',
      '任',
      '袁',
      '夏侯',
      '诸葛',
      '闻人',
      '东方',
      '赫连',
      '令狐',
    ],
    names_female: [
      '清辞',
      '听雨',
      '映雪',
      '怀瑾',
      '知意',
      '惠然',
      '舜华',
      '文茵',
      '令仪',
      '妙仪',
      '停云',
      '齐光',
    ],
    names_male: [
      '云深',
      '无渡',
      '念卿',
      '听澜',
      '寒笙',
      '清和',
      '时雨',
      '槐夏',
      '幼鸿',
      '鹿鸣',
      '既明',
      '序光',
    ],
  },
  西系: {
    surnames: [
      'Blackwood',
      'Morrison',
      'Ashford',
      "O'Brien",
      'Schneider',
      'Volkov',
      'Castellano',
      'Carmen',
      'Carmichael',
      'Barkley',
      'MacAskill',
      'Ranscombe',
      'Worthing',
    ],
    names_female: [
      'Elena',
      'Chloe',
      'Astrid',
      'Sienna',
      'Faye',
      'Mira',
      'Ivy',
      'Ariadne',
      'Aurora',
      'Cecily',
      'Flora',
      'Sylvie',
    ],
    names_male: [
      'Adrian',
      'Felix',
      'Lucian',
      'Ren',
      'Caspian',
      'Dante',
      'Kael',
      'Luca',
      'Florian',
      'Callum',
      'Oliver',
      'Orion',
    ],
  },
};

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

export function randomCharacterName(gender: NameGender): string {
  const normalizedGender = gender === '其他' ? pick<NameGender>(['女', '男']) : gender;
  const [regionKey, region] = pick(Object.entries(NAME_REGIONS));
  const surname = pick(region.surnames);
  const givenName = normalizedGender === '女' ? pick(region.names_female) : pick(region.names_male);
  return regionKey === '西系' ? `${givenName} ${surname}` : surname + givenName;
}
