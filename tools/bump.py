"""Выпуск плагина: версия, модули Samsung, «что нового» — в version.json и в PIN загрузчика (docs/sunic.js).

    python tools/bump.py                 # та же версия: пересобрать version.json и PIN (проверка перед коммитом)
    python tools/bump.py patch           # 1.0.0 → 1.0.1
    python tools/bump.py minor           # 1.0.1 → 1.1.0
    python tools/bump.py --samsung 2.1.2 # перейти на модули другой ВЫПУЩЕННОЙ версии Lampa для Samsung

Запасной список модулей (плагин сам берёт последний выпуск; этот — когда GitHub недоступен) — из version.json пакета Samsung по тегу v<samsung> (raw.githubusercontent), без loader.js
(его заменяет src/android.js) и без модулей только для Samsung (bshub, bsvolume). Потом — автотесты; не прошли — стоп.
"""
import io, json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMSUNG_ONLY = ('loader.js', 'update.js', 'polyfills.js', 'bshub.js', 'bsvolume.js')


def die(msg):
    print('ОШИБКА:', msg)
    sys.exit(1)


def num(v):
    m = re.match(r'^(\d+)\.(\d+)\.(\d+)$', str(v or ''))
    return tuple(int(x) for x in m.groups()) if m else None


def samsung_modules(ver):
    url = 'https://raw.githubusercontent.com/sunic007/lampa-samsung/v%s/version.json' % ver
    try:
        data = json.load(urllib.request.urlopen(url, timeout=20))
    except Exception as e:
        die('не прочитать %s (%s) — такой версии Lampa для Samsung нет или нет сети' % (url, e))
    if data.get('version') != ver:
        die('по тегу v%s лежит version.json версии %s' % (ver, data.get('version')))
    return [f for f in data['files'] if f not in SAMSUNG_ONLY]


def changelog_notes(version):
    """«Что нового» для окна обновления: заголовок и пункты раздела версии из CHANGELOG.md, без разметки."""
    path = os.path.join(ROOT, '.github', 'CHANGELOG.md')
    title, items, inside = '', [], False
    for line in io.open(path, encoding='utf-8').read().splitlines():
        if line.startswith('## '):
            if inside:
                break
            m = re.match(r'##\s+' + re.escape(version) + r'\b\s*(?:[—-]\s*(.*))?$', line)
            if m:
                inside, title = True, (m.group(1) or '').strip()
            continue
        if not inside:
            continue
        if line.startswith('- '):
            items.append(line[2:].strip())
        elif line.startswith('  ') and items:
            items[-1] += ' ' + line.strip()
    if not inside:
        die('в .github/CHANGELOG.md нет раздела «## %s — …» — сначала опишите выпуск' % version)
    clean = lambda t: re.sub(r'\*\*|`', '', t).strip()
    short = lambda t: t if len(t) <= 220 else t[:217].rstrip() + '…'
    return {'title': clean(title)[:120], 'items': [short(clean(i)) for i in items[:6]]}


def main(argv):
    bump, samsung = None, None
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ('patch', 'minor'):
            bump = a
        elif a == '--samsung' and i + 1 < len(argv):
            samsung = argv[i + 1]
            i += 1
        else:
            die('непонятный аргумент: %s' % a)
        i += 1

    vpath = os.path.join(ROOT, 'version.json')
    cur = json.load(io.open(vpath, encoding='utf-8'))
    ver = num(cur['version']) or die('version.json: плохая версия %r' % cur['version'])
    if bump == 'patch':
        ver = (ver[0], ver[1], ver[2] + 1)
    elif bump == 'minor':
        ver = (ver[0], ver[1] + 1, 0)
    version = '%d.%d.%d' % ver
    samsung = samsung or cur['samsung']
    if not num(samsung):
        die('плохая версия Samsung: %r' % samsung)

    data = {'version': version, 'samsung': samsung, 'modules': samsung_modules(samsung), 'notes': changelog_notes(version)}
    with io.open(vpath, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write('\n')

    jpath = os.path.join(ROOT, 'docs', 'sunic.js')
    js = io.open(jpath, encoding='utf-8').read()
    pin = "var PIN = { version: '%s', samsung: '%s', modules: [%s] };" % (
        version, samsung, ', '.join("'%s'" % m for m in data['modules']))
    js2, n = re.subn(r"var PIN = \{[^\n]*\};", lambda m: pin, js, count=1)
    if n != 1:
        die('docs/sunic.js: нет строки «var PIN = {…};»')
    with io.open(jpath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(js2)

    r = subprocess.run(['node', os.path.join(ROOT, 'tests', 'run.cjs')], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(r.stdout.strip())
    if r.returncode != 0:
        die('автотесты не прошли')
    print('Sunic Apps для Android %s · модули Lampa для Samsung %s (%d) · version.json и PIN записаны' % (version, samsung, len(data['modules'])))


if __name__ == '__main__':
    main(sys.argv[1:])
