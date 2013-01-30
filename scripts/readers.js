//
// readers.js
//
// File reader components
//   - TextReader Object
//   - LineReader Object
//
// Written by Tadd Smyrnios
//

// Reads chunks of the file
TextReader = function(){}
TextReader.prototype = {
    reader: new FileReader(),
    chunkSize: 4096,
    position: 0,
    loadedChunks: [],
    isCancelled: false,
    file: null,
    fileSize: function () { return this.file ? this.file.size : 0; },
    readFile: function (file) {
        this.position = 0;
        this.loadedChunks = [];
        this.file = file;

        $this = this;
        var beginRead = function () {
            if (!this.isCancelled) {
                var chunk = $this.file.slice($this.position, Math.min($this.fileSize(), $this.position + $this.chunkSize));
                $this.reader.readAsText(chunk);
            }
        };
        var endRead = function (evt) {
            if (!this.isCancelled) {
                $this.loadedChunks.push(evt.target.result);
                $this.position = Math.min($this.position + $this.chunkSize, $this.fileSize());
                $this.chunkRead(evt);
                if (!$this.isEof()) {
                    beginRead();
                }
                else {
                    $this.eof();
                }
            }
        };
        $this.reader.onloadend = endRead;
        this.isCancelled = false;
        beginRead();
    },
    cancel: function () {
        this.reader.onloadend = function (evt) { };
        this.position = 0;
        this.loadedChunks = [];
        this.file = null;
    },
    isEof: function () { return this.position == this.fileSize(); },
    chunkRead: function (evt) { },
    eof: function () { }
};

// Reads our file line by line from the loaded chunks
LineReader = function() {};
LineReader.prototype = {
    remainder: "",
    reader: new TextReader(),
    loadedLines: [],
    isCancelled: false,
    isEof: function () { return this.reader.isEof(); },
    readFile: function (file) {
        this.reader.cancel();
        this.loadedLines = [];
        this.remainder = "";
        var $this = this;
        this.reader.chunkRead = function (evt) {
            if (!this.isCancelled) {
                var chunk = $this.reader.loadedChunks.shift();
                var text = $this.remainder + chunk;

                var lines = text.split("\n");

                if (!$this.reader.isEof()) {
                    $this.remainder = lines.pop();
                }
                else {
                    $this.remainder = "";
                }

                while (lines.length > 0 && !this.isCancelled) {
                    var line = lines.shift();
                    $this.loadedLines.push(line);
                    $this.lineRead({ line: line });
                }

                if ($this.reader.isEof()) {
                    $this.eof();
                }
            }
        }
        this.isCancelled = false;
        this.reader.readFile(file);
    },
    cancel: function () {
        this.reader.chunkRead = function (evt) { };
        this.isCancelled = true;
        this.reader.cancel();
        this.loadedLines = [];
        this.remainder = "";
    },
    lineRead: function (evt) { },
    eof: function () { }
};