-- ====================================================================
-- DATA VISTA Relational Database Schema (MySQL 8.0+)
-- Project Domain: Data Analytics + Career, Internship & Placement Intelligence
-- ====================================================================

CREATE DATABASE IF NOT EXISTS datavista CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE datavista;

-- 1. Skills Master Table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'Technical',
    demand_index FLOAT DEFAULT 70.0,
    INDEX idx_skill_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Certifications Master Table
CREATE TABLE IF NOT EXISTS certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    issuing_org VARCHAR(100) DEFAULT 'Coursera'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Students Table (Unique student_id)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    branch VARCHAR(100) NOT NULL,
    year INT DEFAULT 3,
    cgpa FLOAT NOT NULL DEFAULT 7.5,
    preferred_career VARCHAR(100) DEFAULT 'Data Analyst',
    preferred_location VARCHAR(100) DEFAULT 'Bangalore',
    num_internships INT DEFAULT 0,
    experience_status VARCHAR(20) DEFAULT 'Fresher',
    experience_years FLOAT DEFAULT 0.0,
    github_profile VARCHAR(255) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_student_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Student Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency VARCHAR(20) DEFAULT 'Intermediate',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_skill (student_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Student Certifications (Many-to-Many)
CREATE TABLE IF NOT EXISTS student_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    certification_id INT NOT NULL,
    year_completed INT DEFAULT 2024,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_cert (student_id, certification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Student Projects
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    domain VARCHAR(100) DEFAULT 'Web Development',
    description TEXT,
    technologies VARCHAR(250) DEFAULT 'Python, SQL',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Student Internships
CREATE TABLE IF NOT EXISTS student_internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    duration_months INT DEFAULT 3,
    stipend FLOAT DEFAULT 15000,
    work_mode VARCHAR(50) DEFAULT 'Hybrid',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Careers Master Table
CREATE TABLE IF NOT EXISTS careers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(100) NOT NULL,
    description TEXT,
    avg_salary_lpa FLOAT DEFAULT 8.5,
    market_growth_pct FLOAT DEFAULT 18.0,
    min_cgpa FLOAT DEFAULT 7.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Career Skills Mapping (Weights)
CREATE TABLE IF NOT EXISTS career_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    career_id INT NOT NULL,
    skill_id INT NOT NULL,
    importance_weight FLOAT DEFAULT 1.0,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_career_skill (career_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Jobs Table (Market Demand)
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    company VARCHAR(120) NOT NULL,
    location VARCHAR(100) DEFAULT 'Bangalore',
    salary_lpa FLOAT DEFAULT 9.0,
    experience_years FLOAT DEFAULT 1.0,
    work_mode VARCHAR(50) DEFAULT 'Hybrid',
    description TEXT,
    posted_date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Job Skills Mapping
CREATE TABLE IF NOT EXISTS job_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_skill (job_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Internships Master Table
CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    company VARCHAR(120) NOT NULL,
    location VARCHAR(100) DEFAULT 'Bangalore',
    stipend FLOAT DEFAULT 20000,
    duration_months INT DEFAULT 3,
    work_mode VARCHAR(50) DEFAULT 'Remote',
    internship_type VARCHAR(50) DEFAULT 'Full-time',
    certificate_provided BOOLEAN DEFAULT TRUE,
    company_rating FLOAT DEFAULT 4.2,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Internship Skills Mapping
CREATE TABLE IF NOT EXISTS internship_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    skill_id INT NOT NULL,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_internship_skill (internship_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Placement Historical Records (For Analytics & ML Benchmarking)
CREATE TABLE IF NOT EXISTS placement_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_ref VARCHAR(50),
    branch VARCHAR(100) NOT NULL,
    year INT DEFAULT 2024,
    cgpa FLOAT NOT NULL,
    aptitude_score FLOAT DEFAULT 70.0,
    communication_score FLOAT DEFAULT 70.0,
    num_skills INT DEFAULT 4,
    num_projects INT DEFAULT 2,
    num_certifications INT DEFAULT 1,
    internship_months INT DEFAULT 0,
    placed TINYINT(1) DEFAULT 1,
    company VARCHAR(120),
    salary_lpa FLOAT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
