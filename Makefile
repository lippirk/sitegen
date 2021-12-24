.PHONY: dev
dev: clean-index.pug index.pug dev-fix
	npm run start-unspec

.PHONY: dev-fix
dev-fix:
	sudo sysctl fs.inotify.max_user_watches=1048576

.PHONY: build
build: clean-index.pug index.pug
	npm run build

index.pug:
	python gen_index_pug.py

.PHONY: clean-index.pug
clean-index.pug:
	rm -f index.pug

.PHONY: test-build
test-build: build
	python -m http.server --directory build

.PHONY: clean
clean: clean-index.pug
	rm -rf build/* dist/ .parcel-cache/

.PHONY: deploy
deploy: clean build
	python deploy-github.py
