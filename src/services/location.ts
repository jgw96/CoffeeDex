const subscriptionKey = '546f48803dbb4d428bdcd38ccc4f6440';

const host = 'api.cognitive.microsoft.com/bing';
const path = '/v7.0/localbusinesses/search';

let mkt = 'en-US';

export async function search(query: string) {
    const loc = await getLocation();

    const response = await fetch(`https://${host}${path}?q=${query}&location&mkt=${mkt}`, {
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'X-Search-Location': `lat:${loc.lat};long:${loc.long};radius:50`
        }
    });
    const data = await response.json();
    console.log(data);
    if (data.places) {
        return data.places.value;
    }
}

function getLocation(): Promise<any> {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({ lat: position.coords.latitude, long: position.coords.longitude });
        });
    })
}
