#!/usr/bin/env python3
"""Generate distinct ORIGINAL SVG draft art, not photorealistic or final assets.
No external libraries, raster input, real-person likenesses or copied game art.
Each ID owns its SVG file; replace its configured path with PNG/WebP later.
"""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/characters/rock-army'
OUT.mkdir(parents=True, exist_ok=True)


def path(d, fill='url(#stone)', stroke='#344043', width=4, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def ellipse(x, y, rx, ry, fill='url(#stone)', extra=''):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="#344043" stroke-width="4" {extra}/>'
def poly(points, fill='url(#stone)', extra=''):
    return f'<polygon points="{points}" fill="{fill}" stroke="#344043" stroke-width="4" stroke-linejoin="round" {extra}/>'
def line(d, color='#b5c9bf', width=4, extra=''):
    return path(d, 'none', color, width, extra)
def crystal(x, y, size=1, color='url(#crystal)', angle=0):
    return f'<g transform="translate({x} {y}) rotate({angle}) scale({size})">'+poly('0,-55 19,-24 12,20 -12,20 -19,-24',color)+poly('0,-55 0,20 -12,20 -19,-24','#ffffff30')+line('M0-55 0 20M-19-24 19-24','#ffffff90',2)+'</g>'
def rock(x,y,scale=1,fill='url(#stone)',angle=0):
    return f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})">'+poly('-30,-24 -9,-39 23,-27 37,4 19,31 -17,33 -38,10',fill)+line('M-30-24-6-8 23-27M-6-8 4 19 19 31','#ffffff40',3)+'</g>'
def boots(style=0,spread=0):
    if style==1:
        return path(f'M{139-spread} 337l-19 40-20 14 39 6 34-49M{191+spread} 337l22 38 29 15-43 6-32-46','#53615b')
    return path(f'M{126-spread} 332l-3 44-17 11 3 10 51 0 6-65M{191+spread} 332l2 44 19 11-4 10-49 0-5-65','#53615b')
def torso(kind='tunic',fill='url(#stone)'):
    if kind=='robe': return path('M131 211 108 245 89 359Q175 382 258 356L234 243 203 212Z',fill)+path('M162 216 137 359l39-19 31 19-20-143','#fff1c1aa')
    if kind=='armor': return poly('126,217 206,216 235,245 215,333 121,333 101,247',fill)+poly('126,217 164,250 206,216 195,286 135,286','#ffffff24')+line('M164 250 167 329M120 297 216 297','#4e6160',5)
    if kind=='wide': return path('M109 216 226 212 271 258 243 337 99 337 68 261Z',fill)+line('M109 216 128 270 99 337M226 212 207 270 243 337M128 270 207 270','#ffffff44',4)
    return path('M130 216 207 216 224 243 216 332 118 332 112 246Z',fill)+line('M130 216 159 270 207 216M159 270 163 331','#ffffff40',4)
def fist(x,y,scale=1,fill='url(#stone)'):
    return f'<g transform="translate({x} {y}) scale({scale})">'+poly('-35,-21 -17,-34 15,-32 37,-13 35,21 18,36 -19,32 -38,13',fill)+line('M-17-31-10-6M4-32 8-7M24-25 26-4M-34 4-4 8 14 30','#ffffff55',3)+'</g>'
def face(variant=0,kind='granite',scale=1,x=175,y=139,expression='calm',beard=False,hood=False,signature=''):
    # Individual angular face outlines. Facial planes, noses, lips, eyelids and
    # asymmetric lighting are shared anatomy, not a reused egg-shaped head.
    outlines=[
      'M-48-55-24-76 17-78 46-60 52-18 38 42 16 64-18 63-42 39-55-8Z',
      'M-52-49-35-73 13-81 47-63 59-28 48 34 25 61-9 69-43 46-61 4Z',
      'M-39-63-9-83 30-77 52-49 45 6 26 53 4 72-25 57-48 20-50-28Z',
      'M-59-43-37-72 1-81 43-70 60-39 53 28 34 57-14 66-50 38-64 0Z',
      'M-50-62-13-83 26-70 50-47 49 5 34 46 3 68-29 55-47 18-58-25Z',
      'M-55-40-43-68-5-78 34-75 56-50 62-10 42 38 14 64-24 59-57 27Z',
      'M-46-65-17-81 22-76 53-51 56-4 29 42 17 69-16 64-45 38-58-11Z',
    ]
    form=outlines[variant%len(outlines)]
    if signature in ('monk','titan','granite'):
        form='M-61-42-44-70-13-79 30-75 59-52 64-7 49 37 21 61-18 62-49 35-64-3Z'
    elif signature in ('novice','pumice','crystalarcher','jadedancer'):
        form='M-40-57-12-77 20-75 44-54 46-10 28 39 3 66-25 47-45 5-47-28Z'
    elif signature in ('fossil','oremonk','crystalpriest'):
        form='M-44-54-20-77 11-81 46-62 51-20 34 38 11 74-19 63-41 25-50-13Z' 
    s=f'<g transform="translate({x} {y}) rotate({(variant%5-2)*2}) scale({scale})">'
    if hood: s+=path('M-67 25-76-39-46-89 20-101 65-77 76-27 61 48 46 64-54 61Z','url(#cloak)')
    s+=ellipse(-53,-9,10,21,'url(#skin)')+ellipse(54,-7,10,21,'url(#skin)')
    s+=path(form,'url(#skin)','#3b4141',3)
    s+=path('M-44-52-15-69 20-68 42-49 36-27 9-32-1-3-31-17Z','#ffffff21','none')
    s+=path('M-1-3 10-31 38-29 47 7 25 28 20 53-4 61 4 25Z','#283c3b24','none')
    s+=path('M-45 8-29 20-20 41-34 31Z','#2d3c3d25','none')
    brow=[('M-40-23-16-30M15-30 40-20','M-36-13q10-8 21-1M16-14q11-6 22 2'),('M-39-28-15-20M15-20 40-29','M-35-11q10 7 19-1M17-12q10 7 20-1'),('M-39-22-14-25M15-26 41-20','M-36-12q11-5 22 0M17-12q11-5 22 0')]
    eyebrows,eyes=brow[0 if expression in ('angry','grin') else 1 if expression=='worried' else 2]
    s+=line(eyebrows,'#44504a',7)+line(eyes,'#243737',3)
    if expression!='sleep':
        s+=ellipse(-24,-11,4,4,'#283732')+ellipse(27,-10,4,4,'#283732')
        s+='<g fill="#fff9dd"><circle cx="-25" cy="-12" r="1.3"/><circle cx="26" cy="-11" r="1.3"/></g>'
    s+=path('M0-21-6 10-1 17 11 16 14 10','none','#687468',3)
    s+=path('M-3-17-2 10 6 13','#f8f0ce55','none')
    if expression=='grin': s+=path('M-23 29Q4 44 28 25L22 40Q0 51-18 40Z','#3b433a','#39433b',2)+path('M-19 31Q4 42 24 29L21 35Q2 44-16 36Z','#e1dfbe','none')
    elif expression=='worried': s+=line('M-21 37Q2 24 25 36','#535e53',4)+line('M-25 18-29 28M29 16 32 25','#8b9278',2)
    elif expression=='sleep': s+=path('M-8 30Q0 23 9 29L9 40Q0 48-7 39Z','#4e6c67','#395854',2)
    else: s+=path('M-20 31 2 28 24 31 4 39-15 36Z','#6c7665','none')+line('M-18 31 23 31','#424d45',2)
    s+=line('M-28 46-13 52M22 48 12 53','#adb392',2)
    # Eyelid folds, brows, age lines and scars give each fictional face its own identity.
    if signature in ('mage','fossil','oremonk','crystalpriest','rockcannon'):
        s+=line('M-26-43q23-7 48 0M-23-36q22-5 43 0M-35-4-44 1M35-2 43 5M-27 20-31 35M26 19 31 35','#718579',2)
    if signature in ('granite','giantbreaker','obsidianknight'):
        s+=line('M-29-41-20-12-26 10','#dce1bd',5)+line('M-29-41-20-12-26 10','#536c66',1.5)
    if signature == 'pumice':
        s+=ellipse(-34,12,5,4,'#789a8b')+ellipse(32,19,4,5,'#789a8b')+ellipse(22,-46,5,4,'#789a8b')
    # Hair/temple cuts, material fractures and unique cheek markings.
    if kind=='crystal':
        crowns=[
            '-50,-54 -41,-89 -22,-69 -7,-98 8,-73 28,-94 45,-63',
            '-48,-55 -52,-79 -22,-93 -3,-76 21,-94 50,-68 45,-51 18,-65 -10,-55',
            '-45,-52 -28,-90 -12,-71 4,-106 20,-77 38,-94 52,-50 15,-61 -17,-57',
            '-49,-52 -47,-78 -22,-72 -1,-89 20,-68 44,-80 52,-53 25,-60 3,-48 -20,-59',
        ]
        s+=poly(crowns[variant%4],'url(#crystal)')+line('M37-4 29 10 35 24','#ccfffa',3)
    elif kind=='lava':
        s+=path('M-52-48-40-85-18-74-5-93 13-75 41-81 55-48 29-59 9-52-17-60Z','#424441')+line('M-29-56-20-27-29-8M40-31 29-8 35 11M-13 47 0 55','#ff9e48',4)
    elif kind=='obsidian':
        if signature == 'magnet':
            s+=path('M-62-44-63-84-31-68 29-68 62-84 62-42 42-51 25-58-28-58-45-48Z','#384950')
        elif signature == 'obsidianknight':
            s+=path('M-61-23-64-70-31-93 19-92 58-69 61-26 39-39 16-63-27-60-41-37Z','#526075')
        elif signature == 'doomgolem':
            s+=poly('-60,-46 -67,-92 -29,-77 -6,-104 19,-76 65,-94 59,-42 29,-59 -2,-51 -32,-60','#344147')
        else:
            s+=poly('-53,-48 -44,-86 -20,-69 -4,-97 15,-72 43,-87 56,-44 27,-58 2,-49 -27,-59','#344147')
        s+=line('M-37-5-28 10-31 25M35-15 27 0','#b9b1e6',2)
    elif kind=='sandstone':
        s+=path('M-53-46-36-74-9-83 26-74 52-48 27-58-13-61Z','#b89e6d')+line('M-41 5-26 8M24 19 40 16M-32 37-18 41','#ccba8d',2)
    else:
        if signature in ('monk','titan','rockcannon'):
            s+=line('M-41-53Q-7-79 34-57','#d9dec0',5)+line('M-30-44 31-44','#748c79',2)
        elif signature == 'novice':
            s+=path('M-42-54-40-79-19-73-7-86 17-76 43-63 42-48 19-58-11-52Z','#9bab93')
        elif signature == 'stonethrower':
            s+=''.join(ellipse(x,y,10,10,'url(#stone)') for x,y in [(-43,-53),(-33,-69),(-14,-76),(7,-76),(28,-70),(44,-56)])
        elif signature == 'spearman':
            s+=path('M-57-40-52-74-27-87 20-84 53-65 58-37 29-47-24-48Z','#a4b5a3')
            s+=poly('-4,-87 -3,-119 14,-111 13,-87','#647c71')
        elif signature == 'granite':
            s+=path('M-64-36-64-69-36-87 26-87 61-69 64-35 28-49-31-47Z','#879d8b')
        else:
            s+=poly('-53,-48 -43,-80 -18,-71 -3,-91 17,-73 40,-78 53,-44 28,-56 4,-51 -23,-58','url(#stone)')
        s+=line(f'M{-40+variant%5*3}-44-31-25-40-7M31 12 40 26 27 46','#677f71',2)
    if beard: s+=path('M-37 20-22 34 0 42 24 32 41 16 34 51 11 77-12 71-33 50Z','url(#beard)','#50665e',2)+line('M-21 41-13 58M0 48 2 68M22 40 15 59','#e5e5c6',3)
    s+='</g>'
    return s

entries=[]
def add(id,name,material,body,variant,x=175,y=139,scale=1,expression='calm',beard=False,hood=False,back='',front=''):
    entries.append(dict(id=id,name=name,material=material,body=body,variant=variant,x=x,y=y,scale=scale,expression=expression,beard=beard,hood=hood,back=back,front=front))
# Existing free characters become visibly different carved-rock followers.
add('novice','見習い信者','granite',boots()+torso('robe','#d7d6be')+path('M129 259 157 280 178 256 202 276 222 255','none','#697e68',12),0,expression='worried',front=''.join(ellipse(133+i*14,293+abs(i-3)*-6,6,7,'#7e8e72') for i in range(7)))
add('monk','岩の拳僧','granite',boots(0,10)+torso('wide')+rock(107,261,1.1)+rock(239,257,1.1),1,y=128,scale=1.04,expression='grin',front=fist(64,286,1.12)+fist(278,279,1.2)+line('M135 282 168 304 204 278','#cfbd83',8))
add('mage','ドラクエ信者','crystal',boots()+torso('robe','url(#cloak)')+crystal(242,260,.7),2,y=137,beard=True,hood=True,back='<g fill="none" stroke="#8af3e8" stroke-width="3"><ellipse cx="180" cy="374" rx="115" ry="24"/><path d="m80 374 162-20-66 40Z"/></g>',front=line('M286 138 273 365','#8c7965',10)+crystal(287,128,.9))
add('bellkeeper','鐘守りの巡礼','granite',boots()+torso('robe','#68a99b'),3,x=143,y=134,scale=.95,expression='calm',beard=True,front=path('M223 251q-6-64 37-67 46 2 44 66l31 76H191Z','url(#bronze)')+path('m190 326-8 19q80 22 156-1l-7-18Z','#638c7b')+line('M222 272h81M214 294h95','#f2dea1',5))
# Normal: seven new body constructions, not palette variations.
add('pebble','小石信者','granite',boots(1)+path('M138 240 204 233 223 301 199 335 138 329 119 287Z')+rock(113,282,.45)+rock(235,284,.45),4,x=176,y=165,scale=.94,expression='worried',front=line('M145 262 182 283 210 258','#d6bd83',8))
add('granite','岩盾兵','granite',boots(0,23)+torso('armor','#8f9d8c'),5,x=190,y=139,expression='angry',front=poly('49,185 151,196 175,279 130,363 52,332 31,250','#84988a')+poly('61,204 134,216 148,277 121,334 67,314 52,251','#c1c4a5')+line('M87 222 110 311M63 268 141 267','#73876d',10)+fist(262,277,.7))
add('roller','転がる岩玉','granite',poly('84,147 148,102 233,113 300,175 310,278 255,362 158,385 70,344 34,254 42,185','#7c8b7e')+poly('91,172 155,131 224,144 273,189 281,270 236,335 160,355 91,322 62,251 68,196','#adbaa5')+line('M87 172 114 220 65 251M281 270 223 263 236 335M158 355 170 301M155 131 178 176','#5e7466',7),6,x=173,y=232,scale=.98,expression='grin',front=line('M296 147q32 47 25 91M28 292q7 43 45 63','#a5c5b3',5))
add('stonethrower','石投げ信者','sandstone',boots(1)+torso('tunic','#c4b483')+path('M127 246 73 226 50 184M207 244l49 27 41-31','none','#9d9c7e',20),7,x=174,y=144,expression='grin',front=line('M48 186 75 133 110 108','#665940',7)+path('M49 183 66 176 89 188 74 200Z','#74634b')+rock(112,107,.34)+rock(297,235,.5))
add('miner','岩の採掘兵','granite',boots(0,10)+torso('tunic','#929b83')+path('M129 252 174 270 218 251','none','#b89c63',20),8,expression='angry',front=line('M96 340 269 161','#795a37',13)+path('M193 133q58-14 107 51l-29-10-35-20-37 13Z','#afbbae')+path('M108 73q60-35 126 2l8 31H101Z','#ddbc72')+ellipse(172,83,19,16,'#edf1cc'))
add('fossil','化石の番人','sandstone',boots()+torso('robe','#b2aa86')+path('M113 253 80 290 95 335M222 250l38 36-12 50','none','#a7aa85',22),9,beard=True,front=path('M117 280q43-49 91 0-7 44-46 36-26-3-19-28 7-16 22-8','none','#e4d8ab',14)+line('M272 191 260 363','#dad6ae',10)+path('M252 190q-21-24 2-30 15-4 20 10 12-11 23 1 13 18-19 27Z','#e4d8ab'))
add('pumice','軽石の運び手','granite',path('M122 255 204 237 233 276 212 326 159 345 109 306Z','#afbda6')+rock(111,286,.5)+rock(246,273,.45),10,x=168,y=153,scale=.95,expression='worried',back=path('M89 252 52 266 28 308 83 297M225 226l50 1 46 42-72 4','#d0d8be')+line('M92 368h153M114 386h115','#8ec9bf',5),front=''.join(ellipse(x,y,7,5,'#7d9688') for x,y in [(146,279),(188,274),(211,299),(158,322)])+path('M131 292l82-38','none','#d6b978',15))
# Rare: ranged, polearm, fast, healer, sniper, potion and magnet silhouettes.
add('crystalarcher','水晶射手','crystal',boots(1)+torso('armor','#7bacac')+crystal(119,260,.55),11,x=173,y=135,expression='calm',front=path('M272 146Q348 252 271 357','none','#8bede2',14)+line('M272 146 292 251 271 357M192 253 336 253','#e4fff3',4)+poly('336,253 316,242 316,264','#f4ffe3'))
add('spearman','岩槍兵','granite',boots(0,7)+torso('armor','#a4ae96')+rock(109,266,.55),12,x=170,y=135,expression='angry',front=line('M81 375 290 111','#8b7251',11)+poly('290,111 284,66 318,82 313,121 285,150','#d4ddbe')+line('M290 111 318 82','#ffffff99',4))
add('stoneninja','石ころ忍者','obsidian',boots(1,13)+path('M119 245 193 216 233 249 202 321 132 345 100 296Z','#485b62')+path('M127 243 86 266 70 237M208 245l41 19 45-49','none','#667b7c',18),13,x=163,y=145,expression='angry',hood=True,back=path('M135 210 51 235 27 214 95 195 36 174 94 167Z','#85b1aa'),front=path('M111 134q53-16 109 3l-4 48-85 9-24-18Z','#41585e')+line('M104 346 259 171','#c2dbd0',9)+poly('301,177 307,203 333,210 307,218 300,244 294,217 268,210 294,203','#b9cebd'))
add('oremonk','鉱石僧侶','granite',boots()+torso('robe','#a8b797')+path('M128 266 168 286 201 259','none','#768e7b',18),14,x=166,y=135,expression='calm',beard=True,front=line('M278 127 268 366','#9f986d',11)+ellipse(280,112,29,30,'#e8d6a0')+crystal(281,112,.45)+line('M243 92q38-35 72 6M252 136q34 22 58-5','#a7eed1',4))
add('sandstone','砂岩の狙撃手','sandstone',boots(1)+torso('tunic','#b99d6d')+path('M122 263 90 292 197 302M212 250l34 35','none','#ad9f7b',20),15,x=169,y=145,expression='calm',front=path('M103 272 122 284 287 245 318 252 326 267 145 311 114 302Z','#6e7464')+line('M173 280 328 246','#b3c6b8',10)+line('M175 266 199 259','#e1dfbe',9)+path('M98 95q77-59 153-3l-1 20-151 4Z','#d4b88b'))
add('geode','晶洞の薬師','crystal',boots()+torso('robe','#8a9daa'),16,x=130,y=126,scale=.91,expression='grin',hood=True,front=path('M203 275q52-28 109 1l-13 74q-39 33-84-2Z','#6e737e')+ellipse(258,275,58,20,'#a8ead9')+crystal(221,265,.38)+crystal(289,255,.55,angle=17)+path('M186 222l19 4 3 35-19 5-11-21Z','#bfede0')+line('M237 205q-18-21 2-34M269 222q22-20 3-36','#c0fff0',5))
add('magnet','磁鉄の衛士','obsidian',boots(0,15)+torso('armor','#5e7b7f'),17,x=182,y=133,expression='angry',front=path('M74 202v81q0 71 77 72 73-2 72-74v-81h-38v82q0 31-35 32-35-2-35-32v-80Z','#4d6a72')+path('M74 202h41v43H74ZM185 202h38v43h-38Z','#c3cbb3')+line('M46 252 25 274 47 297M248 252l22 22-21 23','#9bdbdf',5))
# Super rare: articulated industrial and elemental roles.
add('lavafist','溶岩拳僧','lava',boots(0,16)+torso('wide','#65584b')+rock(102,267,.85,'#504c46')+rock(244,265,.9,'#504c46'),18,x=177,y=129,expression='grin',front=fist(65,287,1.16,'#514844')+fist(291,282,1.25,'#514844')+line('M49 249 71 276 55 301M288 242 271 266 300 286 280 316M133 237 169 275 145 316M215 241 184 273 217 307','#ff9a45',6))
add('obsidianknight','黒曜石騎士','obsidian',boots(0,18)+torso('armor','#3c4a54')+poly('99,219 75,253 102,283 138,245','#657583'),19,x=174,y=136,expression='angry',front=path('M251 203 310 167 293 283 251 346 225 282Z','#4b4e66')+line('M251 203 257 310M225 282 293 283','#b0a4db',4)+line('M73 341 91 233','#6f8091',11)+poly('91,233 68,194 80,132 101,113 112,173 108,207','#8c95ae'))
add('rockcannon','岩石砲台','granite',path('M59 307h240l28 45H31Z','#647777')+rock(77,364,.75)+rock(268,363,.8)+path('M132 288 150 213 227 212 245 298Z','#8b9b87'),20,x=162,y=153,scale=.84,expression='angry',back=line('M92 337 58 389M268 340 302 390','#748b7f',14),front=path('M182 237 296 223 334 243 332 277 292 289 179 272Z','#758d89')+ellipse(331,260,12,24,'#324c4e')+line('M207 240 295 235M209 269 295 279','#c4d1b6',5))
add('thundermage','雷晶の術師','crystal',boots()+torso('robe','#7c779d')+crystal(103,271,.7),21,x=170,y=139,expression='angry',hood=True,back='<g fill="none" stroke="#dceba0" stroke-width="4"><path d="m67 169-24 45 33-8-22 48M290 123l-22 47 34-11-20 45"/></g>',front=line('M280 151 268 366','#5e6f77',12)+crystal(283,132,.95)+poly('286,73 253,129 277,121 267,165 308,107 285,113','#fff2ad'))
add('giantbreaker','巨石破砕兵','granite',boots(0,17)+torso('wide','#778a7b')+rock(102,265,.8)+rock(234,258,.8),22,x=173,y=132,expression='angry',front=line('M112 354 273 164','#8a7052',18)+poly('214,129 260,98 330,123 336,169 295,204 228,181','#99aa96')+poly('228,139 267,116 316,134 310,160 278,181 235,165','#c6ccaa')+line('M270 118 275 176','#596e61',9))
add('jadedancer','翡翠の舞い手','crystal',boots(1,8)+path('M135 219 191 207 225 245 194 307 235 353 173 341 124 362 148 290 108 255Z','#70ac95')+path('M124 241 74 229 47 258M209 239l48-27 35 25','none','#8db9a0',17),23,x=174,y=139,scale=.95,expression='grin',front=path('M44 261q29-79 78-77l-14 18q-37 19-64 59M289 240q17 53-9 91l-6-22q4-32-15-49Z','#b7eed1')+crystal(176,228,.3))
# Ultra rare: enormous, floating, draconic, ceremonial and destructive silhouettes.
add('titan','巨岩の守護者','granite',boots(0,40)+torso('wide','#839884')+rock(69,244,1.25)+rock(283,247,1.27)+rock(89,324,1.1)+rock(267,327,1.13),24,x=176,y=126,scale=1.1,expression='calm',back=poly('71,228 69,171 44,142 97,147 129,204M230,205 262,144 310,139 287,177 289,231','#91a793'),front=poly('142,255 171,236 207,256 196,302 157,306','#c3ccb1')+line('M170 253 174 292','#617c6c',8))
add('meteormage','隕石魔導師','obsidian',path('M125 219 214 216 250 272 267 345 223 365 169 346 108 363 87 339 108 266Z','#66647b')+crystal(116,261,.5,'#baa0c4'),25,x=175,y=141,expression='angry',hood=True,back=rock(72,105,.75,'#73646b',-30)+rock(291,74,.95,'#73646b',25)+line('M44 49 65 79M303 20 290 47','#eab67e',8)+'<ellipse cx="177" cy="387" rx="97" ry="14" fill="none" stroke="#cbb9d9" stroke-width="4"/>',front=path('M118 256 76 287 44 278M219 255l45 30 48-23','none','#8d7e9e',18)+rock(53,280,.4,'#d6b894'))
add('rockdragon','岩龍','granite',path('M93 251q47-57 112-13 40 12 54 49l54-24 26 18-42 36q-51 10-77-20-31 29-71 13l-36 51-24-10 13-48Z','#748c7b')+path('M143 315l-6 48 27 13 17-8-19-13 19-45M224 315l16 39 30 7 8-14-21-9-9-36','#526f66'),26,x=110,y=170,scale=.94,expression='grin',back=poly('167,235 188,171 212,192 251,175 249,215 278,227 236,258','#afbea0')+poly('86,210 69,151 43,150 60,202','#a9b89a'),front=poly('82,102 55,78 78,145 94,133','#bdcba8')+poly('143,113 156,78 167,138 147,148','#bdcba8')+line('M245 282 267 294 293 287','#c4d6b8',5))
add('crystalpriest','水晶の大司祭','crystal',boots()+torso('robe','#c5d8be')+crystal(112,263,.55)+crystal(237,260,.62),27,x=177,y=147,expression='calm',beard=True,back='<g fill="none" stroke="#a9fae3" stroke-width="4"><circle cx="177" cy="152" r="112"/><path d="m177 23 112 195H64Z"/></g>',front=poly('115,77 122,33 149,59 177,13 201,59 231,33 237,82 200,99 152,100','#d4f1d6')+crystal(177,75,.42)+line('M287 146 278 373','#a3c2a8',11)+crystal(290,134,.9))
add('doomgolem','破滅の岩巨人','obsidian',boots(0,35)+torso('wide','#424d57')+rock(73,252,1.17,'#56606c')+rock(280,249,1.2,'#56606c'),28,x=176,y=126,scale=1.12,expression='angry',back=poly('76,235 42,211 26,151 65,172 92,136 117,210M237,214 263,135 289,176 332,158 308,217 278,242','#68727a'),front=fist(57,315,1.12,'#46515b')+fist(301,308,1.12,'#46515b')+line('M151 236 183 266 166 298 203 326M61 281 72 306 52 331M295 277 279 303 299 330','#c5a6ff',6)+crystal(179,261,.52,'#d1b7ff'))

PALETTES = {
 'granite':('#d6ddc3','#9fab98','#5c776d','#e2e1c5','#a6b49b','#64776b','#aee2ce'),
 'sandstone':('#e9d3a7','#bdab7b','#7c8164','#e7d4ab','#c1b385','#8b8d69','#f3d9a0'),
 'crystal':('#d1f8df','#79b7aa','#4a747d','#e0ecd0','#a7cdb6','#688c81','#b7fff1'),
 'obsidian':('#a5b2b2','#647582','#384550','#c5cabc','#899d91','#4b6764','#c2b8ed'),
 'lava':('#b6a58d','#786b5a','#424a47','#d9c7a0','#ad9e7a','#6a7261','#ffc472'),
}
for e in entries:
    a,b,c,skin1,skin2,skin3,accent=PALETTES[e['material']]
    defs=f'''<defs>
<linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{a}"/><stop offset=".43" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></linearGradient>
<radialGradient id="skin" cx=".29" cy=".22" r=".85"><stop stop-color="{skin1}"/><stop offset=".5" stop-color="{skin2}"/><stop offset="1" stop-color="{skin3}"/></radialGradient>
<linearGradient id="crystal" x1="0" x2="1" y2="1"><stop stop-color="#efffdf"/><stop offset=".43" stop-color="{accent}"/><stop offset="1" stop-color="#568593"/></linearGradient>
<linearGradient id="cloak" x1="0" x2="1" y2="1"><stop stop-color="{b}"/><stop offset=".5" stop-color="{c}"/><stop offset="1" stop-color="{accent}"/></linearGradient>
<linearGradient id="beard" x2=".7" y2="1"><stop stop-color="#d3dbc1"/><stop offset="1" stop-color="#789688"/></linearGradient>
<linearGradient id="bronze" x2="1" y2="1"><stop stop-color="#f3dc9c"/><stop offset=".6" stop-color="#a18e59"/><stop offset="1" stop-color="#467569"/></linearGradient>
</defs>'''
    x,y,z=e['x'],e['y'],e['scale']
    neck='' if e['id']=='roller' else poly(f'{x-18*z},{y+45*z} {x+18*z},{y+45*z} {x+23*z},{y+103*z} {x-20*z},{y+103*z}','url(#stone)')
    flip=' transform="translate(360 0) scale(-1 1)"' if e['id'] in ('granite','rockdragon') else ''
    art=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420" width="360" height="420" role="img" aria-labelledby="title desc">
<title id="title">{escape(e['name'])} — 岩石軍団の仮素材</title>
<desc id="desc">オリジナルSVG仮素材。架空の彫刻された大きな顔と、小さい鉱石の体。写真風の完成素材ではありません。</desc>
{defs}<g stroke-linejoin="round" stroke-linecap="round"{flip}>{e['back']}{neck}{e['body']}{face(e['variant'],e['material'],e['scale'],e['x'],e['y'],e['expression'],e['beard'],e['hood'],e['id'])}{e['front']}</g>
</svg>\n'''
    (OUT / f"{e['id']}.svg").write_text(art)
print(f'Generated {len(entries)} unique draft SVG assets in {OUT}')
