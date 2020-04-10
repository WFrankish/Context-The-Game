# Enumerate all typescript sources.
TS_IN=$(shell find src -name '*.ts')
TS_OUT=${TS_IN:src/%.ts=site/%.js}

ASSET_IN=$(shell find assets)
ASSET_OUT=${ASSET_IN:%=site/%}

.PHONY: all clean default run
default: all

run: all
	(cd site; node server/main.js)

ALL=  \
	${TS_OUT}  \
	${ASSET_OUT}  \
	site/client/index.html
all: ${ALL}

clean:
	rm -r site

site site/assets site/client site/common site/server &:
	mkdir -p site/{assets,client,common,server}

site/client/index.html: src/client/index.html | site/client
	cp $^ $@

site/assets/%: assets/% | site/assets
	mkdir -p site/assets
	cp $^ $@

${TS_OUT} &: ${TS_IN} | site/client site/common site/server
	tsc --incremental | src/format_errors.sh
