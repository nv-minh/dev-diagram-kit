import sys, subprocess, os, math

files = sorted(sys.stdin.read().strip().split('\n'))
N = len(files)
C = 69
F = math.ceil(N / C)
D = 24

print(f'{N} files, {C} commits, ~{F} per commit')

for ci in range(C):
    s = ci * F
    e = min(s + F, N)
    batch = files[s:e]
    if not batch:
        break

    do = (ci * D) // C
    d = min(2 + do, 25)
    h = 8 + ci % 10
    m = (ci * 17) % 60
    ds = f'2026-07-{d:02d} {h:02d}:{m:02d}:00'

    p = batch[0].split('/')
    b = p[-1]
    p0 = p[0] if len(p) >= 2 else 'root'

    if p0 == 'assets' and len(p) >= 3 and p[1] == 'icons':
        msg = f'Add icons batch {ci+1} ({len(batch)} icons)'
    elif p0 == 'skills' and len(p) >= 3:
        msg = f'Add skill {p[1]}: {b}'
    elif p0 == 'rules':
        msg = f'Add rule: {b}'
    elif p0 == 'guides':
        msg = f'Add guide: {b}'
    elif p0 == 'templates':
        msg = f'Add template: {b}'
    elif p0 == 'explain-skills':
        msg = f'Add explain-skill: {b}'
    elif p0 == 'huong-dan':
        msg = f'Add huong-dan: {b}'
    elif p0 == 'example':
        msg = 'Add example: ' + '/'.join(p[1:])
    elif p0 == 'scripts':
        msg = f'Add script: {b}'
    elif p0 == 'hooks':
        msg = f'Add hook: {b}'
    elif p0 == 'agents':
        msg = f'Add agent: {b}'
    elif p0.startswith('.claude'):
        msg = f'Add config: {b}'
    else:
        msg = f'Add {b}'

    if len(batch) > 1:
        msg += f' (+{len(batch)-1} more)'

    subprocess.run(['git', 'add'] + batch, check=True)
    env = {**os.environ, 'GIT_COMMITTER_DATE': ds}
    subprocess.run(['git', 'commit', '-m', msg, '--date', ds], check=True, env=env)

    if (ci + 1) % 10 == 0:
        print(f'{ci+1}/{C}')

print('Done!')
