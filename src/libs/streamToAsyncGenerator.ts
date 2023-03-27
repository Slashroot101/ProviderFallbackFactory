
// Converts a stream into an AsyncGenerator that allows reading bytes
// of data from the stream in the chunk size specified. This function

import { Readable } from "stream";

// has some similarities to the `streamToGenerator` function.
export function streamToAsyncGenerator<T>(
    reader: Readable,
    chunkSize?: number,
): AsyncGenerator<T, void, unknown> {

    // Immediately invoke the AsyncGenerator function which will closure
    // scope the stream and returns the AsyncGenerator instance
    return (async function* genFn() {
    
        // Construct a promise that will resolve when the Stream has
        // ended. We use it below as a conditional resolution of the
        // readable and end events.
        const endPromise = signalEnd(reader);

        // Loop until the readable stream stops being readable! This
        // property is available in Node 12.9. We could also check the
        // status of the endPromise to see if it is resolved yet.
        while (!reader.readableEnded) {
        
            // Next, similar to readToEnd function, we loop on the
            // Stream until we have read all of the data that we
            // can from the stream.
            while (reader.readable) {
            
                // First try to read the chunk size, but if that fails
                // then try reading the remainder of the stream.
                let val = reader.read(chunkSize) || reader.read();

                // Either yield the contents to our generator or there
                // was no data and we are no longer readable and need
                // to wait for more info
                if (val) yield val;
                else break;
            }

            // We are no longer readable and one of two things will
            // happen now: `readable` or `end` will fire. We construct
            // a new `readable` signal to wait for the next signal.
            const readablePromise = signalReadable(reader);

            // We wait for either the `end` or `readable` event to fire
            await Promise.race([endPromise, readablePromise]);
        }
    })();
}

// Resolves when the stream fires the `end` event. We use the `once`
// method so that the promise only resolves once.
async function signalEnd(reader: Readable) {
    return new Promise(resolve => {
        reader.once("end", resolve);
    });
}
// Resolves when the stream fires its next `readable` event. We use the 
// event `once` method so that it only ever fires on the next `readable`
// event
async function signalReadable(reader: Readable) {
    return new Promise(resolve => {
        reader.once("readable", resolve);
    });
}