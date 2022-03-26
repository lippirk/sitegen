#!/usr/bin/env python
# -*- coding: utf-8 -*-

from git import Repo

branch      = 'main'

def error(x):
    raise Exception(x)

def bump(version_str, what='minor'):
    m = {
        'major': 0,
        'minor': 1,
        'patch': 2,
    }
    vs = [int(x) for x in version_str.split('.')]
    vs[m[what]] += 1
    return '.'.join([str(x) for x in vs])

def get_data(repo, build_repo):
    assert repo.active_branch.name == branch, f"checkout {branch}"

    last_tag = repo.tags[-1]
    assert repo.head.commit != last_tag.commit, "nothing new since last tag"

    build_last_tag = build_repo.tags[-1]
    assert build_last_tag.name == last_tag.name, "build repo out of sync"

    new_commits = list(repo.iter_commits(f"{last_tag.commit}..HEAD"))

    new_tag_name = bump(last_tag.name)
    new_tag = repo.tag(new_tag_name)

    origin = repo.remote('sitegen')
    build_origin = build_repo.remote('lippirk')

    d = dict(
        new_commits  = new_commits,
        last_tag     = last_tag,
        new_tag      = new_tag,
        origin       = origin,
        build_origin = build_origin,
    )
    return d

def dry_run(d):
    print(f"last tag = {d['last_tag'].name}")
    print(f"new tag  = {d['new_tag'].name}")

    print()
    print("commits since last tag:")
    for nc in d['new_commits']:
        print(f"  - {nc.summary}")

def wet_run(repo, build_repo, d):
    dry_run(d)

    if d['new_tag'] in repo.tags or \
       d['new_tag'] in build_repo.tags:
        error(f"tag {d['new_tag']} already exists")

    print(f"commiting in ./build")
    build_repo.git.add(all=True)
    build_repo.index.commit(d['new_tag'].name)

    print(f"creating new tags: {d['new_tag'].name}...")
    # assume these tags don't exist in either repo
    repo.create_tag(d['new_tag'])
    build_repo.create_tag(d['new_tag'])

    origin = repo.remote('sitegen')
    build_origin = build_repo.remote('lippirk')

    print(f"pushing main...")
    origin.push(branch)
    build_origin.push(branch)

    print(f"pushing tags...")
    d['origin'].push(d['new_tag'].name)
    d['build_origin'].push(d['new_tag'].name)

    print("done")


def main():
    repo = Repo('.')
    build_repo = Repo('./build')
    d = get_data(repo, build_repo)
    #  dry_run(d)
    wet_run(repo, build_repo, d)

if __name__ == "__main__":
    main()
