# Enumerate all directories.
DIRS_OUT=site  \
				 $(patsubst src/%, site/%, $(shell find src/* -type d))  \
				 $(patsubst %, site/%, $(shell find assets -type d))

# Enumerate all typescript sources.
TS_IN=$(shell find src -name '*.ts')
TS_OUT=${TS_IN:src/%.ts=site/%.js}
TS_COPY=${TS_IN:src/%.ts=site/%.ts}

ASSET_IN=$(shell find assets)
ASSET_OUT=${ASSET_IN:%=site/%}

PAGES_IN=$(shell find src -name '*.html')
PAGES_OUT=${PAGES_IN:src/%.html=site/%.html}

.PHONY: all clean default run
default: all

run: all
	(cd site; node server/main.js)

ALL=  \
	${TS_OUT}  \
	${TS_COPY}  \
	${ASSET_OUT}  \
	${DIRS_OUT}  \
	${PAGES_OUT}
all: ${ALL}

clean:
	rm -rf site

${DIRS_OUT} &:
	mkdir -p ${DIRS_OUT}

site/%.ts: src/%.ts | site
	cp $^ $@

site/%.html: src/%.html | site
	cp $^ $@

site/assets/%: assets/% | site
	cp $^ $@

${TS_OUT} &: ${TS_IN} | site
	tsc --incremental | src/format_errors.sh
