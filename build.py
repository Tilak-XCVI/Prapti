#!/usr/bin/env python3
"""Build Prapti from src/.

    python3 build.py           -> test version into beta/   (https://tilak-xcvi.github.io/Prapti/beta/)
    python3 build.py stable    -> live version into the root (https://tilak-xcvi.github.io/Prapti/)

Only build stable when the owner has tested beta and said "release".
"""
import datetime, hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
STABLE = len(sys.argv) > 1 and sys.argv[1] == 'stable'
OUT = ROOT if STABLE else os.path.join(ROOT, 'beta')
UP = '' if STABLE else '../'
TITLE = 'Prapti' if STABLE else 'Prapti Beta'
ORDER = ['app1', 'app2', 'app3', 'app4', 'app6', 'app7', 'app8', 'app5', 'app9', 'app10']  # later files override earlier ones

content = json.dumps(json.load(open(os.path.join(SRC, 'content.json'))), ensure_ascii=False)
js = "\n".join(open(os.path.join(SRC, 'js', n + '.js')).read() for n in ORDER).replace('__CONTENT__', content, 1)
js = "const BUILD = '" + ('stable' if STABLE else 'beta') + "';\n" + js
if not STABLE:  # the test version lives one folder down and shares the images and audio
    js = js.replace("'m/' + id", "'../m/' + id").replace("'audio/", "'../audio/").replace('"letter-bee.jpg"', '"../letter-bee.jpg"').replace('"note-advice.jpg"', '"../note-advice.jpg"')
ver = hashlib.md5(js.encode()).hexdigest()[:8]

head = open(os.path.join(SRC, 'shell-head.html')).read().replace('{TITLE}', TITLE).replace('{UP}', UP)
tail = open(os.path.join(SRC, 'shell-tail.html')).read().replace('{VER}', ver)
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w').write(head + js + tail)

sw = open(os.path.join(SRC, 'sw.js')).read().replace('__VER__', ver)
if not STABLE:
    sw = sw.replace("const CACHE = 'prapti-", "const CACHE = 'praptib-").replace("k.startsWith('prapti-')", "k.startsWith('praptib-')")
    sw = sw.replace("'vendor/supabase.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png'", "'../vendor/supabase.js', 'manifest.webmanifest', '../icons/icon-180.png', '../icons/icon-192.png'").replace("icon: 'icons/icon-192.png', badge: 'icons/icon-192.png'", "icon: '../icons/icon-192.png', badge: '../icons/icon-192.png'")
    man = json.load(open(os.path.join(ROOT, 'manifest.webmanifest')))
    man['name'] = man['short_name'] = 'Prapti Beta'
    for ic in man['icons']: ic['src'] = '../' + ic['src']
    json.dump(man, open(os.path.join(OUT, 'manifest.webmanifest'), 'w'), indent=2)
open(os.path.join(OUT, 'sw.js'), 'w').write(sw)

appv = re.search(r"const APP_VERSION = '([^']+)'", js).group(1)
json.dump({'version': appv, 'build': ver, 'at': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}, open(os.path.join(OUT, 'version.json'), 'w'))
print('built', 'LIVE (Chhaya)' if STABLE else 'TEST (beta)', 'v' + appv, ver)
