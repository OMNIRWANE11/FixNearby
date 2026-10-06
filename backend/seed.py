import os
import random
from datetime import datetime, date, timedelta
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.service_category import ServiceCategory, ProblemType
from app.models.technician import Technician
from app.models.credential import Credential
from app.models.review import Review
from app.models.emergency_request import EmergencyRequest

app = create_app(os.getenv("FLASK_ENV", "development"))

def seed_database():
    with app.app_context():
        print("[*] Creating database tables if not existing...")
        db.create_all()

        print("[*] Cleaning existing seed data...")
        Review.query.delete()
        EmergencyRequest.query.delete()
        Credential.query.delete()
        Technician.query.delete()
        ProblemType.query.delete()
        ServiceCategory.query.delete()
        User.query.delete()
        db.session.commit()

        # 1. CREATE CORE USERS (Admin & Customer)
        admin_user = User(
            email="admin@fixnearby.local",
            full_name="FixNearby City Administrator",
            phone="+919822000001",
            role="admin",
            saved_address="District Disaster Management Authority, Kolhapur Collector Office, Kolhapur",
            saved_latitude=16.7050,
            saved_longitude=74.2433
        )
        admin_user.set_password("AdminPass@123")
        db.session.add(admin_user)

        customer_user = User(
            email="citizen@fixnearby.local",
            full_name="Ananya Sharma",
            phone="+919822000002",
            role="customer",
            saved_address="Flat 402, Royal Palms, Shahupuri 2nd Lane, Kolhapur",
            saved_latitude=16.7032,
            saved_longitude=74.2389
        )
        customer_user.set_password("CitizenPass@123")
        db.session.add(customer_user)

        # 2. CREATE SERVICE CATEGORIES
        categories_data = [
            {
                "code": "electrical",
                "name": "Electrical",
                "icon": "⚡",
                "image_url": "/images/electrical.svg",
                "description": "Urgent electrical faults, sparking, circuit breaker trips, power blackouts and hazardous wiring repairs."
            },
            {
                "code": "plumbing",
                "name": "Plumbing",
                "icon": "💧",
                "image_url": "/images/plumbing.svg",
                "description": "Critical burst pipelines, heavy leakages, sewer backflows, water tank overflows and tap ruptures."
            },
            {
                "code": "automotive",
                "name": "Automotive",
                "icon": "🚗",
                "image_url": "/images/automotive.svg",
                "description": "Roadside breakdowns, dead car/bike battery jumpstart, flat tyre repair, emergency towing assistance."
            },
            {
                "code": "locksmith",
                "name": "Locksmith",
                "icon": "🔐",
                "image_url": "/images/locksmith.svg",
                "description": "Emergency house lockouts, lost vehicle keys, broken key extraction, jammed security locks."
            }
        ]

        cat_objs = {}
        for cdata in categories_data:
            cat = ServiceCategory(**cdata)
            db.session.add(cat)
            cat_objs[cdata["code"]] = cat
        db.session.commit()

        # 3. CREATE PROBLEM TYPES
        problem_types_data = [
            # Electrical
            {
                "category": "electrical", "code": "short-circuit", "name": "Short Circuit / Sparking",
                "urgency": "CRITICAL",
                "safety": "Switch OFF the main distribution board switch immediately! Avoid touching exposed wires or wet surfaces near the switchboard."
            },
            {
                "category": "electrical", "code": "mcb-trip", "name": "Repeated MCB / Fuse Trip",
                "urgency": "HIGH",
                "safety": "Unplug heavy appliances (AC, Geyser, Microwave). Do not repeatedly force the MCB lever up if it immediately flips down."
            },
            {
                "category": "electrical", "code": "burning-smell", "name": "Electrical Burning Smell / Smoke",
                "urgency": "CRITICAL",
                "safety": "Turn off main power breaker at once. Ventilate room. If flame is visible, use CO2 or dry powder fire extinguisher (Never use water!)."
            },
            {
                "category": "electrical", "code": "wiring-fault", "name": "Exposed Hazardous Wiring",
                "urgency": "HIGH",
                "safety": "Cordon off the area. Keep children and pets away from the exposed cable until the technician arrives."
            },
            {
                "category": "electrical", "code": "power-failure", "name": "Complete Home Power Failure",
                "urgency": "NORMAL",
                "safety": "Verify if neighboring houses also lost power. If isolated to your home, check the main breaker before requesting assistance."
            },

            # Plumbing
            {
                "category": "plumbing", "code": "burst-pipe", "name": "Burst Water Pipeline",
                "urgency": "CRITICAL",
                "safety": "Shut off the overhead tank main gate valve immediately to prevent structural water damage."
            },
            {
                "category": "plumbing", "code": "major-leakage", "name": "Major Wall / Ceiling Leakage",
                "urgency": "HIGH",
                "safety": "Turn off the nearest supply isolation valve. Place buckets beneath the drip to avoid floor seepage into electrical outlets."
            },
            {
                "category": "plumbing", "code": "no-water", "name": "Total Water Stoppage / Motor Air-lock",
                "urgency": "NORMAL",
                "safety": "Do not run water pump motor dry as it can burn the windings. Keep motor powered off until inspection."
            },
            {
                "category": "plumbing", "code": "tank-overflow", "name": "Overhead Tank Continuous Overflow",
                "urgency": "HIGH",
                "safety": "Turn off the submersible motor. Check if float ball valve is jammed."
            },
            {
                "category": "plumbing", "code": "tap-failure", "name": "Broken Angle Valve / Ruptured Tap",
                "urgency": "HIGH",
                "safety": "Close the bathroom/kitchen sub-line valve or turn off the pressure pump."
            },

            # Automotive
            {
                "category": "automotive", "code": "battery-dead", "name": "Dead Battery / No Crank",
                "urgency": "HIGH",
                "safety": "Turn off headlights, AC, and infotainment to preserve remaining voltage. Keep vehicle parked in neutral or park gear."
            },
            {
                "category": "automotive", "code": "flat-tyre", "name": "Flat Tyre / Sidewall Cut",
                "urgency": "NORMAL",
                "safety": "Pull vehicle completely off active traffic lane onto the shoulder. Turn on hazard emergency flashers."
            },
            {
                "category": "automotive", "code": "engine-problem", "name": "Engine Overheating / Steam",
                "urgency": "CRITICAL",
                "safety": "Pull over safely immediately and stop the engine. DO NOT open the radiator cap while engine is hot (severe steam burn hazard!)."
            },
            {
                "category": "automotive", "code": "breakdown", "name": "Complete Mechanical Breakdown",
                "urgency": "HIGH",
                "safety": "Stay inside vehicle if stopped on a highway shoulder with seatbelt fastened, or stand safely behind the highway crash barrier."
            },
            {
                "category": "automotive", "code": "towing", "name": "Emergency Flatbed Towing Required",
                "urgency": "HIGH",
                "safety": "Ensure vehicle wheels are locked with parking brake applied until recovery truck arrives."
            },

            # Locksmith
            {
                "category": "locksmith", "code": "locked-out", "name": "House / Apartment Lockout",
                "urgency": "HIGH",
                "safety": "Do not attempt dangerous window scaling or balcony jumps. Wait safely in a secure, well-lit corridor or reception."
            },
            {
                "category": "locksmith", "code": "lost-key", "name": "Lost Keys / Compromised Key",
                "urgency": "HIGH",
                "safety": "If keys were lost with address tags, keep someone present at premises until emergency lock replacement is completed."
            },
            {
                "category": "locksmith", "code": "broken-key", "name": "Key Snapped Inside Cylinder",
                "urgency": "HIGH",
                "safety": "Do not probe inside cylinder with safety pins or screwdrivers as it pushes the fragment deeper into the tumbler."
            },
            {
                "category": "locksmith", "code": "lock-damaged", "name": "Deadbolt Jammed / Forced Lock",
                "urgency": "CRITICAL",
                "safety": "Do not force door latch with heavy leverage. Ensure surrounding area is secure."
            },
            {
                "category": "locksmith", "code": "lock-replacement", "name": "Urgent Security Lock Replacement",
                "urgency": "NORMAL",
                "safety": "Have ownership/lease verification proof ready to confirm your occupancy rights before technician replacement."
            }
        ]

        for pdata in problem_types_data:
            cat = cat_objs[pdata["category"]]
            prob = ProblemType(
                category_id=cat.id,
                code=pdata["code"],
                name=pdata["name"],
                urgency_default=pdata["urgency"],
                safety_instructions=pdata["safety"]
            )
            db.session.add(prob)
        db.session.commit()

        # 4. CREATE 16 REALISTIC TECHNICIANS IN KOLHAPUR
        # Coordinates around Kolhapur localities:
        # Shahupuri, Rajarampuri, Tarabai Park, Udyam Nagar, Rankala, Kasaba Bawada, Shivaji Chowk, etc.
        technicians_seed = [
            # 1. Rajesh Patil (Electrical - Verified, Online) - Target for FN-88492
            {
                "name": "Rajesh Patil",
                "email": "rajesh.patil@fixnearby.local",
                "phone": "+919822110001",
                "badge": "FN-88492",
                "category": "electrical",
                "trade": "Senior Licensed Electrician",
                "exp": 12,
                "rating": 4.9,
                "jobs": 142,
                "radius": 20.0,
                "duty": True,
                "verified": True,
                "lat": 16.7045,
                "lng": 74.2410,
                "specialties": "Short Circuit Isolation, Industrial MCB Panels, House Wiring, Phase Balancing",
                "image": "/images/technicians/tech1.svg",
                "license_num": "MH-KOP-ELEC-48291",
                "trade_name": "Maharashtra State Electrical Licensing Board Class-A",
                "police_clearance": "KOP-PCC-2024-8841",
                "pass_all": True
            },
            # 2. Vikram Shinde (Electrical - Verified, Online)
            {
                "name": "Vikram Shinde",
                "email": "vikram.shinde@fixnearby.local",
                "phone": "+919822110002",
                "badge": "FN-49102",
                "category": "electrical",
                "trade": "Emergency Wireman & Fault Specialist",
                "exp": 8,
                "rating": 4.8,
                "jobs": 89,
                "radius": 15.0,
                "duty": True,
                "verified": True,
                "lat": 16.6950,
                "lng": 74.2475,
                "specialties": "Inverter Faults, MCB Replacement, Cable Burning Repairs",
                "image": "/images/technicians/tech2.svg",
                "license_num": "MH-KOP-ELEC-39182",
                "trade_name": "ITI Electrical Certification",
                "police_clearance": "KOP-PCC-2024-5102",
                "pass_all": True
            },
            # 3. Sachin Kadam (Electrical - Verified, Offline)
            {
                "name": "Sachin Kadam",
                "email": "sachin.kadam@fixnearby.local",
                "phone": "+919822110003",
                "badge": "FN-62019",
                "category": "electrical",
                "trade": "Commercial & Residential Electrician",
                "exp": 6,
                "rating": 4.6,
                "jobs": 64,
                "radius": 12.0,
                "duty": False,
                "verified": True,
                "lat": 16.7115,
                "lng": 74.2340,
                "specialties": "Switchboard Flashover, Motor Starter Wiring",
                "image": "/images/technicians/tech3.svg",
                "license_num": "MH-KOP-ELEC-99210",
                "trade_name": "State Trade Wireman License",
                "police_clearance": "KOP-PCC-2024-3312",
                "pass_all": True
            },
            # 4. Amit Jadhav (Electrical - UNVERIFIED / PENDING - Test Case)
            {
                "name": "Amit Jadhav",
                "email": "amit.jadhav@fixnearby.local",
                "phone": "+919822110004",
                "badge": "FN-33211",
                "category": "electrical",
                "trade": "Assistant Electrician",
                "exp": 2,
                "rating": 3.8,
                "jobs": 3, # Below minimum threshold of 5 jobs
                "radius": 10.0,
                "duty": True,
                "verified": False,
                "lat": 16.7210,
                "lng": 74.2490,
                "specialties": "Domestic Wiring, Light Fitting",
                "image": "/images/technicians/tech4.svg",
                "license_num": "EXPIRED-2023",
                "trade_name": "Apprentice Certification (Expired)",
                "police_clearance": None,
                "pass_all": False,
                "failure_reasons": "Trade license expired; Police clearance certificate not submitted; Customer rating below 4.0 safety threshold; Less than 5 completed jobs."
            },

            # 5. Santosh More (Plumbing - Verified, Online)
            {
                "name": "Santosh More",
                "email": "santosh.more@fixnearby.local",
                "phone": "+919822110005",
                "badge": "FN-77341",
                "category": "plumbing",
                "trade": "Master Hydraulic Plumber",
                "exp": 15,
                "rating": 4.9,
                "jobs": 210,
                "radius": 25.0,
                "duty": True,
                "verified": True,
                "lat": 16.7020,
                "lng": 74.2395,
                "specialties": "Burst High-Pressure Lines, Concealed Leak Detection, Tank Overflows",
                "image": "/images/technicians/tech5.svg",
                "license_num": "MH-PLUMB-55201",
                "trade_name": "Municipal Corporation Licensed Master Plumber",
                "police_clearance": "KOP-PCC-2024-9120",
                "pass_all": True
            },
            # 6. Mahesh Bhosale (Plumbing - Verified, Online)
            {
                "name": "Mahesh Bhosale",
                "email": "mahesh.bhosale@fixnearby.local",
                "phone": "+919822110006",
                "badge": "FN-51829",
                "category": "plumbing",
                "trade": "Emergency Leakage Technician",
                "exp": 7,
                "rating": 4.7,
                "jobs": 78,
                "radius": 15.0,
                "duty": True,
                "verified": True,
                "lat": 16.6980,
                "lng": 74.2530,
                "specialties": "Angle Valve Ruptures, Motor Air-lock Release, Drain Clearing",
                "image": "/images/technicians/tech6.svg",
                "license_num": "MH-PLUMB-33108",
                "trade_name": "ITI Plumbing Certification Grade-I",
                "police_clearance": "KOP-PCC-2024-7402",
                "pass_all": True
            },
            # 7. Vijay Chougule (Plumbing - Verified, Offline)
            {
                "name": "Vijay Chougule",
                "email": "vijay.chougule@fixnearby.local",
                "phone": "+919822110007",
                "badge": "FN-99120",
                "category": "plumbing",
                "trade": "Sanitary & Pipeline Specialist",
                "exp": 9,
                "rating": 4.6,
                "jobs": 92,
                "radius": 18.0,
                "duty": False,
                "verified": True,
                "lat": 16.6880,
                "lng": 74.2210,
                "specialties": "CPVC Pipe Welding, Tank Float Replacement",
                "image": "/images/technicians/tech7.svg",
                "license_num": "MH-PLUMB-48190",
                "trade_name": "State Trade Plumbing Certificate",
                "police_clearance": "KOP-PCC-2024-1189",
                "pass_all": True
            },
            # 8. Deepak Desai (Plumbing - UNVERIFIED / PENDING - Test Case)
            {
                "name": "Deepak Desai",
                "email": "deepak.desai@fixnearby.local",
                "phone": "+919822110008",
                "badge": "FN-11928",
                "category": "plumbing",
                "trade": "Plumbing Assistant",
                "exp": 1,
                "rating": 4.1,
                "jobs": 2, # Below 5 jobs threshold
                "radius": 10.0,
                "duty": True,
                "verified": False,
                "lat": 16.7310,
                "lng": 74.2560,
                "specialties": "Tap Washers, Simple Drain Clearance",
                "image": "/images/technicians/tech8.svg",
                "license_num": "PENDING-VERIFICATION",
                "trade_name": "Provisional Plumbing Apprentice",
                "police_clearance": None,
                "pass_all": False,
                "failure_reasons": "Police verification record pending submission; Minimum completed jobs threshold not met (2/5 jobs)."
            },

            # 9. Pradeep Gaikwad (Automotive - Verified, Online)
            {
                "name": "Pradeep Gaikwad",
                "email": "pradeep.gaikwad@fixnearby.local",
                "phone": "+919822110009",
                "badge": "FN-66281",
                "category": "automotive",
                "trade": "Roadside Recovery & Auto Mechanic",
                "exp": 14,
                "rating": 4.9,
                "jobs": 175,
                "radius": 30.0,
                "duty": True,
                "verified": True,
                "lat": 16.7060,
                "lng": 74.2440,
                "specialties": "Jumpstart Batteries, Alternator Diagnosis, Radiator Boiling Emergency",
                "image": "/images/technicians/tech9.svg",
                "license_num": "MH-AUTO-MV-88219",
                "trade_name": "Automobile Engineering Technical Diploma",
                "police_clearance": "KOP-PCC-2024-6612",
                "pass_all": True
            },
            # 10. Sunil Mane (Automotive - Verified, Online)
            {
                "name": "Sunil Mane",
                "email": "sunil.mane@fixnearby.local",
                "phone": "+919822110010",
                "badge": "FN-83921",
                "category": "automotive",
                "trade": "Tyre & Breakdown Response Specialist",
                "exp": 10,
                "rating": 4.8,
                "jobs": 130,
                "radius": 20.0,
                "duty": True,
                "verified": True,
                "lat": 16.6970,
                "lng": 74.2300,
                "specialties": "Tubeless Puncture Patching, Mobile Battery Boost, Towing Liaison",
                "image": "/images/technicians/tech10.svg",
                "license_num": "MH-AUTO-MV-44109",
                "trade_name": "Motor Vehicle Mechanic ITI License",
                "police_clearance": "KOP-PCC-2024-8391",
                "pass_all": True
            },
            # 11. Ganesh Sawant (Automotive - Verified, Offline)
            {
                "name": "Ganesh Sawant",
                "email": "ganesh.sawant@fixnearby.local",
                "phone": "+919822110011",
                "badge": "FN-44192",
                "category": "automotive",
                "trade": "Auto Electrician & Diagnostic Tech",
                "exp": 8,
                "rating": 4.7,
                "jobs": 84,
                "radius": 15.0,
                "duty": False,
                "verified": True,
                "lat": 16.7130,
                "lng": 74.2360,
                "specialties": "Starter Motor Repair, ECU Relay Check, Fuse Link Replacement",
                "image": "/images/technicians/tech11.svg",
                "license_num": "MH-AUTO-EL-71029",
                "trade_name": "Automotive Electrical Certified Specialist",
                "police_clearance": "KOP-PCC-2024-4412",
                "pass_all": True
            },
            # 12. Sandeep Kamble (Automotive - UNVERIFIED / PENDING - Test Case)
            {
                "name": "Sandeep Kamble",
                "email": "sandeep.kamble@fixnearby.local",
                "phone": "+919822110012",
                "badge": "FN-22819",
                "category": "automotive",
                "trade": "Independent Mechanic",
                "exp": 3,
                "rating": 3.7, # Low rating
                "jobs": 14,
                "radius": 10.0,
                "duty": True,
                "verified": False,
                "lat": 16.7200,
                "lng": 74.2510,
                "specialties": "Two Wheeler General Repair",
                "image": "/images/technicians/tech12.svg",
                "license_num": "MH-MOTO-UNREG",
                "trade_name": "Unregistered Apprentice",
                "police_clearance": None,
                "pass_all": False,
                "failure_reasons": "Average customer rating (3.7) is below the required 4.0 threshold; Police background verification is unverified."
            },

            # 13. Mohan Naik (Locksmith - Verified, Online)
            {
                "name": "Mohan Naik",
                "email": "mohan.naik@fixnearby.local",
                "phone": "+919822110013",
                "badge": "FN-94812",
                "category": "locksmith",
                "trade": "Master Security Locksmith",
                "exp": 16,
                "rating": 5.0,
                "jobs": 310,
                "radius": 25.0,
                "duty": True,
                "verified": True,
                "lat": 16.7035,
                "lng": 74.2380,
                "specialties": "Non-Destructive Home Entry, Broken Key Extraction, Smart Digital Lock Emergency",
                "image": "/images/technicians/tech13.svg",
                "license_num": "MH-LOCK-SEC-99120",
                "trade_name": "Certified Master Locksmith & Safe Technician",
                "police_clearance": "KOP-PCC-2024-9481",
                "pass_all": True
            },
            # 14. Kiran Chavan (Locksmith - Verified, Online)
            {
                "name": "Kiran Chavan",
                "email": "kiran.chavan@fixnearby.local",
                "phone": "+919822110014",
                "badge": "FN-71029",
                "category": "locksmith",
                "trade": "Emergency Door & Car Locksmith",
                "exp": 9,
                "rating": 4.8,
                "jobs": 115,
                "radius": 18.0,
                "duty": True,
                "verified": True,
                "lat": 16.6960,
                "lng": 74.2490,
                "specialties": "Car Lockout Bypass, Cylinder Re-keying, Deadbolt Replacement",
                "image": "/images/technicians/tech14.svg",
                "license_num": "MH-LOCK-SEC-51209",
                "trade_name": "Security Hardware Association Certified",
                "police_clearance": "KOP-PCC-2024-7102",
                "pass_all": True
            },
            # 15. Nitin Shere (Locksmith - Verified, Offline)
            {
                "name": "Nitin Shere",
                "email": "nitin.shere@fixnearby.local",
                "phone": "+919822110015",
                "badge": "FN-58190",
                "category": "locksmith",
                "trade": "Residential Locksmith",
                "exp": 7,
                "rating": 4.7,
                "jobs": 80,
                "radius": 15.0,
                "duty": False,
                "verified": True,
                "lat": 16.7140,
                "lng": 74.2310,
                "specialties": "Mortise Lock Repair, Padlock Extraction, Key Duplication",
                "image": "/images/technicians/tech15.svg",
                "license_num": "MH-LOCK-SEC-33108",
                "trade_name": "Locksmith Guild Certification",
                "police_clearance": "KOP-PCC-2024-5819",
                "pass_all": True
            },
            # 16. Rohan Yadav (Locksmith - UNVERIFIED / PENDING - Test Case)
            {
                "name": "Rohan Yadav",
                "email": "rohan.yadav@fixnearby.local",
                "phone": "+919822110016",
                "badge": "FN-88301",
                "category": "locksmith",
                "trade": "Junior Locksmith",
                "exp": 1,
                "rating": 4.2,
                "jobs": 4, # Less than 5 jobs
                "radius": 8.0,
                "duty": True,
                "verified": False,
                "lat": 16.6890,
                "lng": 74.2230,
                "specialties": "Standard Door Knob Repair",
                "image": "/images/technicians/tech16.svg",
                "license_num": "PROVISIONAL-771",
                "trade_name": "Provisional Locksmith Permit",
                "police_clearance": None,
                "pass_all": False,
                "failure_reasons": "Police verification certificate pending; Minimum 5 completed jobs required for public trust badge (4/5 completed)."
            }
        ]

        print(f"[*] Seeding {len(technicians_seed)} technicians and verification credentials...")
        created_techs = []
        for tinfo in technicians_seed:
            t_user = User(
                email=tinfo["email"],
                full_name=tinfo["name"],
                phone=tinfo["phone"],
                role="technician",
                saved_address="Kolhapur, Maharashtra",
                saved_latitude=tinfo["lat"],
                saved_longitude=tinfo["lng"]
            )
            t_user.set_password("TechPass@123")
            db.session.add(t_user)
            db.session.flush()

            cat = cat_objs[tinfo["category"]]
            tech = Technician(
                user_id=t_user.id,
                category_id=cat.id,
                badge_code=tinfo["badge"],
                trade=tinfo["trade"],
                experience_years=tinfo["exp"],
                phone=tinfo["phone"],
                whatsapp_number=tinfo["phone"],
                rating=tinfo["rating"],
                jobs_completed=tinfo["jobs"],
                operating_radius_km=tinfo["radius"],
                is_on_duty=tinfo["duty"],
                is_verified=tinfo["verified"],
                profile_image_url=tinfo["image"],
                specialties=tinfo["specialties"],
                current_latitude=tinfo["lat"],
                current_longitude=tinfo["lng"]
            )
            db.session.add(tech)
            db.session.flush()

            # Seed 4-Point Credential Audit
            cred = Credential(
                technician_id=tech.id,
                legal_name=tinfo["name"],
                identity_verified=tinfo["pass_all"],
                identity_document_type="Aadhaar National Identity Card" if tinfo["pass_all"] else "Pending Document",
                license_number=tinfo["license_num"],
                trade_license_name=tinfo["trade_name"],
                license_verified=tinfo["pass_all"],
                license_valid_until=date(2028, 12, 31) if tinfo["pass_all"] else date(2023, 1, 1),
                address_verified=tinfo["pass_all"],
                residential_address="Residential Address Verified by Field Officer" if tinfo["pass_all"] else "Unverified Address",
                police_verified=tinfo["pass_all"],
                police_clearance_number=tinfo["police_clearance"],
                police_check_date=date(2024, 1, 15) if tinfo["pass_all"] else None,
                audit_notes="All 4 points rigorously verified according to FixNearby Safety Standard." if tinfo["pass_all"] else "Verification audit flagged missing or failing criteria.",
                failure_reasons=tinfo.get("failure_reasons")
            )
            db.session.add(cred)
            created_techs.append(tech)

        db.session.commit()

        # 5. CREATE A SAMPLE ACTIVE EMERGENCY REQUEST (for instant testing of /tracking)
        sample_tech = Technician.query.filter_by(badge_code="FN-88492").first()
        sample_cat = cat_objs["electrical"]
        sample_prob = ProblemType.query.filter_by(code="short-circuit").first()

        sample_request = EmergencyRequest(
            id="req-live-kolhapur-001",
            user_id=customer_user.id,
            category_id=sample_cat.id,
            problem_type_id=sample_prob.id,
            problem_custom_desc="Main distribution panel sparking loudly with burning smell.",
            severity="CRITICAL",
            customer_name="Ananya Sharma",
            customer_phone="+919822000002",
            customer_address="Shahupuri 2nd Lane, Kolhapur",
            customer_latitude=16.7032,
            customer_longitude=74.2389,
            status="ON_THE_WAY",
            assigned_technician_id=sample_tech.id,
            distance_km=0.8,
            estimated_eta_minutes=4,
            route_polyline='[[16.7045, 74.2410], [16.7040, 74.2405], [16.7035, 74.2395], [16.7032, 74.2389]]'
        )
        db.session.add(sample_request)

        # 6. SEED REVIEWS FOR VERIFIED TECHNICIANS
        reviews_data = [
            ("Quick response! Replaced the burnt MCB within 15 minutes during the storm. Life saver!", 5),
            ("Very polite, verified his FixNearby badge right at the door before letting him in.", 5),
            ("Clean work and transparent pricing. Paid directly via UPI without any surprise charges.", 5),
            ("Prompt arrival and diagnosed the short circuit immediately.", 4)
        ]
        for tech in created_techs:
            if tech.is_verified:
                for idx, (comment, rating) in enumerate(reviews_data[:2]):
                    rev = Review(
                        request_id=f"rev-{tech.badge_code}-{idx}",
                        technician_id=tech.id,
                        user_id=customer_user.id,
                        customer_name="Verified Resident",
                        rating=rating,
                        comment=comment
                    )
                    db.session.add(rev)

        db.session.commit()

        print("\n============================================================")
        print("          FIXNEARBY SEED DATA SUCCESSFULLY CREATED!          ")
        print("============================================================")
        print(f"Total Service Categories: {len(categories_data)}")
        print(f"Total Problem Types:     {len(problem_types_data)}")
        print(f"Total Technicians:        {len(technicians_seed)} (12 Verified, 4 Unverified/Pending)")
        print("\n--- DEMO USER CREDENTIALS ---")
        print("Admin Account:     admin@fixnearby.local       / AdminPass@123")
        print("Customer Account:  citizen@fixnearby.local     / CitizenPass@123")
        print("Technician Accounts (Pass: TechPass@123):")
        print("  - Rajesh Patil   (FN-88492) [VERIFIED, ELECTRICAL, ON DUTY]")
        print("  - Santosh More   (FN-77341) [VERIFIED, PLUMBING, ON DUTY]")
        print("  - Pradeep Gaikwad(FN-66281) [VERIFIED, AUTOMOTIVE, ON DUTY]")
        print("  - Mohan Naik     (FN-94812) [VERIFIED, LOCKSMITH, ON DUTY]")
        print("  - Amit Jadhav    (FN-33211) [UNVERIFIED / FAILING AUDIT TEST CASE]")
        print("  - Rohan Yadav    (FN-88301) [UNVERIFIED / UNDER THRESHOLD TEST CASE]")
        print("\n--- SAMPLE ACTIVE EMERGENCY TRACKING ID ---")
        print("Request ID: req-live-kolhapur-001  (/tracking/req-live-kolhapur-001)")
        print("============================================================\n")

if __name__ == "__main__":
    seed_database()

