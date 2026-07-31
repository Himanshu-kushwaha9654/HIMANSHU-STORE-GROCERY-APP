export interface GeocodeResult {
  formattedAddress: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  road: string;
  lat: number;
  lng: number;
}

export const LocationService = {
  /**
   * Reverse Geocode coordinates into a human-readable address.
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    try {
      // Use zoom=18 for street-level accuracy and addressdetails=1
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { "Accept": "application/json" } }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data || data.error) return null;

      const address = data.address || {};
      
      // Build a premium formatted address (Street, Suburb, etc.)
      const streetPart = address.house_number ? `${address.house_number}, ${address.road || ""}` : (address.road || address.pedestrian || "");
      const areaPart = address.neighbourhood || address.suburb || address.residential || address.village || "";
      const cityPart = address.city || address.town || address.state_district || "";
      
      const formattedParts = [streetPart, areaPart, cityPart, address.state, address.postcode].filter(Boolean);
      const displayAddress = formattedParts.join(", ") || data.display_name;
      
      return {
        formattedAddress: displayAddress,
        city: cityPart,
        state: address.state || "",
        postcode: address.postcode || "",
        country: address.country || "",
        road: streetPart || areaPart || address.suburb || "",
        lat,
        lng
      };
    } catch (err) {
      console.error("Reverse Geocoding failed:", err);
      return null;
    }
  },

  /**
   * Search for an address string and return possible locations.
   */
  async searchAddress(query: string): Promise<GeocodeResult[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5&accept-language=en`,
        { headers: { "Accept": "application/json" } }
      );
      
      if (!response.ok) return [];
      
      const results = await response.json();
      
      return results.map((data: any) => {
        const address = data.address || {};
        return {
          formattedAddress: data.display_name,
          city: address.city || address.town || address.village || address.state_district || "",
          state: address.state || "",
          postcode: address.postcode || "",
          country: address.country || "",
          road: address.road || address.suburb || address.neighbourhood || "",
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon)
        };
      });
    } catch (err) {
      console.error("Geocoding search failed:", err);
      return [];
    }
  }
};
