const stateDistricts = {
        "Andhra Pradesh": ["Adilabad", "Anantapur", "Chittoor", "Cuddapah", "Cyberabad", "East Godavari", "Guntakal Rly.", "Guntur", "Guntur Urban", "Hyderabad City", "Karimnagar", "Khammam", "Krishna", "Kurnool", "Mahaboobnagar", "Medak", "Nalgonda", "Nellore", "Nizamabad", "Prakasham", "Rajahmundry", "Ranga Reddy", "Secunderabad Rly.", "Srikakulam", "Tirupathi Urban", "Vijayawada City", "Vijayawada Rly.", "Visakha Rural", "Visakhapatnam", "Vizianagaram", "Warangal", "Warangal Urban", "West Godavari"],
        "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "K/Kumey", "Kameng East", "Kameng West", "Lohit", "Longding", "Papum Pare", "Rural", "Siang East", "Siang Upper", "Siang West", "Subansiri Lower", "Subansiri Upper", "Tawang", "Tirap", "Upper Dibang Valley"],
        "Assam": ["Baksa", "Barpeta", "Bieo", "Bongaigaon", "C.I.D.", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "G.R.P.", "Goalpara", "Golaghat", "Guwahati City", "Hailakandi", "Hamren", "Jorhat", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", "N.C.Hills", "Nagaon", "Nalbari", "R.P.O.", "Sibsagar", "Sonitpur", "Stf", "Tinsukia", "Udalguri"],
        "Bihar": ["Araria", "Arwal", "Aurangabad", "Bagaha", "Banka", "Begusarai", "Bettiah", "Bhabhua", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "Gaya", "Gopalganj", "Jamalpur Rly.", "Jamui", "Jehanabad", "Katihar", "Katihar Rly.", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Motihari", "Munger", "Muzaffarpur", "Muzaffarpur Rly.", "Nalanda", "Naugachia", "Nawadah", "Patna", "Patna Rly.", "Purnea", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali"],
        "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bemetara", "Bilaspur", "Bizapur", "Dantewara", "Dhamtari", "Durg", "Gariyaband", "Grp Raipur", "Jagdalpur", "Janjgir", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sarguja", "Sukma", "Surajpur"],
        "Goa": ["North Goa", "South Goa"],
        "Gujarat": ["Ahmedabad Commr.", "Ahmedabad Rural", "Ahwa-Dang", "Amreli", "Anand", "Bharuch", "Bhavnagar", "Cid Crime", "Dahod", "Gandhinagar", "Himatnagar", "Jamnagar", "Junagadh", "Kheda North", "Kutch (East(G))", "Kutch (West-Bhuj)", "Mehsana", "Narmada", "Navsari", "Palanpur", "Panchmahal", "Patan", "Porbandar", "Rajkot Commr.", "Rajkot Rural", "Surat Commr.", "Surat Rural", "Surendranagar", "Tapi", "Vadodara Commr.", "Vadodara Rural", "Valsad", "W.Rly Ahmedabad", "W.Rly Vadodara"],
        "Haryana": ["Ambala", "Ambala Rural", "Ambala Urban", "Bhiwani", "Faridabad", "Fatehabad", "Grp", "Gurgaon", "Hissar", "I&P Haryana", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
        "Himachal Pradesh": ["Baddipolicedist", "Bilaspur", "Chamba", "Cid", "G.R.P.", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul-Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
        "Jammu & Kashmir": ["Anantnag", "Awantipora", "Bandipora", "Baramulla", "Border District", "Budgam", "Crime Jammu", "Crime Kashmir", "Crime Srinagar", "Doda", "Ganderbal", "Handwara", "Jammu", "Kargil", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Leh", "Poonch", "Pulwama", "Railways", "Railways Jammu", "Railways Kashmir", "Railways Katra", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Sopore", "Srinagar", "Udhampur"],
        "Jharkhand": ["Bokaro", "Chaibasa", "Chatra", "Deoghar", "Dhanbad", "Dhanbad Rly.", "Dumka", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamshedpur", "Jamshedpur Rly.", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardagga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Saraikela", "Simdega"],
        "Karnataka": ["Bagalkot", "Bangalore Commr.", "Bangalore Rural", "Belgaum", "Bellary", "Bidar", "Bijapur", "Cbpura", "Chamarajnagar", "Chickmagalur", "Chitradurga", "Dakshin Kannada", "Davanagere", "Dharwad Commr.", "Dharwad Rural", "Gadag", "Gulbarga", "Hassan", "Haveri", "K.G.F.", "Kodagu", "Kolar", "Koppal", "Mandya", "Mangalore City", "Mysore Commr.", "Mysore Rural", "Raichur", "Railways", "Ramanagar", "Shimoga", "Tumkur", "Udupi", "Uttar Kannada", "Yadgiri"],
        "Kerala": ["Alapuzha", "Cbcid", "Ernakulam Commr.", "Ernakulam Rural", "Idukki", "Kannur", "Kasargod", "Kollam", "Kollam Commr.", "Kollam Rural", "Kottayam", "Kozhikode Commr.", "Kozhikode Rural", "Malappuram", "Palakkad", "Pathanamthitta", "Railways", "Thrissur", "Thrissur Commr.", "Thrissur Rural", "Trivandrum Commr.", "Trivandrum Rural", "Wayanadu"],
        "Madhya Pradesh": ["Agar", "Alirajpur", "Anuppur", "Ashok Nagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Bhopal Rly.", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datiya", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Indore Rly.", "Jabalpur", "Jabalpur Rly.", "Jhabua", "Katni", "Khandwa", "Khargon", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Sihore", "Singrauli", "Tikamgarh", "Ujjain", "Umariya", "Vidisha"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati Commr.", "Amravati Rural", "Aurangabad Commr.", "Aurangabad Rural", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai Commr.", "Mumbai Rly.", "Nagpur Commr.", "Nagpur Rly.", "Nagpur Rural", "Nanded", "Nandurbar", "Nasik Commr.", "Nasik Rural", "Navi Mumbai", "Osmanabad", "Parbhani", "Pune Commr.", "Pune Rly.", "Pune Rural", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur Commr.", "Solapur Rural", "Thane Commr.", "Thane Rural", "Wardha", "Washim", "Yavatmal"],
        "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Cid", "Imphal East", "Imphal West", "Senapati", "Tamenglong", "Thoubal", "Ukhrul"],
        "Meghalaya": ["Garo Hills East", "Garo Hills North", "Garo Hills South", "Garo Hills South W.", "Garo Hills West", "Jaintia Hills", "Jaintia Hills East", "Jaintia Hills West", "Khasi Hills East", "Khasi Hills South W.", "Khasi Hills West", "Ri-Bhoi"],
        "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip", "Spl Narcotic", "Traffic Ps"],
        "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
        "Odisha": ["Angul", "Balasore", "Baragarh", "Berhampur", "Bhadrak", "Bolangir", "Boudh", "Cuttack", "Dcp Bbsr", "Dcp Ctc", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khurda", "Koraput", "Malkangir", "Mayurbhanj", "Nayagarh", "Nowrangpur", "Nuapada", "Puri", "Rayagada", "Rourkela", "Sambalpur", "Sonepur", "Srp(Cuttack)", "Srp(Rourkela)", "Sundargarh"],

        "Punjab": [
            "Amritsar Rural", "Barnala", "Batala", "Bhatinda", "CP Amritsar", "CP Jalandhar", 
            "CP Ludhiana", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozpur", "G.R.P", 
            "Gurdaspur", "Hoshiarpur", "Jalandhar Rural", "Kapurthala", "Khanna", 
            "Ludhiana Rural", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", 
            "Ropar", "Sangrur", "SAS Ngr", "SBS Nagar", "Tarn Taran"
        ],
        "Rajasthan": [
            "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", 
            "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Discom", 
            "Dungarpur", "G.R.P. Ajmer", "G.R.P. Jodhpur", "Ganganagar", "Hanumangarh", 
            "Jaipur East", "Jaipur North", "Jaipur Rural", "Jaipur South", "Jaipur West", 
            "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur East", "Jodhpur Rural", 
            "Jodhpur West", "Karauli", "Kota City", "Kota Rural", "Nagaur", "Pali", 
            "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur"
        ],
        "Sikkim": ["East", "North", "South", "West"],
        "Tamil Nadu": [
            "Ariyalur", "Chennai", "Chennai Rly.", "Coimbatore Rural", "Coimbatore Urban", 
            "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", 
            "Karur", "Krishnagiri", "Madurai Rural", "Madurai Urban", "Nagapattinam", 
            "Namakkal", "Nilgiris", "Perambalur", "Pudukottai", "Ramnathapuram", 
            "Salem Rural", "Salem Urban", "Sivagangai", "Thanjavur", "Theni", 
            "Thirunelveli Rural", "Thirunelveli Urban", "Thiruvallur", "Thiruvannamalai", 
            "Thiruvarur", "Thoothugudi", "Tiruppur", "Trichy Rly.", "Trichy Rural", 
            "Trichy Urban", "Vellore", "Villupuram", "Virudhunagar"
        ],
        "Tripura": [
            "Dhalai", "Gomati", "GRP", "Khowai", "North", "Sipahijala", "South", 
            "Unakoti", "West"
        ],
        "Uttar Pradesh": [
            "Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", 
            "Auraiya", "Azamgarh", "Badaun", "Baghpat", "Bahraich", "Ballia", 
            "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bijnor", 
            "Bulandshahar", "Chandoli", "Chitrakoot Dham", "Deoria", "Etah", 
            "Etawah", "Faizabad", "Fatehgarh", "Fatehpur", "Firozabad", "G.R.P.", 
            "Gautambudh Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", 
            "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", 
            "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", 
            "Khiri", "Kushi Nagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", 
            "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", 
            "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raibareilly", "Rampur", 
            "Saharanpur", "Sambhal", "Sant Kabirnagar", "Shahjahanpur", "Shamli", 
            "Shrawasti", "Sidharthnagar", "Sitapur", "Sonbhadra", "St. Ravidasnagar", 
            "Sultanpur", "Unnao", "Varanasi"
        ],
        "Uttarakhand": [
            "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", 
            "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudra Prayag", "Tehri Garhwal", 
            "Udhamsingh Nagar", "Uttarkashi"
        ],
        "West Bengal": [
            "24 Parganas North", "24 Parganas South", "Asansol", "Bankura", "BDN CP", 
            "Birbhum", "BKP CP", "Burdwan", "Coochbehar", "Dakshin Dinajpur", 
            "Darjeeling", "Hooghly", "Howrah", "Howrah City", "Howrah G.R.P.", 
            "Jalpaiguri", "Jhargram", "Kharagpur G.R.P.", "Kolkata", "Malda", 
            "Murshidabad", "Nadia", "Paschim Midnapur", "Purab Midnapur", "Purulia", 
            "Sealdah G.R.P.", "Siliguri G.R.P.", "Siliguri PC", "Uttar Dinajpur"
        ],
        
        "A&N Islands": ["Car", "North", "South"],
        "Chandigarh": ["Chandigarh"],
        "D&N Haveli": ["D&N Haveli"],
        "Daman & Diu": ["Daman", "Diu"],
        "Delhi UT": [
            "CAW", "Central", "Crime Branch", "East", "EOW", "GRP(Rly)", "IGI Airport", 
            "Metro Rail", "New Delhi", "North", "North-East", "North-West", "Outer", 
            "South", "South-East", "South-West", "STF", "West"
        ],
        "Lakshadweep": ["Lakshadweep"],
        "Puducherry": ["Karaikal", "Puducherry"]
    };

    const stateSelect = document.getElementById("stateSelect");
    if (stateSelect) {
        stateSelect.addEventListener('change', loadDistricts);
    }

    // --- 2. Function to Load Districts ---
    function loadDistricts() {
        // Get the elements
        const stateSelect = document.getElementById("stateSelect");
        const districtSelect = document.getElementById("districtSelect");
        
        // Get the selected state
        const selectedState = stateSelect.value;

        // Reset the district dropdown
        districtSelect.innerHTML = '<option value="">Select District</option>';

        // Check if a valid state is selected
        if (selectedState && stateDistricts[selectedState]) {
            // Enable the dropdown
            districtSelect.disabled = false;

            // Get the list of districts for that state
            const districts = stateDistricts[selectedState];

            // Loop through districts and add them as options
            districts.forEach(district => {
                const option = document.createElement("option");
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
        } else {
            // If no state selected, disable the district dropdown again
            districtSelect.innerHTML = '<option value="">Select State First</option>';
            districtSelect.disabled = true;
        }
    }

    document.getElementById('tipForm').addEventListener('submit', async function(e) {
        e.preventDefault(); // Stop page reload

        const feedbackArea = document.getElementById('submission-feedback');
        const crimeType = document.getElementById('crimeType').value;
        const state = document.getElementById('stateSelect').value;
        const district = document.getElementById('districtSelect').value;

        // 1. Validation
        if (!crimeType || !state || !district) {
            feedbackArea.style.color = "red";
            feedbackArea.textContent = "❌ Please select Crime Type, State, and District.";
            return;
        }

        feedbackArea.style.color = "burlywood";
        feedbackArea.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing patterns with ML model...';

        // 2. Prepare Data (Convert to UPPERCASE as requested)
        const requestData = {
            state: state.toUpperCase(),
            district: district.toUpperCase(),
            crime: crimeType.toUpperCase()
        };

        try {
            // 3. Send to Node.js Backend
            const response = await fetch('http://localhost:3000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                const count = result.predicted_count; 
                const percentage = result.percentage_of_total;

                feedbackArea.style.color = "#4ade80"; 
                feedbackArea.innerHTML = `
                    <div style="border: 1px solid #4ade80; padding: 20px; border-radius: 8px; margin-top: 15px; background: rgba(74, 222, 128, 0.1); text-align: center;">
                        
                        <h3 style="color: #4ade80; margin-bottom: 10px;">
                            <i class="fa-solid fa-chart-line"></i> Prediction Result
                        </h3>
                        
                        <p style="font-size: 1.1rem; color: #ddd; margin-bottom: 5px;">
                            Projected <strong>${result.crime_type}</strong> cases in <strong>${result.district}</strong>:
                        </p>
                        
                        <div style="font-size: 3rem; font-weight: bold; color: #fff; margin: 10px 0;">
                            ${count}
                        </div>

                        <p style="font-size: 0.9rem; color: #aaa;">
                            (Account for approx. <strong>${percentage}%</strong> of total cases)
                        </p>
                    </div>
                `;
            } else {
                feedbackArea.style.color = "red";
                feedbackArea.textContent = `❌ Error: ${result.error || 'Prediction failed'}`;
            }

        } catch (error) {
            console.error("Prediction Error:", error);
            feedbackArea.style.color = "red";
            feedbackArea.textContent = "❌ Server Error. Is the backend running?";
        }
    });