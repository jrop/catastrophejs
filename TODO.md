# Ideas

* Make `SourceContext` more like a scanner
	* add .expect that throws error if it doesn't find a token
	* make match.* functions handle errors
	* the match.* functions that can handle multiple code-paths can choose to throw the error or pursue an alternate code path
