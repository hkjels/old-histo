
build: components index.js
	@component build

components: template.html component.json
	@component convert $<
	@component install

clean:
	rm -rf build components template.js


.PHONY: build components clean

