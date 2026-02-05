// Location database for geocoding news headlines
// Maps location names to coordinates and metadata

export interface LocationData {
  lat: number;
  lng: number;
  region: string;
}

export const LOCATION_DATABASE: Record<string, LocationData> = {
  // Countries
  'ukraine': { lat: 48.38, lng: 31.17, region: 'Eastern Europe' },
  'russia': { lat: 55.75, lng: 37.62, region: 'Eastern Europe' },
  'china': { lat: 39.9, lng: 116.4, region: 'East Asia' },
  'taiwan': { lat: 23.7, lng: 121.0, region: 'East Asia' },
  'israel': { lat: 31.77, lng: 35.22, region: 'Middle East' },
  'gaza': { lat: 31.35, lng: 34.31, region: 'Middle East' },
  'palestine': { lat: 31.9, lng: 35.2, region: 'Middle East' },
  'iran': { lat: 35.69, lng: 51.39, region: 'Middle East' },
  'iraq': { lat: 33.31, lng: 44.37, region: 'Middle East' },
  'syria': { lat: 33.51, lng: 36.29, region: 'Middle East' },
  'yemen': { lat: 15.37, lng: 44.19, region: 'Middle East' },
  'lebanon': { lat: 33.89, lng: 35.5, region: 'Middle East' },
  'saudi arabia': { lat: 24.71, lng: 46.68, region: 'Middle East' },
  'north korea': { lat: 39.03, lng: 125.75, region: 'East Asia' },
  'dprk': { lat: 39.03, lng: 125.75, region: 'East Asia' },
  'south korea': { lat: 37.57, lng: 126.98, region: 'East Asia' },
  'japan': { lat: 35.68, lng: 139.69, region: 'East Asia' },
  'india': { lat: 28.61, lng: 77.21, region: 'South Asia' },
  'pakistan': { lat: 33.69, lng: 73.06, region: 'South Asia' },
  'afghanistan': { lat: 34.53, lng: 69.17, region: 'Central Asia' },
  'myanmar': { lat: 19.75, lng: 96.1, region: 'Southeast Asia' },
  'philippines': { lat: 14.6, lng: 120.98, region: 'Southeast Asia' },
  'vietnam': { lat: 21.03, lng: 105.85, region: 'Southeast Asia' },
  'sudan': { lat: 15.59, lng: 32.53, region: 'Africa' },
  'ethiopia': { lat: 9.0, lng: 38.75, region: 'Africa' },
  'somalia': { lat: 2.04, lng: 45.34, region: 'Africa' },
  'libya': { lat: 32.9, lng: 13.19, region: 'Africa' },
  'niger': { lat: 13.51, lng: 2.11, region: 'Africa' },
  'mali': { lat: 12.64, lng: -8.0, region: 'Africa' },
  'nigeria': { lat: 9.08, lng: 7.4, region: 'Africa' },
  'congo': { lat: -4.32, lng: 15.31, region: 'Africa' },
  'venezuela': { lat: 10.49, lng: -66.88, region: 'South America' },
  'mexico': { lat: 19.43, lng: -99.13, region: 'North America' },
  'usa': { lat: 38.9, lng: -77.04, region: 'North America' },
  'us': { lat: 38.9, lng: -77.04, region: 'North America' },
  'united states': { lat: 38.9, lng: -77.04, region: 'North America' },
  'uk': { lat: 51.51, lng: -0.13, region: 'Western Europe' },
  'britain': { lat: 51.51, lng: -0.13, region: 'Western Europe' },
  'france': { lat: 48.86, lng: 2.35, region: 'Western Europe' },
  'germany': { lat: 52.52, lng: 13.41, region: 'Western Europe' },
  'poland': { lat: 52.23, lng: 21.01, region: 'Eastern Europe' },
  'turkey': { lat: 39.93, lng: 32.86, region: 'Middle East' },
  
  // Cities
  'kyiv': { lat: 50.45, lng: 30.52, region: 'Ukraine' },
  'kiev': { lat: 50.45, lng: 30.52, region: 'Ukraine' },
  'moscow': { lat: 55.76, lng: 37.62, region: 'Russia' },
  'beijing': { lat: 39.9, lng: 116.4, region: 'China' },
  'taipei': { lat: 25.03, lng: 121.57, region: 'Taiwan' },
  'tehran': { lat: 35.69, lng: 51.39, region: 'Iran' },
  'baghdad': { lat: 33.31, lng: 44.37, region: 'Iraq' },
  'damascus': { lat: 33.51, lng: 36.29, region: 'Syria' },
  'jerusalem': { lat: 31.77, lng: 35.22, region: 'Israel' },
  'tel aviv': { lat: 32.08, lng: 34.78, region: 'Israel' },
  'pyongyang': { lat: 39.03, lng: 125.75, region: 'North Korea' },
  'seoul': { lat: 37.57, lng: 126.98, region: 'South Korea' },
  'tokyo': { lat: 35.68, lng: 139.69, region: 'Japan' },
  'kabul': { lat: 34.53, lng: 69.17, region: 'Afghanistan' },
  'islamabad': { lat: 33.69, lng: 73.06, region: 'Pakistan' },
  'new delhi': { lat: 28.61, lng: 77.21, region: 'India' },
  'washington': { lat: 38.9, lng: -77.04, region: 'USA' },
  'london': { lat: 51.51, lng: -0.13, region: 'UK' },
  'paris': { lat: 48.86, lng: 2.35, region: 'France' },
  'berlin': { lat: 52.52, lng: 13.41, region: 'Germany' },
  'brussels': { lat: 50.85, lng: 4.35, region: 'Belgium' },
  'kharkiv': { lat: 49.99, lng: 36.23, region: 'Ukraine' },
  'odesa': { lat: 46.48, lng: 30.73, region: 'Ukraine' },
  'crimea': { lat: 44.95, lng: 34.1, region: 'Ukraine' },
  'donbas': { lat: 48.0, lng: 37.8, region: 'Ukraine' },
  'donetsk': { lat: 48.0, lng: 37.8, region: 'Ukraine' },
  'rafah': { lat: 31.28, lng: 34.25, region: 'Gaza' },
  'khan younis': { lat: 31.35, lng: 34.3, region: 'Gaza' },
  'beirut': { lat: 33.89, lng: 35.5, region: 'Lebanon' },
  'aleppo': { lat: 36.2, lng: 37.15, region: 'Syria' },
  'khartoum': { lat: 15.59, lng: 32.53, region: 'Sudan' },
  
  // Strategic locations
  'strait of hormuz': { lat: 26.57, lng: 56.25, region: 'Persian Gulf' },
  'hormuz': { lat: 26.57, lng: 56.25, region: 'Persian Gulf' },
  'red sea': { lat: 20.0, lng: 38.0, region: 'Middle East' },
  'taiwan strait': { lat: 24.0, lng: 119.0, region: 'East Asia' },
  'south china sea': { lat: 12.0, lng: 114.0, region: 'Southeast Asia' },
  'black sea': { lat: 43.0, lng: 35.0, region: 'Eastern Europe' },
  'baltic': { lat: 55.0, lng: 19.0, region: 'Northern Europe' },
  'baltic sea': { lat: 55.0, lng: 19.0, region: 'Northern Europe' },
  'persian gulf': { lat: 26.0, lng: 52.0, region: 'Middle East' },
  'suez canal': { lat: 30.46, lng: 32.34, region: 'Middle East' },
  'malacca': { lat: 2.2, lng: 102.0, region: 'Southeast Asia' },
  'arctic': { lat: 71.0, lng: -8.0, region: 'Arctic' },
  'nato': { lat: 50.85, lng: 4.35, region: 'Europe' },
  'pentagon': { lat: 38.87, lng: -77.06, region: 'USA' },
  'kremlin': { lat: 55.75, lng: 37.62, region: 'Russia' },
  'white house': { lat: 38.9, lng: -77.04, region: 'USA' },
  
  // US Cities - EXPANDED
  'salt lake city': { lat: 40.76, lng: -111.89, region: 'USA' },
  'salt lake': { lat: 40.76, lng: -111.89, region: 'USA' },
  'minneapolis': { lat: 44.98, lng: -93.27, region: 'USA' },
  'minnesota': { lat: 44.98, lng: -93.27, region: 'USA' },
  'new york': { lat: 40.71, lng: -74.01, region: 'USA' },
  'nyc': { lat: 40.71, lng: -74.01, region: 'USA' },
  'los angeles': { lat: 34.05, lng: -118.24, region: 'USA' },
  'la': { lat: 34.05, lng: -118.24, region: 'USA' },
  'chicago': { lat: 41.88, lng: -87.63, region: 'USA' },
  'houston': { lat: 29.76, lng: -95.37, region: 'USA' },
  'phoenix': { lat: 33.45, lng: -112.07, region: 'USA' },
  'philadelphia': { lat: 39.95, lng: -75.17, region: 'USA' },
  'san antonio': { lat: 29.42, lng: -98.49, region: 'USA' },
  'san diego': { lat: 32.72, lng: -117.16, region: 'USA' },
  'dallas': { lat: 32.78, lng: -96.8, region: 'USA' },
  'san jose': { lat: 37.34, lng: -121.89, region: 'USA' },
  'austin': { lat: 30.27, lng: -97.74, region: 'USA' },
  'jacksonville': { lat: 30.33, lng: -81.66, region: 'USA' },
  'san francisco': { lat: 37.77, lng: -122.42, region: 'USA' },
  'denver': { lat: 39.74, lng: -104.99, region: 'USA' },
  'seattle': { lat: 47.61, lng: -122.33, region: 'USA' },
  'boston': { lat: 42.36, lng: -71.06, region: 'USA' },
  'atlanta': { lat: 33.75, lng: -84.39, region: 'USA' },
  'miami': { lat: 25.76, lng: -80.19, region: 'USA' },
  'detroit': { lat: 42.33, lng: -83.05, region: 'USA' },
  'portland': { lat: 45.52, lng: -122.68, region: 'USA' },
  'las vegas': { lat: 36.17, lng: -115.14, region: 'USA' },
  'baltimore': { lat: 39.29, lng: -76.61, region: 'USA' },
  'memphis': { lat: 35.15, lng: -90.05, region: 'USA' },
  'nashville': { lat: 36.16, lng: -86.78, region: 'USA' },
  'louisville': { lat: 38.25, lng: -85.76, region: 'USA' },
  'milwaukee': { lat: 43.04, lng: -87.91, region: 'USA' },
  'albuquerque': { lat: 35.08, lng: -106.65, region: 'USA' },
  'tucson': { lat: 32.22, lng: -110.93, region: 'USA' },
  'fresno': { lat: 36.74, lng: -119.79, region: 'USA' },
  'sacramento': { lat: 38.58, lng: -121.49, region: 'USA' },
  'kansas city': { lat: 39.1, lng: -94.58, region: 'USA' },
  'mesa': { lat: 33.42, lng: -111.83, region: 'USA' },
  'omaha': { lat: 41.26, lng: -95.94, region: 'USA' },
  'cleveland': { lat: 41.5, lng: -81.69, region: 'USA' },
  'virginia beach': { lat: 36.85, lng: -75.98, region: 'USA' },
  'raleigh': { lat: 35.78, lng: -78.64, region: 'USA' },
  'new orleans': { lat: 29.95, lng: -90.07, region: 'USA' },
  'el paso': { lat: 31.76, lng: -106.49, region: 'USA' },
  // US States
  'texas': { lat: 31.0, lng: -100.0, region: 'USA' },
  'california': { lat: 36.78, lng: -119.42, region: 'USA' },
  'florida': { lat: 27.66, lng: -81.52, region: 'USA' },
  'arizona': { lat: 34.05, lng: -111.09, region: 'USA' },
  'georgia': { lat: 32.68, lng: -83.22, region: 'USA' },
  'north carolina': { lat: 35.63, lng: -79.81, region: 'USA' },
  'michigan': { lat: 43.33, lng: -84.54, region: 'USA' },
  'ohio': { lat: 40.37, lng: -82.99, region: 'USA' },
  'pennsylvania': { lat: 40.59, lng: -77.21, region: 'USA' },
  'illinois': { lat: 40.0, lng: -89.0, region: 'USA' },
  'new jersey': { lat: 40.06, lng: -74.41, region: 'USA' },
  'virginia': { lat: 37.77, lng: -78.17, region: 'USA' },
  'colorado': { lat: 39.0, lng: -105.5, region: 'USA' },
  'tennessee': { lat: 35.86, lng: -86.66, region: 'USA' },
  'alabama': { lat: 32.81, lng: -86.79, region: 'USA' },
  'louisiana': { lat: 31.17, lng: -91.87, region: 'USA' },
  'kentucky': { lat: 37.84, lng: -85.0, region: 'USA' },
  'oregon': { lat: 44.0, lng: -120.5, region: 'USA' },
  'oklahoma': { lat: 35.57, lng: -96.93, region: 'USA' },
  'connecticut': { lat: 41.6, lng: -72.7, region: 'USA' },
  'iowa': { lat: 42.01, lng: -93.21, region: 'USA' },
  'mississippi': { lat: 32.74, lng: -89.68, region: 'USA' },
  'arkansas': { lat: 34.8, lng: -92.2, region: 'USA' },
  'utah': { lat: 39.32, lng: -111.68, region: 'USA' },
  'nevada': { lat: 39.88, lng: -117.22, region: 'USA' },
  'new mexico': { lat: 34.31, lng: -106.02, region: 'USA' },
  'west virginia': { lat: 38.93, lng: -80.45, region: 'USA' },
  'nebraska': { lat: 41.5, lng: -99.68, region: 'USA' },
  'idaho': { lat: 44.07, lng: -114.74, region: 'USA' },
  'hawaii': { lat: 21.31, lng: -157.86, region: 'USA' },
  'maine': { lat: 45.37, lng: -68.97, region: 'USA' },
  'montana': { lat: 47.05, lng: -109.63, region: 'USA' },
  'alaska': { lat: 64.84, lng: -152.49, region: 'USA' },
  // US Border cities (for ICE/immigration)
  'el centro': { lat: 32.79, lng: -115.56, region: 'USA' },
  'laredo': { lat: 27.51, lng: -99.51, region: 'USA' },
  'mcallen': { lat: 26.2, lng: -98.23, region: 'USA' },
  'brownsville': { lat: 25.9, lng: -97.5, region: 'USA' },
  'nogales': { lat: 31.34, lng: -110.94, region: 'USA' },
  'yuma': { lat: 32.69, lng: -114.63, region: 'USA' },
  'calexico': { lat: 32.68, lng: -115.5, region: 'USA' },
  
  // More Ukraine cities
  'lviv': { lat: 49.84, lng: 24.03, region: 'Ukraine' },
  'zaporizhzhia': { lat: 47.84, lng: 35.14, region: 'Ukraine' },
  'kherson': { lat: 46.64, lng: 32.62, region: 'Ukraine' },
  'mariupol': { lat: 47.1, lng: 37.55, region: 'Ukraine' },
  'kursk': { lat: 51.73, lng: 36.19, region: 'Russia' },
  'belgorod': { lat: 50.6, lng: 36.6, region: 'Russia' },
  
  // More Middle East
  'haifa': { lat: 32.79, lng: 34.99, region: 'Israel' },
  'netanya': { lat: 32.33, lng: 34.86, region: 'Israel' },
  'west bank': { lat: 31.95, lng: 35.3, region: 'Palestine' },
  'ramallah': { lat: 31.9, lng: 35.2, region: 'Palestine' },
  'sanaa': { lat: 15.37, lng: 44.19, region: 'Yemen' },
  'aden': { lat: 12.79, lng: 45.04, region: 'Yemen' },
  'idlib': { lat: 35.93, lng: 36.63, region: 'Syria' },
  'homs': { lat: 34.73, lng: 36.71, region: 'Syria' },
  
  // Europe
  'warsaw': { lat: 52.23, lng: 21.01, region: 'Poland' },
  'bucharest': { lat: 44.43, lng: 26.1, region: 'Romania' },
  'budapest': { lat: 47.5, lng: 19.04, region: 'Hungary' },
  'vienna': { lat: 48.21, lng: 16.37, region: 'Austria' },
  'prague': { lat: 50.08, lng: 14.44, region: 'Czech Republic' },
  'helsinki': { lat: 60.17, lng: 24.94, region: 'Finland' },
  'stockholm': { lat: 59.33, lng: 18.07, region: 'Sweden' },
  'oslo': { lat: 59.91, lng: 10.75, region: 'Norway' },
  'copenhagen': { lat: 55.68, lng: 12.57, region: 'Denmark' },
  'amsterdam': { lat: 52.37, lng: 4.9, region: 'Netherlands' },
  'madrid': { lat: 40.42, lng: -3.7, region: 'Spain' },
  'rome': { lat: 41.9, lng: 12.5, region: 'Italy' },
  'athens': { lat: 37.98, lng: 23.73, region: 'Greece' },
  
  // Asia
  'hong kong': { lat: 22.32, lng: 114.17, region: 'China' },
  'shanghai': { lat: 31.23, lng: 121.47, region: 'China' },
  'manila': { lat: 14.6, lng: 120.98, region: 'Philippines' },
  'hanoi': { lat: 21.03, lng: 105.85, region: 'Vietnam' },
  'singapore': { lat: 1.35, lng: 103.82, region: 'Southeast Asia' },
  'bangkok': { lat: 13.76, lng: 100.5, region: 'Thailand' },
  'jakarta': { lat: -6.21, lng: 106.85, region: 'Indonesia' },
  'kuala lumpur': { lat: 3.14, lng: 101.69, region: 'Malaysia' },
  'mumbai': { lat: 19.08, lng: 72.88, region: 'India' },
  'karachi': { lat: 24.86, lng: 67.01, region: 'Pakistan' },
  'lahore': { lat: 31.55, lng: 74.34, region: 'Pakistan' },
  
  // Africa
  'cairo': { lat: 30.04, lng: 31.24, region: 'Egypt' },
  'tripoli': { lat: 32.9, lng: 13.19, region: 'Libya' },
  'addis ababa': { lat: 9.0, lng: 38.75, region: 'Ethiopia' },
  'nairobi': { lat: -1.29, lng: 36.82, region: 'Kenya' },
  'johannesburg': { lat: -26.2, lng: 28.04, region: 'South Africa' },
  'lagos': { lat: 6.52, lng: 3.38, region: 'Nigeria' },
  'goma': { lat: -1.68, lng: 29.23, region: 'DRC' },
  'darfur': { lat: 13.5, lng: 25.0, region: 'Sudan' },
  
  // Latin America
  'caracas': { lat: 10.49, lng: -66.88, region: 'Venezuela' },
  'bogota': { lat: 4.71, lng: -74.07, region: 'Colombia' },
  'lima': { lat: -12.05, lng: -77.04, region: 'Peru' },
  'buenos aires': { lat: -34.6, lng: -58.38, region: 'Argentina' },
  'sao paulo': { lat: -23.55, lng: -46.63, region: 'Brazil' },
  'rio de janeiro': { lat: -22.91, lng: -43.17, region: 'Brazil' },
  'mexico city': { lat: 19.43, lng: -99.13, region: 'Mexico' },
  'tijuana': { lat: 32.51, lng: -117.04, region: 'Mexico' },
  'port-au-prince': { lat: 18.54, lng: -72.34, region: 'Haiti' },
  'haiti': { lat: 18.54, lng: -72.34, region: 'Caribbean' },
  
  // More conflict zones and regions
  'donbass': { lat: 48.0, lng: 38.0, region: 'Ukraine' },
  'luhansk': { lat: 48.57, lng: 39.31, region: 'Ukraine' },
  'bakhmut': { lat: 48.6, lng: 38.0, region: 'Ukraine' },
  'avdiivka': { lat: 48.14, lng: 37.75, region: 'Ukraine' },
  'pokrovsk': { lat: 48.28, lng: 37.18, region: 'Ukraine' },
  'sumy': { lat: 50.91, lng: 34.8, region: 'Ukraine' },
  'dnipro': { lat: 48.47, lng: 35.04, region: 'Ukraine' },
  'poltava': { lat: 49.59, lng: 34.55, region: 'Ukraine' },
  
  // More Middle East
  'mosul': { lat: 36.34, lng: 43.13, region: 'Iraq' },
  'basra': { lat: 30.51, lng: 47.81, region: 'Iraq' },
  'kirkuk': { lat: 35.47, lng: 44.39, region: 'Iraq' },
  'erbil': { lat: 36.19, lng: 44.01, region: 'Iraq' },
  'deir ez-zor': { lat: 35.34, lng: 40.14, region: 'Syria' },
  'raqqa': { lat: 35.95, lng: 39.01, region: 'Syria' },
  'latakia': { lat: 35.52, lng: 35.79, region: 'Syria' },
  'hodeidah': { lat: 14.8, lng: 42.95, region: 'Yemen' },
  'marib': { lat: 15.46, lng: 45.32, region: 'Yemen' },
  'taiz': { lat: 13.58, lng: 44.02, region: 'Yemen' },
  'isfahan': { lat: 32.65, lng: 51.68, region: 'Iran' },
  'shiraz': { lat: 29.59, lng: 52.58, region: 'Iran' },
  'tabriz': { lat: 38.08, lng: 46.29, region: 'Iran' },
  'mashhad': { lat: 36.3, lng: 59.6, region: 'Iran' },
  'qom': { lat: 34.64, lng: 50.88, region: 'Iran' },
  'ahvaz': { lat: 31.32, lng: 48.67, region: 'Iran' },
  'kermanshah': { lat: 34.31, lng: 47.06, region: 'Iran' },
  'rasht': { lat: 37.28, lng: 49.58, region: 'Iran' },
  'zahedan': { lat: 29.5, lng: 60.86, region: 'Iran' },
  'bandar abbas': { lat: 27.19, lng: 56.28, region: 'Iran' },
  'bushehr': { lat: 28.97, lng: 50.84, region: 'Iran' },
  'natanz': { lat: 33.51, lng: 51.92, region: 'Iran' },
  'fordow': { lat: 34.88, lng: 51.0, region: 'Iran' },
  'arak': { lat: 34.09, lng: 49.69, region: 'Iran' },
  'parchin': { lat: 35.52, lng: 51.77, region: 'Iran' },
  'kharg island': { lat: 29.23, lng: 50.32, region: 'Iran' },
  'chabahar': { lat: 25.29, lng: 60.64, region: 'Iran' },
  'sanandaj': { lat: 35.31, lng: 46.99, region: 'Iran' },
  'urmia': { lat: 37.55, lng: 45.08, region: 'Iran' },
  'yazd': { lat: 31.9, lng: 54.37, region: 'Iran' },
  'kerman': { lat: 30.28, lng: 57.08, region: 'Iran' },
  
  // More Gaza/West Bank
  'nablus': { lat: 32.22, lng: 35.26, region: 'Palestine' },
  'jenin': { lat: 32.46, lng: 35.3, region: 'Palestine' },
  'tulkarm': { lat: 32.31, lng: 35.03, region: 'Palestine' },
  'hebron': { lat: 31.53, lng: 35.1, region: 'Palestine' },
  'bethlehem': { lat: 31.71, lng: 35.21, region: 'Palestine' },
  'jericho': { lat: 31.86, lng: 35.46, region: 'Palestine' },
  'gaza city': { lat: 31.5, lng: 34.47, region: 'Gaza' },
  'jabalia': { lat: 31.53, lng: 34.48, region: 'Gaza' },
  'beit hanoun': { lat: 31.54, lng: 34.54, region: 'Gaza' },
  'deir al-balah': { lat: 31.42, lng: 34.35, region: 'Gaza' },
  'nuseirat': { lat: 31.45, lng: 34.39, region: 'Gaza' },
  
  // More Israel
  'ashkelon': { lat: 31.67, lng: 34.57, region: 'Israel' },
  'ashdod': { lat: 31.8, lng: 34.65, region: 'Israel' },
  'beersheba': { lat: 31.25, lng: 34.79, region: 'Israel' },
  'eilat': { lat: 29.56, lng: 34.95, region: 'Israel' },
  'tiberias': { lat: 32.79, lng: 35.53, region: 'Israel' },
  'nazareth': { lat: 32.7, lng: 35.3, region: 'Israel' },
  'sderot': { lat: 31.52, lng: 34.6, region: 'Israel' },
  'dimona': { lat: 31.07, lng: 35.03, region: 'Israel' },
  
  // More Lebanon
  'tyre': { lat: 33.27, lng: 35.2, region: 'Lebanon' },
  'sidon': { lat: 33.56, lng: 35.37, region: 'Lebanon' },
  'tripoli lebanon': { lat: 34.44, lng: 35.85, region: 'Lebanon' },
  'baalbek': { lat: 34.01, lng: 36.21, region: 'Lebanon' },
  'nabatieh': { lat: 33.38, lng: 35.48, region: 'Lebanon' },
  
  // Red Sea / Houthi targets
  'bab el-mandeb': { lat: 12.58, lng: 43.33, region: 'Red Sea' },
  'mocha': { lat: 13.32, lng: 43.25, region: 'Yemen' },
  'al hudaydah': { lat: 14.8, lng: 42.95, region: 'Yemen' },
  
  // More Russia border/military
  'voronezh': { lat: 51.67, lng: 39.18, region: 'Russia' },
  'bryansk': { lat: 53.25, lng: 34.37, region: 'Russia' },
  'pskov': { lat: 57.82, lng: 28.33, region: 'Russia' },
  'murmansk': { lat: 68.97, lng: 33.09, region: 'Russia' },
  'vladivostok': { lat: 43.12, lng: 131.89, region: 'Russia' },
  'novosibirsk': { lat: 55.01, lng: 82.92, region: 'Russia' },
  'yekaterinburg': { lat: 56.84, lng: 60.6, region: 'Russia' },
  'kazan': { lat: 55.79, lng: 49.12, region: 'Russia' },
  'samara': { lat: 53.2, lng: 50.15, region: 'Russia' },
  'krasnodar': { lat: 45.04, lng: 38.98, region: 'Russia' },
  
  // More Asia
  'xinjiang': { lat: 41.0, lng: 85.0, region: 'China' },
  'tibet': { lat: 29.65, lng: 91.1, region: 'China' },
  'shenzhen': { lat: 22.54, lng: 114.06, region: 'China' },
  'guangzhou': { lat: 23.13, lng: 113.26, region: 'China' },
  'wuhan': { lat: 30.59, lng: 114.31, region: 'China' },
  'chengdu': { lat: 30.57, lng: 104.07, region: 'China' },
  'okinawa': { lat: 26.5, lng: 127.93, region: 'Japan' },
  'osaka': { lat: 34.69, lng: 135.5, region: 'Japan' },
  'busan': { lat: 35.18, lng: 129.08, region: 'South Korea' },
  'incheon': { lat: 37.46, lng: 126.71, region: 'South Korea' },
  'kaesong': { lat: 37.97, lng: 126.56, region: 'North Korea' },
  'wonsan': { lat: 39.15, lng: 127.44, region: 'North Korea' },
  'yangon': { lat: 16.87, lng: 96.2, region: 'Myanmar' },
  'mandalay': { lat: 21.97, lng: 96.08, region: 'Myanmar' },
  'dhaka': { lat: 23.81, lng: 90.41, region: 'Bangladesh' },
  'colombo': { lat: 6.93, lng: 79.85, region: 'Sri Lanka' },
  'kathmandu': { lat: 27.72, lng: 85.32, region: 'Nepal' },
  'kashmir': { lat: 34.08, lng: 74.8, region: 'India' },
  'srinagar': { lat: 34.08, lng: 74.8, region: 'India' },
  'peshawar': { lat: 34.01, lng: 71.58, region: 'Pakistan' },
  'quetta': { lat: 30.18, lng: 67.0, region: 'Pakistan' },
  'kandahar': { lat: 31.61, lng: 65.72, region: 'Afghanistan' },
  'herat': { lat: 34.35, lng: 62.2, region: 'Afghanistan' },
  'mazar-i-sharif': { lat: 36.71, lng: 67.11, region: 'Afghanistan' },
  
  // More Africa
  'mogadishu': { lat: 2.04, lng: 45.34, region: 'Somalia' },
  'kismayo': { lat: -0.36, lng: 42.55, region: 'Somalia' },
  'benghazi': { lat: 32.12, lng: 20.07, region: 'Libya' },
  'sirte': { lat: 31.21, lng: 16.59, region: 'Libya' },
  'timbuktu': { lat: 16.77, lng: -3.01, region: 'Mali' },
  'bamako': { lat: 12.64, lng: -8.0, region: 'Mali' },
  'niamey': { lat: 13.51, lng: 2.11, region: 'Niger' },
  'ouagadougou': { lat: 12.37, lng: -1.52, region: 'Burkina Faso' },
  'abuja': { lat: 9.08, lng: 7.4, region: 'Nigeria' },
  'maiduguri': { lat: 11.85, lng: 13.16, region: 'Nigeria' },
  'kinshasa': { lat: -4.32, lng: 15.31, region: 'DRC' },
  'lubumbashi': { lat: -11.66, lng: 27.48, region: 'DRC' },
  'juba': { lat: 4.85, lng: 31.58, region: 'South Sudan' },
  'asmara': { lat: 15.34, lng: 38.93, region: 'Eritrea' },
  'djibouti': { lat: 11.59, lng: 43.15, region: 'Djibouti' },
  
  // More Europe
  'minsk': { lat: 53.9, lng: 27.57, region: 'Belarus' },
  'vilnius': { lat: 54.69, lng: 25.28, region: 'Lithuania' },
  'riga': { lat: 56.95, lng: 24.11, region: 'Latvia' },
  'tallinn': { lat: 59.44, lng: 24.75, region: 'Estonia' },
  'kaliningrad': { lat: 54.71, lng: 20.51, region: 'Russia' },
  'st petersburg': { lat: 59.93, lng: 30.34, region: 'Russia' },
  'rostov': { lat: 47.24, lng: 39.71, region: 'Russia' },
  'volgograd': { lat: 48.72, lng: 44.5, region: 'Russia' },
  'sevastopol': { lat: 44.6, lng: 33.53, region: 'Crimea' },
  'simferopol': { lat: 44.95, lng: 34.1, region: 'Crimea' },
  'tbilisi': { lat: 41.72, lng: 44.79, region: 'Georgia' },
  'baku': { lat: 40.41, lng: 49.87, region: 'Azerbaijan' },
  'yerevan': { lat: 40.18, lng: 44.51, region: 'Armenia' },
  'nagorno-karabakh': { lat: 39.82, lng: 46.75, region: 'Caucasus' },
  
  // Central Asia
  'almaty': { lat: 43.24, lng: 76.95, region: 'Kazakhstan' },
  'astana': { lat: 51.17, lng: 71.43, region: 'Kazakhstan' },
  'tashkent': { lat: 41.3, lng: 69.28, region: 'Uzbekistan' },
  'bishkek': { lat: 42.87, lng: 74.59, region: 'Kyrgyzstan' },
  'dushanbe': { lat: 38.56, lng: 68.77, region: 'Tajikistan' },
  'ashgabat': { lat: 37.95, lng: 58.38, region: 'Turkmenistan' },
};

// Keywords that indicate event types - ordered by specificity (most specific first)
export const EVENT_TYPE_KEYWORDS: Record<string, string[]> = {
  missile: ['missile', 'icbm', 'ballistic', 'cruise missile', 'hypersonic', 'rocket attack', 'rocket strike'],
  airstrike: ['airstrike', 'air strike', 'airstrikes', 'bombing raid', 'aerial bombardment', 'air attack'],
  drone: ['drone', 'uav', 'unmanned', 'shahed', 'loitering munition'],
  naval: ['ship', 'vessel', 'tanker', 'maritime', 'naval', 'fleet', 'carrier', 'submarine', 'warship', 'destroyer', 'frigate'],
  military: ['troops', 'army', 'soldiers', 'military operation', 'ground forces', 'infantry', 'tank', 'artillery', 'offensive', 'counteroffensive'],
  protest: ['protest', 'protests', 'demonstration', 'demonstrators', 'rally', 'unrest', 'riot', 'riots'],
  cyber: ['cyber', 'hack', 'breach', 'malware', 'ransomware', 'ddos', 'cyberattack'],
  terror: ['terrorist', 'terrorism', 'suicide bomb', 'car bomb', 'ied', 'insurgent'],
  raid: ['raid', 'raids', 'ice raid', 'police raid', 'special forces'],
  explosion: ['explosion', 'blast', 'detonation', 'exploded'],
  shooting: ['shooting', 'gunfire', 'shot dead', 'opened fire', 'gunman'],
  conflict: ['war', 'conflict', 'combat', 'battle', 'fighting', 'clashes'],
};

// Severity keywords
export const SEVERITY_KEYWORDS = {
  critical: ['breaking', 'urgent', 'killed', 'dead', 'attack', 'explosion', 'war', 'invasion', 'missile', 'nuclear'],
  high: ['strike', 'troops', 'military', 'conflict', 'combat', 'offensive', 'casualties', 'wounded'],
  medium: ['tension', 'exercise', 'drill', 'sanctions', 'warning', 'threat', 'protest'],
};

export function extractLocation(text: string): LocationData | null {
  const lowerText = text.toLowerCase();
  
  // Sort locations by length (longest first) to match most specific first
  // e.g., "Salt Lake City" before "LA", "New York" before "York"
  const sortedLocations = Object.entries(LOCATION_DATABASE)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [location, data] of sortedLocations) {
    // Skip very short location names that could cause false matches
    if (location.length <= 2) {
      // For 1-2 char locations (us, uk, la), require word boundaries
      const regex = new RegExp(`\\b${escapeRegex(location)}\\b`, 'i');
      if (regex.test(text)) {
        return data;
      }
    } else {
      // For longer locations, use word boundary matching
      const regex = new RegExp(`\\b${escapeRegex(location)}\\b`, 'i');
      if (regex.test(text)) {
        return data;
      }
    }
  }
  
  return null;
}

// Helper to escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractEventType(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check in order of specificity
  const typeOrder = ['missile', 'airstrike', 'drone', 'naval', 'military', 'protest', 'cyber', 'terror', 'raid', 'explosion', 'shooting', 'conflict'];
  
  for (const type of typeOrder) {
    const keywords = EVENT_TYPE_KEYWORDS[type];
    if (keywords && keywords.some(kw => lowerText.includes(kw))) {
      return type;
    }
  }
  
  // Fallback checks for common patterns
  if (lowerText.includes('attack') || lowerText.includes('strike')) return 'airstrike';
  if (lowerText.includes('killed') || lowerText.includes('dead')) return 'conflict';
  
  return 'breaking';
}

export function extractSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerText = text.toLowerCase();
  
  if (SEVERITY_KEYWORDS.critical.some(kw => lowerText.includes(kw))) return 'critical';
  if (SEVERITY_KEYWORDS.high.some(kw => lowerText.includes(kw))) return 'high';
  if (SEVERITY_KEYWORDS.medium.some(kw => lowerText.includes(kw))) return 'medium';
  
  return 'low';
}
