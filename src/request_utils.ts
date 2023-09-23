import { RequestOptions, get } from "https";

export async function getSync(options: string | RequestOptions | URL) {
    var promise = new Promise((resolve, reject) => {
        get(options, (response) => {
            let chunksOfData: any[] = [];

            response.on('data', (fragments) => {
                chunksOfData.push(fragments);
            });

            response.on('end', () => {
                let responseBody = Buffer.concat(chunksOfData);
                resolve(responseBody.toString());
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });
    let response = await promise;
    return response;
}
