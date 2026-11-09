"""
Seed Script — Free Internship Opportunities for DATA VISTA
Covers: AICTE, Internshala, Forage, IBM SkillsBuild, Microsoft Learn,
        Google Career Certificates, Infosys Springboard, Cisco NetAcad,
        AWS Educate, TCS iON, ISRO, DRDO, NITI Aayog, Amazon, Intel, Cisco
All apply_url values point to official, publicly accessible portals.
"""

from database import engine, Base, SessionLocal
from models import FreeInternshipOpportunity

VERIFIED_FREE_INTERNSHIPS = [
    # ── AICTE ─────────────────────────────────────────────────────────────────
    {
        "title": "AICTE National Technical Internship Program",
        "organization": "AICTE / Ministry of Education, Govt. of India",
        "domain": "Software Engineering & Emerging Technologies",
        "description": "Government-backed national internship program connecting B.Tech/BE/MCA students with industry mentors across core engineering and technology domains.",
        "duration": "2 – 6 Months",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "₹5,000 – ₹15,000 / month",
        "eligibility": "B.Tech/BE/MCA/Diploma students enrolled in AICTE-approved institutions",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "AICTE Internship Enterprise Portal",
        "apply_url": "https://internship.aicte-india.org/",
        "source_url": "https://internship.aicte-india.org/",
        "free_to_apply": True,
        "verification_status": "Official Government Portal",
        "is_active": True,
    },

    # ── Internshala ───────────────────────────────────────────────────────────
    {
        "title": "Internshala Free Student Internships",
        "organization": "Internshala",
        "domain": "Multiple — Web Dev, Data Science, Marketing, Design",
        "description": "India's largest internship platform with 50,000+ active listings across tech, management and creative fields. Free to register and apply directly.",
        "duration": "1 – 6 Months (varies by listing)",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "₹2,000 – ₹25,000+ / month (varies)",
        "eligibility": "All undergraduate and postgraduate students; filters available by course and stream",
        "application_deadline": "Rolling / Multiple deadlines",
        "official_source": "Internshala Official Platform",
        "apply_url": "https://internshala.com/internships/",
        "source_url": "https://internshala.com/",
        "free_to_apply": True,
        "verification_status": "Verified Platform",
        "is_active": True,
    },
    {
        "title": "Internshala Free Online Training + Internship Combo",
        "organization": "Internshala Trainings",
        "domain": "Python, Machine Learning, Web Development, Data Science",
        "description": "Free short training courses followed by a guaranteed internship certificate. Covers Python, ML, Web Dev and more. No fees for the free-tier training tracks.",
        "duration": "4 – 8 Weeks",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free Training + Certificate of Completion",
        "eligibility": "Any student with basic computer knowledge; no prior coding experience needed for beginner tracks",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Internshala Trainings",
        "apply_url": "https://trainings.internshala.com/",
        "source_url": "https://trainings.internshala.com/",
        "free_to_apply": True,
        "verification_status": "Verified Platform",
        "is_active": True,
    },

    # ── Forage ────────────────────────────────────────────────────────────────
    {
        "title": "Forage Virtual Work Experience — All Programs",
        "organization": "Forage (theforage.com)",
        "domain": "Finance, Consulting, Technology, Data Analytics, Law",
        "description": "100% free virtual internship simulations from top companies including JPMorgan, Goldman Sachs, BCG, Deloitte, Accenture, Microsoft and 100+ more. Earn a completion certificate recognised by employers.",
        "duration": "5 – 10 Hours (self-paced)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free — Official Completion Certificate issued",
        "eligibility": "Open to all students globally; no minimum CGPA requirement",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Forage Official Platform",
        "apply_url": "https://www.theforage.com/",
        "source_url": "https://www.theforage.com/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Platform",
        "is_active": True,
    },
    {
        "title": "Forage × JPMorgan Software Engineering Virtual Experience",
        "organization": "JPMorgan Chase & Co. via Forage",
        "domain": "Software Engineering & Financial Technology",
        "description": "Work on real JPMorgan engineering tasks — fixing broken repositories, using JPMorgan's open-source Perspective library for data visualisation, and writing Python. Earns an official JPMorgan certificate.",
        "duration": "5 Hours (self-paced)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free — Official JPMorgan Certificate",
        "eligibility": "Open globally to any student interested in software engineering",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Forage — JPMorgan Program",
        "apply_url": "https://www.theforage.com/simulations/jpmorgan/software-engineering-mban",
        "source_url": "https://www.theforage.com/simulations/jpmorgan/software-engineering-mban",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },
    {
        "title": "Forage × Accenture Data Analytics Virtual Experience",
        "organization": "Accenture via Forage",
        "domain": "Data Analytics & Business Intelligence",
        "description": "Simulates the role of a Data Analyst at Accenture — data cleaning, modelling, and visualisation tasks. Earns an official Accenture certificate.",
        "duration": "5 – 6 Hours (self-paced)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free — Official Accenture Certificate",
        "eligibility": "Open globally; suitable for students learning data analytics",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Forage — Accenture Program",
        "apply_url": "https://www.theforage.com/simulations/accenture-nordics/data-analytics-mmlb",
        "source_url": "https://www.theforage.com/simulations/accenture-nordics/data-analytics-mmlb",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },

    # ── IBM SkillsBuild ───────────────────────────────────────────────────────
    {
        "title": "IBM SkillsBuild Student Program",
        "organization": "IBM",
        "domain": "AI, Cloud Computing, Cybersecurity & Data Science",
        "description": "Free learning paths from IBM covering AI, cloud (IBM Cloud), cybersecurity, and data science. Earn IBM digital badges and credentials recognised by employers worldwide.",
        "duration": "Self-paced (2 – 10 weeks per learning path)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free IBM Digital Credentials + Cloud Credits",
        "eligibility": "Any student; free registration via IBM SkillsBuild for Students portal",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "IBM SkillsBuild Official Portal",
        "apply_url": "https://skillsbuild.org/students",
        "source_url": "https://skillsbuild.org/students",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },

    # ── Microsoft Learn / Internships ─────────────────────────────────────────
    {
        "title": "Microsoft Student & Research Internship",
        "organization": "Microsoft",
        "domain": "Cloud Computing, AI & Software Development",
        "description": "Paid internship at Microsoft India for engineering students — work on Azure, AI, and core software engineering. Apply via official Microsoft Careers portal.",
        "duration": "8 – 12 Weeks",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "Competitive (₹50,000 – ₹80,000 / month)",
        "eligibility": "Enrolled undergraduate or postgraduate engineering / computing students",
        "application_deadline": "2026-12-31",
        "official_source": "Microsoft Careers Portal",
        "apply_url": "https://careers.microsoft.com/students/us/en/asiapacificstudent",
        "source_url": "https://careers.microsoft.com/students/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },
    {
        "title": "Microsoft Learn Student Ambassador Program",
        "organization": "Microsoft",
        "domain": "Cloud, AI, Developer Tools & Community",
        "description": "Become a Microsoft Learn Student Ambassador — gain free access to Azure credits, Microsoft certifications, exclusive developer events and mentorship from Microsoft engineers.",
        "duration": "Ongoing (semester or yearly commitment)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free Azure Credits + Microsoft Certification Vouchers",
        "eligibility": "Currently enrolled higher-education student with a passion for technology",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Microsoft MLSA Official Portal",
        "apply_url": "https://studentambassadors.microsoft.com/",
        "source_url": "https://studentambassadors.microsoft.com/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },

    # ── Google ────────────────────────────────────────────────────────────────
    {
        "title": "Google STEP Internship (Student Training in Engineering)",
        "organization": "Google",
        "domain": "Software Engineering & Computer Science",
        "description": "Paid software engineering internship for first and second-year undergraduates. Work on real Google products alongside full-time engineers with a structured mentorship programme.",
        "duration": "10 – 12 Weeks",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "Competitive Industry Standard (₹40,000 – ₹75,000 / month)",
        "eligibility": "1st or 2nd year undergraduate students in CS or related STEM; strong fundamentals required",
        "application_deadline": "2026-12-31",
        "official_source": "Google Careers Student Portal",
        "apply_url": "https://careers.google.com/jobs/results/?category=PROGRAM_MANAGEMENT&employment_type=INTERN",
        "source_url": "https://careers.google.com/students/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },
    {
        "title": "Google Summer of Code (GSoC)",
        "organization": "Google Open Source",
        "domain": "Open Source Software Development",
        "description": "Google's flagship programme paying students to contribute to open-source projects over 12 weeks. Work with leading open-source organisations. Stipend paid directly by Google.",
        "duration": "12 Weeks",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "USD 1,500 – USD 3,300 (depending on country)",
        "eligibility": "Students 18+ enrolled in any accredited higher-education programme",
        "application_deadline": "2027-04-02",
        "official_source": "Google Summer of Code Official Site",
        "apply_url": "https://summerofcode.withgoogle.com/",
        "source_url": "https://summerofcode.withgoogle.com/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },
    {
        "title": "Google Career Certificates (Free via Coursera for Students)",
        "organization": "Google via Coursera",
        "domain": "Data Analytics, UX Design, IT Support, Cybersecurity, Project Mgmt",
        "description": "Industry-recognised Google Career Certificates — Data Analytics, IT Support, UX Design, Cybersecurity and Project Management. Free for eligible students via Coursera financial aid.",
        "duration": "3 – 6 Months (self-paced)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free via Financial Aid (apply on Coursera) — Google Certificate issued",
        "eligibility": "Any student; apply for Coursera financial aid to waive fee entirely",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Google Career Certificates on Coursera",
        "apply_url": "https://grow.google/certificates/",
        "source_url": "https://grow.google/certificates/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },

    # ── Infosys Springboard ───────────────────────────────────────────────────
    {
        "title": "Infosys Springboard Free Learning & Internship Program",
        "organization": "Infosys",
        "domain": "Full Stack, AI/ML, Cloud, Data Science & Cybersecurity",
        "description": "Infosys Springboard offers 1,000+ free courses covering programming, AI, cloud and soft skills. Completion of selected paths leads to Infosys internship consideration and certificates.",
        "duration": "Self-paced (weeks to months per path)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free Courses + Infosys Certificate of Completion",
        "eligibility": "Any student — free registration with college email or personal email",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Infosys Springboard Official Portal",
        "apply_url": "https://infyspringboard.onwingspan.com/",
        "source_url": "https://infyspringboard.onwingspan.com/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },
    {
        "title": "Infosys InStep Global Technical Internship",
        "organization": "Infosys",
        "domain": "Full Stack Engineering, Cloud & AI",
        "description": "Prestigious global paid internship programme for top university students. Work on live Infosys client projects worldwide, with travel and accommodation covered.",
        "duration": "8 – 12 Weeks",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "Paid + Travel & Accommodation Covered",
        "eligibility": "Undergraduate and postgraduate students with strong technical project portfolios",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Infosys InStep Official Portal",
        "apply_url": "https://www.infosys.com/instep.html",
        "source_url": "https://www.infosys.com/instep.html",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },

    # ── Cisco Networking Academy ──────────────────────────────────────────────
    {
        "title": "Cisco Networking Academy — Free Courses & Internship Track",
        "organization": "Cisco",
        "domain": "Networking, Cybersecurity & IoT",
        "description": "Cisco's NetAcad platform offers free industry-standard courses — CCNA, Cybersecurity Essentials, Python Essentials, IoT Fundamentals. Top performers are considered for Cisco internships.",
        "duration": "Self-paced (4 – 16 weeks per course)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free Cisco Digital Certificates + Industry-Recognised Badges",
        "eligibility": "Open to all students globally with a valid email address",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "Cisco Networking Academy",
        "apply_url": "https://www.netacad.com/",
        "source_url": "https://www.netacad.com/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },
    {
        "title": "Cisco Apprentice & Engineering Internship",
        "organization": "Cisco",
        "domain": "Networking, Cybersecurity & Cloud Automation",
        "description": "Paid engineering internship at Cisco India — work on live networking, security and cloud automation projects with mentorship from Cisco engineers.",
        "duration": "6 Months",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "₹40,000 – ₹65,000 / month",
        "eligibility": "Pre-final / Final year students in CSE, IT, Telecommunications or allied domains",
        "application_deadline": "2026-12-31",
        "official_source": "Cisco Emerging Talent Portal",
        "apply_url": "https://jobs.cisco.com/jobs/SearchJobs?21178=%5B169482%5D&21178_format=6020&listFilterMode=1",
        "source_url": "https://www.cisco.com/c/en/us/about/careers/we-are-cisco/students-and-new-graduates.html",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },

    # ── AWS Educate ───────────────────────────────────────────────────────────
    {
        "title": "AWS Educate — Free Cloud Training & Badges",
        "organization": "Amazon Web Services (AWS)",
        "domain": "Cloud Computing, DevOps & Machine Learning",
        "description": "AWS Educate gives students free access to AWS cloud learning content, hands-on labs, and digital badges — no credit card required. Covers EC2, S3, Lambda, ML and more.",
        "duration": "Self-paced (hours to weeks)",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Free AWS Labs + AWS Digital Badges",
        "eligibility": "Any student with a valid college email; no prior cloud experience required",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "AWS Educate Official Portal",
        "apply_url": "https://aws.amazon.com/education/awseducate/",
        "source_url": "https://aws.amazon.com/education/awseducate/",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise Program",
        "is_active": True,
    },
    {
        "title": "Amazon Student Programs & SDE Internship",
        "organization": "Amazon",
        "domain": "Software Development, Cloud & Distributed Systems",
        "description": "Paid SDE internship at Amazon India — work on core Amazon products (Alexa, AWS, Retail) solving large-scale distributed systems challenges. Strong DSA skills required.",
        "duration": "3 – 6 Months",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "₹50,000 – ₹80,000 / month",
        "eligibility": "Enrolled B.Tech/M.Tech in CS, CE or related STEM; strong DSA fundamentals",
        "application_deadline": "2026-12-31",
        "official_source": "Amazon Jobs Student Portal",
        "apply_url": "https://www.amazon.jobs/en/teams/internships-for-students",
        "source_url": "https://www.amazon.jobs/en/teams/internships-for-students",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },

    # ── TCS iON ───────────────────────────────────────────────────────────────
    {
        "title": "TCS iON National Internship Initiative",
        "organization": "Tata Consultancy Services (TCS)",
        "domain": "Full Stack Web Development & Data Analytics",
        "description": "TCS iON offers structured virtual internships and national-level skill-building programmes for engineering students across India, with project certificates.",
        "duration": "2 – 4 Months",
        "stipend_type": "Performance Stipend",
        "stipend_amount": "Project Performance Incentives (₹8,000 – ₹15,000)",
        "eligibility": "Undergraduate students from all engineering and science disciplines across India",
        "application_deadline": "Rolling / Open Throughout Year",
        "official_source": "TCS iON Official Hub",
        "apply_url": "https://learning.tcsionhub.in/hub/national-qualifier-test/",
        "source_url": "https://learning.tcsionhub.in/",
        "free_to_apply": True,
        "verification_status": "Verified Corporate Program",
        "is_active": True,
    },

    # ── Government Programmes ─────────────────────────────────────────────────
    {
        "title": "ISRO VSSC Graduate & Student Project Training",
        "organization": "Indian Space Research Organisation (ISRO)",
        "domain": "Space Technology, Embedded Systems & Scientific Computing",
        "description": "Work on live ISRO space research projects under scientist mentorship. Students receive an official ISRO project certificate upon completion.",
        "duration": "3 – 6 Months",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Unpaid — Official ISRO Certificate + Scientist Mentorship",
        "eligibility": "Pre-final / Final year B.Tech, M.Tech, M.Sc students with min 6.5 CGPA and college endorsement",
        "application_deadline": "Rolling / Batch Intake (Twice Yearly)",
        "official_source": "ISRO Official Portal",
        "apply_url": "https://www.isro.gov.in/Careers.html",
        "source_url": "https://www.isro.gov.in/Careers.html",
        "free_to_apply": True,
        "verification_status": "Official Government Research",
        "is_active": True,
    },
    {
        "title": "DRDO Student Research Apprentice Program",
        "organization": "Defence Research and Development Organisation (DRDO)",
        "domain": "Cybersecurity, Signal Processing & Systems Engineering",
        "description": "Research apprenticeship at DRDO labs across India. Work on national defence technology projects with senior scientists in electronics, computing and materials engineering.",
        "duration": "6 – 12 Months",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "Government Apprentice Scale (₹8,000 – ₹12,000 / month)",
        "eligibility": "Graduate / Diploma engineers in CSE, ECE, Mechanical or allied branches",
        "application_deadline": "2026-11-30",
        "official_source": "DRDO Official Recruitment Portal",
        "apply_url": "https://drdo.gov.in/drdo/careers",
        "source_url": "https://drdo.gov.in/drdo/careers",
        "free_to_apply": True,
        "verification_status": "Official Government Research",
        "is_active": True,
    },
    {
        "title": "NITI Aayog Official Internship Scheme",
        "organization": "NITI Aayog, Government of India",
        "domain": "Data Analytics, Public Policy & Governance Metrics",
        "description": "Intern directly at NITI Aayog — India's premier policy think tank. Work on live data-driven governance projects with senior government officers.",
        "duration": "6 Weeks – 6 Months",
        "stipend_type": "Unpaid / Learning & Research",
        "stipend_amount": "Unpaid — Official Government Certificate",
        "eligibility": "Undergraduate students having completed 2nd year; min 85% in 12th or 7.0 CGPA",
        "application_deadline": "Rolling (Open 1st – 10th of every month)",
        "official_source": "NITI Aayog Official Portal",
        "apply_url": "https://niti.gov.in/internship",
        "source_url": "https://niti.gov.in/internship",
        "free_to_apply": True,
        "verification_status": "Official Government Portal",
        "is_active": True,
    },

    # ── Intel ─────────────────────────────────────────────────────────────────
    {
        "title": "Intel Student Graduate & Technical Internship",
        "organization": "Intel Corporation",
        "domain": "Computer Architecture, Firmware & AI Systems",
        "description": "Engineering internship at Intel India — contribute to processor design, firmware development and AI accelerator research with world-class engineers.",
        "duration": "3 – 6 Months",
        "stipend_type": "Paid Stipend",
        "stipend_amount": "₹30,000 – ₹45,000 / month",
        "eligibility": "B.Tech/M.Tech in CSE, ECE, Electrical or Data Science",
        "application_deadline": "2026-12-31",
        "official_source": "Intel Careers Portal",
        "apply_url": "https://jobs.intel.com/en/student-internship",
        "source_url": "https://jobs.intel.com/en/student-internship",
        "free_to_apply": True,
        "verification_status": "Verified Enterprise",
        "is_active": True,
    },
]


def seed_free_internships():
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        added = 0
        updated = 0
        for item in VERIFIED_FREE_INTERNSHIPS:
            existing = db.query(FreeInternshipOpportunity).filter(
                FreeInternshipOpportunity.title == item["title"],
                FreeInternshipOpportunity.organization == item["organization"]
            ).first()

            if existing:
                # Update existing record so new fields (description) are filled in
                existing.description = item.get("description", "")
                existing.apply_url = item["apply_url"]
                existing.stipend_amount = item.get("stipend_amount", "")
                existing.eligibility = item.get("eligibility", "")
                existing.is_active = item.get("is_active", True)
                updated += 1
            else:
                opp = FreeInternshipOpportunity(
                    title=item["title"],
                    organization=item["organization"],
                    domain=item["domain"],
                    description=item.get("description", ""),
                    duration=item.get("duration"),
                    stipend_type=item["stipend_type"],
                    stipend_amount=item.get("stipend_amount", ""),
                    eligibility=item.get("eligibility"),
                    application_deadline=item.get("application_deadline", "Rolling / Open Throughout Year"),
                    official_source=item["official_source"],
                    apply_url=item["apply_url"],
                    source_url=item.get("source_url", item["apply_url"]),
                    free_to_apply=item.get("free_to_apply", True),
                    verification_status=item.get("verification_status", "Verified Official"),
                    is_active=item.get("is_active", True),
                )
                db.add(opp)
                added += 1

        db.commit()
        total = db.query(FreeInternshipOpportunity).count()
        print(f"[+] Free internships: {added} added, {updated} updated. Total: {total}")
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_free_internships()
