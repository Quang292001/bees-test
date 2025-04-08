class ProcessCancelledError extends Error {
    constructor(message = "Processing was cancelled") {
        super(message);
        this.name = "ProcessCancelledError";
    }
}

async function processWithDelay(numbers, delay = 1000, progressCallback, signal) {
    // Input validation
    if (!Array.isArray(numbers)) {
        throw new TypeError("Input must be an array of numbers.");
    }
    if (!numbers.every(num => typeof num === "number")) {
        throw new TypeError("All elements in the array must be numbers.");
    }
    if (numbers.length === 0) return Promise.resolve();

    for (let i = 0; i < numbers.length; i++) {
        if (signal?.aborted) {
            throw new ProcessCancelledError();
        }

        console.log(numbers[i]);

        if (progressCallback) {
            progressCallback(i + 1, numbers.length);
        }

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, delay);

            if (signal) {
                signal.addEventListener("abort", () => {
                    clearTimeout(timeout);
                    reject(new ProcessCancelledError());
                }, { once: true });
            }
        });
    }
}

// Example usage
const controller = new AbortController();
const signal = controller.signal;

processWithDelay([1, 2, 3, 4, 5], 1000, (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
}, signal).catch(err => {
    if (err instanceof ProcessCancelledError) {
        console.log("Processing was cancelled.");
    } else {
        console.error(err);
    }
});

// To cancel after 3 seconds
setTimeout(() => controller.abort(), 3000);
