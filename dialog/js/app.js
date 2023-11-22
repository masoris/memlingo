//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
    console.log("startRecording() called");

    /*
        Simple constraints object, for more advanced features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */

    var constraints = { audio: true, video: false }

    /*
        We're using the standard promise based getUserMedia() 
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        __log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device

        */
        audioContext = new AudioContext();

        //update the format 
        document.getElementById("formats").innerHTML = "Format: 2 channel " + encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value + " @ " + audioContext.sampleRate / 1000 + "kHz"

        //assign to gumStream for later use
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        //stop the input from playing back through the speakers
        //input.connect(audioContext.destination)

        //get the encoding 
        encodingType = encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;

        //disable the encoding selector
        encodingTypeSelect.disabled = true;

        recorder = new WebAudioRecorder(input, {
            workerDir: "js/", // must end with slash
            encoding: encodingType,
            numChannels: 2, //2 is the default, mp3 encoding supports only 2
            onEncoderLoading: function (recorder, encoding) {
                // show "loading encoder..." display
                __log("Loading " + encoding + " encoder...");
            },
            onEncoderLoaded: function (recorder, encoding) {
                // hide "loading encoder..." display
                __log(encoding + " encoder loaded");
            }
        });

        function arrayBufferToBase64(arrayBuffer) {
            // ArrayBuffer를 Uint8Array로 변환
            var uint8Array = new Uint8Array(arrayBuffer);

            // Uint8Array를 문자열로 변환
            var binaryString = String.fromCharCode.apply(null, uint8Array);

            // 문자열을 Base64로 인코딩
            return btoa(binaryString);
        }

        function blobToBase64(blob, callback) {
            var reader = new FileReader();
            reader.onload = function () {
                var base64String = reader.result.split(',')[1];
                callback(base64String);
            };
            reader.readAsDataURL(blob);
        }

        // Blob 객체 생성 (예: 이미지 파일을 Blob으로 가져옴)
        // var blob = new Blob(["Hello, World!"], { type: "text/plain" });
        function store_blob_mp3(blob_base64) {
            jsonObj = { blob_base64: blob_base64 };
            strdata = JSON.stringify(jsonObj);
            postAjaxRequest('/api/mp3-store.api', strdata, function (response) {
                jsonObj = JSON.parse(response);
                console.log(jsonObj.transcript);

            }, function (errcode) { });
        }

        recorder.onComplete = function (recorder, blob) {
            //__log(blob);
            //__log(arrayBufferToBase64(blob));
            // Blob을 Base64 문자열로 변환
            blobToBase64(blob, function (base64String) {
                // console.log(base64String);
                // 서버로 blob 객체를 전달해서 .mp3 파일로 서버 디스크에 저장한다.
                // /api/mp3-store.api 
                // {"blob_base64":blob_base64} 
                store_blob_mp3(base64String);
            });
            __log("Encoding complete");

            createDownloadLink(blob, recorder.encoding);
            encodingTypeSelect.disabled = false;
        }

        recorder.setOptions({
            timeLimit: 120,
            encodeAfterRecord: encodeAfterRecord,
            ogg: { quality: 0.5 },
            mp3: { bitRate: 160 }
        });

        //start the recording process
        recorder.startRecording();

        __log("Recording started");

    }).catch(function (err) {
        //enable the record button if getUSerMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;

    });

    //disable the record button
    recordButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
    console.log("stopRecording() called");

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //disable the stop button
    stopButton.disabled = true;
    recordButton.disabled = false;

    //tell the recorder to finish the recording (stop recording + encode the recorded audio)
    recorder.finishRecording();

    __log('Recording stopped');
}

function createDownloadLink(blob, encoding) {

    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');

    //add controls to the <audio> element
    au.controls = true;
    au.src = url;

    //link the a element to the blob
    link.href = url;
    link.download = new Date().toISOString() + '.' + encoding;
    link.innerHTML = link.download;

    //add the new audio and a elements to the li element
    li.appendChild(au);
    li.appendChild(link);

    //add the li element to the ordered list
    recordingsList.appendChild(li);
}



//helper function
function __log(e, data) {
    log.innerHTML += "\n" + e + " " + (data || '');
}