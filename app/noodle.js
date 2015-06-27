! function() {


    // Private Members
    var ctx; //audio context
    var fft_data = {};

    window.onload = function() {

        getAudioData();

    }

    function getAudioData() {
        try {
            ctx = new AudioContext(); //is there a better API for this? 
            loadFile('boop.mp3');
            loadFile('boop-copy.mp3');

        } catch (e) {
            alert('you need webaudio support' + e);
        }
    }

    //load the mp3 file 
    function loadFile(fileName) {

        var req = new XMLHttpRequest();
        req.open("GET", fileName, true);
        //we can't use jquery because we need the arraybuffer type 
        req.responseType = "arraybuffer";
        req.onload = function() {
            //decode the loaded data 
            ctx.decodeAudioData(req.response, function(buffer) {

                // Get the amplitudes
                var buf = buffer.getChannelData(0);
                drawData(fileName, buf);
                if (fileName.indexOf('copy') >= 0) {
                    crossCorrelate();
                }
            });
        };
        req.send();
    }

    /////////////////////////// CANVAS STUFF ///////////////////////////////////


    function addToCanvas(element_id, data) {
        var
            element = document.getElementById(element_id),
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            width = element.clientWidth,
            height = element.clientHeight,
            n = data.length;

        canvas.width = width;
        canvas.height = height;
        element.appendChild(canvas);

        context.strokeStyle = 'blue'
        context.beginPath()
        data.forEach(function(c_value, i) {
            context.lineTo(
                i * width / n,
                height / 2 * (1.5 - c_value.real)
            )
        })
        context.stroke();
    }


    function drawData(id, buf) {
        var data = new complex_array.ComplexArray(buf.length);

        data.map(function(value, i, n) {
            value.real = buf[i];
        })

        addToCanvas(id + '-original', data)

        fft_data[id] = data.FFT();

        addToCanvas(id + '-fft', data)


    }


    function crossCorrelate() {
        var original = fft_data['boop.mp3'].real;
        var copy = fft_data['boop-copy.mp3'].real;

        var max = Math.max(original.length, copy.length);
        var res = (original.length < copy.length) ? [original, copy] : [copy, original];
        var sm = res[0]
        var lg = res[1]

        sm = bloat(sm, max);

        var product = new complex_array.ComplexArray(original.length);

        product.map(function(value, i, n) {
            value.real = (sm[i] * lg[i]);
        });



        console.log(product);
        addToCanvas('fft-product', product);

        addToCanvas('cross-correlation', product.InvFFT());

    }

    function bloat(sm_arr, bloat_size) {
        var bloatedArray = new complex_array.ComplexArray(bloat_size);

        bloatedArray.map(function(value, i, n) {
            value.real = sm_arr[i];
        });



        console.log(bloatedArray);

        return bloatedArray.real;

    }



}()