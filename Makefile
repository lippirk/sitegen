.PHONY: dev
dev: dev-fix
	npm run start-unspec

.PHONY: dev-fix
dev-fix:
	sudo sysctl fs.inotify.max_user_watches=1048576

.PHONY: build
build:
	npm run build

.PHONY: test-build
test-build: build
	python -m http.server --directory build

.PHONY: clean
clean:
	rm -rf build/ dist/ .parcel-cache/
