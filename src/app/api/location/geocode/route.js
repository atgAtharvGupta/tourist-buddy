export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!latitude || !longitude) {
      return Response.json({ 
        error: 'Missing latitude or longitude' 
      }, { status: 400 });
    }

    // Nominatim API endpoint for reverse geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse`;

    const nominatimResponse = await fetch(nominatimUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'TouristBuddy-Hackathon-App',
      },
    });

    const params = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      format: 'json',
      'accept-language': 'en',
      zoom: '10'
    });

    const fullUrl = `${nominatimUrl}?${params}`;

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'TouristBuddy-Hackathon-App',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract the city name from the Nominatim response
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.county;
    const state = address.state || address.region;
    const country = address.country;

    if (city) {
      const fullLocation = state && country 
        ? `${city}, ${state}, ${country}`
        : country 
        ? `${city}, ${country}`
        : city;

      return Response.json({ 
        city,
        fullLocation,
        address: data.address 
      });
    } else {
      return Response.json({ 
        error: 'City not found for the given coordinates' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Nominatim API Error:', error.message);
    return Response.json({ 
      error: 'Error fetching location data from Nominatim',
      details: error.message 
    }, { status: 500 });
  }
}
