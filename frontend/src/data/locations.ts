// Location data for cascading dropdowns

export interface LocationData {
  [country: string]: {
    [state: string]: string[];
  };
}

export const locationData: LocationData = {
  "India": {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "Kakinada", "Rajahmundry", "Guntur", "Vijayawada", "Kurnool", "Ongole", "Srikakulam", "Visakhapatnam", "Vizianagaram", "Eluru"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Goalpara"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand", "Bharuch", "Junagadh"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belagavi", "Davangere", "Bellary", "Bijapur", "Shimoga", "Tumkur"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kannur", "Kottayam", "Palakkad", "Malappuram"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Ratlam", "Rewa", "Satna", "Morena"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Aurangabad", "Nashik", "Solapur", "Thane", "Kolhapur", "Sangli", "Ahmednagar"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Berhampur", "Sambalpur", "Baleshwar", "Bhadrak", "Baripada", "Jharsuguda"],
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Mohali", "Batala", "Pathankot", "Moga"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Siddipet"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Baharampur", "Habra"]
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Oakland", "Sacramento", "Fresno", "Long Beach", "Santa Ana", "Anaheim"],
    "New York": ["New York", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo"],
    "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
    "Illinois": ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Elgin", "Peoria", "Champaign", "Waukegan", "Cicero"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", "Bristol", "Leicester", "Coventry", "Bradford"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling", "Ayr", "Dumfries", "Falkirk"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Caerphilly", "Rhondda", "Port Talbot", "Merthyr Tydfil", "Bridgend"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Bangor", "Craigavon", "Castlereagh", "Carrickfergus", "Newtownabbey", "Coleraine"]
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai", "Jebel Ali", "Deira", "Bur Dubai", "Jumeirah", "Marina", "Downtown", "Business Bay"],
    "Abu Dhabi": ["Abu Dhabi", "Al Ain", "Al Dhafra", "Yas Island", "Saadiyat Island"],
    "Sharjah": ["Sharjah", "Al Qasimia", "Al Nahda", "Al Majaz"],
    "Ajman": ["Ajman", "Al Nuaimiya", "Al Jerf"],
    "Ras Al Khaimah": ["Ras Al Khaimah", "Al Hamra", "Al Marjan Island"],
    "Fujairah": ["Fujairah", "Dibba", "Khor Fakkan"],
    "Umm Al Quwain": ["Umm Al Quwain", "Al Salamah"]
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Levis", "Trois-Rivieres", "Terrebonne"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna", "Langley", "Nanaimo"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Leduc"]
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Albury", "Wagga Wagga", "Tamworth", "Orange", "Dubbo", "Nowra", "Broken Hill"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Latrobe", "Albury-Wodonga", "Shepparton", "Mildura", "Warrnambool", "Traralgon"],
    "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville", "Toowoomba", "Rockhampton", "Mackay", "Bundaberg", "Hervey Bay", "Gladstone"],
    "Western Australia": ["Perth", "Fremantle", "Bunbury", "Geraldton", "Kalgoorlie", "Albany", "Broome", "Mandurah", "Rockingham", "Joondalup"]
  },
  "Singapore": {
    "Central Region": ["Singapore", "Orchard", "Marina Bay", "Raffles Place", "Clarke Quay"],
    "East Region": ["Tampines", "Pasir Ris", "Bedok", "Changi", "Simei"],
    "North Region": ["Woodlands", "Yishun", "Sembawang", "Admiralty", "Kranji"],
    "North East Region": ["Punggol", "Sengkang", "Hougang", "Serangoon", "Ang Mo Kio"],
    "West Region": ["Jurong", "Boon Lay", "Pioneer", "Tuas", "Clementi"]
  }
};

export const countries = Object.keys(locationData);

export function getStates(country: string): string[] {
  if (!country || !locationData[country]) return [];
  return Object.keys(locationData[country]);
}

export function getCities(country: string, state: string): string[] {
  if (!country || !state || !locationData[country] || !locationData[country][state]) return [];
  return locationData[country][state];
}
