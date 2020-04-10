# Enumerate all typescript sources.
SOURCES=$(shell find src -name '*.ts')
OUTPUTS=${SOURCES:.ts=.js}

.PHONY: all clean default
default: all

all: ${OUTPUTS}

clean:
	rm -r site

site:
	mkdir site

site/static/%: src/static/%
	cp $^ $@

# Build typescript sources.
${OUTPUTS}: ${SOURCES}
	mkdir -p $(@D)
	tsc --incremental | src/format_errors.sh
