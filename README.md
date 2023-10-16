# ft_transcendance

## Docker compose

#### Important 
- Ne pas utiliser le cli docker-compose mais docker compose

#### Env

- renommer le fichier .env.example en .env

### Commande
#### Start docker compose
```> docker compose up --build -d```
#### Start uniquement postgres
```> docker compose up postgres --build -d```
#### Debug container
```ENTRYPOINT ["tail", "-f", "/dev/null"] ```


## Git flow

#### Branch name convention
```<owner-name>/<scope>/<name>```
- Example: mbe/feat/add-Profile-component

#### Commit 
- https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format

#### Scope
- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- test: Adding missing tests or correcting existing tests

#### Créer une branche
```> git checkout -b <branch-name>```

#### Supprimer une branche
```> git branch -d <branch-name>```

#### Changer de branche
```> git checkout <branch-name>```

#### Fix les conflicts
```bash
# Mettre à jour main
git checkout main
git pull
# Rebase les changements de main sur notre branche
git checkout <branch-name>
git rebase main

# Si y a des conflits les fix et itérer jusqu'à qu'il y en ait plus
git add -A
git rebase --continue
```
![en.subject.pdf](https://github.com/Kiwi-Poilu/ft_transcendence/files/12872450/en.subject.pdf)
