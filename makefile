gh-pages:
	git checkout gh-pages
	rm main.build.js
	git add -A
	git commit -m "Clean"
	
	git checkout master
	browserify test.js -o main.build.js
	git checkout gh-pages
	git add -A
	git commit -m "Build"
	git push origin gh-pages
	
	git checkout master
